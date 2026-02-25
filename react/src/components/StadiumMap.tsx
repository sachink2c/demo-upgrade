/**
 * StadiumMap: Main component for rendering cricket stadium availability map.
 * Supports two rendering modes: SVG and Grid.
 * Includes filtering, selection, hover state, and keyboard accessibility.
 */

import React, { useState, useRef, useCallback, useMemo } from "react";
import { StadiumMapProps, Section } from "../types";
import {
  getSectionColor,
  colorToCSS,
  DEFAULT_THRESHOLDS,
  getSectionLabel,
} from "../utils";
import { Legend } from "./Legend";
import { Tooltip } from "./Tooltip";

export const StadiumMap: React.FC<StadiumMapProps> = ({
  sections,
  mode,
  svgMarkup,
  onSectionClick,
  onSectionHover,
  selectedSectionId,
  thresholds = DEFAULT_THRESHOLDS,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Filter sections based on search term and availability
  const filteredSections = useMemo(() => {
    return sections.filter((section) => {
      const matchesSearch =
        searchTerm === "" ||
        section.name.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (showOnlyAvailable) {
        const colorInfo = getSectionColor(section, thresholds);
        return colorInfo.status === "AVAILABLE";
      }

      return true;
    });
  }, [sections, searchTerm, showOnlyAvailable, thresholds]);

  // Create a map for quick section lookup by ID
  const sectionMap = useMemo(() => {
    const map = new Map<string, Section>();
    sections.forEach((s) => map.set(s.id, s));
    return map;
  }, [sections]);

  // Handle section click
  const handleSectionClick = useCallback(
    (sectionId: string) => {
      onSectionClick?.(sectionId);
    },
    [onSectionClick]
  );

  // Handle section hover
  const handleSectionHover = useCallback(
    (sectionId: string | null) => {
      setHoveredSectionId(sectionId);
      onSectionHover?.(sectionId);
    },
    [onSectionHover]
  );

  // Handle mouse move for tooltip positioning (in grid mode)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setTooltipPosition({
        x: e.clientX + 10,
        y: e.clientY + 10,
      });
    },
    []
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (
        (e.key === "Enter" || e.key === " ") &&
        e.currentTarget.dataset.sectionId
      ) {
        e.preventDefault();
        handleSectionClick(e.currentTarget.dataset.sectionId);
      }
    },
    [handleSectionClick]
  );

  // Get hovered section for tooltip
  const hoveredSection = hoveredSectionId
    ? sectionMap.get(hoveredSectionId)
    : null;

  // ============================================
  // SVG MODE
  // ============================================
  if (mode === "svg") {
    return (
      <div className="stadium-map-container">
        <div className="stadium-map-header">
          <input
            type="text"
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="stadium-search-input"
            aria-label="Search sections by name"
          />
        </div>

        <Legend thresholds={thresholds} />

        {svgMarkup && (
          <div
            ref={svgContainerRef}
            className="stadium-svg-container"
            role="img"
            aria-label="Stadium availability map"
            onClick={(e) => {
              // Event delegation for SVG mode
              const target = e.target as SVGElement;
              if (target.id) {
                // Find section by shapeKey (which matches SVG id)
                const section = sections.find((s) => s.shapeKey === target.id);
                if (section) {
                  handleSectionClick(section.id);
                }
              }
            }}
            onMouseMove={(e) => {
              handleMouseMove(e);
              // Update tooltip position and section on hover
              const target = e.target as SVGElement;
              if (target.id) {
                const section = sections.find((s) => s.shapeKey === target.id);
                if (section) {
                  handleSectionHover(section.id);
                }
              } else {
                handleSectionHover(null);
              }
            }}
            onMouseLeave={() => handleSectionHover(null)}
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        )}

        {/* SVG styling - applied after SVG is rendered */}
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <style>{generateSVGStyles(
              sections,
              selectedSectionId,
              hoveredSectionId,
              thresholds
            )}</style>
          </defs>
        </svg>

        <Tooltip
          section={hoveredSection!}
          x={tooltipPosition.x}
          y={tooltipPosition.y}
          visible={hoveredSection !== null}
          thresholds={thresholds}
        />
      </div>
    );
  }

  // ============================================
  // GRID MODE
  // ============================================
  return (
    <div className="stadium-map-container">
      <div className="stadium-map-header">
        <input
          type="text"
          placeholder="Search sections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="stadium-search-input"
          aria-label="Search sections by name"
        />

        <label className="stadium-checkbox-label">
          <input
            type="checkbox"
            checked={showOnlyAvailable}
            onChange={(e) => setShowOnlyAvailable(e.target.checked)}
            aria-label="Show only available sections"
          />
          Show only available
        </label>
      </div>

      <Legend thresholds={thresholds} />

      <div
        className="stadium-grid-container"
        onMouseMove={handleMouseMove}
        role="grid"
        aria-label="Stadium sections grid"
      >
        {filteredSections.length > 0 ? (
          filteredSections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              isSelected={section.id === selectedSectionId}
              isHovered={section.id === hoveredSectionId}
              onHover={handleSectionHover}
              onClick={() => handleSectionClick(section.id)}
              onKeyDown={handleKeyDown}
              thresholds={thresholds}
            />
          ))
        ) : (
          <div className="stadium-no-results">No sections match your search</div>
        )}
      </div>

      <Tooltip
        section={hoveredSection!}
        x={tooltipPosition.x}
        y={tooltipPosition.y}
        visible={hoveredSection !== null}
        thresholds={thresholds}
      />
    </div>
  );
};

