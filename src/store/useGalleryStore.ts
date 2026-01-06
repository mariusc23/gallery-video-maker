import { create } from 'zustand';
import type { Photo, Slide, SlotCropConfig } from '@/types';
import { DEFAULT_SLOT_CROP } from '@/types';
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
  addPhotos: (files: File[]) => Promise<string[]>;
  removePhotos: (photoIds: string[]) => void;
  getPhoto: (photoId: string) => Photo | undefined;

  // Slide actions
  createSlidesFromPhotos: (
    photoIds: string[],
    layoutId?: string
  ) => void;
  addPhotosToSelectedSlides: (photoIds: string[]) => void;
  updateSlide: (slideId: string, updates: Partial<Slide>) => void;
  updateSlotCrop: (slideId: string, slotIndex: number, cropUpdates: Partial<SlotCropConfig>) => void;
  deleteSlides: (slideIds: string[]) => void;
  reorderSlides: (oldIndex: number, newIndex: number) => void;
  reorderSelectedSlides: (targetIndex: number) => void;

  // Batch actions
  batchUpdateSlides: (
    slideIds: string[],
    updates: Partial<Omit<Slide, 'id' | 'photoIds' | 'layoutId'>>
  ) => void;
  batchChangeLayout: (slideIds: string[], newLayoutId: string) => void;

  // Selection actions
  selectSlide: (slideId: string, multi: boolean) => void;
  selectSlideRange: (slideId: string) => void;
  selectAllSlides: () => void;
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

    // Return the IDs of newly added photos
    return newPhotos.map((photo) => photo.id);
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

      // Remove slides that use these photos (keep slides that still have some photos)
      const slides = state.slides.filter((slide) => {
        return !slide.photoIds.every((id) => photoIds.includes(id) || !id || id === '');
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

    // Default to single photo layout if no layout specified or only 1 photo
    const selectedLayoutId = layoutId || 'single';
    const layout = COLLAGE_LAYOUTS.find((l) => l.id === selectedLayoutId);
    if (!layout) {
      console.error('Layout not found:', selectedLayoutId);
      return;
    }

    // Chunk photos into groups matching layout photo count
    const chunks: string[][] = [];
    for (let i = 0; i < photoIds.length; i += layout.photoCount) {
      chunks.push(photoIds.slice(i, i + layout.photoCount));
    }

    chunks.forEach((chunk) => {
      // Fill with photos or empty strings if not enough
      const photoIdsForSlide = [...chunk];
      while (photoIdsForSlide.length < layout.photoCount) {
        photoIdsForSlide.push('');
      }

      const slide: Slide = {
        id: generateId(),
        layoutId: selectedLayoutId,
        photoIds: photoIdsForSlide,
        duration: 90, // 3 seconds at 30fps
        transition: { type: 'fade', duration: 15 }, // 0.5s fade
      };
      newSlides.push(slide);
    });

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

        // Add photos to slide, replacing empty slots first
        const currentPhotoIds = [...slide.photoIds];
        let photoIndex = 0;

        // Fill empty slots first
        for (let i = 0; i < currentPhotoIds.length && photoIndex < photoIds.length; i++) {
          if (!currentPhotoIds[i] || currentPhotoIds[i] === '') {
            currentPhotoIds[i] = photoIds[photoIndex];
            photoIndex++;
          }
        }

        updatedSlides[slideIndex] = {
          ...slide,
          photoIds: currentPhotoIds,
        };
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

  updateSlotCrop: (slideId: string, slotIndex: number, cropUpdates: Partial<SlotCropConfig>) => {
    set((state) => ({
      slides: state.slides.map((slide) => {
        if (slide.id !== slideId) return slide;

        // Initialize slotCrops array if needed
        const slotCrops = slide.slotCrops
          ? [...slide.slotCrops]
          : Array(slide.photoIds.length).fill(null).map(() => ({ ...DEFAULT_SLOT_CROP }));

        // Extend array if needed
        while (slotCrops.length <= slotIndex) {
          slotCrops.push({ ...DEFAULT_SLOT_CROP });
        }

        // Update the specific slot
        slotCrops[slotIndex] = { ...slotCrops[slotIndex], ...cropUpdates };

        return { ...slide, slotCrops };
      }),
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

  reorderSelectedSlides: (targetIndex: number) => {
    set((state) => {
      const { slides, selectedSlideIds } = state;
      if (selectedSlideIds.size === 0) return state;

      // Separate selected and non-selected slides, preserving their relative order
      const selectedSlides: typeof slides = [];
      const nonSelectedSlides: typeof slides = [];

      slides.forEach((slide) => {
        if (selectedSlideIds.has(slide.id)) {
          selectedSlides.push(slide);
        } else {
          nonSelectedSlides.push(slide);
        }
      });

      // Find how many non-selected slides come before the target
      let insertPosition = 0;
      let slidesBeforeTarget = 0;
      for (let i = 0; i < slides.length && slidesBeforeTarget < targetIndex; i++) {
        if (!selectedSlideIds.has(slides[i].id)) {
          insertPosition++;
        }
        slidesBeforeTarget++;
      }

      // Clamp insert position
      insertPosition = Math.min(insertPosition, nonSelectedSlides.length);

      // Insert selected slides at the target position
      const newSlides = [...nonSelectedSlides];
      newSlides.splice(insertPosition, 0, ...selectedSlides);

      return { slides: newSlides };
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

  batchChangeLayout: (slideIds: string[], newLayoutId: string) => {
    set((state) => {
      const { slides } = state;
      const newLayout = COLLAGE_LAYOUTS.find((l) => l.id === newLayoutId);
      if (!newLayout) {
        console.error('Layout not found:', newLayoutId);
        return state;
      }

      // Get selected slides
      const selectedSlides = slides.filter((s) => slideIds.includes(s.id));

      if (selectedSlides.length === 0) {
        return state;
      }

      // Collect all photos from selected slides (excluding empty slots)
      const allPhotos: string[] = [];
      selectedSlides.forEach((slide) => {
        slide.photoIds.forEach((photoId) => {
          if (photoId && photoId !== '') {
            allPhotos.push(photoId);
          }
        });
      });

      // Create new slides with redistributed photos
      const newSlides: Slide[] = [];
      let photoIndex = 0;

      // Keep creating slides until we run out of photos
      while (photoIndex < allPhotos.length) {
        const photoIds: string[] = [];

        // Fill this slide with photos
        for (let i = 0; i < newLayout.photoCount; i++) {
          if (photoIndex < allPhotos.length) {
            photoIds.push(allPhotos[photoIndex]);
            photoIndex++;
          } else {
            // Fill remaining slots with empty strings
            photoIds.push('');
          }
        }

        // Use properties from the first selected slide as template
        const templateSlide = selectedSlides[0];
        newSlides.push({
          id: generateId(),
          layoutId: newLayoutId,
          photoIds,
          duration: templateSlide.duration,
          transition: templateSlide.transition,
        });
      }

      // Replace selected slides with new slides in the timeline
      // Find the index of the first selected slide
      const firstSelectedIndex = slides.findIndex((s) =>
        slideIds.includes(s.id)
      );

      // Remove all selected slides and insert new ones at the first position
      const updatedSlides = slides.filter((s) => !slideIds.includes(s.id));
      updatedSlides.splice(firstSelectedIndex, 0, ...newSlides);

      return { slides: updatedSlides };
    });
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

  selectAllSlides: () => {
    set((state) => {
      const { slides } = state;
      if (slides.length === 0) return state;

      const selectedSlideIds = new Set(slides.map((s) => s.id));
      return {
        selectedSlideIds,
        currentSlideId: state.currentSlideId || slides[0].id,
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
