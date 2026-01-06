import { useState } from 'react';
import { useGalleryStore } from '@/store/useGalleryStore';
import { cn } from '@/lib/utils';
import { COLLAGE_LAYOUTS } from '@/data/layouts';
import { GripVertical } from 'lucide-react';

export function TimelineSidebar() {
  const slides = useGalleryStore((state) => state.slides);
  const currentSlideId = useGalleryStore((state) => state.currentSlideId);
  const selectedSlideIds = useGalleryStore((state) => state.selectedSlideIds);
  const selectSlide = useGalleryStore((state) => state.selectSlide);
  const selectSlideRange = useGalleryStore((state) => state.selectSlideRange);
  const setPlayheadFrame = useGalleryStore((state) => state.setPlayheadFrame);
  const reorderSlides = useGalleryStore((state) => state.reorderSlides);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetIndex(index);
  };

  const handleDragLeave = () => {
    setDropTargetIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = draggedIndex;

    if (sourceIndex !== null && sourceIndex !== targetIndex) {
      reorderSlides(sourceIndex, targetIndex);
    }

    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
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
              const isDragging = draggedIndex === index;
              const isDropTarget = dropTargetIndex === index;

              return (
                <div
                  key={slide.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => handleSlideClick(slide.id, e)}
                  className={cn(
                    'bg-background border rounded p-2 text-xs cursor-pointer transition-colors select-none flex items-center gap-2',
                    isCurrent && 'border-primary ring-2 ring-primary ring-offset-1',
                    isSelected && !isCurrent && 'border-primary',
                    !isSelected && !isCurrent && 'hover:border-muted-foreground',
                    isDragging && 'opacity-50',
                    isDropTarget && draggedIndex !== index && 'border-dashed border-2 border-primary'
                  )}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 cursor-grab active:cursor-grabbing" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">
                      Slide {index + 1}
                    </div>
                    <div className="text-muted-foreground truncate">
                      {COLLAGE_LAYOUTS.find(l => l.id === slide.layoutId)?.name || 'Unknown'}
                      {' · '}
                      {(slide.duration / 30).toFixed(1)}s
                    </div>
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
