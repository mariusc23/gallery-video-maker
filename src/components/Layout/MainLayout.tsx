import type { ReactNode } from "react";

interface MainLayoutProps {
  timeline: ReactNode;
  editor: ReactNode;
  preview: ReactNode;
}

export function MainLayout({ timeline, editor, preview }: MainLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Timeline Sidebar - Left */}
      <div className="bg-muted/30 w-64 flex-shrink-0 overflow-y-auto border-r">
        {timeline}
      </div>

      {/* Editor - Right */}
      <div className="bg-muted/30 w-96 flex-shrink-0 overflow-y-auto border-r">
        {editor}
      </div>

      {/* Preview - Center */}
      <div className="flex-1 overflow-y-auto">{preview}</div>
    </div>
  );
}
