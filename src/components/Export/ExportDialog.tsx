import { AlertCircle, Video } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type ExportFps,
  type ExportResolution,
  FPS_OPTIONS,
  RESOLUTION_CONFIGS,
} from "@/export/types";
import { useExport } from "@/export/useExport";

import { ExportProgress } from "./ExportProgress";

interface ExportDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function ExportDialog({ onOpenChange, open }: ExportDialogProps) {
  const [resolution, setResolution] = useState<ExportResolution>("1080p");
  const [fps, setFps] = useState<ExportFps>(30);
  const {
    cancelExport,
    canExport,
    isExporting,
    progress,
    resetProgress,
    startExport,
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
    <Dialog onOpenChange={handleClose} open={open}>
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
                  onValueChange={(v) => setResolution(v as ExportResolution)}
                  value={resolution}
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
                  onValueChange={(v) => setFps(Number(v) as ExportFps)}
                  value={String(fps)}
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
              <Button onClick={handleClose} variant="outline">
                Cancel
              </Button>
              <Button disabled={!canExport} onClick={handleExport}>
                Start Export
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <ExportProgress onCancel={cancelExport} progress={progress} />
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
