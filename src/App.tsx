import { useState } from "react";

import { SlideEditor } from "@/components/Editor/SlideEditor";
import { ExportDialog } from "@/components/Export/ExportDialog";
import { MainLayout } from "@/components/Layout/MainLayout";
import { MediaLibraryDialog } from "@/components/MediaLibrary/MediaLibraryDialog";
import { Navbar } from "@/components/Navbar";
import { PreviewPanel } from "@/components/Preview/PreviewPanel";
import { TimelineSidebar } from "@/components/Timeline/TimelineSidebar";

function App() {
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [initialSelectedPhotoIds, setInitialSelectedPhotoIds] = useState<
    string[]
  >([]);

  const handleOpenMediaLibrary = () => {
    setInitialSelectedPhotoIds([]);
    setIsMediaLibraryOpen(true);
  };

  const handleOpenMediaLibraryWithPhotos = (photoIds: string[]) => {
    setInitialSelectedPhotoIds(photoIds);
    setIsMediaLibraryOpen(true);
  };

  const handleExport = () => {
    setIsExportDialogOpen(true);
  };

  return (
    <div className="flex h-screen flex-col">
      <Navbar
        onExport={handleExport}
        onOpenMediaLibrary={handleOpenMediaLibrary}
      />
      <MainLayout
        editor={<SlideEditor />}
        preview={<PreviewPanel />}
        timeline={
          <TimelineSidebar
            onOpenMediaLibraryWithPhotos={handleOpenMediaLibraryWithPhotos}
          />
        }
      />
      <MediaLibraryDialog
        initialSelectedPhotoIds={initialSelectedPhotoIds}
        onOpenChange={setIsMediaLibraryOpen}
        open={isMediaLibraryOpen}
      />
      <ExportDialog
        onOpenChange={setIsExportDialogOpen}
        open={isExportDialogOpen}
      />
    </div>
  );
}

export default App;
