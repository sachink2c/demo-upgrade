import React, { useEffect, useMemo, useState } from "react";
import { Section, Thresholds } from "../types";
import LayoutMap from "../components/LayoutMap";
import { buildSectionsFromLayout } from "../layout/layoutEngine";
import { StadiumLayoutConfig } from "../layout/types";
import { LAYOUT_SCHEMAS } from "./layoutSchemas";

const customThresholds: Thresholds = {
  limitedPct: 0.5,
  fullPct: 0.9,
};

export const App: React.FC = () => {
  const [mode, setMode] = useState<"svg" | "grid">("svg");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [layoutKey, setLayoutKey] = useState<keyof typeof LAYOUT_SCHEMAS>("topBottomBoxes");
  const initialCounts = getInitialCounts("topBottomBoxes");
  const [boxCount, setBoxCount] = useState(initialCounts.countPerSide);
  const [topBoxCount, setTopBoxCount] = useState(initialCounts.top);
  const [bottomBoxCount, setBottomBoxCount] = useState(initialCounts.bottom);
  const [sections, setSections] = useState<Section[]>([]);
  const schemaUsesBoxItems =
    (LAYOUT_SCHEMAS[layoutKey].boxes.items?.length ?? 0) > 0;

  useEffect(() => {
    const counts = getInitialCounts(layoutKey);
    setBoxCount(counts.countPerSide);
    setTopBoxCount(counts.top);
    setBottomBoxCount(counts.bottom);
  }, [layoutKey]);

  const layoutConfig = useMemo<StadiumLayoutConfig>(() => {
    const base = LAYOUT_SCHEMAS[layoutKey];
    const placement = base.boxes.placement;
    const usesItems = (base.boxes.items?.length ?? 0) > 0;

    if (usesItems) {
      return base;
    }

    return {
      ...base,
      boxes: {
        ...base.boxes,
        countPerSide: boxCount,
        ...(placement === "top-bottom"
          ? {
              sideCounts: {
                ...(base.boxes.sideCounts ?? {}),
                top: topBoxCount,
                bottom: bottomBoxCount,
              },
            }
          : {}),
      },
    };
  }, [bottomBoxCount, boxCount, layoutKey, topBoxCount]);

  useEffect(() => {
    setSections(randomizeSections(buildSectionsFromLayout(layoutConfig)));
    setSelectedSectionId(null);
  }, [layoutConfig]);

  const handleSectionClick = (sectionId: string) => {
    setSelectedSectionId(sectionId);
  };

  const handleSectionHover = (sectionId: string | null) => {
    if (!sectionId) return;
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      console.log("Hovering section:", section.name);
    }
  };

  const handleRefreshMockData = () => {
    setSections((previous) => randomizeSections(previous));
    setSelectedSectionId(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Cricket Stadium Availability Map</h1>
        <p className="subtitle">JSON-configured stands and boxes layout demo</p>
      </header>

      <div className="demo-controls">
        <div className="control-group">
          <label htmlFor="mode-select" className="control-label">
            Rendering Mode:
          </label>
          <select
            id="mode-select"
            value={mode}
            onChange={(e) => setMode(e.target.value as "svg" | "grid")}
            className="control-select"
          >
            <option value="svg">SVG Mode</option>
            <option value="grid">Grid Mode</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="layout-select" className="control-label">
            Box Layout:
          </label>
          <select
            id="layout-select"
            value={layoutKey}
            onChange={(e) =>
              setLayoutKey(e.target.value as keyof typeof LAYOUT_SCHEMAS)
            }
            className="control-select"
          >
            <option value="topBottomBoxes">Boxes Top/Bottom</option>
            <option value="leftRightBoxes">Boxes Left/Right + Top/Bottom Stands</option>
          </select>
        </div>

        {schemaUsesBoxItems ? (
          <div className="control-group">
            <span className="control-label">Boxes are schema-driven via boxes.items[]</span>
          </div>
        ) : layoutKey === "topBottomBoxes" ? (
          <>
            <div className="control-group">
              <label htmlFor="top-box-count" className="control-label">
                Top Boxes:
              </label>
              <input
                id="top-box-count"
                type="number"
                min={1}
                max={8}
                value={topBoxCount}
                onChange={(e) => setTopBoxCount(clampNumber(Number(e.target.value), 1, 8))}
                className="control-select"
              />
            </div>

            <div className="control-group">
              <label htmlFor="bottom-box-count" className="control-label">
                Bottom Boxes:
              </label>
              <input
                id="bottom-box-count"
                type="number"
                min={1}
                max={8}
                value={bottomBoxCount}
                onChange={(e) =>
                  setBottomBoxCount(clampNumber(Number(e.target.value), 1, 8))
                }
                className="control-select"
              />
            </div>
          </>
        ) : (
          <div className="control-group">
            <label htmlFor="box-count" className="control-label">
              Boxes Per Side:
            </label>
            <input
              id="box-count"
              type="number"
              min={1}
              max={8}
              value={boxCount}
              onChange={(e) => setBoxCount(clampNumber(Number(e.target.value), 1, 8))}
              className="control-select"
            />
          </div>
        )}

        <button
          onClick={handleRefreshMockData}
          className="control-button refresh-button"
        >
          Refresh Mock Data
        </button>

        <button
          onClick={() => setSelectedSectionId(null)}
          className="control-button clear-button"
        >
          Clear Selection
        </button>
      </div>

      {selectedSectionId && (
        <div className="selected-info">
          <strong>Selected:</strong>{" "}
          {sections.find((s) => s.id === selectedSectionId)?.name}
        </div>
      )}

      <div className="map-wrapper">
        <LayoutMap
          sections={sections}
          layoutConfig={layoutConfig}
          mode={mode}
          onSectionClick={handleSectionClick}
          onSectionHover={handleSectionHover}
          selectedSectionId={selectedSectionId || undefined}
          thresholds={customThresholds}
        />
      </div>
    </div>
  );
};

function randomizeSections(baseSections: Section[]): Section[] {
  return baseSections.map((section) => ({
    ...section,
    filled: Math.floor(Math.random() * (section.capacity + 1)),
  }));
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function getInitialCounts(layoutKey: keyof typeof LAYOUT_SCHEMAS): {
  countPerSide: number;
  top: number;
  bottom: number;
} {
  const schema = LAYOUT_SCHEMAS[layoutKey];
  const fallback = Math.max(1, schema.boxes.countPerSide ?? 1);
  const sideCounts = schema.boxes.sideCounts ?? {};

  return {
    countPerSide: fallback,
    top: Math.max(1, sideCounts.top ?? fallback),
    bottom: Math.max(1, sideCounts.bottom ?? fallback),
  };
}

export default App;
