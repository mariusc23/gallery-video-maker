// Crop configuration for a photo slot
export type ObjectFit = "contain" | "cover";

// Photo entity
export interface Photo {
  aspectRatio: number;
  faceCenter?: { x: number; y: number }; // Normalized 0-1 position of detected face center
  file: File;
  height: number;
  id: string;
  thumbnail: string; // base64 data URL for thumbnails
  url: string; // Object URL for display
  width: number;
}

export interface SlotCropConfig {
  objectFit: ObjectFit;
  offsetX: number; // -1 to 1, 0 = centered
  offsetY: number; // -1 to 1, 0 = centered
}

export interface TransitionConfig {
  duration: number; // in frames (30fps)
  type: TransitionType;
}

// Transition types
export type TransitionType =
  | "blur"
  | "fade"
  | "kenBurns"
  | "none"
  | "rotate"
  | "slide"
  | "zoom";

export const DEFAULT_SLOT_CROP: SlotCropConfig = {
  objectFit: "cover",
  offsetX: 0,
  offsetY: 0,
};

// Application state
export interface AppState {
  currentSlideId: null | string;
  fps: number;
  isPlaying: boolean;
  photos: Record<string, Photo>; // Keyed by ID
  playheadFrame: number;
  selectedSlideIds: Set<string>;
  slides: Slide[];
}

export interface CollageLayout {
  aspectRatio: number; // 16/9 for video
  id: string;
  name: string;
  photoCount: number; // 1-12 (includes single photo)
  slots: LayoutSlot[];
}

// Collage layout definitions
export interface LayoutSlot {
  height: number; // percentage 0-100
  id: string;
  width: number; // percentage 0-100
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  zIndex?: number;
}

// Slide type - all slides are now treated as layouts with photo slots
export interface Slide {
  duration: number; // in frames at 30fps
  id: string;
  layoutId: string;
  photoIds: string[]; // Must match layout photoCount
  slotCrops?: SlotCropConfig[]; // Optional crop config per slot, parallel to photoIds
  transition: TransitionConfig;
}
