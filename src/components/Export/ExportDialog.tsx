import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExportProgress } from "./ExportProgress";
import { useExport } from "@/export/useExport";
import {
  RESOLUTION_CONFIGS,
  FPS_OPTIONS,
  type ExportResolution,
  type ExportFps,
} from "@/export/types";
import { AlertCircle, Video } from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [resolution, setResolution] = useState<ExportResolution>("1080p");
  const [fps, setFps] = useState<ExportFps>(30);
  const {
    isExporting,
    progress,
    startExport,
    cancelExport,
    resetProgress,
    canExport,
  } = useExport();

  const handleExport = () => {
    startExport(resolution, fps);
  };

  const handleClose = () => {
    if (isExporting) {
      cancelExport();
    }
    resetProgress();
    onOpenChange(false);
  };

  const isComplete = progress?.status === "complete";
  const isError = progress?.status === "error";
  const isCancelled = progress?.status === "cancelled";
  const showResults = isComplete || isError || isCancelled;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Export Video
          </DialogTitle>
          <DialogDescription>
            Choose your export settings and render the video
          </DialogDescription>
        </DialogHeader>

        {!isExporting && !showResults ? (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Resolution</label>
                <Select
                  value={resolution}
                  onValueChange={(v) => setResolution(v as ExportResolution)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RESOLUTION_CONFIGS).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label} ({config.width}x{config.height})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Frame Rate</label>
                <Select
                  value={String(fps)}
                  onValueChange={(v) => setFps(Number(v) as ExportFps)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FPS_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={String(option.value)}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!canExport && (
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  Add slides before exporting
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={!canExport}>
                Start Export
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <ExportProgress progress={progress} onCancel={cancelExport} />
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
