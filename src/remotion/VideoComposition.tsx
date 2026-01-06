import { Series } from "remotion";

import { useGalleryStore } from "@/store/useGalleryStore";

import { SlideRenderer } from "./SlideRenderer";

export const VideoComposition: React.FC = () => {
  const slides = useGalleryStore((state) => state.slides);

  if (slides.length === 0) {
    return (
      <div
        style={{
          alignItems: "center",
          backgroundColor: "#000",
          color: "#fff",
          display: "flex",
          fontFamily: "sans-serif",
          fontSize: 48,
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        No slides to preview
      </div>
    );
  }

  return (
    <Series>
      {slides.map((slide) => (
        <Series.Sequence durationInFrames={slide.duration} key={slide.id}>
          <SlideRenderer slide={slide} />
        </Series.Sequence>
      ))}
    </Series>
  );
};
