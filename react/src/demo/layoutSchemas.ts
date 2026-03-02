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
      countPerSide: 4,
      sideCounts: {
        top: 4,
        bottom: 2,
        left: 3,
        right: 2,
      },
    },
  },
};
