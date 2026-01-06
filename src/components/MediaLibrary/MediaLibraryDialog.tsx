import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MediaUploadZone } from './MediaUploadZone';
import { MediaGrid } from './MediaGrid';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGalleryStore } from '@/store/useGalleryStore';
import { COLLAGE_LAYOUTS } from '@/data/layouts';

interface MediaLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaLibraryDialog({
  open,
  onOpenChange,
}: MediaLibraryDialogProps) {
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>('');

  const createSlidesFromPhotos = useGalleryStore(
    (state) => state.createSlidesFromPhotos
  );

  const handleCreateSlides = () => {
    const photoIds = Array.from(selectedPhotoIds);
    if (photoIds.length === 0) return;

    createSlidesFromPhotos(photoIds, selectedLayoutId || undefined);
    setSelectedPhotoIds(new Set());
    setSelectedLayoutId('');
    onOpenChange(false);
  };

  const handleTogglePhoto = (photoId: string) => {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedPhotoIds(new Set());
  };

  // Filter layouts based on selected photo count
  const availableLayouts = COLLAGE_LAYOUTS.filter(
    (layout) => layout.photoCount === selectedPhotoIds.size
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
          <DialogDescription>
            Upload photos and create slides for your video
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <MediaUploadZone />

          <MediaGrid
            selectedPhotoIds={selectedPhotoIds}
            onTogglePhoto={handleTogglePhoto}
          />

          {selectedPhotoIds.size > 0 && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  {selectedPhotoIds.size} photo
                  {selectedPhotoIds.size === 1 ? '' : 's'} selected
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
                  <label className="text-sm font-medium">
                    Layout (optional)
                  </label>
                  <Select
                    value={selectedLayoutId}
                    onValueChange={setSelectedLayoutId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a layout or create individual slides" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLayouts.length > 0 ? (
                        availableLayouts.map((layout) => (
                          <SelectItem key={layout.id} value={layout.id}>
                            {layout.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="_none" disabled>
                          No layouts available for {selectedPhotoIds.size}{' '}
                          photos
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {availableLayouts.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Individual slides will be created for each photo
                    </p>
                  )}
                </div>
              )}

              <Button onClick={handleCreateSlides} className="w-full">
                Create Slides
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
