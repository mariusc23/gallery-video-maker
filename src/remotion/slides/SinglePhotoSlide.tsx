import { AbsoluteFill, Img } from 'remotion';
import type { SingleSlide } from '@/types';
import { useGalleryStore } from '@/store/useGalleryStore';

interface SinglePhotoSlideProps {
  slide: SingleSlide;
}

export const SinglePhotoSlide: React.FC<SinglePhotoSlideProps> = ({
  slide,
}) => {
  const photo = useGalleryStore((state) => state.photos[slide.photoId]);

  if (!photo) {
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
        Photo not found
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Img
        src={photo.url}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </AbsoluteFill>
  );
};
