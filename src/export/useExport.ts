import { useState, useCallback, useRef } from "react";
import { VideoExporter } from "./VideoExporter";
import { useGalleryStore } from "@/store/useGalleryStore";
import { COLLAGE_LAYOUTS } from "@/data/layouts";
import type {
  ExportOptions,
  ExportProgress,
  ExportResolution,
  ExportFps,
} from "./types";

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const exporterRef = useRef<VideoExporter | null>(null);

  const slides = useGalleryStore((state) => state.slides);
  const photos = useGalleryStore((state) => state.photos);

  const startExport = useCallback(
    async (resolution: ExportResolution, fps: ExportFps) => {
      if (slides.length === 0) {
        console.error("No slides to export");
        return;
      }

      setIsExporting(true);
      setProgress({
        status: "preparing",
        currentFrame: 0,
        totalFrames: 0,
        percentage: 0,
        estimatedTimeRemaining: null,
      });

      const options: ExportOptions = { resolution, fps };
      const exporter = new VideoExporter(options);
      exporterRef.current = exporter;

      try {
        const blob = await exporter.export(
          slides,
          photos,
          COLLAGE_LAYOUTS,
          setProgress
        );

        // Determine file extension based on blob type
        const extension = blob.type.includes("mp4") ? "mp4" : "webm";

        // Trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `gallery-video-${Date.now()}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        if ((error as Error).message !== "Export cancelled") {
          setProgress({
            status: "error",
            currentFrame: 0,
            totalFrames: 0,
            percentage: 0,
            estimatedTimeRemaining: null,
            error: (error as Error).message,
          });
        }
      } finally {
        setIsExporting(false);
        exporterRef.current = null;
      }
    },
    [slides, photos]
  );

  const cancelExport = useCallback(() => {
    exporterRef.current?.cancel();
    setProgress({
      status: "cancelled",
      currentFrame: 0,
      totalFrames: 0,
      percentage: 0,
      estimatedTimeRemaining: null,
    });
    setIsExporting(false);
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(null);
  }, []);

  return {
    isExporting,
    progress,
    startExport,
    cancelExport,
    resetProgress,
    canExport: slides.length > 0,
  };
}
