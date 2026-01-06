import { useCallback, useState } from "react";

import { useGalleryStore } from "@/store/useGalleryStore";
import { revokePhotoUrls } from "@/utils/photoUtils";

import { deserializeProject } from "./deserialize";
import { serializeProject } from "./serialize";

export interface ProjectProgress {
  current: number;
  error?: string;
  percentage: number;
  status: ProjectStatus;
  total: number;
}

export type ProjectStatus =
  | "deserializing"
  | "error"
  | "idle"
  | "serializing"
  | "success";

export function useProject() {
  const [progress, setProgress] = useState<null | ProjectProgress>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const photos = useGalleryStore((state) => state.photos);
  const slides = useGalleryStore((state) => state.slides);

  const saveProject = useCallback(async () => {
    const photoCount = Object.keys(photos).length;
    if (photoCount === 0) {
      return;
    }

    setIsProcessing(true);
    setProgress({
      current: 0,
      percentage: 0,
      status: "serializing",
      total: photoCount,
    });

    try {
      const blob = await serializeProject(photos, slides, (p) => {
        setProgress({
          current: p.current,
          percentage: Math.round((p.current / p.total) * 100),
          status: "serializing",
          total: p.total,
        });
      });

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gallery-project-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress({
        current: photoCount,
        percentage: 100,
        status: "success",
        total: photoCount,
      });
    } catch (error) {
      setProgress({
        current: 0,
        error: error instanceof Error ? error.message : "Save failed",
        percentage: 0,
        status: "error",
        total: 0,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [photos, slides]);

  const loadProject = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress({
      current: 0,
      percentage: 0,
      status: "deserializing",
      total: 0,
    });

    try {
      const { photos: newPhotos, slides: newSlides } = await deserializeProject(
        file,
        (p) => {
          setProgress({
            current: p.current,
            percentage: Math.round((p.current / p.total) * 100),
            status: "deserializing",
            total: p.total,
          });
        }
      );

      // Revoke old Object URLs before replacing state
      const store = useGalleryStore.getState();
      revokePhotoUrls(Object.values(store.photos));

      // Replace state with loaded project
      useGalleryStore.setState({
        currentSlideId: null,
        photos: newPhotos,
        playheadFrame: 0,
        selectedSlideIds: new Set(),
        slides: newSlides,
      });

      setProgress({
        current: Object.keys(newPhotos).length,
        percentage: 100,
        status: "success",
        total: Object.keys(newPhotos).length,
      });
    } catch (error) {
      setProgress({
        current: 0,
        error: error instanceof Error ? error.message : "Load failed",
        percentage: 0,
        status: "error",
        total: 0,
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(null);
  }, []);

  const canSave = Object.keys(photos).length > 0;

  return {
    canSave,
    isProcessing,
    loadProject,
    progress,
    resetProgress,
    saveProject,
  };
}
