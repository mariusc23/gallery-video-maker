export type ExportResolution = '720p' | '1080p' | '4k';
export type ExportFps = 24 | 30 | 60;

export interface ResolutionConfig {
  width: number;
  height: number;
  label: string;
  bitrate: number;
}

export const RESOLUTION_CONFIGS: Record<ExportResolution, ResolutionConfig> = {
  '720p': { width: 1280, height: 720, label: '720p (HD)', bitrate: 5_000_000 },
  '1080p': { width: 1920, height: 1080, label: '1080p (Full HD)', bitrate: 10_000_000 },
  '4k': { width: 3840, height: 2160, label: '4K (Ultra HD)', bitrate: 35_000_000 },
};

export const FPS_OPTIONS: { value: ExportFps; label: string }[] = [
  { value: 24, label: '24 fps (Cinema)' },
  { value: 30, label: '30 fps (Standard)' },
  { value: 60, label: '60 fps (Smooth)' },
];

export type ExportStatus =
  | 'idle'
  | 'preparing'
  | 'rendering'
  | 'encoding'
  | 'complete'
  | 'cancelled'
  | 'error';

export interface ExportProgress {
  status: ExportStatus;
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  estimatedTimeRemaining: number | null;
  error?: string;
}

export interface ExportOptions {
  resolution: ExportResolution;
  fps: ExportFps;
}
