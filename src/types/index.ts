// Photo entity
export interface Photo {
  id: string;
  url: string; // Object URL for display
  file: File;
  thumbnail: string; // base64 data URL for thumbnails
  width: number;
  height: number;
  aspectRatio: number;
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
