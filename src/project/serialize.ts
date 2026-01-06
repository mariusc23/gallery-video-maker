import { strToU8, Zip, ZipDeflate, ZipPassThrough } from "fflate";

import type { Photo, Slide } from "@/types";

import type { ProjectFile, SerializedPhoto } from "./types";

export interface SerializeProgress {
  current: number;
  status: "serializing";
  total: number;
}

export async function serializeProject(
  photos: Record<string, Photo>,
  slides: Slide[],
  onProgress?: (progress: SerializeProgress) => void
): Promise<Blob> {
  const photoArray = Object.values(photos);
  const total = photoArray.length;

  // Build project metadata
  const projectData: ProjectFile = {
    createdAt: new Date().toISOString(),
    photos: photoArray.map(serializePhoto),
    slides,
    updatedAt: new Date().toISOString(),
    version: 1,
  };

  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];

    const zipStream = new Zip((err, chunk, final) => {
      if (err) {
        reject(err);
        return;
      }
      if (chunk) {
        chunks.push(chunk);
      }
      if (final) {
        // Convert chunks to ArrayBuffers for Blob compatibility
        const blobParts = chunks.map((c) => c.buffer as ArrayBuffer);
        resolve(new Blob(blobParts, { type: "application/zip" }));
      }
    });

    // Add project.json (small, can compress)
    const projectJson = new ZipDeflate("project.json", { level: 6 });
    zipStream.add(projectJson);
    projectJson.push(strToU8(JSON.stringify(projectData, null, 2)), true);

    // Process photos one at a time
    const processPhotos = async () => {
      for (let i = 0; i < photoArray.length; i++) {
        const photo = photoArray[i];
        const mimeType = photo.file?.type || "image/jpeg";
        const extension = getExtension(mimeType);

        // Add photo file (no compression - images are already compressed)
        const photoFile = new ZipPassThrough(`photos/${photo.id}${extension}`);
        zipStream.add(photoFile);

        // Fetch from Object URL (more reliable than File.arrayBuffer which can expire)
        const response = await fetch(photo.url);
        const arrayBuffer = await response.arrayBuffer();
        photoFile.push(new Uint8Array(arrayBuffer), true);

        // Add thumbnail (small, can compress)
        if (photo.thumbnail) {
          const thumbFile = new ZipDeflate(`photos/${photo.id}.thumb`, {
            level: 6,
          });
          zipStream.add(thumbFile);
          thumbFile.push(strToU8(photo.thumbnail), true);
        }

        onProgress?.({
          current: i + 1,
          status: "serializing",
          total,
        });

        // Allow GC between photos
        await new Promise((r) => setTimeout(r, 0));
      }

      zipStream.end();
    };

    processPhotos().catch(reject);
  });
}

function getExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    "image/gif": ".gif",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  return extensions[mimeType] || ".jpg";
}

function serializePhoto(photo: Photo): SerializedPhoto {
  return {
    aspectRatio: photo.aspectRatio,
    faceCenter: photo.faceCenter,
    fileName: photo.file?.name || `${photo.id}.jpg`,
    height: photo.height,
    id: photo.id,
    mimeType: photo.file?.type || "image/jpeg",
    width: photo.width,
  };
}
