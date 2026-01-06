import { strFromU8, unzip } from "fflate";

import type { Photo, Slide } from "@/types";

import type { ProjectFile, SerializedPhoto } from "./types";

export interface DeserializeProgress {
  current: number;
  status: "deserializing";
  total: number;
}

export interface DeserializeResult {
  photos: Record<string, Photo>;
  slides: Slide[];
}

export async function deserializeProject(
  file: File,
  onProgress?: (progress: DeserializeProgress) => void
): Promise<DeserializeResult> {
  const arrayBuffer = await file.arrayBuffer();

  return new Promise((resolve, reject) => {
    unzip(new Uint8Array(arrayBuffer), (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        // Parse project.json
        const projectJsonData = files["project.json"];
        if (!projectJsonData) {
          reject(new Error("Invalid project file: missing project.json"));
          return;
        }

        const projectData: unknown = JSON.parse(strFromU8(projectJsonData));
        if (!validateProjectFile(projectData)) {
          reject(new Error("Invalid project file format"));
          return;
        }

        const total = projectData.photos.length;
        const photos: Record<string, Photo> = {};

        // Reconstruct photos
        for (let i = 0; i < projectData.photos.length; i++) {
          const serializedPhoto = projectData.photos[i];
          const photo = reconstructPhoto(serializedPhoto, files);
          photos[photo.id] = photo;

          onProgress?.({
            current: i + 1,
            status: "deserializing",
            total,
          });
        }

        resolve({
          photos,
          slides: projectData.slides,
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}

export function validateProjectFile(data: unknown): data is ProjectFile {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return (
    obj.version === 1 &&
    Array.isArray(obj.photos) &&
    Array.isArray(obj.slides) &&
    typeof obj.createdAt === "string" &&
    typeof obj.updatedAt === "string"
  );
}

function reconstructPhoto(
  serialized: SerializedPhoto,
  files: Record<string, Uint8Array>
): Photo {
  // Find the photo file in the ZIP
  const photoKey = Object.keys(files).find(
    (key) => key.startsWith(`photos/${serialized.id}.`) && !key.endsWith(".thumb")
  );

  if (!photoKey) {
    throw new Error(`Missing photo file for ${serialized.id}`);
  }

  const imageData = files[photoKey];
  const photoFile = new File([imageData.buffer as ArrayBuffer], serialized.fileName, {
    type: serialized.mimeType,
  });
  const url = URL.createObjectURL(photoFile);

  // Get thumbnail
  const thumbKey = `photos/${serialized.id}.thumb`;
  const thumbnail = files[thumbKey] ? strFromU8(files[thumbKey]) : "";

  return {
    aspectRatio: serialized.aspectRatio,
    faceCenter: serialized.faceCenter,
    file: photoFile,
    height: serialized.height,
    id: serialized.id,
    thumbnail,
    url,
    width: serialized.width,
  };
}
