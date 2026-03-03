import { StadiumLayoutConfig } from "../layout/types";

export const LAYOUT_SCHEMAS: Record<string, StadiumLayoutConfig> = {
  leftRightBoxes: {
    stands: {
      north: true,
      south: true,
      east: false,
      west: false,
    },
    boxes: {
      placement: "left-right",
      countPerSide: 3,
    },
  },
  topBottomBoxes: {
    dimensions: {
      width: 900,
      height: 760,
      groundRadius: 140,
    },
    stands: {
      north: false,
      south: false,
      east: false,
      west: false,
    },
    boxes: {
      placement: "top-bottom",
      items: [
        { type: "top", row: 1, order: 1, name: "Top R1 O1", capacity: 100, available: 70 },
        { type: "top", row: 1, order: 2, name: "Top R1 O2", capacity: 90, available: 20, status: "LIMITED" },
        { type: "top", row: 2, order: 1, name: "Top R2 O1", capacity: 110, available: 0, status: "FULL" },
        { type: "top", row: 2, order: 2, name: "Top R2 O2", capacity: 120, available: 80 },
        { type: "top", row: 2, order: 3, name: "Top R2 O3", capacity: 115, available: 55 },
        { type: "top", row: 2, order: 4, name: "Top R2 O4", capacity: 105, available: 30 },
        { type: "bottom", row: 1, order: 1, name: "Bottom R1 O1", capacity: 95, available: 65 },
        { type: "bottom", row: 1, order: 2, name: "Bottom R1 O2", capacity: 85, available: 10, status: "LIMITED" },
        { type: "bottom", row: 2, order: 1, name: "Bottom R2 O1", capacity: 105, available: 40 },
        { type: "bottom", row: 2, order: 2, name: "Bottom R2 O2", capacity: 88, available: 12, status: "LIMITED" },
        { type: "left", row: 1, order: 1, name: "Left R1 O1", capacity: 100, available: 55 },
        { type: "left", row: 1, order: 2, name: "Left R1 O2", capacity: 90, available: 30 },
        { type: "left", row: 2, order: 1, name: "Left R2 O1", capacity: 80, available: 0, status: "FULL" },
        { type: "right", row: 1, order: 1, name: "Right R1 O1", capacity: 110, available: 72 },
        { type: "right", row: 1, order: 2, name: "Right R1 O2", capacity: 75, available: 6, status: "LIMITED" },
        { type: "right", row: 2, order: 1, name: "Right R2 O1", capacity: 98, available: 25 },
      ],
    },
  },
};
