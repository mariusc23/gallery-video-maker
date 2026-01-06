import { useState } from "react";
import { useGalleryStore } from "@/store/useGalleryStore";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { COLLAGE_LAYOUTS } from "@/data/layouts";
import { BatchEditPanel } from "./BatchEditPanel";
import { X, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransitionType } from "@/types";

const TRANSITION_TYPES: { value: TransitionType; label: string }[] = [
  { value: "none", label: "None (Cut)" },
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
  { value: "zoom", label: "Zoom" },
  { value: "rotate", label: "Rotate" },
  { value: "blur", label: "Blur" },
  { value: "kenBurns", label: "Ken Burns" },
];

export function SlideEditor() {
  const currentSlideId = useGalleryStore((state) => state.currentSlideId);
  const selectedSlideIds = useGalleryStore((state) => state.selectedSlideIds);
  const slides = useGalleryStore((state) => state.slides);
  const updateSlide = useGalleryStore((state) => state.updateSlide);
  const photos = useGalleryStore((state) => state.photos);
  const currentSlide = slides.find((s) => s.id === currentSlideId);

  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const [photoPickerSlotIndex, setPhotoPickerSlotIndex] = useState<
    number | null
  >(null);

  const photoList = Object.values(photos);

  // Show batch editor if multiple slides are selected
  if (selectedSlideIds.size > 1) {
    return <BatchEditPanel />;
  }

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

  const durationInSeconds = currentSlide.duration / 30;

  const handleDurationChange = (value: number[]) => {
    const newDuration = value[0] * 30; // Convert seconds to frames
    updateSlide(currentSlide.id, { duration: newDuration });
  };

  const handleTransitionChange = (value: TransitionType) => {
    updateSlide(currentSlide.id, {
      transition: { ...currentSlide.transition, type: value },
    });
  };

  const handleLayoutChange = (value: string) => {
    const newLayout = COLLAGE_LAYOUTS.find((l) => l.id === value);
    if (!newLayout) return;

    // Adjust photoIds array to match new layout's photo count
    const currentPhotoIds = [...currentSlide.photoIds];

    if (currentPhotoIds.length > newLayout.photoCount) {
      // Trim excess photos
      updateSlide(currentSlide.id, {
        layoutId: value,
        photoIds: currentPhotoIds.slice(0, newLayout.photoCount),
      });
    } else if (currentPhotoIds.length < newLayout.photoCount) {
      // Fill with empty slots
      const paddedPhotoIds = [
        ...currentPhotoIds,
        ...Array(newLayout.photoCount - currentPhotoIds.length).fill(""),
      ];
      updateSlide(currentSlide.id, {
        layoutId: value,
        photoIds: paddedPhotoIds,
      });
    } else {
      updateSlide(currentSlide.id, { layoutId: value });
    }
  };

  const handleOpenPhotoPicker = (slotIndex: number) => {
    setPhotoPickerSlotIndex(slotIndex);
    setPhotoPickerOpen(true);
  };

  const handleSelectPhoto = (photoId: string) => {
    if (photoPickerSlotIndex !== null) {
      const newPhotoIds = [...currentSlide.photoIds];
      newPhotoIds[photoPickerSlotIndex] = photoId;
      updateSlide(currentSlide.id, { photoIds: newPhotoIds });
    }
    setPhotoPickerOpen(false);
    setPhotoPickerSlotIndex(null);
  };

  const handleRemovePhoto = (slotIndex: number) => {
    const newPhotoIds = [...currentSlide.photoIds];
    newPhotoIds[slotIndex] = "";
    updateSlide(currentSlide.id, { photoIds: newPhotoIds });
  };

  const layout = COLLAGE_LAYOUTS.find((l) => l.id === currentSlide.layoutId);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Slide Editor</h2>
        <p className="text-sm text-muted-foreground">
          {layout?.name || "Unknown Layout"}
        </p>
      </div>

      {/* Layout Control */}
      <div className="space-y-2">
        <Label>Layout</Label>
        <Select value={currentSlide.layoutId} onValueChange={handleLayoutChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COLLAGE_LAYOUTS.map((layout) => (
              <SelectItem key={layout.id} value={layout.id}>
                {layout.name} ({layout.photoCount} {layout.photoCount === 1 ? 'photo' : 'photos'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose slide layout pattern
        </p>
      </div>

      {/* Photo Selection */}
      <div className="space-y-2">
        <Label>Photos</Label>
        <div className={currentSlide.photoIds.length === 1 ? "" : "grid grid-cols-2 gap-2"}>
          {currentSlide.photoIds.map((photoId, index) => (
            <div
              key={index}
              className={`relative ${currentSlide.photoIds.length === 1 ? 'aspect-video' : 'aspect-square'} rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/50 cursor-pointer hover:border-primary transition-colors group`}
            >
              {photoId && photos[photoId] ? (
                <>
                  <img
                    src={photos[photoId].thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                    onClick={() => handleOpenPhotoPicker(index)}
                  />
                  {currentSlide.photoIds.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto(index);
                      }}
                      className="absolute top-1 z-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  )}
                  <div
                    onClick={() => handleOpenPhotoPicker(index)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <ImagePlus className={`${currentSlide.photoIds.length === 1 ? "h-8 w-8" : "h-6 w-6"} text-white`} />
                  </div>
                </>
              ) : (
                <div
                  onClick={() => handleOpenPhotoPicker(index)}
                  className="w-full h-full flex items-center justify-center text-muted-foreground"
                >
                  <ImagePlus className={currentSlide.photoIds.length === 1 ? "h-8 w-8" : "h-6 w-6"} />
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Click to change photos</p>
      </div>

      {/* Duration Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Duration</Label>
          <span className="text-sm text-muted-foreground">
            {durationInSeconds.toFixed(1)}s
          </span>
        </div>
        <Slider
          value={[durationInSeconds]}
          onValueChange={handleDurationChange}
          min={1}
          max={10}
          step={0.5}
        />
        <p className="text-xs text-muted-foreground">
          1 to 10 seconds per slide
        </p>
      </div>

      {/* Transition Control */}
      <div className="space-y-2">
        <Label>Transition</Label>
        <Select
          value={currentSlide.transition.type}
          onValueChange={handleTransitionChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRANSITION_TYPES.map((transition) => (
              <SelectItem key={transition.value} value={transition.value}>
                {transition.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Photo Picker Dialog */}
      <Dialog open={photoPickerOpen} onOpenChange={setPhotoPickerOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Photo</DialogTitle>
            <DialogDescription>Choose a photo for this slot</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {photoList.map((photo) => (
              <div
                key={photo.id}
                onClick={() => handleSelectPhoto(photo.id)}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                  "border-transparent hover:border-primary"
                )}
              >
                <img
                  src={photo.thumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          {photoList.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No photos available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
