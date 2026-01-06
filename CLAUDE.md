# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
mise exec -- npm run dev          # Start development server
mise exec -- npm run build        # TypeScript check + Vite build
mise exec -- npm run lint         # Run ESLint
mise exec -- npm run lint:fix     # Run ESLint with auto-fix
mise exec -- npm run format       # Format with Prettier
mise exec -- npm run format:check # Check formatting
```

## Architecture Overview

Gallery Video Maker is a React app for creating slideshow videos from photos with collage layouts, transitions, and face detection-based cropping.

### Tech Stack
- React 19 + TypeScript + Vite (rolldown-vite)
- Zustand for state management
- Remotion for video rendering/preview
- Tailwind CSS 4 + Radix UI components
- MediaPipe for face detection
- dnd-kit for drag-and-drop

### Key Directories

- `src/components/` - React UI components organized by feature (Editor, Export, MediaLibrary, Preview, Timeline, ui)
- `src/store/useGalleryStore.ts` - Central Zustand store with all app state and actions
- `src/remotion/` - Remotion video composition and slide rendering
- `src/export/` - Canvas-based video export logic
- `src/utils/` - Utilities for face detection, cropping, photo processing
- `src/data/layouts.ts` - 14 predefined collage layout definitions
- `src/types/index.ts` - Core TypeScript types (Photo, Slide, Layout, etc.)

### Data Flow

1. Photos uploaded → stored in Zustand with face detection results
2. Slides created → reference photo IDs, layout ID, crop configs, transitions
3. Preview → Remotion renders slides with transitions
4. Export → Canvas-based rendering to video file

### State Management Pattern

The Zustand store uses selector pattern for performance:
```typescript
const photos = useGalleryStore((state) => state.photos);
const addPhotos = useGalleryStore((state) => state.addPhotos);
```

### UI Components

UI primitives in `src/components/ui/` wrap Radix UI with Tailwind styling. Use existing components (Button, Dialog, Select, Slider, etc.) rather than creating new ones.

## Code Style

- ESLint with Perfectionist plugin enforces natural alphabetical ordering for imports, object keys, and type properties
- Prettier with Tailwind plugin for class ordering
- Props and object properties are sorted alphabetically by the linter
