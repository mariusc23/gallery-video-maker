import { useState } from "react";
import { useGalleryStore } from "@/store/useGalleryStore";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
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
import { COLLAGE_LAYOUTS } from "@/data/layouts";
import { BatchEditPanel } from "./BatchEditPanel";
import { CropPositionEditor } from "./CropPositionEditor";
import { X, ImagePlus, GripVertical, Maximize, Crop, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransitionType, SlotCropConfig } from "@/types";
import { DEFAULT_SLOT_CROP } from "@/types";
import { getSlotCropConfig } from "@/utils/cropUtils";

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
  const updateSlotCrop = useGalleryStore((state) => state.updateSlotCrop);
  const deleteSlides = useGalleryStore((state) => state.deleteSlides);
  const photos = useGalleryStore((state) => state.photos);
  const currentSlide = slides.find((s) => s.id === currentSlideId);

  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const [photoPickerSlotIndex, setPhotoPickerSlotIndex] = useState<
    number | null
  >(null);
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);
  const [dropTargetPhotoIndex, setDropTargetPhotoIndex] = useState<number | null>(null);
  const [cropEditorOpen, setCropEditorOpen] = useState(false);
  const [cropEditorSlotIndex, setCropEditorSlotIndex] = useState<number | null>(null);

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
    // Also reset crop config for this slot
    updateSlotCrop(currentSlide.id, slotIndex, DEFAULT_SLOT_CROP);
    updateSlide(currentSlide.id, { photoIds: newPhotoIds });
  };

  const handleToggleObjectFit = (slotIndex: number) => {
    const currentConfig = getSlotCropConfig(currentSlide.slotCrops, slotIndex);
    const newFit = currentConfig.objectFit === 'cover' ? 'contain' : 'cover';
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
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handlePhotoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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
        : Array(currentSlide.photoIds.length).fill(null).map(() => ({ ...DEFAULT_SLOT_CROP }));

      // Ensure array is long enough
      while (newSlotCrops.length <= Math.max(sourceIndex, targetIndex)) {
        newSlotCrops.push({ ...DEFAULT_SLOT_CROP });
      }

      const tempCrop = newSlotCrops[sourceIndex];
      newSlotCrops[sourceIndex] = newSlotCrops[targetIndex];
      newSlotCrops[targetIndex] = tempCrop;

      updateSlide(currentSlide.id, { photoIds: newPhotoIds, slotCrops: newSlotCrops });
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
          {currentSlide.photoIds.map((photoId, index) => {
            const isDragging = draggedPhotoIndex === index;
            const isDropTarget = dropTargetPhotoIndex === index;
            const canDrag = currentSlide.photoIds.length > 1 && photoId && photos[photoId];
            const cropConfig = getSlotCropConfig(currentSlide.slotCrops, index);
            const photo = photoId ? photos[photoId] : null;

            return (
              <div key={index} className="space-y-1">
                <div
                  draggable={!!canDrag}
                  onDragStart={canDrag ? (e) => handlePhotoDragStart(e, index) : undefined}
                  onDragOver={(e) => handlePhotoDragOver(e, index)}
                  onDragLeave={handlePhotoDragLeave}
                  onDrop={(e) => handlePhotoDrop(e, index)}
                  onDragEnd={handlePhotoDragEnd}
                  className={cn(
                    `relative ${currentSlide.photoIds.length === 1 ? 'aspect-video' : 'aspect-square'} rounded-lg overflow-hidden border-2 transition-colors group`,
                    isDropTarget && draggedPhotoIndex !== index ? 'border-primary border-dashed' : 'border-dashed border-muted-foreground/50',
                    !isDragging && 'hover:border-primary',
                    isDragging && 'opacity-50'
                  )}
                >
                  {photo ? (
                    <>
                      <img
                        src={photo.thumbnail}
                        alt=""
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => handleOpenPhotoPicker(index)}
                      />
                      {currentSlide.photoIds.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePhoto(index);
                            }}
                            className="absolute top-1 right-1 z-10 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                          <div className="absolute top-1 left-1 z-10 bg-black/50 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                            <GripVertical className="h-3 w-3 text-white" />
                          </div>
                        </>
                      )}
                      <div
                        onClick={() => handleOpenPhotoPicker(index)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      >
                        <ImagePlus className={`${currentSlide.photoIds.length === 1 ? "h-8 w-8" : "h-6 w-6"} text-white`} />
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={() => handleOpenPhotoPicker(index)}
                      className="w-full h-full flex items-center justify-center text-muted-foreground cursor-pointer"
                    >
                      <ImagePlus className={currentSlide.photoIds.length === 1 ? "h-8 w-8" : "h-6 w-6"} />
                    </div>
                  )}
                </div>
                {/* Crop controls */}
                {photo && (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => handleToggleObjectFit(index)}
                      title={cropConfig.objectFit === 'cover' ? 'Switch to Contain (show full image)' : 'Switch to Cover (fill slot)'}
                    >
                      {cropConfig.objectFit === 'cover' ? (
                        <><Crop className="h-3 w-3 mr-1" />Cover</>
                      ) : (
                        <><Maximize className="h-3 w-3 mr-1" />Contain</>
                      )}
                    </Button>
                    {cropConfig.objectFit === 'cover' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => handleOpenCropEditor(index)}
                        title="Adjust crop position"
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
        <p className="text-xs text-muted-foreground">Click to change photos, drag to reorder</p>
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

      {/* Delete Slide */}
      <div className="pt-4 border-t">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Slide
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Slide</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this slide? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSlide}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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

      {/* Crop Position Editor Dialog */}
      {cropEditorSlotIndex !== null && currentSlide.photoIds[cropEditorSlotIndex] && photos[currentSlide.photoIds[cropEditorSlotIndex]] && (
        <CropPositionEditor
          open={cropEditorOpen}
          onOpenChange={setCropEditorOpen}
          photo={photos[currentSlide.photoIds[cropEditorSlotIndex]]}
          cropConfig={getSlotCropConfig(currentSlide.slotCrops, cropEditorSlotIndex)}
          slotAspect={(() => {
            const currentLayout = COLLAGE_LAYOUTS.find((l) => l.id === currentSlide.layoutId);
            if (!currentLayout) return 16 / 9;
            const slot = currentLayout.slots[cropEditorSlotIndex];
            if (!slot) return 16 / 9;
            return (slot.width / slot.height) * (16 / 9);
          })()}
          onUpdate={handleCropUpdate}
        />
      )}
    </div>
  );
}
