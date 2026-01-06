import { useGalleryStore } from '@/store/useGalleryStore';
import { MediaItem } from './MediaItem';

interface MediaGridProps {
  selectedPhotoIds: Set<string>;
  onTogglePhoto: (photoId: string, event?: React.MouseEvent) => void;
}

export function MediaGrid({
  selectedPhotoIds,
  onTogglePhoto,
}: MediaGridProps) {
  const photos = useGalleryStore((state) => state.photos);
  const photoList = Object.values(photos);

  if (photoList.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        No photos uploaded yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">
        Photos ({photoList.length})
      </div>
      <div className="grid grid-cols-4 gap-4">
        {photoList.map((photo) => (
          <MediaItem
            key={photo.id}
            photo={photo}
            isSelected={selectedPhotoIds.has(photo.id)}
            onToggle={(event: React.MouseEvent) => onTogglePhoto(photo.id, event)}
          />
        ))}
      </div>
    </div>
  );
}
