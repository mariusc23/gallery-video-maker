import type { Photo } from "@/types";

import { detectFaceCenter } from "./faceDetection";

/**
 * Chunk an array into smaller arrays of specified size
 * @param array - The array to chunk
 * @param size - The size of each chunk
 * @returns Array of chunks
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Create a Photo object from a File
 * @param file - The image file
 * @returns Photo object with metadata
 */
export async function createPhotoFromFile(file: File): Promise<Photo> {
  const id = generateId();
  const url = URL.createObjectURL(file);

  try {
    // Load image to get dimensions
    const img = await loadImage(url);

    // Create thumbnail
    const thumbnail = await createThumbnail(img, 200);

    // Detect face center for smart cropping
    const faceCenter = await detectFaceCenter(img);

    return {
      aspectRatio: img.width / img.height,
      faceCenter: faceCenter ?? undefined,
      file,
      height: img.height,
      id,
      thumbnail,
      url,
      width: img.width,
    };
  } catch (error: unknown) {
    // Clean up object URL if there's an error
    URL.revokeObjectURL(url);
    throw error;
  }
}

/**
 * Generate a unique ID for photos and slides
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Revoke object URLs to prevent memory leaks
 * @param photos - Array of photos whose URLs should be revoked
 */
export function revokePhotoUrls(photos: Photo[]): void {
  photos.forEach((photo) => {
    URL.revokeObjectURL(photo.url);
  });
}

/**
 * Create a thumbnail from an image
 * @param img - The source image
 * @param maxSize - Maximum dimension (width or height) in pixels
 * @returns Base64 data URL of the thumbnail
 */
async function createThumbnail(
  img: HTMLImageElement,
  maxSize: number = 200
): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  const scale = Math.min(maxSize / img.width, maxSize / img.height);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.7);
}

/**
 * Load an image from a URL and return the HTMLImageElement
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}
