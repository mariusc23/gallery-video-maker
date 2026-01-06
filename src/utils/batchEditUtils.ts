import type { Slide, CollageSlide } from '@/types';
import { COLLAGE_LAYOUTS } from '@/data/layouts';
import { generateId } from './photoUtils';

/**
 * Split slides when changing to a layout with fewer photo slots
 * Creates additional slides to accommodate all photos
 */
export function splitSlidesForLayout(
  slides: Slide[],
  newLayoutId: string
): Slide[] {
  const newLayout = COLLAGE_LAYOUTS.find((l) => l.id === newLayoutId);
  if (!newLayout) {
    return slides;
  }

  const newSlides: Slide[] = [];

  for (const slide of slides) {
    // Single slides remain unchanged
    if (slide.type === 'single') {
      newSlides.push(slide);
      continue;
    }

    const currentPhotos = slide.photoIds;

    // If photos fit in new layout or fewer, update in place
    if (currentPhotos.length <= newLayout.photoCount) {
      newSlides.push({
        ...slide,
        layoutId: newLayoutId,
      } as CollageSlide);
    } else {
      // Need to split into multiple slides
      const chunks: string[][] = [];
      for (let i = 0; i < currentPhotos.length; i += newLayout.photoCount) {
        chunks.push(currentPhotos.slice(i, i + newLayout.photoCount));
      }

      chunks.forEach((chunk, idx) => {
        if (chunk.length === newLayout.photoCount) {
          // Create collage slide with full layout
          newSlides.push({
            ...slide,
            id: idx === 0 ? slide.id : generateId(), // Keep original ID for first chunk
            layoutId: newLayoutId,
            photoIds: chunk,
          } as CollageSlide);
        } else if (chunk.length === 1) {
          // Create single slide for remaining photo
          newSlides.push({
            id: generateId(),
            type: 'single',
            photoId: chunk[0],
            duration: slide.duration,
            transition: slide.transition,
          });
        } else {
          // Find a layout that matches the remaining photo count
          const matchingLayout = COLLAGE_LAYOUTS.find(
            (l) => l.photoCount === chunk.length
          );
          if (matchingLayout) {
            newSlides.push({
              ...slide,
              id: generateId(),
              layoutId: matchingLayout.id,
              photoIds: chunk,
            } as CollageSlide);
          } else {
            // Fallback: create individual slides for remaining photos
            chunk.forEach((photoId) => {
              newSlides.push({
                id: generateId(),
                type: 'single',
                photoId,
                duration: slide.duration,
                transition: slide.transition,
              });
            });
          }
        }
      });
    }
  }

  return newSlides;
}
