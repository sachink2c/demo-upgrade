/**
 * Cricket Stadium Availability Map - React Component Library
 *
 * Main entry point exporting all components, types, and utilities.
 * This is the public API surface.
 */

// Components
export { StadiumMap, default as default } from "./components/StadiumMap";
export { LayoutMap } from "./components/LayoutMap";
export { Legend } from "./components/Legend";
export { Tooltip } from "./components/Tooltip";

// Types
export type {
  Section,
  SectionStatus,
  ColorScheme,
  StadiumMapProps,
  TooltipProps,
  LegendProps,
  Thresholds,
  SectionColorInfo,
} from "./types";

export type {
  BoxPlacement,
  LayoutBuildResult,
  LayoutDimensions,
  BoxesLayout,
  StandsLayout,
  StadiumLayoutConfig,
  ResolvedStadiumLayoutConfig,
} from "./layout/types";

// Utilities
export {
  getSectionColor,
  getSectionLabel,
  getPercentage,
  getComputedStatus,
  statusToColor,
  colorToCSS,
  getAvailableSeats,
  DEFAULT_THRESHOLDS,
} from "./utils";

export {
  resolveLayoutConfig,
  buildSectionsFromLayout,
  buildSvgMarkupFromLayout,
  buildLayout,
} from "./layout/layoutEngine";

// Styles (should be imported in the application)
export { default as styles } from "./styles/styles.css";
