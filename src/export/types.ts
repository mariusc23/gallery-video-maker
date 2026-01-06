export type ExportFps = 24 | 30 | 60;
export type ExportResolution = "4k" | "720p" | "1080p";

export interface ResolutionConfig {
  bitrate: number;
  height: number;
  label: string;
  width: number;
}

export const RESOLUTION_CONFIGS: Record<ExportResolution, ResolutionConfig> = {
  "4k": {
    bitrate: 35_000_000,
    height: 2160,
    label: "4K (Ultra HD)",
    width: 3840,
  },
  "720p": { bitrate: 5_000_000, height: 720, label: "720p (HD)", width: 1280 },
  "1080p": {
    bitrate: 10_000_000,
    height: 1080,
    label: "1080p (Full HD)",
    width: 1920,
  },
};

export const FPS_OPTIONS: { label: string; value: ExportFps; }[] = [
  { label: "24 fps (Cinema)", value: 24 },
  { label: "30 fps (Standard)", value: 30 },
  { label: "60 fps (Smooth)", value: 60 },
];

export interface ExportOptions {
  fps: ExportFps;
  resolution: ExportResolution;
}

export interface ExportProgress {
  currentFrame: number;
  error?: string;
  estimatedTimeRemaining: null | number;
  percentage: number;
  status: ExportStatus;
  totalFrames: number;
}

export type ExportStatus =
  | "cancelled"
  | "complete"
  | "encoding"
  | "error"
  | "idle"
  | "preparing"
  | "rendering";