/**
 * SectionCard: Individual card component for grid mode.
 */
interface SectionCardProps {
  section: Section;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (sectionId: string | null) => void;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  thresholds: typeof DEFAULT_THRESHOLDS;
}

const SectionCard: React.FC<SectionCardProps> = ({
  section,
  isSelected,
  isHovered,
  onHover,
  onClick,
  onKeyDown,
  thresholds,
}) => {
  const colorInfo = getSectionColor(section, thresholds);
  const percentage = Math.round(colorInfo.percentage * 100);
  const bgColor = colorToCSS(colorInfo.color);

  return (
    <div
      className={`stadium-section-card ${isSelected ? "selected" : ""} ${
        isHovered ? "hovered" : ""
      }`}
      style={{
        "--section-color": bgColor,
      } as React.CSSProperties & { "--section-color": string }}
      onClick={onClick}
      onMouseEnter={() => onHover(section.id)}
      onMouseLeave={() => onHover(null)}
      onKeyDown={onKeyDown}
      data-section-id={section.id}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`${section.name}: ${getSectionLabel(section, thresholds)}`}
    >
      <div className="section-card-name">{section.name}</div>
      <div className="section-card-capacity">
        {section.filled} / {section.capacity}
      </div>
      <div className="section-card-percentage">{percentage}%</div>
      <div
        className="section-card-bar"
        style={{
          width: `${percentage}%`,
          backgroundColor: bgColor,
        }}
      />
    </div>
  );
};

/**
 * Generate CSS for styling SVG elements based on sections.
 * Each SVG element with id matching section.shapeKey gets styled accordingly.
 */
function generateSVGStyles(
  sections: Section[],
  selectedSectionId: string | undefined,
  hoveredSectionId: string | null,
  thresholds: typeof DEFAULT_THRESHOLDS
): string {
  let styles = "";

  sections.forEach((section) => {
    const colorInfo = getSectionColor(section, thresholds);
    const bgColor = colorToCSS(colorInfo.color);

    const selector = `#${CSS.escape(section.shapeKey)}`;

    styles += `
      ${selector} {
        fill: ${bgColor};
        stroke: #333;
        stroke-width: 2;
        cursor: pointer;
        transition: all 0.2s ease;
        opacity: 0.8;
      }
      ${selector}:hover {
        opacity: 1;
        stroke-width: 3;
      }
    `;

    if (section.id === selectedSectionId) {
      styles += `
        ${selector} {
          stroke: #000;
          stroke-width: 4;
          opacity: 1;
        }
      `;
    }

    if (section.id === hoveredSectionId) {
      styles += `
        ${selector} {
          opacity: 1;
          stroke-width: 4;
        }
      `;
    }
  });

  return styles;
}

export default StadiumMap;
