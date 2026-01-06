import { useState, useEffect } from "react";
import { useGalleryStore } from "@/store/useGalleryStore";
import { cn } from "@/lib/utils";
import { COLLAGE_LAYOUTS } from "@/data/layouts";
import { GripVertical } from "lucide-react";

interface TimelineSidebarProps {
  onOpenMediaLibraryWithPhotos?: (photoIds: string[]) => void;
}

export function TimelineSidebar({
  onOpenMediaLibraryWithPhotos,
}: TimelineSidebarProps) {
  const slides = useGalleryStore((state) => state.slides);
  const currentSlideId = useGalleryStore((state) => state.currentSlideId);
  const selectedSlideIds = useGalleryStore((state) => state.selectedSlideIds);
  const selectSlide = useGalleryStore((state) => state.selectSlide);
  const selectSlideRange = useGalleryStore((state) => state.selectSlideRange);
  const setPlayheadFrame = useGalleryStore((state) => state.setPlayheadFrame);
  const reorderSlides = useGalleryStore((state) => state.reorderSlides);
  const reorderSelectedSlides = useGalleryStore((state) => state.reorderSelectedSlides);
  const selectAllSlides = useGalleryStore((state) => state.selectAllSlides);
  const clearSelection = useGalleryStore((state) => state.clearSelection);
  const addPhotos = useGalleryStore((state) => state.addPhotos);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [isFileDragOver, setIsFileDragOver] = useState(false);

  // Keyboard shortcut for Cmd+A to select all slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        // Only handle if slides exist and no input is focused
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement ||
          (activeElement as HTMLElement)?.isContentEditable;

        if (slides.length > 0 && !isInputFocused) {
          e.preventDefault();
          selectAllSlides();
        }
      }

      if (e.key === "Escape") {
        // Don't clear selection if a dialog is open
        const isDialogOpen = document.querySelector('[role="dialog"]');
        if (!isDialogOpen) {
          clearSelection();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length, selectAllSlides, clearSelection]);

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
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetIndex(index);
  };

  const handleDragLeave = () => {
    setDropTargetIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = draggedIndex;

    if (sourceIndex !== null && sourceIndex !== targetIndex) {
      const draggedSlide = slides[sourceIndex];
      // If dragging a selected slide and multiple are selected, move all selected slides
      if (selectedSlideIds.has(draggedSlide.id) && selectedSlideIds.size > 1) {
        reorderSelectedSlides(targetIndex);
      } else {
        reorderSlides(sourceIndex, targetIndex);
      }
    }

    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  // File drop handlers for the timeline area
  const handleFileDragOver = (e: React.DragEvent) => {
    // Only handle file drops, not slide reordering
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setIsFileDragOver(true);
    }
  };

  const handleFileDragLeave = (e: React.DragEvent) => {
    // Check if we're leaving the container entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsFileDragOver(false);
    }
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    // Only handle file drops, not slide reordering
    if (!e.dataTransfer.types.includes("Files")) return;

    e.preventDefault();
    setIsFileDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      const newPhotoIds = await addPhotos(files);
      onOpenMediaLibraryWithPhotos?.(newPhotoIds);
    }
  };

  return (
    <div
      className={cn(
        "p-4 h-full flex flex-col transition-colors",
        isFileDragOver && "bg-primary/10"
      )}
      onDragOver={handleFileDragOver}
      onDragLeave={handleFileDragLeave}
      onDrop={handleFileDrop}
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Timeline</h2>
        <p className="text-xs text-muted-foreground">
          {slides.length} {slides.length === 1 ? "slide" : "slides"}
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
              // Show as dragging if this slide is dragged, or if it's selected and a selected slide is being dragged
              const draggedSlide = draggedIndex !== null ? slides[draggedIndex] : null;
              const isMultiDrag = draggedSlide && selectedSlideIds.has(draggedSlide.id) && selectedSlideIds.size > 1;
              const isDragging = draggedIndex === index || (isMultiDrag && isSelected);
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
                    "bg-background border rounded p-2 text-xs cursor-pointer transition-colors select-none flex items-center gap-2",
                    isCurrent &&
                      "border-primary ring-2 ring-primary ring-offset-1",
                    isSelected && !isCurrent && "border-primary",
                    !isSelected &&
                      !isCurrent &&
                      "hover:border-muted-foreground",
                    isDragging && "opacity-50",
                    isDropTarget &&
                      draggedIndex !== index &&
                      "border-dashed border-2 border-primary"
                  )}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 cursor-grab active:cursor-grabbing" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">Slide {index + 1}</div>
                    <div className="text-muted-foreground truncate">
                      {COLLAGE_LAYOUTS.find((l) => l.id === slide.layoutId)
                        ?.name || "Unknown"}
                      {" · "}
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
