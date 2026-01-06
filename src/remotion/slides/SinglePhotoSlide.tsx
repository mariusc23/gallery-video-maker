import { AbsoluteFill, Img } from "remotion";
import type { Slide } from "@/types";
import { useGalleryStore } from "@/store/useGalleryStore";

interface SinglePhotoSlideProps {
  slide: Slide;
}

// NOTE: This component is deprecated. All slides now use CollageSlide with layouts.
// Kept for backwards compatibility but not actively used.
export const SinglePhotoSlide: React.FC<SinglePhotoSlideProps> = ({
  slide,
}) => {
  const photo = useGalleryStore((state) => state.photos[slide.photoIds[0]]);

  if (!photo) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        Photo not found
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Img
        src={photo.url}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </AbsoluteFill>
  );
};
