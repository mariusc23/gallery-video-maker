import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Photo } from '@/types';

interface MediaItemProps {
  photo: Photo;
  isSelected: boolean;
  onToggle: (event: React.MouseEvent) => void;
}

export function MediaItem({ photo, isSelected, onToggle }: MediaItemProps) {
  return (
    <div
      onClick={onToggle}
      className={cn(
        'relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all select-none',
        isSelected
          ? 'border-primary ring-2 ring-primary ring-offset-2'
          : 'border-transparent hover:border-muted-foreground/50'
      )}
    >
      <img
        src={photo.thumbnail}
        alt=""
        className="w-full h-full object-cover"
      />
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
