import { Download, Images } from "lucide-react";

import { Button } from "@/components/ui/button";

interface NavbarProps {
  onExport: () => void;
  onOpenMediaLibrary: () => void;
}

export function Navbar({ onExport, onOpenMediaLibrary }: NavbarProps) {
  return (
    <nav className="bg-background border-b">
      <div className="flex h-14 items-center gap-4 px-4">
        <h1 className="text-lg font-semibold">Gallery Video Maker</h1>
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
