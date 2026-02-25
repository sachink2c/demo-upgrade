/**
 * Shared type definitions for the Cricket Stadium Availability Map component.
 */

/** Status of a stadium section */
export type SectionStatus = "AVAILABLE" | "LIMITED" | "FULL" | "BLOCKED";

/** Color theme for different statuses */
export type ColorScheme = "green" | "amber" | "red" | "grey";

/**
 * Represents a stadium section with availability information.
 */
export interface Section {
  /** Unique identifier for the section */
  id: string;

  /** Display name (e.g., "North Stand") */
  name: string;

  /** Total capacity of the section */
  capacity: number;

  /** Number of filled seats */
  filled: number;

  /** Optional status override (if not provided, computed from fill percentage) */
  status?: SectionStatus;

  /** Unique key for matching SVG shape elements (used in SVG mode) */
  shapeKey: string;
}

/**
 * Customizable thresholds for determining section availability status.
 */
export interface Thresholds {
  /** Fill percentage (0-1) above which a section is considered LIMITED (default: 0.5) */
  limitedPct: number;

  /** Fill percentage (0-1) above which a section is considered FULL (default: 0.9) */
  fullPct: number;
}

/**
 * Props for the StadiumMap component.
 */
export interface StadiumMapProps {
  /** Array of stadium sections to display */
  sections: Section[];

  /** Rendering mode: "svg" for inline SVG or "grid" for card grid */
  mode: "svg" | "grid";

  /** SVG markup string (required when mode="svg"). Each SVG element must have an id matching a section.shapeKey */
  svgMarkup?: string;

  /** Callback fired when a section is clicked */
  onSectionClick?: (sectionId: string) => void;

  /** Callback fired when hovering over a section. Pass null when mouse leaves */
  onSectionHover?: (sectionId: string | null) => void;

  /** ID of the currently selected section (for visual highlighting) */
  selectedSectionId?: string;

  /** Custom thresholds for determining status. Defaults: { limitedPct: 0.5, fullPct: 0.9 } */
  thresholds?: Thresholds;
}

/**
 * Props for the Tooltip component.
 */
export interface TooltipProps {
  /** Section being displayed in the tooltip */
  section: Section;

  /** X coordinate for positioning (in pixels) */
  x: number;

  /** Y coordinate for positioning (in pixels) */
  y: number;

  /** Whether the tooltip is currently visible */
  visible: boolean;

  /** Custom thresholds for computing status labels */
  thresholds?: Thresholds;
}

/**
 * Props for the Legend component.
 */
export interface LegendProps {
  /** Custom thresholds (for documentation purposes) */
  thresholds?: Thresholds;
}

/**
 * Information about a section's color and computed status.
 */
export interface SectionColorInfo {
  /** The color scheme for this section */
  color: ColorScheme;

  /** The computed or explicit status */
  status: SectionStatus;

  /** The fill percentage (0-1) */
  percentage: number;
}
