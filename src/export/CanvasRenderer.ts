import type { Photo, Slide, CollageLayout, SlotCropConfig } from "@/types";
import { DEFAULT_SLOT_CROP } from "@/types";
import {
  calculateCropSourceRect,
  calculateContainDestRect,
} from "@/utils/cropUtils";

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d")!;
    this.width = width;
    this.height = height;
  }

  async preloadImages(photos: Record<string, Photo>): Promise<void> {
    const loadPromises = Object.values(photos).map(async (photo) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = photo.url;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () =>
          reject(new Error(`Failed to load image: ${photo.id}`));
      });
      this.imageCache.set(photo.id, img);
    });
    await Promise.all(loadPromises);
  }

  renderSlide(
    slide: Slide,
    _photos: Record<string, Photo>,
    layouts: CollageLayout[]
  ): void {
    const layout = layouts.find((l) => l.id === slide.layoutId);
    if (!layout) return;

    // Clear canvas with black background
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render each slot
    layout.slots.forEach((slot, idx) => {
      const photoId = slide.photoIds[idx];
      if (!photoId) return;

      const img = this.imageCache.get(photoId);
      if (!img) return;

      // Calculate slot position in pixels
      const slotX = (slot.x / 100) * this.width;
      const slotY = (slot.y / 100) * this.height;
      const slotWidth = (slot.width / 100) * this.width;
      const slotHeight = (slot.height / 100) * this.height;

      // Get crop config for this slot
      const cropConfig = slide.slotCrops?.[idx] ?? DEFAULT_SLOT_CROP;

      // Draw with crop config
      this.drawImageWithCrop(
        img,
        slotX,
        slotY,
        slotWidth,
        slotHeight,
        cropConfig
      );
    });
  }

  private drawImageWithCrop(
    img: HTMLImageElement,
    x: number,
    y: number,
    targetWidth: number,
    targetHeight: number,
    cropConfig: SlotCropConfig
  ): void {
    if (cropConfig.objectFit === "contain") {
      // Contain mode - show full image with letterboxing
      const { sourceX, sourceY, sourceW, sourceH } = calculateCropSourceRect(
        cropConfig,
        img.width,
        img.height,
        targetWidth,
        targetHeight
      );
      const { destX, destY, destW, destH } = calculateContainDestRect(
        img.width,
        img.height,
        targetWidth,
        targetHeight
      );

      this.ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceW,
        sourceH,
        x + destX,
        y + destY,
        destW,
        destH
      );
    } else {
      // Cover mode with offset
      const { sourceX, sourceY, sourceW, sourceH } = calculateCropSourceRect(
        cropConfig,
        img.width,
        img.height,
        targetWidth,
        targetHeight
      );

      this.ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceW,
        sourceH,
        x,
        y,
        targetWidth,
        targetHeight
      );
    }
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  clear(): void {
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // Render a slide to a new temporary canvas (for transitions)
  renderSlideToCanvas(
    slide: Slide,
    layouts: CollageLayout[]
  ): HTMLCanvasElement {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = this.width;
    tempCanvas.height = this.height;
    const tempCtx = tempCanvas.getContext("2d")!;

    const layout = layouts.find((l) => l.id === slide.layoutId);
    if (!layout) {
      tempCtx.fillStyle = "#000000";
      tempCtx.fillRect(0, 0, this.width, this.height);
      return tempCanvas;
    }

    // Clear with black background
    tempCtx.fillStyle = "#000000";
    tempCtx.fillRect(0, 0, this.width, this.height);

    // Render each slot
    layout.slots.forEach((slot, idx) => {
      const photoId = slide.photoIds[idx];
      if (!photoId) return;

      const img = this.imageCache.get(photoId);
      if (!img) return;

      // Calculate slot position in pixels
      const slotX = (slot.x / 100) * this.width;
      const slotY = (slot.y / 100) * this.height;
      const slotWidth = (slot.width / 100) * this.width;
      const slotHeight = (slot.height / 100) * this.height;

      // Get crop config for this slot
      const cropConfig = slide.slotCrops?.[idx] ?? DEFAULT_SLOT_CROP;

      // Draw with crop config
      this.drawImageWithCropToContext(
        tempCtx,
        img,
        slotX,
        slotY,
        slotWidth,
        slotHeight,
        cropConfig
      );
    });

    return tempCanvas;
  }

  private drawImageWithCropToContext(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    targetWidth: number,
    targetHeight: number,
    cropConfig: SlotCropConfig
  ): void {
    if (cropConfig.objectFit === "contain") {
      // Contain mode - show full image with letterboxing
      const { sourceX, sourceY, sourceW, sourceH } = calculateCropSourceRect(
        cropConfig,
        img.width,
        img.height,
        targetWidth,
        targetHeight
      );
      const { destX, destY, destW, destH } = calculateContainDestRect(
        img.width,
        img.height,
        targetWidth,
        targetHeight
      );

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceW,
        sourceH,
        x + destX,
        y + destY,
        destW,
        destH
      );
    } else {
      // Cover mode with offset
      const { sourceX, sourceY, sourceW, sourceH } = calculateCropSourceRect(
        cropConfig,
        img.width,
        img.height,
        targetWidth,
        targetHeight
      );

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceW,
        sourceH,
        x,
        y,
        targetWidth,
        targetHeight
      );
    }
  }
}
