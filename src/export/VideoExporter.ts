import type { CollageLayout, Photo, Slide } from "@/types";

import type { ExportOptions, ExportProgress, ResolutionConfig } from "./types";

import { CanvasRenderer } from "./CanvasRenderer";
import { renderTransitionFrame } from "./transitions";
import { RESOLUTION_CONFIGS } from "./types";

const BASE_FPS = 30; // Slide durations are stored at 30fps

export class VideoExporter {
  private abortController: AbortController | null = null;
  private canvas: HTMLCanvasElement;
  private chunks: Blob[] = [];
  private config: ResolutionConfig;
  private mediaRecorder: MediaRecorder | null = null;
  private options: ExportOptions;
  private renderer: CanvasRenderer;

  constructor(options: ExportOptions) {
    this.options = options;
    this.config = RESOLUTION_CONFIGS[options.resolution];
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;
    this.renderer = new CanvasRenderer(this.config.width, this.config.height);
  }

  cancel(): void {
    this.abortController?.abort();
  }

  async export(
    slides: Slide[],
    photos: Record<string, Photo>,
    layouts: CollageLayout[],
    onProgress: (progress: ExportProgress) => void
  ): Promise<Blob> {
    this.abortController = new AbortController();
    const { fps } = this.options;

    // Calculate total frames at target fps
    const fpsRatio = fps / BASE_FPS;
    const totalFrames = Math.ceil(
      slides.reduce((sum, slide) => sum + slide.duration * fpsRatio, 0)
    );

    // Pre-load all images
    onProgress({
      currentFrame: 0,
      estimatedTimeRemaining: null,
      percentage: 0,
      status: "preparing",
      totalFrames,
    });
    await this.renderer.preloadImages(photos);

    // Check for abort
    if (this.abortController.signal.aborted) {
      throw new Error("Export cancelled");
    }

    // Setup MediaRecorder with canvas stream
    // Pass fps to capture at the target frame rate
    const stream = this.canvas.captureStream(fps);
    const mimeType = this.getSupportedMimeType();

    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: this.config.bitrate,
    });

    this.chunks = [];
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };

    // Start recording
    this.mediaRecorder.start(100); // Collect data every 100ms

    // Render frame by frame
    onProgress({
      currentFrame: 0,
      estimatedTimeRemaining: null,
      percentage: 0,
      status: "rendering",
      totalFrames,
    });

    const startTime = Date.now();
    let currentFrame = 0;

    // Copy images to main renderer's canvas
    const ctx = this.canvas.getContext("2d")!;

    for (let slideIndex = 0; slideIndex < slides.length; slideIndex++) {
      if (this.abortController.signal.aborted) {
        this.mediaRecorder.stop();
        throw new Error("Export cancelled");
      }

      const slide = slides[slideIndex];
      const nextSlide = slides[slideIndex + 1];
      const transitionDurationBase = nextSlide ? slide.transition.duration : 0;
      const transitionDuration = Math.ceil(transitionDurationBase * fpsRatio);
      const slideContentDuration =
        Math.ceil(slide.duration * fpsRatio) - transitionDuration;

      // Render slide content frames
      for (let frame = 0; frame < slideContentDuration; frame++) {
        if (this.abortController.signal.aborted) {
          this.mediaRecorder.stop();
          throw new Error("Export cancelled");
        }

        this.renderer.renderSlide(slide, photos, layouts);
        ctx.drawImage(this.renderer.getCanvas(), 0, 0);
        await this.waitForNextFrame(currentFrame, startTime);
        currentFrame++;
        this.updateProgress(onProgress, currentFrame, totalFrames, startTime);
      }

      // Render transition frames
      if (nextSlide && transitionDuration > 0) {
        for (let frame = 0; frame < transitionDuration; frame++) {
          if (this.abortController.signal.aborted) {
            this.mediaRecorder.stop();
            throw new Error("Export cancelled");
          }

          const progress = frame / transitionDuration;
          renderTransitionFrame(slide.transition.type, {
            ctx: this.renderer.getContext(),
            height: this.config.height,
            incomingSlide: nextSlide,
            layouts,
            outgoingSlide: slide,
            progress,
            renderer: this.renderer,
            width: this.config.width,
          });
          ctx.drawImage(this.renderer.getCanvas(), 0, 0);
          await this.waitForNextFrame(currentFrame, startTime);
          currentFrame++;
          this.updateProgress(onProgress, currentFrame, totalFrames, startTime);
        }
      }
    }

    // Stop recording and wait for final data
    onProgress({
      currentFrame: totalFrames,
      estimatedTimeRemaining: 0,
      percentage: 100,
      status: "encoding",
      totalFrames,
    });

    return new Promise((resolve, reject) => {
      this.mediaRecorder!.onstop = () => {
        const blob = new Blob(this.chunks, { type: mimeType });
        onProgress({
          currentFrame: totalFrames,
          estimatedTimeRemaining: null,
          percentage: 100,
          status: "complete",
          totalFrames,
        });
        resolve(blob);
      };
      this.mediaRecorder!.onerror = (e) => reject(e);
      this.mediaRecorder!.stop();
    });
  }

  private getSupportedMimeType(): string {
    const types = [
      "video/mp4;codecs=h264",
      "video/mp4",
      "video/webm;codecs=h264",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return "video/webm";
  }

  private updateProgress(
    onProgress: (p: ExportProgress) => void,
    currentFrame: number,
    totalFrames: number,
    startTime: number
  ): void {
    const percentage = (currentFrame / totalFrames) * 100;
    const elapsed = (Date.now() - startTime) / 1000;
    const framesPerSecond = currentFrame / elapsed;
    const remainingFrames = totalFrames - currentFrame;
    const estimatedTimeRemaining =
      framesPerSecond > 0 ? remainingFrames / framesPerSecond : null;

    onProgress({
      currentFrame,
      estimatedTimeRemaining,
      percentage,
      status: "rendering",
      totalFrames,
    });
  }

  private async waitForNextFrame(
    currentFrame: number,
    startTime: number
  ): Promise<void> {
    // Calculate when the next frame should be displayed based on elapsed time
    const frameDuration = 1000 / this.options.fps;
    const targetTime = startTime + (currentFrame + 1) * frameDuration;
    const now = Date.now();
    const waitTime = Math.max(0, targetTime - now);

    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}
