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
      height: 620,
      groundRadius: 155,
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
        { type: "top", order: 1, name: "Top Box 1", capacity: 100, available: 70 },
        { type: "top", order: 2, name: "Top Box 2", capacity: 90, available: 20, status: "LIMITED" },
        { type: "top", order: 3, name: "Top Box 3", capacity: 110, available: 0, status: "FULL" },
        { type: "top", order: 4, name: "Top Box 4", capacity: 120, available: 80 },
        { type: "bottom", order: 1, name: "Bottom Box 1", capacity: 95, available: 65 },
        { type: "bottom", order: 2, name: "Bottom Box 2", capacity: 85, available: 10, status: "LIMITED" },
        { type: "bottom", order: 3, name: "Bottom Box 3", capacity: 105, available: 40 },
        { type: "left", order: 1, name: "Left Box 1", capacity: 100, available: 55 },
        { type: "left", order: 2, name: "Left Box 2", capacity: 90, available: 30 },
        { type: "left", order: 3, name: "Left Box 3", capacity: 80, available: 0, status: "FULL" },
        { type: "right", order: 1, name: "Right Box 1", capacity: 110, available: 72 },
        { type: "right", order: 2, name: "Right Box 2", capacity: 75, available: 6, status: "LIMITED" },
      ],
    },
  },
};
