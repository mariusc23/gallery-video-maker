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
      <div className="w-64 border-r bg-muted/30 overflow-y-auto flex-shrink-0">
        {timeline}
      </div>

      {/* Editor - Right */}
      <div className="w-96 border-r bg-muted/30 overflow-y-auto flex-shrink-0">
        {editor}
      </div>

      {/* Preview - Center */}
      <div className="flex-1 overflow-y-auto">{preview}</div>
    </div>
  );
}
