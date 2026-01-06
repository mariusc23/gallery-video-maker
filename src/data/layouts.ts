import type { CollageLayout } from "@/types";

export const COLLAGE_LAYOUTS: CollageLayout[] = [
  // 1 photo (single)
  {
    id: "single",
    name: "Single Photo",
    photoCount: 1,
    aspectRatio: 16 / 9,
    slots: [{ id: "1", x: 0, y: 0, width: 100, height: 100 }],
  },

  // 2 photos
  {
    id: "split-horizontal",
    name: "Split Horizontal",
    photoCount: 2,
    aspectRatio: 16 / 9,
    slots: [
      { id: "1", x: 0, y: 0, width: 50, height: 100 },
      { id: "2", x: 50, y: 0, width: 50, height: 100 },
    ],
  },
  {
    id: "split-vertical",
    name: "Split Vertical",
    photoCount: 2,
    aspectRatio: 16 / 9,
    slots: [
      { id: "1", x: 0, y: 0, width: 100, height: 50 },
      { id: "2", x: 0, y: 50, width: 100, height: 50 },
    ],
  },
  {
    id: "side-by-side-large-left",
    name: "Side by Side (Large Left)",
    photoCount: 2,
    aspectRatio: 16 / 9,
    slots: [
      { id: "1", x: 0, y: 0, width: 66.67, height: 100 },
      { id: "2", x: 66.67, y: 0, width: 33.33, height: 100 },
    ],
  },
  {
    id: "side-by-side-large-right",
    name: "Side by Side (Large Right)",
    photoCount: 2,
    aspectRatio: 16 / 9,
    slots: [
      { id: "1", x: 0, y: 0, width: 33.33, height: 100 },
      { id: "2", x: 33.33, y: 0, width: 66.67, height: 100 },
    ],
  },

  // 3 photos
  {
    id: "grid-3-left",
    name: "Grid 3 (Large Left)",
    photoCount: 3,
    aspectRatio: 16 / 9,
    slots: [
      { id: "1", x: 0, y: 0, width: 66.67, height: 100 },
      { id: "2", x: 66.67, y: 0, width: 33.33, height: 50 },
      { id: "3", x: 66.67, y: 50, width: 33.33, height: 50 },
    ],
  },
  {
    id: "grid-3-right",
    name: "Grid 3 (Large Right)",
    photoCount: 3,
    aspectRatio: 16 / 9,
    slots: [
      { id: "1", x: 33.33, y: 0, width: 66.67, height: 100 },
      { id: "2", x: 0, y: 0, width: 33.33, height: 50 },
      { id: "3", x: 0, y: 50, width: 33.33, height: 50 },
    ],
  },
  {
    id: "grid-3-horizontal",
    name: "Grid 3 (Horizontal)",
    photoCount: 3,
    aspectRatio: 16 / 9,
    slots: [
      { id: "1", x: 0, y: 0, width: 33.33, height: 100 },
      { id: "2", x: 33.33, y: 0, width: 33.33, height: 100 },
      { id: "3", x: 66.67, y: 0, width: 33.33, height: 100 },
    ],
  },

  // 4 photos
  {
    id: "grid-4",
    name: "Grid 2x2",
    photoCount: 4,
    aspectRatio: 16 / 9,
    slots: [
      { id: "1", x: 0, y: 0, width: 50, height: 50 },
      { id: "2", x: 50, y: 0, width: 50, height: 50 },
      { id: "3", x: 0, y: 50, width: 50, height: 50 },
      { id: "4", x: 50, y: 50, width: 50, height: 50 },
    ],
  },
  {
    id: "grid-4-horizontal",
    name: "Grid 4 (Horizontal)",
    photoCount: 4,
    aspectRatio: 16 / 9,
    slots: [
      { id: "1", x: 0, y: 0, width: 25, height: 100 },
      { id: "2", x: 25, y: 0, width: 25, height: 100 },
      { id: "3", x: 50, y: 0, width: 25, height: 100 },
      { id: "4", x: 75, y: 0, width: 25, height: 100 },
    ],
  },

  // 5 photos
  {
    id: "grid-5",
    name: "Grid 5",
    photoCount: 5,
    aspectRatio: 16 / 9,
    slots: [
      { id: "1", x: 0, y: 0, width: 66.67, height: 50 },
      { id: "2", x: 66.67, y: 0, width: 33.33, height: 50 },
      { id: "3", x: 0, y: 50, width: 33.33, height: 50 },
      { id: "4", x: 33.33, y: 50, width: 33.33, height: 50 },
      { id: "5", x: 66.67, y: 50, width: 33.33, height: 50 },
    ],
  },

  // 6 photos
  {
    id: "grid-6",
    name: "Grid 2x3",
    photoCount: 6,
    aspectRatio: 16 / 9,
    slots: [
      { id: "1", x: 0, y: 0, width: 33.33, height: 50 },
      { id: "2", x: 33.33, y: 0, width: 33.33, height: 50 },
      { id: "3", x: 66.67, y: 0, width: 33.33, height: 50 },
      { id: "4", x: 0, y: 50, width: 33.33, height: 50 },
      { id: "5", x: 33.33, y: 50, width: 33.33, height: 50 },
      { id: "6", x: 66.67, y: 50, width: 33.33, height: 50 },
    ],
  },

  // 8 photos
  {
    id: "grid-8",
    name: "Grid 2x4",
    photoCount: 8,
    aspectRatio: 16 / 9,
    slots: [
      { id: "1", x: 0, y: 0, width: 25, height: 50 },
      { id: "2", x: 25, y: 0, width: 25, height: 50 },
      { id: "3", x: 50, y: 0, width: 25, height: 50 },
      { id: "4", x: 75, y: 0, width: 25, height: 50 },
      { id: "5", x: 0, y: 50, width: 25, height: 50 },
      { id: "6", x: 25, y: 50, width: 25, height: 50 },
      { id: "7", x: 50, y: 50, width: 25, height: 50 },
      { id: "8", x: 75, y: 50, width: 25, height: 50 },
    ],
  },

  // 9 photos
  {
    id: "grid-9",
    name: "Grid 3x3",
    photoCount: 9,
    aspectRatio: 16 / 9,
    slots: [
      { id: "1", x: 0, y: 0, width: 33.33, height: 33.33 },
      { id: "2", x: 33.33, y: 0, width: 33.33, height: 33.33 },
      { id: "3", x: 66.67, y: 0, width: 33.33, height: 33.33 },
      { id: "4", x: 0, y: 33.33, width: 33.33, height: 33.33 },
      { id: "5", x: 33.33, y: 33.33, width: 33.33, height: 33.33 },
      { id: "6", x: 66.67, y: 33.33, width: 33.33, height: 33.33 },
      { id: "7", x: 0, y: 66.67, width: 33.33, height: 33.33 },
      { id: "8", x: 33.33, y: 66.67, width: 33.33, height: 33.33 },
      { id: "9", x: 66.67, y: 66.67, width: 33.33, height: 33.33 },
    ],
  },

  // 12 photos
  {
    id: "grid-12",
    name: "Grid 3x4",
    photoCount: 12,
    aspectRatio: 16 / 9,
    slots: [
      { id: "1", x: 0, y: 0, width: 25, height: 33.33 },
      { id: "2", x: 25, y: 0, width: 25, height: 33.33 },
      { id: "3", x: 50, y: 0, width: 25, height: 33.33 },
      { id: "4", x: 75, y: 0, width: 25, height: 33.33 },
      { id: "5", x: 0, y: 33.33, width: 25, height: 33.33 },
      { id: "6", x: 25, y: 33.33, width: 25, height: 33.33 },
      { id: "7", x: 50, y: 33.33, width: 25, height: 33.33 },
      { id: "8", x: 75, y: 33.33, width: 25, height: 33.33 },
      { id: "9", x: 0, y: 66.67, width: 25, height: 33.33 },
      { id: "10", x: 25, y: 66.67, width: 25, height: 33.33 },
      { id: "11", x: 50, y: 66.67, width: 25, height: 33.33 },
      { id: "12", x: 75, y: 66.67, width: 25, height: 33.33 },
    ],
  },
];
