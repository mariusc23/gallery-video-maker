import type { SlotCropConfig } from "@/types";

import { DEFAULT_SLOT_CROP } from "@/types";

/**
 * Calculate destination rectangle for 'contain' mode (letterboxing)
 */
export function calculateContainDestRect(
  imgWidth: number,
  imgHeight: number,
  targetWidth: number,
  targetHeight: number
): { destH: number; destW: number; destX: number; destY: number; } {
  const imgAspect = imgWidth / imgHeight;
  const targetAspect = targetWidth / targetHeight;

  let destW: number;
  let destH: number;

  if (imgAspect > targetAspect) {
    // Image is wider - fit to width, letterbox top/bottom
    destW = targetWidth;
    destH = targetWidth / imgAspect;
  } else {
    // Image is taller - fit to height, letterbox sides
    destH = targetHeight;
    destW = targetHeight * imgAspect;
  }

  const destX = (targetWidth - destW) / 2;
  const destY = (targetHeight - destH) / 2;

  return { destH, destW, destX, destY };
}

/**
 * Calculate source rectangle for canvas drawImage with crop config
 */
export function calculateCropSourceRect(
  cropConfig: SlotCropConfig,
  imgWidth: number,
  imgHeight: number,
  targetWidth: number,
  targetHeight: number
): { sourceH: number; sourceW: number; sourceX: number; sourceY: number; } {
  const imgAspect = imgWidth / imgHeight;
  const targetAspect = targetWidth / targetHeight;

  if (cropConfig.objectFit === "contain") {
    // For contain, we draw the full image
    return {
      sourceH: imgHeight,
      sourceW: imgWidth,
      sourceX: 0,
      sourceY: 0,
    };
  }

  // Cover mode
  let sourceW: number;
  let sourceH: number;
  let sourceX: number;
  let sourceY: number;

  if (imgAspect > targetAspect) {
    // Image is wider - crop sides
    sourceH = imgHeight;
    sourceW = imgHeight * targetAspect;

    // Available pan range is (imgWidth - sourceW)
    const maxOffsetX = (imgWidth - sourceW) / 2;
    sourceX = (imgWidth - sourceW) / 2 - cropConfig.offsetX * maxOffsetX;
    sourceY = 0;
  } else {
    // Image is taller - crop top/bottom
    sourceW = imgWidth;
    sourceH = imgWidth / targetAspect;

    // Available pan range is (imgHeight - sourceH)
    const maxOffsetY = (imgHeight - sourceH) / 2;
    sourceX = 0;
    sourceY = (imgHeight - sourceH) / 2 - cropConfig.offsetY * maxOffsetY;
  }

  return { sourceH, sourceW, sourceX, sourceY };
}

/**
 * Calculate crop offset to center on a face position.
 * @param faceCenter - Normalized face position (0-1)
 * @param photoAspect - Photo width/height ratio
 * @param slotAspect - Slot width/height ratio
 * @returns offsetX, offsetY for SlotCropConfig (-1 to 1)
 */
export function calculateFaceCropOffset(
  faceCenter: { x: number; y: number },
  photoAspect: number,
  slotAspect: number
): { offsetX: number; offsetY: number } {
  let offsetX = 0;
  let offsetY = 0;

  if (photoAspect > slotAspect) {
    // Photo is wider than slot - can pan horizontally
    // faceCenter.x: 0.5 = centered (offset 0), 0 = left (offset -1), 1 = right (offset 1)
    offsetX = (faceCenter.x - 0.5) * 2;
  } else {
    // Photo is taller than slot - can pan vertically
    offsetY = (faceCenter.y - 0.5) * 2;
  }

  return {
    offsetX: clampOffset(offsetX),
    offsetY: clampOffset(offsetY),
  };
}

/**
 * Clamp offset values to valid range
 */
export function clampOffset(offset: number): number {
  return Math.max(-1, Math.min(1, offset));
}

/**
 * Calculate CSS styles for rendering a photo with crop config (for preview)
 */
export function getCropStyles(
  cropConfig: SlotCropConfig
): React.CSSProperties {
  if (cropConfig.objectFit === "contain") {
    return {
      height: "100%",
      objectFit: "contain",
      width: "100%",
    };
  }

  // Cover mode with offset
  // Convert offset from -1..1 to percentage for object-position
  // At 0: 50% (centered)
  // At -1: 0% (show left/top edge)
  // At +1: 100% (show right/bottom edge)
  const posX = 50 + cropConfig.offsetX * 50;
  const posY = 50 + cropConfig.offsetY * 50;

  return {
    height: "100%",
    objectFit: "cover",
    objectPosition: `${posX}% ${posY}%`,
    width: "100%",
  };
}

/**
 * Get crop config for a specific slot, with fallback to defaults
 */
export function getSlotCropConfig(
  slotCrops: SlotCropConfig[] | undefined,
  slotIndex: number
): SlotCropConfig {
  return slotCrops?.[slotIndex] ?? DEFAULT_SLOT_CROP;
}
