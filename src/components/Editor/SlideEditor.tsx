import { useGalleryStore } from '@/store/useGalleryStore';

export function SlideEditor() {
  const currentSlideId = useGalleryStore((state) => state.currentSlideId);
  const slides = useGalleryStore((state) => state.slides);
  const currentSlide = slides.find((s) => s.id === currentSlideId);

  if (!currentSlide) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium mb-2">No slide selected</p>
          <p className="text-sm">
            Select a slide from the timeline to edit its properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Slide Editor</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Type</p>
          <p className="text-base">
            {currentSlide.type === 'single' ? 'Single Photo' : 'Collage'}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Duration</p>
          <p className="text-base">{(currentSlide.duration / 30).toFixed(1)} seconds</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Transition</p>
          <p className="text-base capitalize">{currentSlide.transition.type}</p>
        </div>
      </div>
    </div>
  );
}
