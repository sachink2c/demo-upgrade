/**
 * Utility functions for color coding, status determination, and label generation.
 */

import { Section, Thresholds, ColorScheme, SectionStatus, SectionColorInfo } from "./types";

/** Default thresholds for status determination */
export const DEFAULT_THRESHOLDS: Thresholds = {
  limitedPct: 0.5,
  fullPct: 0.9,
};

/**
 * Computes the fill percentage for a section.
 * @param section The section to compute for
 * @returns Fill percentage as a decimal (0-1)
 */
export function getPercentage(section: Section): number {
  if (section.capacity <= 0) return 0;
  return Math.min(section.filled / section.capacity, 1);
}

/**
 * Determines the status of a section based on fill percentage and thresholds.
 * @param section The section to determine status for
 * @param percentage The fill percentage (0-1)
 * @param thresholds Custom thresholds or defaults
 * @returns The computed status
 */
export function getComputedStatus(
  section: Section,
  percentage: number,
  thresholds: Thresholds = DEFAULT_THRESHOLDS
): SectionStatus {
  // Keep BLOCKED as an explicit override; otherwise derive from occupancy numbers.
  if (section.status === "BLOCKED") return "BLOCKED";
  if (percentage >= 1) return "BLOCKED";

  if (percentage >= thresholds.fullPct) return "FULL";
  if (percentage >= thresholds.limitedPct) return "LIMITED";
  return "AVAILABLE";
}

/**
 * Maps a status to its corresponding color scheme.
 * @param status The status to map
 * @returns The color scheme
 */
export function statusToColor(status: SectionStatus): ColorScheme {
  switch (status) {
    case "AVAILABLE":
      return "green";
    case "LIMITED":
      return "amber";
    case "FULL":
      return "red";
    case "BLOCKED":
      return "grey";
    default:
      return "green";
  }
}

/**
 * Gets the color scheme and status information for a section.
 * @param section The section to get color info for
 * @param thresholds Custom thresholds or defaults
 * @returns Color and status information
 */
export function getSectionColor(
  section: Section,
  thresholds: Thresholds = DEFAULT_THRESHOLDS
): SectionColorInfo {
  const percentage = getPercentage(section);
  const status = getComputedStatus(section, percentage, thresholds);
  const color = statusToColor(status);

  return { color, status, percentage };
}

/**
 * Gets the color as a CSS color value.
 * @param color The color scheme
 * @returns A CSS color string
 */
export function colorToCSS(color: ColorScheme): string {
  switch (color) {
    case "green":
      return "#10b981"; // emerald-500
    case "amber":
      return "#f59e0b"; // amber-500
    case "red":
      return "#ef4444"; // red-500
    case "grey":
      return "#9ca3af"; // gray-400
    default:
      return "#10b981";
  }
}

/**
 * Gets a user-friendly label for a section's status.
 * @param section The section to get a label for
 * @param thresholds Custom thresholds or defaults
 * @returns A human-readable status label
 */
export function getSectionLabel(
  section: Section,
  thresholds: Thresholds = DEFAULT_THRESHOLDS
): string {
  const colorInfo = getSectionColor(section, thresholds);
  const percentage = Math.round(colorInfo.percentage * 100);

  switch (colorInfo.status) {
    case "AVAILABLE":
      return `Available (${percentage}% full)`;
    case "LIMITED":
      return `Limited Availability (${percentage}% full)`;
    case "FULL":
      return `Full (${percentage}% full)`;
    case "BLOCKED":
      return "Blocked";
    default:
      return `${percentage}% full`;
  }
}

/**
 * Gets the number of available seats for a section.
 * @param section The section
 * @returns Number of available seats
 */
export function getAvailableSeats(section: Section): number {
  return Math.max(0, section.capacity - section.filled);
}
