import { AbsoluteFill, Img } from "remotion";

import type { Slide } from "@/types";

import { COLLAGE_LAYOUTS } from "@/data/layouts";
import { useGalleryStore } from "@/store/useGalleryStore";
import { getCropStyles, getSlotCropConfig } from "@/utils/cropUtils";

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
          alignItems: "center",
          backgroundColor: "#000",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
        }}
      >
        Layout not found
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {layout.slots.map((slot, idx) => {
        const photoId = slide.photoIds[idx];
        const photo = photoId ? photos[photoId] : null;

        if (!photo) {
          return (
            <div
              key={slot.id}
              style={{
                alignItems: "center",
                backgroundColor: "#333",
                color: "#666",
                display: "flex",
                fontSize: 24,
                height: `${slot.height}%`,
                justifyContent: "center",
                left: `${slot.x}%`,
                position: "absolute",
                top: `${slot.y}%`,
                width: `${slot.width}%`,
              }}
            >
              No photo
            </div>
          );
        }

        const cropConfig = getSlotCropConfig(slide.slotCrops, idx);
        const cropStyles = getCropStyles(cropConfig);

        return (
          <div
            key={slot.id}
            style={{
              backgroundColor: "#000",
              height: `${slot.height}%`,
              left: `${slot.x}%`,
              overflow: "hidden",
              position: "absolute",
              top: `${slot.y}%`,
              width: `${slot.width}%`,
              zIndex: slot.zIndex || 0,
            }}
          >
            <Img src={photo.url} style={cropStyles} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
