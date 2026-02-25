/**
 * Tooltip component for displaying section information on hover.
 * Does not trap focus - rendered inline with pointer-events.
 */

import React from "react";
import { TooltipProps } from "../types";
import { getAvailableSeats, getSectionLabel } from "../utils";

export const Tooltip: React.FC<TooltipProps> = ({
  section,
  x,
  y,
  visible,
  thresholds,
}) => {
  if (!visible) return null;

  const available = getAvailableSeats(section);
  const label = getSectionLabel(section, thresholds);

  return (
    <div
      className="stadium-tooltip"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="tooltip-content">
        <div className="tooltip-header">{section.name}</div>
        <div className="tooltip-row">
          <span className="tooltip-label">Status:</span>
          <span className="tooltip-value">{label}</span>
        </div>
        <div className="tooltip-row">
          <span className="tooltip-label">Capacity:</span>
          <span className="tooltip-value">
            {section.filled} / {section.capacity}
          </span>
        </div>
        <div className="tooltip-row">
          <span className="tooltip-label">Available:</span>
          <span className="tooltip-value">{available}</span>
        </div>
      </div>
    </div>
  );
};
