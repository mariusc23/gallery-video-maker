import { useCallback, useRef, useState } from "react";

import { COLLAGE_LAYOUTS } from "@/data/layouts";
import { useGalleryStore } from "@/store/useGalleryStore";

import type {
  ExportFps,
  ExportOptions,
  ExportProgress,
  ExportResolution,
} from "./types";

import { VideoExporter } from "./VideoExporter";

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const exporterRef = useRef<null | VideoExporter>(null);

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
        currentFrame: 0,
        estimatedTimeRemaining: null,
        percentage: 0,
        status: "preparing",
        totalFrames: 0,
      });

      const options: ExportOptions = { fps, resolution };
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
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        if (errorMessage !== "Export cancelled") {
          setProgress({
            currentFrame: 0,
            error: (error as Error).message,
            estimatedTimeRemaining: null,
            percentage: 0,
            status: "error",
            totalFrames: 0,
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
      currentFrame: 0,
      estimatedTimeRemaining: null,
      percentage: 0,
      status: "cancelled",
      totalFrames: 0,
    });
    setIsExporting(false);
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(null);
  }, []);

  return {
    cancelExport,
    canExport: slides.length > 0,
    isExporting,
    progress,
    resetProgress,
    startExport,
  };
}
