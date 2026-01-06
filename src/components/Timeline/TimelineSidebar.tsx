import { useGalleryStore } from '@/store/useGalleryStore';
import { cn } from '@/lib/utils';

export function TimelineSidebar() {
  const slides = useGalleryStore((state) => state.slides);
  const currentSlideId = useGalleryStore((state) => state.currentSlideId);
  const selectedSlideIds = useGalleryStore((state) => state.selectedSlideIds);
  const selectSlide = useGalleryStore((state) => state.selectSlide);
  const selectSlideRange = useGalleryStore((state) => state.selectSlideRange);
  const setPlayheadFrame = useGalleryStore((state) => state.setPlayheadFrame);

  const handleSlideClick = (slideId: string, event: React.MouseEvent) => {
    const isMultiSelect = event.metaKey || event.ctrlKey;
    const isRangeSelect = event.shiftKey;

    // Prevent text selection when using modifier keys
    if (isMultiSelect || isRangeSelect) {
      event.preventDefault();
    }

    if (isRangeSelect) {
      selectSlideRange(slideId);
    } else {
      selectSlide(slideId, isMultiSelect);
    }

    // Calculate the start frame of the clicked slide and seek to it
    const slideIndex = slides.findIndex((s) => s.id === slideId);
    if (slideIndex !== -1) {
      let startFrame = 0;
      for (let i = 0; i < slideIndex; i++) {
        startFrame += slides[i].duration;
      }
      setPlayheadFrame(startFrame);
    }
  };

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
            {slides.map((slide, index) => {
              const isSelected = selectedSlideIds.has(slide.id);
              const isCurrent = currentSlideId === slide.id;

              return (
                <div
                  key={slide.id}
                  onClick={(e) => handleSlideClick(slide.id, e)}
                  className={cn(
                    'bg-background border rounded p-2 text-xs cursor-pointer transition-colors select-none',
                    isCurrent && 'border-primary ring-2 ring-primary ring-offset-1',
                    isSelected && !isCurrent && 'border-primary',
                    !isSelected && !isCurrent && 'hover:border-muted-foreground'
                  )}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
