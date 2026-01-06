// Photo entity
export interface Photo {
  id: string;
  url: string; // Object URL for display
  file: File;
  thumbnail: string; // base64 data URL for thumbnails
  width: number;
  height: number;
  aspectRatio: number;
  faceCenter?: { x: number; y: number }; // Normalized 0-1 position of detected face center
}

// Transition types
export type TransitionType =
  | 'none'
  | 'fade'
  | 'slide'
  | 'zoom'
  | 'rotate'
  | 'blur'
  | 'kenBurns';

export interface TransitionConfig {
  type: TransitionType;
  duration: number; // in frames (30fps)
}

// Crop configuration for a photo slot
export type ObjectFit = 'cover' | 'contain';

export interface SlotCropConfig {
  objectFit: ObjectFit;
  offsetX: number; // -1 to 1, 0 = centered
  offsetY: number; // -1 to 1, 0 = centered
}

export const DEFAULT_SLOT_CROP: SlotCropConfig = {
  objectFit: 'cover',
  offsetX: 0,
  offsetY: 0,
};

// Collage layout definitions
export interface LayoutSlot {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  zIndex?: number;
}

export interface CollageLayout {
  id: string;
  name: string;
  photoCount: number; // 1-12 (includes single photo)
  slots: LayoutSlot[];
  aspectRatio: number; // 16/9 for video
}

// Slide type - all slides are now treated as layouts with photo slots
export interface Slide {
  id: string;
  layoutId: string;
  photoIds: string[]; // Must match layout photoCount
  slotCrops?: SlotCropConfig[]; // Optional crop config per slot, parallel to photoIds
  duration: number; // in frames at 30fps
  transition: TransitionConfig;
}

// Application state
export interface AppState {
  photos: Record<string, Photo>; // Keyed by ID
  slides: Slide[];
  selectedSlideIds: Set<string>;
  currentSlideId: string | null;
  playheadFrame: number;
  fps: number;
  isPlaying: boolean;
}
