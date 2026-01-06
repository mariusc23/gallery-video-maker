import type { PlayerRef } from "@remotion/player";

import { Player } from "@remotion/player";
import { useEffect, useRef } from "react";

import { VideoComposition } from "@/remotion/VideoComposition";
import { useGalleryStore } from "@/store/useGalleryStore";

export function PreviewPanel() {
  const slides = useGalleryStore((state) => state.slides);
  const totalDuration = useGalleryStore((state) => state.getTotalDuration());
  const playheadFrame = useGalleryStore((state) => state.playheadFrame);
  const playerRef = useRef<PlayerRef>(null);

  // Seek the player when playhead changes from timeline
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.seekTo(playheadFrame);
    }
  }, [playheadFrame]);

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Preview</h2>
        <p className="text-muted-foreground text-xs">
          {(totalDuration / 30).toFixed(1)} seconds total
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-black">
        {slides.length === 0 ? (
          <div className="text-muted-foreground text-center text-sm">
            Preview will appear here
            <br />
            when you add slides
          </div>
        ) : (
          <Player
            component={VideoComposition}
            compositionHeight={1080}
            compositionWidth={1920}
            controls
            durationInFrames={totalDuration || 90}
            fps={30}
            ref={playerRef}
            style={{
              maxHeight: "100%",
              width: "100%",
            }}
          />
        )}
      </div>
    </div>
  );
}
