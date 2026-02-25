/**
 * Legend component explaining color coding and availability statuses.
 */

import React from "react";
import { LegendProps } from "../types";
import { DEFAULT_THRESHOLDS, colorToCSS } from "../utils";

export const Legend: React.FC<LegendProps> = ({ thresholds = DEFAULT_THRESHOLDS }) => {
  const limitedPct = Math.round(thresholds.limitedPct * 100);
  const fullPct = Math.round(thresholds.fullPct * 100);

  return (
    <div className="stadium-legend">
      <div className="legend-title">Legend</div>
      <div className="legend-items">
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: colorToCSS("green") }}
          ></div>
          <div className="legend-text">
            <div className="legend-status">Available</div>
            <div className="legend-detail">0% - {limitedPct}%</div>
          </div>
        </div>

        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: colorToCSS("amber") }}
          ></div>
          <div className="legend-text">
            <div className="legend-status">Limited</div>
            <div className="legend-detail">
              {limitedPct}% - {fullPct}%
            </div>
          </div>
        </div>

        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: colorToCSS("red") }}
          ></div>
          <div className="legend-text">
            <div className="legend-status">Full</div>
            <div className="legend-detail">{fullPct}%+</div>
          </div>
        </div>

        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: colorToCSS("grey") }}
          ></div>
          <div className="legend-text">
            <div className="legend-status">Blocked</div>
            <div className="legend-detail">Not available</div>
          </div>
        </div>
      </div>
    </div>
  );
};
