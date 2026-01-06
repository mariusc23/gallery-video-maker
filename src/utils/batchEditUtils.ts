import type { Slide } from '@/types';
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
    const currentPhotos = slide.photoIds.filter(id => id && id !== '');

    // If photos fit in new layout or fewer, update in place
    if (currentPhotos.length <= newLayout.photoCount) {
      const paddedPhotoIds = [...currentPhotos];
      while (paddedPhotoIds.length < newLayout.photoCount) {
        paddedPhotoIds.push('');
      }
      newSlides.push({
        ...slide,
        layoutId: newLayoutId,
        photoIds: paddedPhotoIds,
      });
    } else {
      // Need to split into multiple slides
      const chunks: string[][] = [];
      for (let i = 0; i < currentPhotos.length; i += newLayout.photoCount) {
        chunks.push(currentPhotos.slice(i, i + newLayout.photoCount));
      }

      chunks.forEach((chunk, idx) => {
        // Pad chunk with empty strings if needed
        const paddedChunk = [...chunk];
        while (paddedChunk.length < newLayout.photoCount) {
          paddedChunk.push('');
        }

        // Find matching layout or use the new layout
        const matchingLayout = COLLAGE_LAYOUTS.find(
          (l) => l.photoCount === chunk.length
        ) || newLayout;

        newSlides.push({
          ...slide,
          id: idx === 0 ? slide.id : generateId(), // Keep original ID for first chunk
          layoutId: matchingLayout.id,
          photoIds: paddedChunk.slice(0, matchingLayout.photoCount),
        });
      });
    }
  }

  return newSlides;
}
