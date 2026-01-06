import { useGalleryStore } from '@/store/useGalleryStore';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COLLAGE_LAYOUTS } from '@/data/layouts';
import { BatchEditPanel } from './BatchEditPanel';
import type { TransitionType } from '@/types';

const TRANSITION_TYPES: { value: TransitionType; label: string }[] = [
  { value: 'none', label: 'None (Cut)' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'rotate', label: 'Rotate' },
  { value: 'blur', label: 'Blur' },
  { value: 'kenBurns', label: 'Ken Burns' },
];

export function SlideEditor() {
  const currentSlideId = useGalleryStore((state) => state.currentSlideId);
  const selectedSlideIds = useGalleryStore((state) => state.selectedSlideIds);
  const slides = useGalleryStore((state) => state.slides);
  const updateSlide = useGalleryStore((state) => state.updateSlide);
  const currentSlide = slides.find((s) => s.id === currentSlideId);

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
    if (currentSlide.type === 'collage') {
      updateSlide(currentSlide.id, { layoutId: value });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Slide Editor</h2>
        <p className="text-sm text-muted-foreground">
          {currentSlide.type === 'single' ? 'Single Photo' : 'Collage'}
        </p>
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

      {/* Layout Control (Collage only) */}
      {currentSlide.type === 'collage' && (
        <div className="space-y-2">
          <Label>Layout</Label>
          <Select
            value={currentSlide.layoutId}
            onValueChange={handleLayoutChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLLAGE_LAYOUTS.map((layout) => (
                <SelectItem key={layout.id} value={layout.id}>
                  {layout.name} ({layout.photoCount} photos)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Change the collage layout pattern
          </p>
        </div>
      )}
    </div>
  );
}
