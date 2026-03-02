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
    stands: {
      north: false,
      south: false,
      east: true,
      west: true,
    },
    boxes: {
      placement: "top-bottom",
      countPerSide: 4,
    },
  },
};
