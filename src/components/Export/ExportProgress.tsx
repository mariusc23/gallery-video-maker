import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ExportProgress as ExportProgressType } from "@/export/types";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface ExportProgressProps {
  progress: ExportProgressType | null;
  onCancel: () => void;
}

export function ExportProgress({ progress, onCancel }: ExportProgressProps) {
  if (!progress) return null;

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const statusLabels: Record<string, string> = {
    preparing: "Loading images...",
    rendering: "Rendering frames...",
    encoding: "Finalizing video...",
    complete: "Export complete!",
    cancelled: "Export cancelled",
    error: "Export failed",
    idle: "",
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
            <Button variant="destructive" size="sm" onClick={onCancel}>
              Cancel Export
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
