import type { Slide } from "@/types";

export interface ProjectFile {
  createdAt: string;
  photos: SerializedPhoto[];
  slides: Slide[];
  updatedAt: string;
  version: 1;
}

export interface SerializedPhoto {
  aspectRatio: number;
  faceCenter?: { x: number; y: number };
  fileName: string;
  height: number;
  id: string;
  mimeType: string;
  width: number;
}
