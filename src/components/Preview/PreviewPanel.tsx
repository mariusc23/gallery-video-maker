import { Player } from '@remotion/player';
import { useGalleryStore } from '@/store/useGalleryStore';
import { VideoComposition } from '@/remotion/VideoComposition';

export function PreviewPanel() {
  const slides = useGalleryStore((state) => state.slides);
  const totalDuration = useGalleryStore((state) => state.getTotalDuration());

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Preview</h2>
        <p className="text-xs text-muted-foreground">
          {(totalDuration / 30).toFixed(1)} seconds total
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden">
        {slides.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            Preview will appear here
            <br />
            when you add slides
          </div>
        ) : (
          <Player
            component={VideoComposition}
            durationInFrames={totalDuration || 90}
            compositionWidth={1920}
            compositionHeight={1080}
            fps={30}
            controls
            style={{
              width: '100%',
              maxHeight: '100%',
            }}
          />
        )}
      </div>
    </div>
  );
}
