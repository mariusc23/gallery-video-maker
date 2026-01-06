import { Series } from 'remotion';
import { useGalleryStore } from '@/store/useGalleryStore';
import { SlideRenderer } from './SlideRenderer';

export const VideoComposition: React.FC = () => {
  const slides = useGalleryStore((state) => state.slides);

  if (slides.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          color: '#fff',
          fontSize: 48,
          fontFamily: 'sans-serif',
        }}
      >
        No slides to preview
      </div>
    );
  }

  return (
    <Series>
      {slides.map((slide) => (
        <Series.Sequence key={slide.id} durationInFrames={slide.duration}>
          <SlideRenderer slide={slide} />
        </Series.Sequence>
      ))}
    </Series>
  );
};
