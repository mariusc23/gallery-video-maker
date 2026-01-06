import { CheckCircle2, FolderOpen, Loader2, Save, XCircle } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { type ProjectProgress, useProject } from "@/project/useProject";

interface ProjectDialogProps {
  mode: "load" | "save";
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function ProjectDialog({
  mode,
  onOpenChange,
  open,
}: ProjectDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    canSave,
    isProcessing,
    loadProject,
    progress,
    resetProgress,
    saveProject,
  } = useProject();

  const handleSave = async () => {
    await saveProject();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadProject(file);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetProgress();
      onOpenChange(false);
    }
  };

  const isSuccess = progress?.status === "success";
  const isError = progress?.status === "error";
  const showResults = isSuccess || isError;

  if (mode === "save") {
    return (
      <Dialog onOpenChange={handleClose} open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Save Project
            </DialogTitle>
            <DialogDescription>
              Save your project as a single file with all images included
            </DialogDescription>
          </DialogHeader>

          {!isProcessing && !showResults ? (
            <>
              <div className="text-muted-foreground py-4 text-center text-sm">
                Your project will be saved as a .zip file that can be loaded
                later.
              </div>
              <DialogFooter>
                <Button onClick={handleClose} variant="outline">
                  Cancel
                </Button>
                <Button disabled={!canSave} onClick={handleSave}>
                  Save Project
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <ProjectProgressDisplay progress={progress} />
              {showResults && (
                <DialogFooter>
                  <Button onClick={handleClose}>Close</Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Load mode
  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Load Project
          </DialogTitle>
          <DialogDescription>
            Load a previously saved project file
          </DialogDescription>
        </DialogHeader>

        {!isProcessing && !showResults ? (
          <>
            <input
              accept=".zip,application/zip"
              className="hidden"
              onChange={handleFileSelect}
              ref={fileInputRef}
              type="file"
            />
            <div className="text-muted-foreground py-4 text-center text-sm">
              Select a .zip project file to load.
            </div>
            <DialogFooter>
              <Button onClick={handleClose} variant="outline">
                Cancel
              </Button>
              <Button onClick={() => fileInputRef.current?.click()}>
                Choose File
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <ProjectProgressDisplay progress={progress} />
            {showResults && (
              <DialogFooter>
                <Button onClick={handleClose}>Close</Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProjectProgressDisplay({
  progress,
}: {
  progress: null | ProjectProgress;
}) {
  if (!progress) return null;

  const isSuccess = progress.status === "success";
  const isError = progress.status === "error";
  const isActive = !isSuccess && !isError;

  const statusLabels: Record<string, string> = {
    deserializing: "Loading images...",
    error: "Operation failed",
    idle: "",
    serializing: "Saving images...",
    success: "Complete!",
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-center">
        {isActive && <Loader2 className="text-primary h-8 w-8 animate-spin" />}
        {isSuccess && <CheckCircle2 className="h-8 w-8 text-green-500" />}
        {isError && <XCircle className="h-8 w-8 text-red-500" />}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium">{statusLabels[progress.status]}</p>
        {progress.error && (
          <p className="mt-1 text-sm text-red-500">{progress.error}</p>
        )}
      </div>

      {isActive && (
        <>
          <Progress value={progress.percentage} />
          <div className="text-muted-foreground text-center text-xs">
            {progress.current} / {progress.total} images
          </div>
        </>
      )}
    </div>
  );
}
