import type { CollageLayout, Slide, TransitionType } from "@/types";

import type { CanvasRenderer } from "./CanvasRenderer";

export interface TransitionContext {
  ctx: CanvasRenderingContext2D;
  height: number;
  incomingSlide: Slide;
  layouts: CollageLayout[];
  outgoingSlide: Slide;
  progress: number; // 0 to 1
  renderer: CanvasRenderer;
  width: number;
}

type TransitionFunction = (context: TransitionContext) => void;

const transitions: Record<TransitionType, TransitionFunction> = {
  blur: ({
    ctx,
    height,
    incomingSlide,
    layouts,
    outgoingSlide,
    progress,
    renderer,
    width,
  }) => {
    // Note: Canvas blur filter has limited browser support
    const supportsFilter = typeof ctx.filter !== "undefined";

    const outgoingCanvas = renderer.renderSlideToCanvas(outgoingSlide, layouts);
    const incomingCanvas = renderer.renderSlideToCanvas(incomingSlide, layouts);

    // Clear
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    if (!supportsFilter) {
      // Fallback to simple crossfade
      ctx.drawImage(outgoingCanvas, 0, 0);
      ctx.globalAlpha = progress;
      ctx.drawImage(incomingCanvas, 0, 0);
      ctx.globalAlpha = 1;
      return;
    }

    // Outgoing blurs out
    ctx.save();
    ctx.filter = `blur(${progress * 20}px)`;
    ctx.globalAlpha = 1 - progress;
    ctx.drawImage(outgoingCanvas, 0, 0);
    ctx.restore();

    // Incoming blurs in
    ctx.save();
    ctx.filter = `blur(${(1 - progress) * 20}px)`;
    ctx.globalAlpha = progress;
    ctx.drawImage(incomingCanvas, 0, 0);
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.filter = "none";
  },

  fade: ({
    ctx,
    incomingSlide,
    layouts,
    outgoingSlide,
    progress,
    renderer,
  }) => {
    const outgoingCanvas = renderer.renderSlideToCanvas(outgoingSlide, layouts);
    const incomingCanvas = renderer.renderSlideToCanvas(incomingSlide, layouts);

    // Draw outgoing slide
    ctx.drawImage(outgoingCanvas, 0, 0);

    // Blend incoming on top with increasing alpha
    ctx.globalAlpha = progress;
    ctx.drawImage(incomingCanvas, 0, 0);
    ctx.globalAlpha = 1;
  },

  kenBurns: ({
    ctx,
    height,
    incomingSlide,
    layouts,
    outgoingSlide,
    progress,
    renderer,
    width,
  }) => {
    // Ken Burns: slow zoom crossfade
    const outgoingCanvas = renderer.renderSlideToCanvas(outgoingSlide, layouts);
    const incomingCanvas = renderer.renderSlideToCanvas(incomingSlide, layouts);

    // Clear
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    // Outgoing with slight zoom
    const outScale = 1.0 + progress * 0.05;
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(outScale, outScale);
    ctx.globalAlpha = 1 - progress;
    ctx.translate(-width / 2, -height / 2);
    ctx.drawImage(outgoingCanvas, 0, 0);
    ctx.restore();

    // Incoming with slight zoom starting smaller
    const inScale = 0.95 + progress * 0.05;
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(inScale, inScale);
    ctx.globalAlpha = progress;
    ctx.translate(-width / 2, -height / 2);
    ctx.drawImage(incomingCanvas, 0, 0);
    ctx.restore();
    ctx.globalAlpha = 1;
  },

  none: ({ incomingSlide, layouts, renderer }) => {
    const canvas = renderer.renderSlideToCanvas(incomingSlide, layouts);
    renderer.getContext().drawImage(canvas, 0, 0);
  },

  rotate: ({
    ctx,
    height,
    incomingSlide,
    layouts,
    outgoingSlide,
    progress,
    renderer,
    width,
  }) => {
    const outgoingCanvas = renderer.renderSlideToCanvas(outgoingSlide, layouts);
    const incomingCanvas = renderer.renderSlideToCanvas(incomingSlide, layouts);

    // Clear
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    // Outgoing rotates out
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((-progress * Math.PI) / 4);
    ctx.globalAlpha = 1 - progress;
    ctx.translate(-width / 2, -height / 2);
    ctx.drawImage(outgoingCanvas, 0, 0);
    ctx.restore();

    // Incoming rotates in
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(((1 - progress) * Math.PI) / 4);
    ctx.globalAlpha = progress;
    ctx.translate(-width / 2, -height / 2);
    ctx.drawImage(incomingCanvas, 0, 0);
    ctx.restore();
    ctx.globalAlpha = 1;
  },

  slide: ({
    ctx,
    height,
    incomingSlide,
    layouts,
    outgoingSlide,
    progress,
    renderer,
    width,
  }) => {
    const outgoingCanvas = renderer.renderSlideToCanvas(outgoingSlide, layouts);
    const incomingCanvas = renderer.renderSlideToCanvas(incomingSlide, layouts);

    // Clear
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    // Outgoing slides left
    ctx.drawImage(outgoingCanvas, -width * progress, 0);

    // Incoming slides in from right
    ctx.drawImage(incomingCanvas, width * (1 - progress), 0);
  },

  zoom: ({
    ctx,
    height,
    incomingSlide,
    layouts,
    outgoingSlide,
    progress,
    renderer,
    width,
  }) => {
    const outgoingCanvas = renderer.renderSlideToCanvas(outgoingSlide, layouts);
    const incomingCanvas = renderer.renderSlideToCanvas(incomingSlide, layouts);

    // Clear
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    // Outgoing zooms out and fades
    const outScale = 1 + progress * 0.2;
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(outScale, outScale);
    ctx.globalAlpha = 1 - progress;
    ctx.translate(-width / 2, -height / 2);
    ctx.drawImage(outgoingCanvas, 0, 0);
    ctx.restore();

    // Incoming zooms in and fades in
    const inScale = 0.8 + progress * 0.2;
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(inScale, inScale);
    ctx.globalAlpha = progress;
    ctx.translate(-width / 2, -height / 2);
    ctx.drawImage(incomingCanvas, 0, 0);
    ctx.restore();
    ctx.globalAlpha = 1;
  },
};

export function renderTransitionFrame(
  type: TransitionType,
  context: TransitionContext
): void {
  const transitionFn = transitions[type] || transitions.none;
  transitionFn(context);
}
