import { Button } from '@/components/ui/button';
import { Images, Download } from 'lucide-react';

interface NavbarProps {
  onOpenMediaLibrary: () => void;
  onExport: () => void;
}

export function Navbar({ onOpenMediaLibrary, onExport }: NavbarProps) {
  return (
    <nav className="border-b bg-background">
      <div className="flex h-14 items-center px-4 gap-4">
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
