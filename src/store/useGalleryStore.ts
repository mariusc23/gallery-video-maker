import { create } from 'zustand';
import type { Photo, Slide, SingleSlide, CollageSlide } from '@/types';
import { createPhotoFromFile, generateId, revokePhotoUrls } from '@/utils/photoUtils';
import { COLLAGE_LAYOUTS } from '@/data/layouts';

interface GalleryStore {
  // State
  photos: Record<string, Photo>;
  slides: Slide[];
  selectedSlideIds: Set<string>;
  currentSlideId: string | null;
  playheadFrame: number;
  isPlaying: boolean;
  fps: number;

  // Photo actions
  addPhotos: (files: File[]) => Promise<void>;
  removePhotos: (photoIds: string[]) => void;
  getPhoto: (photoId: string) => Photo | undefined;

  // Slide actions
  createSlidesFromPhotos: (
    photoIds: string[],
    layoutId?: string
  ) => void;
  addPhotosToSelectedSlides: (photoIds: string[]) => void;
  updateSlide: (slideId: string, updates: Partial<Slide>) => void;
  deleteSlides: (slideIds: string[]) => void;
  reorderSlides: (oldIndex: number, newIndex: number) => void;

  // Batch actions
  batchUpdateSlides: (
    slideIds: string[],
    updates: Partial<Omit<Slide, 'id' | 'type' | 'photoId' | 'photoIds' | 'layoutId'>>
  ) => void;

  // Selection actions
  selectSlide: (slideId: string, multi: boolean) => void;
  selectSlideRange: (slideId: string) => void;
  toggleSlideSelection: (slideId: string) => void;
  clearSelection: () => void;
  setCurrentSlide: (slideId: string | null) => void;

  // Playback actions
  setPlayheadFrame: (frame: number) => void;
  setPlaying: (playing: boolean) => void;

  // Computed
  getTotalDuration: () => number;
  getSlideAtFrame: (frame: number) => Slide | null;
}

