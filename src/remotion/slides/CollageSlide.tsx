import { AbsoluteFill, Img } from 'remotion';
import type { Slide } from '@/types';
import { useGalleryStore } from '@/store/useGalleryStore';
import { COLLAGE_LAYOUTS } from '@/data/layouts';

interface CollageSlideProps {
  slide: Slide;
}

export const CollageSlide: React.FC<CollageSlideProps> = ({ slide }) => {
  const photos = useGalleryStore((state) => state.photos);
  const layout = COLLAGE_LAYOUTS.find((l) => l.id === slide.layoutId);

  if (!layout) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        Layout not found
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {layout.slots.map((slot, idx) => {
        const photoId = slide.photoIds[idx];
        const photo = photoId ? photos[photoId] : null;

        if (!photo) {
          return (
            <div
              key={slot.id}
              style={{
                position: 'absolute',
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                width: `${slot.width}%`,
                height: `${slot.height}%`,
                backgroundColor: '#333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: 24,
              }}
            >
              No photo
            </div>
          );
        }

        return (
          <div
            key={slot.id}
            style={{
              position: 'absolute',
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              width: `${slot.width}%`,
              height: `${slot.height}%`,
              overflow: 'hidden',
              zIndex: slot.zIndex || 0,
            }}
          >
            <Img
              src={photo.url}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
