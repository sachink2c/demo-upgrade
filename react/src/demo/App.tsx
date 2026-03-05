import React, { useEffect, useMemo, useState } from "react";
import { Section, SectionStatus, Thresholds } from "../types";
import LayoutMap from "../components/LayoutMap";
import { buildSectionsFromLayout } from "../layout/layoutEngine";
import { BoxItemConfig, BoxSide, StadiumLayoutConfig } from "../layout/types";
import { LAYOUT_SCHEMAS } from "./layoutSchemas";

const customThresholds: Thresholds = {
  limitedPct: 0.5,
  fullPct: 0.9,
};

type DataSourceMode = "hardcoded" | "webapi";
type ApiProvider = "dynamics" | "salesforce";
const DEFAULT_DYNAMICS_API_URL = "https://api.mockfly.dev/mocks/aa379ee1-7379-4fb3-b0ab-512a9fd8638b/map";

export const App: React.FC = () => {
  const [mode, setMode] = useState<"svg" | "grid">("svg");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [layoutKey, setLayoutKey] = useState<keyof typeof LAYOUT_SCHEMAS>("topBottomBoxes");
  const [dataSource, setDataSource] = useState<DataSourceMode>("hardcoded");
  const [apiProvider, setApiProvider] = useState<ApiProvider>("dynamics");
  const [apiUrl, setApiUrl] = useState(DEFAULT_DYNAMICS_API_URL);
  const [apiItems, setApiItems] = useState<BoxItemConfig[]>([]);
  const [apiReloadTick, setApiReloadTick] = useState(0);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const initialCounts = getInitialCounts("topBottomBoxes");
  const [boxCount, setBoxCount] = useState(initialCounts.countPerSide);
  const [topBoxCount, setTopBoxCount] = useState(initialCounts.top);
  const [bottomBoxCount, setBottomBoxCount] = useState(initialCounts.bottom);
  const [sections, setSections] = useState<Section[]>([]);
  const schemaUsesBoxItems = dataSource === "hardcoded" &&
    (LAYOUT_SCHEMAS[layoutKey].boxes.items?.length ?? 0) > 0;

  useEffect(() => {
    if (dataSource !== "webapi") {
      setApiError(null);
      setApiLoading(false);
      return;
    }

    const trimmedUrl = apiUrl.trim();
    if (!trimmedUrl) {
      setApiItems([]);
      setApiError("Enter an API URL to load boxes.items[] from web API.");
      setApiLoading(false);
      return;
    }

    const controller = new AbortController();
    let mounted = true;

    setApiLoading(true);
    setApiError(null);

    fetch(trimmedUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((payload) => {
        if (!mounted) return;
        const records = extractApiRecords(payload, apiProvider);
        const nextItems = mapApiRecordsToBoxItems(records);
        setApiItems(nextItems);

        if (nextItems.length === 0) {
          setApiError("No valid box items found in API response.");
        }
      })
      .catch((error: unknown) => {
        if (!mounted || isAbortError(error)) return;
        setApiItems([]);
        setApiError(error instanceof Error ? error.message : "Failed to load API data.");
      })
      .finally(() => {
        if (!mounted) return;
        setApiLoading(false);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [apiProvider, apiReloadTick, apiUrl, dataSource]);

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
    const useWebItems = dataSource === "webapi";

    if (useWebItems) {
      return {
        ...base,
        boxes: {
          ...base.boxes,
          items: apiItems,
        },
      };
    }

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
  }, [apiItems, bottomBoxCount, boxCount, dataSource, layoutKey, topBoxCount]);

  useEffect(() => {
    setSections(buildSectionsFromLayout(layoutConfig));
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
    if (dataSource === "webapi") {
      setApiReloadTick((value) => value + 1);
      return;
    }
    setSections(buildSectionsFromLayout(layoutConfig));
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
          <label htmlFor="data-source-select" className="control-label">
            Items Source:
          </label>
          <select
            id="data-source-select"
            value={dataSource}
            onChange={(e) => setDataSource(e.target.value as DataSourceMode)}
            className="control-select"
          >
            <option value="hardcoded">Hardcoded (Schema)</option>
            <option value="webapi">Web API</option>
          </select>
        </div>

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

        {dataSource === "webapi" && (
          <>
            <div className="control-group">
              <label htmlFor="provider-select" className="control-label">
                API Type:
              </label>
              <select
                id="provider-select"
                value={apiProvider}
                onChange={(e) => setApiProvider(e.target.value as ApiProvider)}
                className="control-select"
              >
                <option value="dynamics">Dynamics OData</option>
                <option value="salesforce">Salesforce</option>
              </select>
            </div>

            <div className="control-group">
              <label htmlFor="api-url-input" className="control-label">
                API URL:
              </label>
              <input
                id="api-url-input"
                type="url"
                placeholder="https://example.com/api/boxes"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="control-select"
              />
            </div>
          </>
        )}

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

        <button onClick={handleRefreshMockData} className="control-button refresh-button">
          {dataSource === "webapi" ? "Reload API Data" : "Reload Schema Data"}
        </button>

        <button
          onClick={() => setSelectedSectionId(null)}
          className="control-button clear-button"
        >
          Clear Selection
        </button>
      </div>

      {dataSource === "webapi" && (
        <div className={`api-status ${apiError ? "error" : "ok"}`}>
          {apiLoading
            ? "Loading API items..."
            : apiError
              ? apiError
              : `Loaded ${apiItems.length} API items into boxes.items[]`}
        </div>
      )}

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

function extractApiRecords(payload: unknown, provider: ApiProvider): unknown[] {
  if (Array.isArray(payload)) return payload;
  const record = toRecord(payload);
  if (!record) return [];

  if (provider === "salesforce" && Array.isArray(record.records)) {
    return record.records;
  }

  if (provider === "dynamics" && Array.isArray(record.value)) {
    return record.value;
  }

  if (Array.isArray(record.items)) {
    return record.items;
  }

  if (Array.isArray(record.data)) {
    return record.data;
  }

  return [];
}

function mapApiRecordsToBoxItems(records: unknown[]): BoxItemConfig[] {
  const normalized = records
    .map((record, index) => mapApiRecordToBoxItem(record, index))
    .filter((item): item is BoxItemConfig => item !== null);

  return normalized;
}

function mapApiRecordToBoxItem(record: unknown, index: number): BoxItemConfig | null {
  const value = toRecord(record);
  if (!value) return null;

  const side = normalizeBoxSide(readString(value, [
    "type",
    "side",
    "boxType",
    "box_side",
    "boxSide",
    "Side__c",
    "Type__c",
    "BoxType__c",
  ]));

  if (!side) return null;

  const row = readPositiveInteger(value, [
    "row",
    "boxRow",
    "rowNumber",
    "Row__c",
    "BoxRow__c",
  ], 1);
  const order = readPositiveInteger(value, [
    "order",
    "boxOrder",
    "sequence",
    "sortOrder",
    "displayOrder",
    "Order__c",
    "BoxOrder__c",
  ], index + 1);

  const item: BoxItemConfig = {
    type: side,
    row,
    order,
    name: readString(value, ["name", "label", "title", "Name", "Name__c"]),
    capacity: readOptionalPositiveInteger(value, ["capacity", "total", "Capacity__c"]),
    available: readOptionalPositiveInteger(value, ["available", "availableSeats", "Available__c"]),
    status: normalizeStatus(readString(value, ["status", "Status", "Status__c", "availabilityStatus"])),
  };

  return item;
}

function normalizeBoxSide(value: string | undefined): BoxSide | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().replace(/[_\s]+/g, "-");
  const compact = normalized.replace(/-/g, "");

  if (isBoxSide(normalized)) return normalized;

  if (compact === "topleft") return "top-left";
  if (compact === "topright") return "top-right";
  if (compact === "bottomleft") return "bottom-left";
  if (compact === "bottomright") return "bottom-right";
  if (compact === "top") return "top";
  if (compact === "bottom") return "bottom";
  if (compact === "left") return "left";
  if (compact === "right") return "right";

  return null;
}

function isBoxSide(value: string): value is BoxSide {
  return (
    value === "top" ||
    value === "bottom" ||
    value === "left" ||
    value === "right" ||
    value === "top-left" ||
    value === "top-right" ||
    value === "bottom-left" ||
    value === "bottom-right"
  );
}

function normalizeStatus(value: string | undefined): SectionStatus | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toUpperCase();

  if (
    normalized === "AVAILABLE" ||
    normalized === "LIMITED" ||
    normalized === "FULL" ||
    normalized === "BLOCKED"
  ) {
    return normalized;
  }

  return undefined;
}

function readString(source: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function readPositiveInteger(
  source: Record<string, unknown>,
  keys: string[],
  fallback: number
): number {
  const value = readOptionalPositiveInteger(source, keys);
  return value ?? fallback;
}

function readOptionalPositiveInteger(
  source: Record<string, unknown>,
  keys: string[]
): number | undefined {
  for (const key of keys) {
    const parsed = toPositiveInteger(source[key]);
    if (parsed !== undefined) return parsed;
  }
  return undefined;
}

function toPositiveInteger(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    const rounded = Math.floor(value);
    return rounded > 0 ? rounded : undefined;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      const rounded = Math.floor(numeric);
      return rounded > 0 ? rounded : undefined;
    }
  }
  return undefined;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function isAbortError(value: unknown): boolean {
  return value instanceof DOMException && value.name === "AbortError";
}
