import { Download, Images } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useGalleryStore } from "@/store/useGalleryStore";

interface NavbarProps {
  onExport: () => void;
  onOpenMediaLibrary: () => void;
}

export function Navbar({ onExport, onOpenMediaLibrary }: NavbarProps) {
  const uploadProgress = useGalleryStore((state) => state.uploadProgress);

  const progressPercent = uploadProgress
    ? Math.round((uploadProgress.completed / uploadProgress.total) * 100)
    : 0;

  return (
    <nav className="bg-background border-b">
      <div className="flex h-14 items-center gap-4 px-4">
        <h1 className="text-lg font-semibold">Gallery Video Maker</h1>

        {uploadProgress && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Progress className="w-32" value={progressPercent} />
              <span className="text-muted-foreground text-sm">
                {uploadProgress.completed}/{uploadProgress.total}
              </span>
            </div>
          </div>
        )}

        <div className="ml-auto flex gap-2">
          <Button onClick={onOpenMediaLibrary} variant="outline">
            <Images className="mr-2 h-4 w-4" />
            Media Library
          </Button>
          <Button onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Video
          </Button>
        </div>
      </div>
    </nav>
  );
}
