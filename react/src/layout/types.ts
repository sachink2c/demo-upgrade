import { Section, SectionStatus } from "../types";

export type BoxPlacement = "left-right" | "top-bottom";
export type BoxEdgeSide = "top" | "bottom" | "left" | "right";
export type BoxCornerSide = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type BoxSide = BoxEdgeSide | BoxCornerSide;
export type BoxSideCounts = Partial<Record<BoxEdgeSide, number>>;

export interface BoxItemConfig {
  type: BoxSide;
  row?: number;
  order: number;
  name?: string;
  capacity?: number;
  status?: SectionStatus;
  available?: number;
}

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
  sideCounts: Record<BoxEdgeSide, number>;
  items: BoxItemConfig[];
  width: number;
  height: number;
  gap: number;
  offsetFromGround: number;
}

export interface StadiumLayoutConfig {
  dimensions?: Partial<LayoutDimensions>;
  stands?: Partial<StandsLayout>;
  boxes: Pick<BoxesLayout, "placement"> &
    {
      countPerSide?: number;
      sideCounts?: BoxSideCounts;
      items?: BoxItemConfig[];
    } &
    Partial<Omit<BoxesLayout, "placement" | "countPerSide" | "sideCounts" | "items">>;
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
