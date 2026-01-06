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
  photoCount: number; // 2-12
  slots: LayoutSlot[];
  aspectRatio: number; // 16/9 for video
}

// Slide types
export type SlideType = 'single' | 'collage';

export interface BaseSlide {
  id: string;
  type: SlideType;
  duration: number; // in frames at 30fps
  transition: TransitionConfig;
}

export interface SingleSlide extends BaseSlide {
  type: 'single';
  photoId: string;
}

export interface CollageSlide extends BaseSlide {
  type: 'collage';
  layoutId: string;
  photoIds: string[]; // Must match layout photoCount
}

export type Slide = SingleSlide | CollageSlide;

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
