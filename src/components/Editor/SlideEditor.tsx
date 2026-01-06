import {
  Crop,
  GripVertical,
  ImagePlus,
  Maximize,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

import type { SlotCropConfig, TransitionType } from "@/types";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { COLLAGE_LAYOUTS } from "@/data/layouts";
import { cn } from "@/lib/utils";
import { useGalleryStore } from "@/store/useGalleryStore";
import { DEFAULT_SLOT_CROP } from "@/types";
import { getSlotCropConfig } from "@/utils/cropUtils";

import { BatchEditPanel } from "./BatchEditPanel";
import { CropPositionEditor } from "./CropPositionEditor";

const TRANSITION_TYPES: { label: string; value: TransitionType; }[] = [
  { label: "None (Cut)", value: "none" },
  { label: "Fade", value: "fade" },
  { label: "Slide", value: "slide" },
  { label: "Zoom", value: "zoom" },
  { label: "Rotate", value: "rotate" },
  { label: "Blur", value: "blur" },
  { label: "Ken Burns", value: "kenBurns" },
];

export function SlideEditor() {
  const currentSlideId = useGalleryStore((state) => state.currentSlideId);
  const selectedSlideIds = useGalleryStore((state) => state.selectedSlideIds);
  const slides = useGalleryStore((state) => state.slides);
  const updateSlide = useGalleryStore((state) => state.updateSlide);
  const updateSlotCrop = useGalleryStore((state) => state.updateSlotCrop);
  const deleteSlides = useGalleryStore((state) => state.deleteSlides);
  const photos = useGalleryStore((state) => state.photos);
  const currentSlide = slides.find((s) => s.id === currentSlideId);

  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const [photoPickerSlotIndex, setPhotoPickerSlotIndex] = useState<
    null | number
  >(null);
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<null | number>(
    null
  );
  const [dropTargetPhotoIndex, setDropTargetPhotoIndex] = useState<
    null | number
  >(null);
  const [cropEditorOpen, setCropEditorOpen] = useState(false);
  const [cropEditorSlotIndex, setCropEditorSlotIndex] = useState<null | number>(
    null
  );

  const photoList = Object.values(photos);

  // Show batch editor if multiple slides are selected
  if (selectedSlideIds.size > 1) {
    return <BatchEditPanel />;
  }

  if (!currentSlide) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground text-center">
          <p className="mb-2 text-lg font-medium">No slide selected</p>
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
    // Also reset crop config for this slot
    updateSlotCrop(currentSlide.id, slotIndex, DEFAULT_SLOT_CROP);
    updateSlide(currentSlide.id, { photoIds: newPhotoIds });
  };

  const handleToggleObjectFit = (slotIndex: number) => {
    const currentConfig = getSlotCropConfig(currentSlide.slotCrops, slotIndex);
    const newFit = currentConfig.objectFit === "cover" ? "contain" : "cover";
    updateSlotCrop(currentSlide.id, slotIndex, { objectFit: newFit });
  };

  const handleOpenCropEditor = (slotIndex: number) => {
    setCropEditorSlotIndex(slotIndex);
    setCropEditorOpen(true);
  };

  const handleCropUpdate = (updates: Partial<SlotCropConfig>) => {
    if (cropEditorSlotIndex !== null) {
      updateSlotCrop(currentSlide.id, cropEditorSlotIndex, updates);
    }
  };

  const handlePhotoDragStart = (e: React.DragEvent, index: number) => {
    setDraggedPhotoIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handlePhotoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetPhotoIndex(index);
  };

  const handlePhotoDragLeave = () => {
    setDropTargetPhotoIndex(null);
  };

  const handlePhotoDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = draggedPhotoIndex;

    if (sourceIndex !== null && sourceIndex !== targetIndex) {
      const newPhotoIds = [...currentSlide.photoIds];
      // Swap the photos
      const temp = newPhotoIds[sourceIndex];
      newPhotoIds[sourceIndex] = newPhotoIds[targetIndex];
      newPhotoIds[targetIndex] = temp;

      // Also swap the crop configs if they exist
      const newSlotCrops = currentSlide.slotCrops
        ? [...currentSlide.slotCrops]
        : Array(currentSlide.photoIds.length)
            .fill(null)
            .map(() => ({ ...DEFAULT_SLOT_CROP }));

      // Ensure array is long enough
      while (newSlotCrops.length <= Math.max(sourceIndex, targetIndex)) {
        newSlotCrops.push({ ...DEFAULT_SLOT_CROP });
      }

      const tempCrop = newSlotCrops[sourceIndex];
      newSlotCrops[sourceIndex] = newSlotCrops[targetIndex];
      newSlotCrops[targetIndex] = tempCrop;

      updateSlide(currentSlide.id, {
        photoIds: newPhotoIds,
        slotCrops: newSlotCrops,
      });
    }

    setDraggedPhotoIndex(null);
    setDropTargetPhotoIndex(null);
  };

  const handlePhotoDragEnd = () => {
    setDraggedPhotoIndex(null);
    setDropTargetPhotoIndex(null);
  };

  const handleDeleteSlide = () => {
    deleteSlides([currentSlide.id]);
  };

  const layout = COLLAGE_LAYOUTS.find((l) => l.id === currentSlide.layoutId);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="mb-1 text-lg font-semibold">Slide Editor</h2>
        <p className="text-muted-foreground text-sm">
          {layout?.name || "Unknown Layout"}
        </p>
      </div>

      {/* Layout Control */}
      <div className="space-y-2">
        <Label>Layout</Label>
        <Select
          onValueChange={handleLayoutChange}
          value={currentSlide.layoutId}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COLLAGE_LAYOUTS.map((layout) => (
              <SelectItem key={layout.id} value={layout.id}>
                {layout.name} ({layout.photoCount}{" "}
                {layout.photoCount === 1 ? "photo" : "photos"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-xs">
          Choose slide layout pattern
        </p>
      </div>

      {/* Photo Selection */}
      <div className="space-y-2">
        <Label>Photos</Label>
        <div
          className={
            currentSlide.photoIds.length === 1 ? "" : "grid grid-cols-2 gap-2"
          }
        >
          {currentSlide.photoIds.map((photoId, index) => {
            const isDragging = draggedPhotoIndex === index;
            const isDropTarget = dropTargetPhotoIndex === index;
            const canDrag =
              currentSlide.photoIds.length > 1 && photoId && photos[photoId];
            const cropConfig = getSlotCropConfig(currentSlide.slotCrops, index);
            const photo = photoId ? photos[photoId] : null;

            return (
              <div className="space-y-1" key={index}>
                <div
                  className={cn(
                    `relative ${currentSlide.photoIds.length === 1 ? "aspect-video" : "aspect-square"} group overflow-hidden rounded-lg border-2 transition-colors`,
                    isDropTarget && draggedPhotoIndex !== index
                      ? "border-primary border-dashed"
                      : "border-muted-foreground/50 border-dashed",
                    !isDragging && "hover:border-primary",
                    isDragging && "opacity-50"
                  )}
                  draggable={!!canDrag}
                  onDragEnd={handlePhotoDragEnd}
                  onDragLeave={handlePhotoDragLeave}
                  onDragOver={(e) => handlePhotoDragOver(e, index)}
                  onDragStart={
                    canDrag ? (e) => handlePhotoDragStart(e, index) : undefined
                  }
                  onDrop={(e) => handlePhotoDrop(e, index)}
                >
                  {photo ? (
                    <>
                      <img
                        alt=""
                        className="h-full w-full cursor-pointer object-cover"
                        onClick={() => handleOpenPhotoPicker(index)}
                        src={photo.thumbnail}
                      />
                      {currentSlide.photoIds.length > 1 && (
                        <>
                          <button
                            className="bg-destructive text-destructive-foreground absolute top-1 right-1 z-10 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePhoto(index);
                            }}
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                          <div className="absolute top-1 left-1 z-10 cursor-grab rounded bg-black/50 p-0.5 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
                            <GripVertical className="h-3 w-3 text-white" />
                          </div>
                        </>
                      )}
                      <div
                        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => handleOpenPhotoPicker(index)}
                      >
                        <ImagePlus
                          className={`${currentSlide.photoIds.length === 1 ? "h-8 w-8" : "h-6 w-6"} text-white`}
                        />
                      </div>
                    </>
                  ) : (
                    <div
                      className="text-muted-foreground flex h-full w-full cursor-pointer items-center justify-center"
                      onClick={() => handleOpenPhotoPicker(index)}
                    >
                      <ImagePlus
                        className={
                          currentSlide.photoIds.length === 1
                            ? "h-8 w-8"
                            : "h-6 w-6"
                        }
                      />
                    </div>
                  )}
                </div>
                {/* Crop controls */}
                {photo && (
                  <div className="flex gap-1">
                    <Button
                      className="h-7 flex-1 text-xs"
                      onClick={() => handleToggleObjectFit(index)}
                      size="sm"
                      title={
                        cropConfig.objectFit === "cover"
                          ? "Switch to Contain (show full image)"
                          : "Switch to Cover (fill slot)"
                      }
                      variant="outline"
                    >
                      {cropConfig.objectFit === "cover" ? (
                        <>
                          <Crop className="mr-1 h-3 w-3" />
                          Cover
                        </>
                      ) : (
                        <>
                          <Maximize className="mr-1 h-3 w-3" />
                          Contain
                        </>
                      )}
                    </Button>
                    {cropConfig.objectFit === "cover" && (
                      <Button
                        className="h-7 px-2 text-xs"
                        onClick={() => handleOpenCropEditor(index)}
                        size="sm"
                        title="Adjust crop position"
                        variant="outline"
                      >
                        Adjust
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-muted-foreground text-xs">
          Click to change photos, drag to reorder
        </p>
      </div>

      {/* Duration Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Duration</Label>
          <span className="text-muted-foreground text-sm">
            {durationInSeconds.toFixed(1)}s
          </span>
        </div>
        <Slider
          max={10}
          min={1}
          onValueChange={handleDurationChange}
          step={0.5}
          value={[durationInSeconds]}
        />
        <p className="text-muted-foreground text-xs">
          1 to 10 seconds per slide
        </p>
      </div>

      {/* Transition Control */}
      <div className="space-y-2">
        <Label>Transition</Label>
        <Select
          onValueChange={handleTransitionChange}
          value={currentSlide.transition.type}
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

      {/* Delete Slide */}
      <div className="border-t pt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Slide
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Slide</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this slide? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDeleteSlide}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Photo Picker Dialog */}
      <Dialog onOpenChange={setPhotoPickerOpen} open={photoPickerOpen}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Photo</DialogTitle>
            <DialogDescription>Choose a photo for this slot</DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid grid-cols-4 gap-4">
            {photoList.map((photo) => (
              <div
                className={cn(
                  "relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all",
                  "hover:border-primary border-transparent"
                )}
                key={photo.id}
                onClick={() => handleSelectPhoto(photo.id)}
              >
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  src={photo.thumbnail}
                />
              </div>
            ))}
          </div>
          {photoList.length === 0 && (
            <div className="text-muted-foreground py-8 text-center text-sm">
              No photos available
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Crop Position Editor Dialog */}
      {cropEditorSlotIndex !== null &&
        currentSlide.photoIds[cropEditorSlotIndex] &&
        photos[currentSlide.photoIds[cropEditorSlotIndex]] && (
          <CropPositionEditor
            cropConfig={getSlotCropConfig(
              currentSlide.slotCrops,
              cropEditorSlotIndex
            )}
            onOpenChange={setCropEditorOpen}
            onUpdate={handleCropUpdate}
            open={cropEditorOpen}
            photo={photos[currentSlide.photoIds[cropEditorSlotIndex]]}
            slotAspect={(() => {
              const currentLayout = COLLAGE_LAYOUTS.find(
                (l) => l.id === currentSlide.layoutId
              );
              if (!currentLayout) return 16 / 9;
              const slot = currentLayout.slots[cropEditorSlotIndex];
              if (!slot) return 16 / 9;
              return (slot.width / slot.height) * (16 / 9);
            })()}
          />
        )}
    </div>
  );
}
