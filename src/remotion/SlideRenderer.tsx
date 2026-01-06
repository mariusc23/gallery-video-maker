import type { Slide } from '@/types';
import { CollageSlide } from './slides/CollageSlide';

interface SlideRendererProps {
  slide: Slide;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({ slide }) => {
  // All slides now use the layout-based rendering
  return <CollageSlide slide={slide} />;
};
