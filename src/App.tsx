import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { MainLayout } from '@/components/Layout/MainLayout';
import { TimelineSidebar } from '@/components/Timeline/TimelineSidebar';
import { SlideEditor } from '@/components/Editor/SlideEditor';
import { PreviewPanel } from '@/components/Preview/PreviewPanel';
import { MediaLibraryDialog } from '@/components/MediaLibrary/MediaLibraryDialog';
import { ExportDialog } from '@/components/Export/ExportDialog';

function App() {
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [initialSelectedPhotoIds, setInitialSelectedPhotoIds] = useState<string[]>([]);

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
    <div className="h-screen flex flex-col">
      <Navbar
        onOpenMediaLibrary={handleOpenMediaLibrary}
        onExport={handleExport}
      />
      <MainLayout
        timeline={<TimelineSidebar onOpenMediaLibraryWithPhotos={handleOpenMediaLibraryWithPhotos} />}
        editor={<SlideEditor />}
        preview={<PreviewPanel />}
      />
      <MediaLibraryDialog
        open={isMediaLibraryOpen}
        onOpenChange={setIsMediaLibraryOpen}
        initialSelectedPhotoIds={initialSelectedPhotoIds}
      />
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
      />
    </div>
  );
}

export default App;
