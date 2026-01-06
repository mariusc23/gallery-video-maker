import type { Slide } from '@/types';
import { SinglePhotoSlide } from './slides/SinglePhotoSlide';
import { CollageSlide } from './slides/CollageSlide';

interface SlideRendererProps {
  slide: Slide;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({ slide }) => {
  if (slide.type === 'single') {
    return <SinglePhotoSlide slide={slide} />;
  }

  return <CollageSlide slide={slide} />;
};
