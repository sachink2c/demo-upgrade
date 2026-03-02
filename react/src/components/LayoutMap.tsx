import React, { useMemo } from "react";
import { Section, StadiumMapProps } from "../types";
import StadiumMap from "./StadiumMap";
import { buildSvgMarkupFromLayout } from "../layout/layoutEngine";
import { StadiumLayoutConfig } from "../layout/types";

export interface LayoutMapProps extends Omit<StadiumMapProps, "svgMarkup" | "sections"> {
  sections: Section[];
  layoutConfig: StadiumLayoutConfig;
}

export const LayoutMap: React.FC<LayoutMapProps> = ({
  sections,
  layoutConfig,
  mode,
  onSectionClick,
  onSectionHover,
  selectedSectionId,
  thresholds,
}) => {
  const svgMarkup = useMemo(
    () => buildSvgMarkupFromLayout(layoutConfig),
    [layoutConfig]
  );

  return (
    <StadiumMap
      sections={sections}
      mode={mode}
      svgMarkup={mode === "svg" ? svgMarkup : undefined}
      onSectionClick={onSectionClick}
      onSectionHover={onSectionHover}
      selectedSectionId={selectedSectionId}
      thresholds={thresholds}
    />
  );
};

export default LayoutMap;
