import { create } from "zustand";

import type { LayoutSlot, Photo, Slide, SlotCropConfig } from "@/types";

import { COLLAGE_LAYOUTS } from "@/data/layouts";
import { DEFAULT_SLOT_CROP } from "@/types";
import { calculateFaceCropOffset } from "@/utils/cropUtils";
import {
  createPhotoFromFile,
  generateId,
  revokePhotoUrls,
} from "@/utils/photoUtils";

interface GalleryStore {
  // Photo actions
  addPhotos: (files: File[]) => Promise<string[]>;
  addPhotosToSelectedSlides: (photoIds: string[]) => void;
  batchChangeLayout: (slideIds: string[], newLayoutId: string) => void;
  // Batch actions
  batchUpdateSlides: (
    slideIds: string[],
    updates: Partial<Omit<Slide, "id" | "layoutId" | "photoIds">>
  ) => void;
  clearSelection: () => void;
  createSlidesAutoLayout: (photoIds: string[]) => void;
  // Slide actions
  createSlidesFromPhotos: (photoIds: string[], layoutId?: string) => void;

  currentSlideId: null | string;
  deleteSlides: (slideIds: string[]) => void;
  fps: number;

  getPhoto: (photoId: string) => Photo | undefined;
  getSlideAtFrame: (frame: number) => null | Slide;
  // Computed
  getTotalDuration: () => number;
  isPlaying: boolean;
  // State
  photos: Record<string, Photo>;
  playheadFrame: number;
  removePhotos: (photoIds: string[]) => void;
  reorderSelectedSlides: (targetIndex: number) => void;

  reorderSlides: (oldIndex: number, newIndex: number) => void;
  selectAllSlides: () => void;

  selectedSlideIds: Set<string>;
  // Selection actions
  selectSlide: (slideId: string, multi: boolean) => void;
  selectSlideRange: (slideId: string) => void;
  setCurrentSlide: (slideId: null | string) => void;
  // Playback actions
  setPlayheadFrame: (frame: number) => void;
  setPlaying: (playing: boolean) => void;

  slides: Slide[];
  toggleSlideSelection: (slideId: string) => void;

  updateSlide: (slideId: string, updates: Partial<Slide>) => void;
  updateSlotCrop: (
    slideId: string,
    slotIndex: number,
    cropUpdates: Partial<SlotCropConfig>
  ) => void;
}

/**
 * Calculate initial slot crop config for a photo, using face detection if available
 */
function getInitialSlotCrop(
  photo: Photo | undefined,
  slot: LayoutSlot
): SlotCropConfig {
  if (!photo?.faceCenter) {
    return { ...DEFAULT_SLOT_CROP };
  }

  // Calculate slot aspect ratio (slot dimensions are percentages of 16:9 canvas)
  const slotAspect = (slot.width / slot.height) * (16 / 9);
  const { offsetX, offsetY } = calculateFaceCropOffset(
    photo.faceCenter,
    photo.aspectRatio,
    slotAspect
  );

  return {
    ...DEFAULT_SLOT_CROP,
    offsetX,
    offsetY,
  };
}

