import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { MainLayout } from '@/components/Layout/MainLayout';
import { TimelineSidebar } from '@/components/Timeline/TimelineSidebar';
import { SlideEditor } from '@/components/Editor/SlideEditor';
import { PreviewPanel } from '@/components/Preview/PreviewPanel';
import { MediaLibraryDialog } from '@/components/MediaLibrary/MediaLibraryDialog';

function App() {
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  const handleOpenMediaLibrary = () => {
    setIsMediaLibraryOpen(true);
  };

  const handleExport = () => {
    console.log('Export video');
    // Will be implemented in Phase 9
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar
        onOpenMediaLibrary={handleOpenMediaLibrary}
        onExport={handleExport}
      />
      <MainLayout
        timeline={<TimelineSidebar />}
        editor={<SlideEditor />}
        preview={<PreviewPanel />}
      />
      <MediaLibraryDialog
        open={isMediaLibraryOpen}
        onOpenChange={setIsMediaLibraryOpen}
      />
    </div>
  );
}

export default App;
