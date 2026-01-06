import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaUploadZone } from "./MediaUploadZone";
import { MediaGrid } from "./MediaGrid";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGalleryStore } from "@/store/useGalleryStore";
import { COLLAGE_LAYOUTS } from "@/data/layouts";

interface MediaLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSelectedPhotoIds?: string[];
}

export function MediaLibraryDialog({
  open,
  onOpenChange,
  initialSelectedPhotoIds,
}: MediaLibraryDialogProps) {
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>("auto");
  const [lastClickedPhotoId, setLastClickedPhotoId] = useState<string | null>(
    null
  );

  // Update selection when initialSelectedPhotoIds changes (e.g., when dialog opens with dropped photos)
  useEffect(() => {
    if (initialSelectedPhotoIds && initialSelectedPhotoIds.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedPhotoIds(new Set(initialSelectedPhotoIds));
    }
  }, [initialSelectedPhotoIds]);

  const photos = useGalleryStore((state) => state.photos);
  const photoList = Object.values(photos);
  const selectedSlideIds = useGalleryStore((state) => state.selectedSlideIds);
  const slides = useGalleryStore((state) => state.slides);

  const createSlidesFromPhotos = useGalleryStore(
    (state) => state.createSlidesFromPhotos
  );
  const createSlidesAutoLayout = useGalleryStore(
    (state) => state.createSlidesAutoLayout
  );
  const addPhotosToSelectedSlides = useGalleryStore(
    (state) => state.addPhotosToSelectedSlides
  );

  // Check if selected slides have empty slots
  const selectedSlides = slides.filter((s) => selectedSlideIds.has(s.id));
  const hasEmptySlots = selectedSlides.some((s) =>
    s.photoIds.some((id) => !id || id === "")
  );

  const handleCreateSlides = () => {
    const photoIds = Array.from(selectedPhotoIds);
    if (photoIds.length === 0) return;

    if (selectedLayoutId === "auto") {
      createSlidesAutoLayout(photoIds);
    } else {
      createSlidesFromPhotos(photoIds, selectedLayoutId || undefined);
    }
    setSelectedPhotoIds(new Set());
    setSelectedLayoutId("");
    setLastClickedPhotoId(null);
    onOpenChange(false);
  };

  const handleTogglePhoto = (photoId: string, event?: React.MouseEvent) => {
    const isMultiSelect = event?.metaKey || event?.ctrlKey;
    const isRangeSelect = event?.shiftKey;

    // Prevent text selection when using modifier keys
    if (isMultiSelect || isRangeSelect) {
      event?.preventDefault();
    }

    if (isRangeSelect && lastClickedPhotoId) {
      // Range selection
      const currentIndex = photoList.findIndex((p) => p.id === photoId);
      const lastIndex = photoList.findIndex((p) => p.id === lastClickedPhotoId);

      if (currentIndex !== -1 && lastIndex !== -1) {
        const startIndex = Math.min(currentIndex, lastIndex);
        const endIndex = Math.max(currentIndex, lastIndex);

        setSelectedPhotoIds((prev) => {
          const next = new Set(prev);
          for (let i = startIndex; i <= endIndex; i++) {
            next.add(photoList[i].id);
          }
          return next;
        });
        setLastClickedPhotoId(photoId);
      }
    } else if (isMultiSelect) {
      // Toggle individual selection
      setSelectedPhotoIds((prev) => {
        const next = new Set(prev);
        if (next.has(photoId)) {
          next.delete(photoId);
        } else {
          next.add(photoId);
        }
        return next;
      });
      setLastClickedPhotoId(photoId);
    } else {
      // Single selection (toggle)
      setSelectedPhotoIds((prev) => {
        const next = new Set(prev);
        if (next.has(photoId)) {
          next.delete(photoId);
        } else {
          next.add(photoId);
        }
        return next;
      });
      setLastClickedPhotoId(photoId);
    }
  };

  const handleClearSelection = () => {
    setSelectedPhotoIds(new Set());
    setLastClickedPhotoId(null);
  };

  const handleAddToSlides = () => {
    const photoIds = Array.from(selectedPhotoIds);
    if (photoIds.length === 0) return;

    addPhotosToSelectedSlides(photoIds);
    setSelectedPhotoIds(new Set());
    setLastClickedPhotoId(null);
    onOpenChange(false);
  };

  const handlePhotosUploaded = (photoIds: string[]) => {
    // Add newly uploaded photos to selection
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      photoIds.forEach((id) => next.add(id));
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
          <DialogDescription>
            Upload photos and create slides for your video
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <MediaUploadZone onPhotosUploaded={handlePhotosUploaded} />

          <MediaGrid
            selectedPhotoIds={selectedPhotoIds}
            onTogglePhoto={handleTogglePhoto}
          />

          {selectedPhotoIds.size > 0 && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  {selectedPhotoIds.size} photo
                  {selectedPhotoIds.size === 1 ? "" : "s"} selected
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSelection}
                >
                  Clear Selection
                </Button>
              </div>

              {selectedPhotoIds.size > 1 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Layout</label>
                  <Select
                    value={selectedLayoutId}
                    onValueChange={setSelectedLayoutId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        Auto (fit based on orientation)
                      </SelectItem>
                      {COLLAGE_LAYOUTS.map((layout) => (
                        <SelectItem key={layout.id} value={layout.id}>
                          {layout.name} ({layout.photoCount} photos)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-xs">
                    {selectedLayoutId === "auto"
                      ? "Landscape photos get single slides, portraits are paired side by side"
                      : "Photos will be divided into multiple slides based on the layout"}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleCreateSlides} className="flex-1">
                  Create Slides
                </Button>
                {selectedSlideIds.size > 0 && (
                  <Button
                    onClick={handleAddToSlides}
                    variant="secondary"
                    className="flex-1"
                    disabled={!hasEmptySlots}
                  >
                    Add to Selected Slides
                  </Button>
                )}
              </div>
              {selectedSlideIds.size > 0 && !hasEmptySlots && (
                <p className="text-muted-foreground text-center text-xs">
                  Selected slides have no empty slots
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
