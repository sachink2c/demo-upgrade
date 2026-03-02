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
        { type: "top", order: 1 },
        { type: "top", order: 2 },
        { type: "top", order: 3 },
        { type: "top", order: 4 },
        { type: "bottom", order: 1 },
        { type: "bottom", order: 2 },
         { type: "bottom", order: 3 },
        { type: "left", order: 1 },
        { type: "left", order: 2 },
        { type: "left", order: 3 },
        { type: "right", order: 1 },
        { type: "right", order: 2 },
      ],
    },
  },
};