export const useGalleryStore = create<GalleryStore>((set, get) => ({
  // Photo actions
  addPhotos: async (files: File[]) => {
    const newPhotos: Photo[] = [];

    for (const file of files) {
      try {
        const photo = await createPhotoFromFile(file);
        newPhotos.push(photo);
      } catch (error) {
        console.error("Failed to process photo:", error);
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
  addPhotosToSelectedSlides: (photoIds: string[]) => {
    set((state) => {
      const { selectedSlideIds, slides } = state;
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
        for (
          let i = 0;
          i < currentPhotoIds.length && photoIndex < photoIds.length;
          i++
        ) {
          if (!currentPhotoIds[i] || currentPhotoIds[i] === "") {
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
  batchChangeLayout: (slideIds: string[], newLayoutId: string) => {
    set((state) => {
      const { slides } = state;
      const newLayout = COLLAGE_LAYOUTS.find((l) => l.id === newLayoutId);
      if (!newLayout) {
        console.error("Layout not found:", newLayoutId);
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
          if (photoId && photoId !== "") {
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
            photoIds.push("");
          }
        }

        // Use properties from the first selected slide as template
        const templateSlide = selectedSlides[0];
        newSlides.push({
          duration: templateSlide.duration,
          id: generateId(),
          layoutId: newLayoutId,
          photoIds,
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
  // Batch actions
  batchUpdateSlides: (slideIds: string[], updates) => {
    set((state) => ({
      slides: state.slides.map((slide) =>
        slideIds.includes(slide.id)
          ? ({ ...slide, ...updates } as Slide)
          : slide
      ),
    }));
  },
  clearSelection: () => {
    set({ currentSlideId: null, selectedSlideIds: new Set() });
  },
  createSlidesAutoLayout: (photoIds: string[]) => {
    const { photos } = get();
    const newSlides: Slide[] = [];

    if (photoIds.length === 0) return;

    // Helper to check if photo is landscape (aspectRatio >= 1)
    const isLandscape = (photoId: string): boolean => {
      const photo = photos[photoId];
      return photo ? photo.aspectRatio >= 1 : true; // Default to landscape if photo not found
    };

    // Helper to create slide with face-based crop
    const createSlide = (layoutId: string, slidePhotoIds: string[]): Slide => {
      const layout = COLLAGE_LAYOUTS.find((l) => l.id === layoutId);
      const slotCrops = slidePhotoIds.map((photoId, idx) => {
        const photo = photos[photoId];
        const slot = layout?.slots[idx];
        return slot
          ? getInitialSlotCrop(photo, slot)
          : { ...DEFAULT_SLOT_CROP };
      });

      return {
        duration: 90,
        id: generateId(),
        layoutId,
        photoIds: slidePhotoIds,
        slotCrops,
        transition: { duration: 15, type: "fade" },
      };
    };

    // Alternator for large-left vs large-right layouts
    let useLargeLeft = true;

    let i = 0;
    while (i < photoIds.length) {
      const currentPhotoId = photoIds[i];
      const nextPhotoId = photoIds[i + 1];

      if (isLandscape(currentPhotoId)) {
        // Landscape photo → single slide
        newSlides.push(createSlide("single", [currentPhotoId]));
        i++;
      } else {
        // Current photo is portrait
        if (!nextPhotoId) {
          // No next photo → single slide
          newSlides.push(createSlide("single", [currentPhotoId]));
          i++;
        } else if (!isLandscape(nextPhotoId)) {
          // Next photo is also portrait → split-horizontal (50/50)
          newSlides.push(
            createSlide("split-horizontal", [currentPhotoId, nextPhotoId])
          );
          i += 2;
        } else {
          // Next photo is landscape → side-by-side with landscape in large slot
          // Alternate between large-left and large-right
          if (useLargeLeft) {
            // Landscape on left (large), Portrait on right (small)
            newSlides.push(
              createSlide("side-by-side-large-left", [
                nextPhotoId,
                currentPhotoId,
              ])
            );
          } else {
            // Portrait on left (small), Landscape on right (large)
            newSlides.push(
              createSlide("side-by-side-large-right", [
                currentPhotoId,
                nextPhotoId,
              ])
            );
          }
          useLargeLeft = !useLargeLeft;
          i += 2;
        }
      }
    }

    set((state) => ({
      slides: [...state.slides, ...newSlides],
    }));
  },
  // Slide actions
  createSlidesFromPhotos: (photoIds: string[], layoutId?: string) => {
    const { photos } = get();
    const newSlides: Slide[] = [];

    if (photoIds.length === 0) return;

    // Default to single photo layout if no layout specified or only 1 photo
    const selectedLayoutId = layoutId || "single";
    const layout = COLLAGE_LAYOUTS.find((l) => l.id === selectedLayoutId);
    if (!layout) {
      console.error("Layout not found:", selectedLayoutId);
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
        photoIdsForSlide.push("");
      }

      // Calculate initial crop configs based on face detection
      const slotCrops = photoIdsForSlide.map((photoId, idx) => {
        const photo = photos[photoId];
        const slot = layout.slots[idx];
        return getInitialSlotCrop(photo, slot);
      });

      const slide: Slide = {
        duration: 90, // 3 seconds at 30fps
        id: generateId(),
        layoutId: selectedLayoutId,
        photoIds: photoIdsForSlide,
        slotCrops,
        transition: { duration: 15, type: "fade" }, // 0.5s fade
      };
      newSlides.push(slide);
    });

    set((state) => ({
      slides: [...state.slides, ...newSlides],
    }));
  },

  currentSlideId: null,

  deleteSlides: (slideIds: string[]) => {
    set((state) => {
      const slides = state.slides.filter(
        (slide) => !slideIds.includes(slide.id)
      );
      const selectedSlideIds = new Set(
        Array.from(state.selectedSlideIds).filter(
          (id) => !slideIds.includes(id)
        )
      );
      const currentSlideId = slideIds.includes(state.currentSlideId ?? "")
        ? null
        : state.currentSlideId;

      return { currentSlideId, selectedSlideIds, slides };
    });
  },

  fps: 30,

  getPhoto: (photoId: string) => {
    return get().photos[photoId];
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

  // Computed
  getTotalDuration: () => {
    const { slides } = get();
    return slides.reduce((total, slide) => total + slide.duration, 0);
  },

  isPlaying: false,

  // Initial state
  photos: {},

  playheadFrame: 0,

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
        return !slide.photoIds.every(
          (id) => photoIds.includes(id) || !id || id === ""
        );
      });

      return { photos, slides };
    });
  },

  reorderSelectedSlides: (targetIndex: number) => {
    set((state) => {
      const { selectedSlideIds, slides } = state;
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
      for (
        let i = 0;
        i < slides.length && slidesBeforeTarget < targetIndex;
        i++
      ) {
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

  reorderSlides: (oldIndex: number, newIndex: number) => {
    set((state) => {
      const slides = [...state.slides];
      const [movedSlide] = slides.splice(oldIndex, 1);
      slides.splice(newIndex, 0, movedSlide);
      return { slides };
    });
  },

  selectAllSlides: () => {
    set((state) => {
      const { slides } = state;
      if (slides.length === 0) return state;

      const selectedSlideIds = new Set(slides.map((s) => s.id));
      return {
        currentSlideId: state.currentSlideId || slides[0].id,
        selectedSlideIds,
      };
    });
  },

  selectedSlideIds: new Set(),

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
          currentSlideId: slideId,
          selectedSlideIds,
        };
      } else {
        return {
          currentSlideId: slideId,
          selectedSlideIds: new Set([slideId]),
        };
      }
    });
  },

  selectSlideRange: (slideId: string) => {
    set((state) => {
      const { currentSlideId, slides } = state;

      // If no current slide, just select the clicked one
      if (!currentSlideId) {
        return {
          currentSlideId: slideId,
          selectedSlideIds: new Set([slideId]),
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
        currentSlideId: slideId,
        selectedSlideIds,
      };
    });
  },

  setCurrentSlide: (slideId: null | string) => {
    set({ currentSlideId: slideId });
  },

  // Playback actions
  setPlayheadFrame: (frame: number) => {
    set({ playheadFrame: frame });
  },

  setPlaying: (playing: boolean) => {
    set({ isPlaying: playing });
  },

  slides: [],

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

  updateSlide: (slideId: string, updates: Partial<Slide>) => {
    set((state) => ({
      slides: state.slides.map((slide) =>
        slide.id === slideId ? ({ ...slide, ...updates } as Slide) : slide
      ),
    }));
  },

  updateSlotCrop: (
    slideId: string,
    slotIndex: number,
    cropUpdates: Partial<SlotCropConfig>
  ) => {
    set((state) => ({
      slides: state.slides.map((slide) => {
        if (slide.id !== slideId) return slide;

        // Initialize slotCrops array if needed
        const slotCrops = slide.slotCrops
          ? [...slide.slotCrops]
          : Array(slide.photoIds.length)
              .fill(null)
              .map(() => ({ ...DEFAULT_SLOT_CROP }));

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
}));
