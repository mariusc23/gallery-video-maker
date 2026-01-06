import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Photo } from "@/types";

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
        "relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all select-none",
        isSelected
          ? "border-primary ring-primary ring-2 ring-offset-2"
          : "hover:border-muted-foreground/50 border-transparent"
      )}
    >
      <img
        src={photo.thumbnail}
        alt=""
        className="h-full w-full object-cover"
      />
      {isSelected && (
        <div className="bg-primary text-primary-foreground absolute top-2 right-2 rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
