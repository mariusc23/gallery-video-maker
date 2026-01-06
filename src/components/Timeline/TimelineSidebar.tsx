import { useGalleryStore } from '@/store/useGalleryStore';

export function TimelineSidebar() {
  const slides = useGalleryStore((state) => state.slides);

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Timeline</h2>
        <p className="text-xs text-muted-foreground">
          {slides.length} {slides.length === 1 ? 'slide' : 'slides'}
        </p>
      </div>

      <div className="flex-1 space-y-2">
        {slides.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            No slides yet.
            <br />
            Upload photos to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="bg-background border rounded p-2 text-xs"
              >
                <div className="font-medium">
                  Slide {index + 1}
                </div>
                <div className="text-muted-foreground">
                  {slide.type === 'single' ? 'Single Photo' : 'Collage'}
                  {' · '}
                  {(slide.duration / 30).toFixed(1)}s
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
