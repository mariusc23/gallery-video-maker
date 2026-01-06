import { Composition } from "remotion";
import { VideoComposition } from "./VideoComposition";

// This will be dynamically configured based on slides
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GalleryVideo"
        component={VideoComposition}
        durationInFrames={300} // Default 10 seconds, will be overridden by Player
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
