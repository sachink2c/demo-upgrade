import { Section } from "../types";

export type BoxPlacement = "left-right" | "top-bottom";

export interface LayoutDimensions {
  width: number;
  height: number;
  groundRadius: number;
}

export interface StandsLayout {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
  thickness: number;
}

export interface BoxesLayout {
  placement: BoxPlacement;
  countPerSide: number;
  width: number;
  height: number;
  gap: number;
  offsetFromGround: number;
}

export interface StadiumLayoutConfig {
  dimensions?: Partial<LayoutDimensions>;
  stands?: Partial<StandsLayout>;
  boxes: Pick<BoxesLayout, "placement" | "countPerSide"> & Partial<Omit<BoxesLayout, "placement" | "countPerSide">>;
}

export interface ResolvedStadiumLayoutConfig {
  dimensions: LayoutDimensions;
  stands: StandsLayout;
  boxes: BoxesLayout;
}

export interface LayoutBuildResult {
  sections: Section[];
  svgMarkup: string;
}
