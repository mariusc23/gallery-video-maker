import type { CollageLayout } from "@/types";

export const COLLAGE_LAYOUTS: CollageLayout[] = [
  // 1 photo (single)
  {
    aspectRatio: 16 / 9,
    id: "single",
    name: "Single Photo",
    photoCount: 1,
    slots: [{ height: 100, id: "1", width: 100, x: 0, y: 0 }],
  },

  // 2 photos
  {
    aspectRatio: 16 / 9,
    id: "split-horizontal",
    name: "Split Horizontal",
    photoCount: 2,
    slots: [
      { height: 100, id: "1", width: 50, x: 0, y: 0 },
      { height: 100, id: "2", width: 50, x: 50, y: 0 },
    ],
  },
  {
    aspectRatio: 16 / 9,
    id: "split-vertical",
    name: "Split Vertical",
    photoCount: 2,
    slots: [
      { height: 50, id: "1", width: 100, x: 0, y: 0 },
      { height: 50, id: "2", width: 100, x: 0, y: 50 },
    ],
  },
  {
    aspectRatio: 16 / 9,
    id: "side-by-side-large-left",
    name: "Side by Side (Large Left)",
    photoCount: 2,
    slots: [
      { height: 100, id: "1", width: 66.67, x: 0, y: 0 },
      { height: 100, id: "2", width: 33.33, x: 66.67, y: 0 },
    ],
  },
  {
    aspectRatio: 16 / 9,
    id: "side-by-side-large-right",
    name: "Side by Side (Large Right)",
    photoCount: 2,
    slots: [
      { height: 100, id: "1", width: 33.33, x: 0, y: 0 },
      { height: 100, id: "2", width: 66.67, x: 33.33, y: 0 },
    ],
  },

  // 3 photos
  {
    aspectRatio: 16 / 9,
    id: "grid-3-left",
    name: "Grid 3 (Large Left)",
    photoCount: 3,
    slots: [
      { height: 100, id: "1", width: 66.67, x: 0, y: 0 },
      { height: 50, id: "2", width: 33.33, x: 66.67, y: 0 },
      { height: 50, id: "3", width: 33.33, x: 66.67, y: 50 },
    ],
  },
  {
    aspectRatio: 16 / 9,
    id: "grid-3-right",
    name: "Grid 3 (Large Right)",
    photoCount: 3,
    slots: [
      // Slots ordered left-to-right, top-to-bottom for visual order
      { height: 50, id: "1", width: 33.33, x: 0, y: 0 },
      { height: 50, id: "2", width: 33.33, x: 0, y: 50 },
      { height: 100, id: "3", width: 66.67, x: 33.33, y: 0 },
    ],
  },
  {
    aspectRatio: 16 / 9,
    id: "grid-3-horizontal",
    name: "Grid 3 (Horizontal)",
    photoCount: 3,
    slots: [
      { height: 100, id: "1", width: 33.33, x: 0, y: 0 },
      { height: 100, id: "2", width: 33.33, x: 33.33, y: 0 },
      { height: 100, id: "3", width: 33.33, x: 66.67, y: 0 },
    ],
  },

  // 4 photos
  {
    aspectRatio: 16 / 9,
    id: "grid-4",
    name: "Grid 2x2",
    photoCount: 4,
    slots: [
      { height: 50, id: "1", width: 50, x: 0, y: 0 },
      { height: 50, id: "2", width: 50, x: 50, y: 0 },
      { height: 50, id: "3", width: 50, x: 0, y: 50 },
      { height: 50, id: "4", width: 50, x: 50, y: 50 },
    ],
  },
  {
    aspectRatio: 16 / 9,
    id: "grid-4-horizontal",
    name: "Grid 4 (Horizontal)",
    photoCount: 4,
    slots: [
      { height: 100, id: "1", width: 25, x: 0, y: 0 },
      { height: 100, id: "2", width: 25, x: 25, y: 0 },
      { height: 100, id: "3", width: 25, x: 50, y: 0 },
      { height: 100, id: "4", width: 25, x: 75, y: 0 },
    ],
  },

  // 5 photos
  {
    aspectRatio: 16 / 9,
    id: "grid-5",
    name: "Grid 5",
    photoCount: 5,
    slots: [
      { height: 50, id: "1", width: 66.67, x: 0, y: 0 },
      { height: 50, id: "2", width: 33.33, x: 66.67, y: 0 },
      { height: 50, id: "3", width: 33.33, x: 0, y: 50 },
      { height: 50, id: "4", width: 33.33, x: 33.33, y: 50 },
      { height: 50, id: "5", width: 33.33, x: 66.67, y: 50 },
    ],
  },

  // 6 photos
  {
    aspectRatio: 16 / 9,
    id: "grid-6",
    name: "Grid 2x3",
    photoCount: 6,
    slots: [
      { height: 50, id: "1", width: 33.33, x: 0, y: 0 },
      { height: 50, id: "2", width: 33.33, x: 33.33, y: 0 },
      { height: 50, id: "3", width: 33.33, x: 66.67, y: 0 },
      { height: 50, id: "4", width: 33.33, x: 0, y: 50 },
      { height: 50, id: "5", width: 33.33, x: 33.33, y: 50 },
      { height: 50, id: "6", width: 33.33, x: 66.67, y: 50 },
    ],
  },

  // 8 photos
  {
    aspectRatio: 16 / 9,
    id: "grid-8",
    name: "Grid 2x4",
    photoCount: 8,
    slots: [
      { height: 50, id: "1", width: 25, x: 0, y: 0 },
      { height: 50, id: "2", width: 25, x: 25, y: 0 },
      { height: 50, id: "3", width: 25, x: 50, y: 0 },
      { height: 50, id: "4", width: 25, x: 75, y: 0 },
      { height: 50, id: "5", width: 25, x: 0, y: 50 },
      { height: 50, id: "6", width: 25, x: 25, y: 50 },
      { height: 50, id: "7", width: 25, x: 50, y: 50 },
      { height: 50, id: "8", width: 25, x: 75, y: 50 },
    ],
  },

  // 9 photos
  {
    aspectRatio: 16 / 9,
    id: "grid-9",
    name: "Grid 3x3",
    photoCount: 9,
    slots: [
      { height: 33.33, id: "1", width: 33.33, x: 0, y: 0 },
      { height: 33.33, id: "2", width: 33.33, x: 33.33, y: 0 },
      { height: 33.33, id: "3", width: 33.33, x: 66.67, y: 0 },
      { height: 33.33, id: "4", width: 33.33, x: 0, y: 33.33 },
      { height: 33.33, id: "5", width: 33.33, x: 33.33, y: 33.33 },
      { height: 33.33, id: "6", width: 33.33, x: 66.67, y: 33.33 },
      { height: 33.33, id: "7", width: 33.33, x: 0, y: 66.67 },
      { height: 33.33, id: "8", width: 33.33, x: 33.33, y: 66.67 },
      { height: 33.33, id: "9", width: 33.33, x: 66.67, y: 66.67 },
    ],
  },

  // 12 photos
  {
    aspectRatio: 16 / 9,
    id: "grid-12",
    name: "Grid 3x4",
    photoCount: 12,
    slots: [
      { height: 33.33, id: "1", width: 25, x: 0, y: 0 },
      { height: 33.33, id: "2", width: 25, x: 25, y: 0 },
      { height: 33.33, id: "3", width: 25, x: 50, y: 0 },
      { height: 33.33, id: "4", width: 25, x: 75, y: 0 },
      { height: 33.33, id: "5", width: 25, x: 0, y: 33.33 },
      { height: 33.33, id: "6", width: 25, x: 25, y: 33.33 },
      { height: 33.33, id: "7", width: 25, x: 50, y: 33.33 },
      { height: 33.33, id: "8", width: 25, x: 75, y: 33.33 },
      { height: 33.33, id: "9", width: 25, x: 0, y: 66.67 },
      { height: 33.33, id: "10", width: 25, x: 25, y: 66.67 },
      { height: 33.33, id: "11", width: 25, x: 50, y: 66.67 },
      { height: 33.33, id: "12", width: 25, x: 75, y: 66.67 },
    ],
  },
];
