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
import type { TransitionType } from "@/types";
import { Trash2 } from "lucide-react";

const TRANSITION_TYPES: { value: TransitionType; label: string }[] = [
  { value: "none", label: "None (Cut)" },
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
  { value: "zoom", label: "Zoom" },
  { value: "rotate", label: "Rotate" },
  { value: "blur", label: "Blur" },
  { value: "kenBurns", label: "Ken Burns" },
];

export function BatchEditPanel() {
  const selectedSlideIds = useGalleryStore((state) => state.selectedSlideIds);
  const batchUpdateSlides = useGalleryStore((state) => state.batchUpdateSlides);
  const batchChangeLayout = useGalleryStore((state) => state.batchChangeLayout);
  const deleteSlides = useGalleryStore((state) => state.deleteSlides);
  const clearSelection = useGalleryStore((state) => state.clearSelection);

  const [duration, setDuration] = useState<number | null>(null);
  const [transition, setTransition] = useState<TransitionType | null>(null);
  const [layoutId, setLayoutId] = useState<string | null>(null);

  const handleApplyChanges = () => {
    const updates: any = {};

    // Apply duration change
    if (duration !== null) {
      updates.duration = duration * 30; // Convert to frames
    }

    // Apply transition change
    if (transition !== null) {
      updates.transition = { type: transition, duration: 15 };
    }

    // Apply layout change with photo redistribution
    if (layoutId !== null) {
      const slideIdsArray = Array.from(selectedSlideIds);

      // Use the new batch change layout method that redistributes photos
      batchChangeLayout(slideIdsArray, layoutId);

      // Note: batchChangeLayout already handles duration/transition from the template slide
      // No need to apply updates separately for layout changes
    } else {
      // Apply updates without layout change
      batchUpdateSlides(Array.from(selectedSlideIds), updates);
    }

    // Reset form
    setDuration(null);
    setTransition(null);
    setLayoutId(null);
    clearSelection();
  };

  const handleCancel = () => {
    setDuration(null);
    setTransition(null);
    setLayoutId(null);
    clearSelection();
  };

  const handleDeleteSlides = () => {
    deleteSlides(Array.from(selectedSlideIds));
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="mb-1 text-lg font-semibold">Batch Edit</h2>
        <p className="text-muted-foreground text-sm">
          Editing {selectedSlideIds.size} slide
          {selectedSlideIds.size === 1 ? "" : "s"}
        </p>
      </div>

      {/* Layout Control */}
      <div className="space-y-2">
        <Label>Layout</Label>
        <Select value={layoutId ?? ""} onValueChange={setLayoutId}>
          <SelectTrigger>
            <SelectValue placeholder="Leave unchanged" />
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
          Photos will be redistributed across slides to fill all available slots
        </p>
      </div>

      {/* Duration Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Duration</Label>
          {duration !== null && (
            <span className="text-muted-foreground text-sm">
              {duration.toFixed(1)}s
            </span>
          )}
        </div>
        <Slider
          value={[duration ?? 3]}
          onValueChange={(value) => setDuration(value[0])}
          min={1}
          max={10}
          step={0.5}
        />
        <p className="text-muted-foreground text-xs">
          {duration === null
            ? "Leave unchanged"
            : "Apply to all selected slides"}
        </p>
      </div>

      {/* Transition Control */}
      <div className="space-y-2">
        <Label>Transition</Label>
        <Select
          value={transition ?? ""}
          onValueChange={(value) => setTransition(value as TransitionType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Leave unchanged" />
          </SelectTrigger>
          <SelectContent>
            {TRANSITION_TYPES.map((trans) => (
              <SelectItem key={trans.value} value={trans.value}>
                {trans.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleApplyChanges} className="flex-1">
          Apply Changes
        </Button>
        <Button onClick={handleCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>

      {/* Delete Button */}
      <div className="border-t pt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete {selectedSlideIds.size} Slide
              {selectedSlideIds.size === 1 ? "" : "s"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Slides</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedSlideIds.size} slide
                {selectedSlideIds.size === 1 ? "" : "s"}? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSlides}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