export const useGalleryStore = create<GalleryStore>((set, get) => ({
  // Initial state
  photos: {},
  slides: [],
  selectedSlideIds: new Set(),
  currentSlideId: null,
  playheadFrame: 0,
  isPlaying: false,
  fps: 30,

  // Photo actions
  addPhotos: async (files: File[]) => {
    const newPhotos: Photo[] = [];

    for (const file of files) {
      try {
        const photo = await createPhotoFromFile(file);
        newPhotos.push(photo);
      } catch (error) {
        console.error('Failed to process photo:', error);
      }
    }

    set((state) => {
      const photos = { ...state.photos };
      newPhotos.forEach((photo) => {
        photos[photo.id] = photo;
      });
      return { photos };
    });
  },

  removePhotos: (photoIds: string[]) => {
    set((state) => {
      const photos = { ...state.photos };
      const photosToRevoke: Photo[] = [];

      photoIds.forEach((id) => {
        if (photos[id]) {
          photosToRevoke.push(photos[id]);
          delete photos[id];
        }
      });

      // Revoke Object URLs to prevent memory leaks
      revokePhotoUrls(photosToRevoke);

      // Remove slides that use these photos
      const slides = state.slides.filter((slide) => {
        if (slide.type === 'single') {
          return !photoIds.includes(slide.photoId);
        } else {
          // Keep collage slides that still have some photos
          return !slide.photoIds.every((id) => photoIds.includes(id));
        }
      });

      return { photos, slides };
    });
  },

  getPhoto: (photoId: string) => {
    return get().photos[photoId];
  },

  // Slide actions
  createSlidesFromPhotos: (photoIds: string[], layoutId?: string) => {
    const newSlides: Slide[] = [];

    if (photoIds.length === 0) return;

    // If no layout specified or only 1 photo, create single slides
    if (!layoutId || photoIds.length === 1) {
      photoIds.forEach((photoId) => {
        const slide: SingleSlide = {
          id: generateId(),
          type: 'single',
          photoId,
          duration: 90, // 3 seconds at 30fps
          transition: { type: 'fade', duration: 15 }, // 0.5s fade
        };
        newSlides.push(slide);
      });
    } else {
      // Create collage slides
      const layout = COLLAGE_LAYOUTS.find((l) => l.id === layoutId);
      if (!layout) {
        console.error('Layout not found:', layoutId);
        return;
      }

      // Chunk photos into groups matching layout photo count
      const chunks: string[][] = [];
      for (let i = 0; i < photoIds.length; i += layout.photoCount) {
        chunks.push(photoIds.slice(i, i + layout.photoCount));
      }

      chunks.forEach((chunk) => {
        if (chunk.length === layout.photoCount) {
          const slide: CollageSlide = {
            id: generateId(),
            type: 'collage',
            layoutId,
            photoIds: chunk,
            duration: 90, // 3 seconds
            transition: { type: 'fade', duration: 15 },
          };
          newSlides.push(slide);
        } else if (chunk.length === 1) {
          // Create single slide for remaining photo
          const slide: SingleSlide = {
            id: generateId(),
            type: 'single',
            photoId: chunk[0],
            duration: 90,
            transition: { type: 'fade', duration: 15 },
          };
          newSlides.push(slide);
        }
        // If chunk.length > 1 but < layout.photoCount, we could either:
        // 1. Create a smaller layout (not implemented yet)
        // 2. Skip them (current behavior)
        // 3. Create individual slides
      });
    }

    set((state) => ({
      slides: [...state.slides, ...newSlides],
    }));
  },

  addPhotosToSelectedSlides: (photoIds: string[]) => {
    set((state) => {
      const { slides, selectedSlideIds } = state;
      if (selectedSlideIds.size === 0 || photoIds.length === 0) {
        return state;
      }

      const selectedSlides = slides.filter((s) => selectedSlideIds.has(s.id));
      const updatedSlides = [...slides];

      selectedSlides.forEach((slide) => {
        const slideIndex = updatedSlides.findIndex((s) => s.id === slide.id);
        if (slideIndex === -1) return;

        if (slide.type === 'collage') {
          // Add photos to collage, replacing empty slots first
          const currentPhotoIds = [...slide.photoIds];
          let photoIndex = 0;

          // Fill empty slots first
          for (let i = 0; i < currentPhotoIds.length && photoIndex < photoIds.length; i++) {
            if (!currentPhotoIds[i] || currentPhotoIds[i] === '') {
              currentPhotoIds[i] = photoIds[photoIndex];
              photoIndex++;
            }
          }

          // If there are still photos left and all slots are filled,
          // we could expand to a larger layout or create new slides
          // For now, just update with filled slots
          updatedSlides[slideIndex] = {
            ...slide,
            photoIds: currentPhotoIds,
          } as Slide;
        }
        // Single slides can't have photos added to them
      });

      return { slides: updatedSlides };
    });
  },

  updateSlide: (slideId: string, updates: Partial<Slide>) => {
    set((state) => ({
      slides: state.slides.map((slide) =>
        slide.id === slideId ? ({ ...slide, ...updates } as Slide) : slide
      ),
    }));
  },

  deleteSlides: (slideIds: string[]) => {
    set((state) => {
      const slides = state.slides.filter((slide) => !slideIds.includes(slide.id));
      const selectedSlideIds = new Set(
        Array.from(state.selectedSlideIds).filter((id) => !slideIds.includes(id))
      );
      const currentSlideId = slideIds.includes(state.currentSlideId ?? '')
        ? null
        : state.currentSlideId;

      return { slides, selectedSlideIds, currentSlideId };
    });
  },

  reorderSlides: (oldIndex: number, newIndex: number) => {
    set((state) => {
      const slides = [...state.slides];
      const [movedSlide] = slides.splice(oldIndex, 1);
      slides.splice(newIndex, 0, movedSlide);
      return { slides };
    });
  },

  // Batch actions
  batchUpdateSlides: (slideIds: string[], updates) => {
    set((state) => ({
      slides: state.slides.map((slide) =>
        slideIds.includes(slide.id) ? ({ ...slide, ...updates } as Slide) : slide
      ),
    }));
  },

  // Selection actions
  selectSlide: (slideId: string, multi: boolean) => {
    set((state) => {
      if (multi) {
        const selectedSlideIds = new Set(state.selectedSlideIds);
        if (selectedSlideIds.has(slideId)) {
          selectedSlideIds.delete(slideId);
        } else {
          selectedSlideIds.add(slideId);
        }
        return {
          selectedSlideIds,
          currentSlideId: slideId,
        };
      } else {
        return {
          selectedSlideIds: new Set([slideId]),
          currentSlideId: slideId,
        };
      }
    });
  },

  selectSlideRange: (slideId: string) => {
    set((state) => {
      const { slides, currentSlideId } = state;

      // If no current slide, just select the clicked one
      if (!currentSlideId) {
        return {
          selectedSlideIds: new Set([slideId]),
          currentSlideId: slideId,
        };
      }

      // Find indices of current and clicked slides
      const currentIndex = slides.findIndex((s) => s.id === currentSlideId);
      const clickedIndex = slides.findIndex((s) => s.id === slideId);

      if (currentIndex === -1 || clickedIndex === -1) {
        return state;
      }

      // Select all slides between current and clicked (inclusive)
      const startIndex = Math.min(currentIndex, clickedIndex);
      const endIndex = Math.max(currentIndex, clickedIndex);
      const selectedSlideIds = new Set<string>();

      for (let i = startIndex; i <= endIndex; i++) {
        selectedSlideIds.add(slides[i].id);
      }

      return {
        selectedSlideIds,
        currentSlideId: slideId,
      };
    });
  },

  toggleSlideSelection: (slideId: string) => {
    set((state) => {
      const selectedSlideIds = new Set(state.selectedSlideIds);
      if (selectedSlideIds.has(slideId)) {
        selectedSlideIds.delete(slideId);
      } else {
        selectedSlideIds.add(slideId);
      }
      return { selectedSlideIds };
    });
  },

  clearSelection: () => {
    set({ selectedSlideIds: new Set(), currentSlideId: null });
  },

  setCurrentSlide: (slideId: string | null) => {
    set({ currentSlideId: slideId });
  },

  // Playback actions
  setPlayheadFrame: (frame: number) => {
    set({ playheadFrame: frame });
  },

  setPlaying: (playing: boolean) => {
    set({ isPlaying: playing });
  },

  // Computed
  getTotalDuration: () => {
    const { slides } = get();
    return slides.reduce((total, slide) => total + slide.duration, 0);
  },

  getSlideAtFrame: (frame: number) => {
    const { slides } = get();
    let currentFrame = 0;

    for (const slide of slides) {
      if (frame >= currentFrame && frame < currentFrame + slide.duration) {
        return slide;
      }
      currentFrame += slide.duration;
    }

    return null;
  },
}));
