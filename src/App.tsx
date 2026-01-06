import { useState } from "react";

import { SlideEditor } from "@/components/Editor/SlideEditor";
import { ExportDialog } from "@/components/Export/ExportDialog";
import { MainLayout } from "@/components/Layout/MainLayout";
import { MediaLibraryDialog } from "@/components/MediaLibrary/MediaLibraryDialog";
import { Navbar } from "@/components/Navbar";
import { PreviewPanel } from "@/components/Preview/PreviewPanel";
import { LoadConfirmDialog } from "@/components/Project/LoadConfirmDialog";
import { ProjectDialog } from "@/components/Project/ProjectDialog";
import { TimelineSidebar } from "@/components/Timeline/TimelineSidebar";
import { useGalleryStore } from "@/store/useGalleryStore";

function App() {
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [isLoadConfirmOpen, setIsLoadConfirmOpen] = useState(false);
  const [initialSelectedPhotoIds, setInitialSelectedPhotoIds] = useState<
    string[]
  >([]);

  const photos = useGalleryStore((state) => state.photos);
  const hasExistingContent = Object.keys(photos).length > 0;

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

  const handleSaveProject = () => {
    setIsSaveDialogOpen(true);
  };

  const handleLoadProject = () => {
    if (hasExistingContent) {
      setIsLoadConfirmOpen(true);
    } else {
      setIsLoadDialogOpen(true);
    }
  };

  const handleConfirmLoad = () => {
    setIsLoadConfirmOpen(false);
    setIsLoadDialogOpen(true);
  };

  return (
    <div className="flex h-screen flex-col">
      <Navbar
        onExport={handleExport}
        onLoadProject={handleLoadProject}
        onOpenMediaLibrary={handleOpenMediaLibrary}
        onSaveProject={handleSaveProject}
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
      <ProjectDialog
        mode="save"
        onOpenChange={setIsSaveDialogOpen}
        open={isSaveDialogOpen}
      />
      <ProjectDialog
        mode="load"
        onOpenChange={setIsLoadDialogOpen}
        open={isLoadDialogOpen}
      />
      <LoadConfirmDialog
        onCancel={() => setIsLoadConfirmOpen(false)}
        onConfirm={handleConfirmLoad}
        open={isLoadConfirmOpen}
      />
    </div>
  );
}

export default App;
