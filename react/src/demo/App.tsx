/**
 * Demo App: Showcases the StadiumMap component in both SVG and Grid modes.
 * Includes mock data for a cricket stadium and mode switching.
 */

import React, { useState } from "react";
import { Section, Thresholds } from "../types";
import StadiumMap from "../components/StadiumMap";

/**
 * Mock data for a cricket stadium.
 */
const MOCK_SECTIONS: Section[] = [
  {
    id: "north-1",
    name: "North Stand - Lower",
    capacity: 2000,
    filled: 1500,
    status: undefined,
    shapeKey: "north_lower",
  },
  {
    id: "north-2",
    name: "North Stand - Upper",
    capacity: 1500,
    filled: 600,
    status: undefined,
    shapeKey: "north_upper",
  },
  {
    id: "south-1",
    name: "South Stand - Lower",
    capacity: 2200,
    filled: 150,
    status: undefined,
    shapeKey: "south_lower",
  },
  {
    id: "south-2",
    name: "South Stand - Upper",
    capacity: 1800,
    filled: 1700,
    status: undefined,
    shapeKey: "south_upper",
  },
  {
    id: "east-vip",
    name: "East VIP Box",
    capacity: 500,
    filled: 500,
    status: undefined,
    shapeKey: "east_vip",
  },
  {
    id: "east-general",
    name: "East General",
    capacity: 1200,
    filled: 850,
    status: undefined,
    shapeKey: "east_general",
  },
  {
    id: "west-vip",
    name: "West VIP Box",
    capacity: 500,
    filled: 250,
    status: undefined,
    shapeKey: "west_vip",
  },
  {
    id: "west-general",
    name: "West General",
    capacity: 1200,
    filled: 400,
    status: undefined,
    shapeKey: "west_general",
  },
  {
    id: "corporate",
    name: "Corporate Boxes",
    capacity: 800,
    filled: 0,
    status: "BLOCKED",
    shapeKey: "corporate",
  },
];

/**
 * Sample SVG markup for demonstration (simplified cricket stadium layout).
 * Each SVG element id must match a section's shapeKey.
 */
const SAMPLE_SVG_MARKUP = `
  <svg width="600" height="500" viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg">
    <!-- North Stand -->
    <rect id="north_lower" x="200" y="20" width="200" height="60" rx="5" />
    <rect id="north_upper" x="220" y="90" width="160" height="40" rx="3" />
    
    <!-- South Stand -->
    <rect id="south_lower" x="200" y="420" width="200" height="60" rx="5" />
    <rect id="south_upper" x="220" y="370" width="160" height="40" rx="3" />
    
    <!-- East Side -->
    <rect id="east_vip" x="450" y="150" width="80" height="120" rx="5" />
    <rect id="east_general" x="450" y="280" width="80" height="100" rx="3" />
    
    <!-- West Side -->
    <rect id="west_vip" x="70" y="150" width="80" height="120" rx="5" />
    <rect id="west_general" x="70" y="280" width="80" height="100" rx="3" />
    
    <!-- Corporate Boxes (center) -->
    <circle id="corporate" cx="300" cy="250" r="100" />
  </svg>
`;

/**
 * Demo App Component
 */
export const App: React.FC = () => {
  const [mode, setMode] = useState<"svg" | "grid">("grid");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );
  const [mockSections, setMockSections] = useState(MOCK_SECTIONS);
  const customThresholds: Thresholds = {
    limitedPct: 0.5,
    fullPct: 0.9,
  };

  const handleSectionClick = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    const section = mockSections.find((s) => s.id === sectionId);
    console.log("Selected section:", section);
  };

  const handleSectionHover = (sectionId: string | null) => {
    if (sectionId) {
      const section = mockSections.find((s) => s.id === sectionId);
      console.log("Hovering section:", section);
    }
  };

  const handleRefreshMockData = () => {
    const refreshed = mockSections.map((section) => ({
      ...section,
      filled: Math.floor(Math.random() * (section.capacity + 1)),
    }));
    setMockSections(refreshed);
    setSelectedSectionId(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Cricket Stadium Availability Map</h1>
        <p className="subtitle">React + TypeScript Component Library Demo</p>
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
            <option value="grid">Grid Mode (Cards)</option>
            <option value="svg">SVG Mode (Shapes)</option>
          </select>
        </div>

        <button
          onClick={handleRefreshMockData}
          className="control-button refresh-button"
        >
          🔄 Refresh Mock Data
        </button>

        <button
          onClick={() => setSelectedSectionId(null)}
          className="control-button clear-button"
        >
          ✕ Clear Selection
        </button>
      </div>

      {selectedSectionId && (
        <div className="selected-info">
          <strong>Selected:</strong>{" "}
          {mockSections.find((s) => s.id === selectedSectionId)?.name}
        </div>
      )}

      <div className="map-wrapper">
        <StadiumMap
          sections={mockSections}
          mode={mode}
          svgMarkup={mode === "svg" ? SAMPLE_SVG_MARKUP : undefined}
          onSectionClick={handleSectionClick}
          onSectionHover={handleSectionHover}
          selectedSectionId={selectedSectionId || undefined}
          thresholds={customThresholds}
        />
      </div>

      <section className="demo-info">
        <h2>Component Features</h2>
        <ul>
          <li>✅ Two rendering modes: SVG and Grid</li>
          <li>✅ Color-coded availability status (Available, Limited, Full, Blocked)</li>
          <li>✅ Interactive selection and hover states</li>
          <li>✅ Search and filter functionality</li>
          <li>✅ Keyboard accessibility (Tab, Enter, Space)</li>
          <li>✅ Responsive grid layout</li>
          <li>✅ Tooltip with detailed information</li>
          <li>✅ Performance optimized (handles 300+ sections)</li>
          <li>✅ No external UI library dependencies</li>
          <li>✅ Platform-agnostic (ready for Dynamics 365, Salesforce, etc.)</li>
        </ul>
      </section>

      <section className="demo-info">
        <h2>Usage Example</h2>
        <pre className="code-block">
{`import { StadiumMap, Legend } from '@stadium-map/lib';

<StadiumMap
  sections={sections}
  mode="grid"
  onSectionClick={(id) => console.log('Selected:', id)}
  selectedSectionId={selectedId}
  thresholds={{ limitedPct: 0.5, fullPct: 0.9 }}
/>`}
        </pre>
      </section>
    </div>
  );
};

export default App;
