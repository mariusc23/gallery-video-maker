import { useGalleryStore } from "@/store/useGalleryStore";

import { MediaItem } from "./MediaItem";

interface MediaGridProps {
  onTogglePhoto: (photoId: string, event?: React.MouseEvent) => void;
  selectedPhotoIds: Set<string>;
}

export function MediaGrid({ onTogglePhoto, selectedPhotoIds }: MediaGridProps) {
  const photos = useGalleryStore((state) => state.photos);
  const photoList = Object.values(photos);

  if (photoList.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center text-sm">
        No photos uploaded yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Photos ({photoList.length})</div>
      <div className="grid grid-cols-4 gap-4">
        {photoList.map((photo) => (
          <MediaItem
            isSelected={selectedPhotoIds.has(photo.id)}
            key={photo.id}
            onToggle={(event: React.MouseEvent) =>
              onTogglePhoto(photo.id, event)
            }
            photo={photo}
          />
        ))}
      </div>
    </div>
  );
}
