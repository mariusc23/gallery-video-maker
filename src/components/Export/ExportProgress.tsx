import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import type { ExportProgress as ExportProgressType } from "@/export/types";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ExportProgressProps {
  onCancel: () => void;
  progress: ExportProgressType | null;
}

export function ExportProgress({ onCancel, progress }: ExportProgressProps) {
  if (!progress) return null;

  const formatTime = (seconds: null | number): string => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const statusLabels: Record<string, string> = {
    cancelled: "Export cancelled",
    complete: "Export complete!",
    encoding: "Finalizing video...",
    error: "Export failed",
    idle: "",
    preparing: "Loading images...",
    rendering: "Rendering frames...",
  };

  const isComplete = progress.status === "complete";
  const isError = progress.status === "error";
  const isCancelled = progress.status === "cancelled";
  const isActive = !isComplete && !isError && !isCancelled;

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-center">
        {isActive && <Loader2 className="text-primary h-8 w-8 animate-spin" />}
        {isComplete && <CheckCircle2 className="h-8 w-8 text-green-500" />}
        {(isError || isCancelled) && (
          <XCircle className="h-8 w-8 text-red-500" />
        )}
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

          <div className="text-muted-foreground flex justify-between text-xs">
            <span>
              Frame {progress.currentFrame} / {progress.totalFrames}
            </span>
            <span>{formatTime(progress.estimatedTimeRemaining)} remaining</span>
          </div>

          <div className="flex justify-center">
            <Button onClick={onCancel} size="sm" variant="destructive">
              Cancel Export
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
