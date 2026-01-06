import { Composition } from "remotion";

import { VideoComposition } from "./VideoComposition";

// This will be dynamically configured based on slides
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        component={VideoComposition}
        durationInFrames={300} // Default 10 seconds, will be overridden by Player
        fps={30}
        height={1080}
        id="GalleryVideo"
        width={1920}
      />
    </>
  );
};
