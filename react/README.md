# Cricket Stadium Availability Map

A **reusable, production-ready React + TypeScript UI component library** for rendering cricket stadium availability maps with color-coded zones. Designed to be embedded into both **Dynamics 365 (PCF)** and **Salesforce (LWC)** via thin wrappers, with zero platform-specific dependencies.

## ✨ Features

- ✅ **Dual Rendering Modes**: SVG (shape-based) and Grid (card-based)
- ✅ **Color-Coded Status**: Available (green), Limited (amber), Full (red), Blocked (grey)
- ✅ **Interactive Selection**: Click to select, hover for details, keyboard navigation
- ✅ **Dynamic Filtering**: Search by name, toggle to show only available sections
- ✅ **Rich Tooltips**: Displays name, capacity, available seats, percentage, and status
- ✅ **Accessibility**: Full keyboard support (Tab, Enter, Space), ARIA labels, focus management
- ✅ **High Performance**: Handles 300+ sections without lag via event delegation
- ✅ **Responsive Design**: Mobile-friendly grid layout with CSS media queries
- ✅ **Zero External Dependencies**: React + TypeScript only (aside from dev tools)
- ✅ **Type-Safe**: Strict TypeScript with full type exports
- ✅ **CSS-Only Styling**: No Tailwind or UI frameworks required

## 📦 What's Included

```
src/
├── components/
│   ├── StadiumMap.tsx        # Main component (SVG + Grid modes)
│   ├── Legend.tsx             # Color legend
│   └── Tooltip.tsx            # Hover tooltip
├── types.ts                   # Shared TypeScript interface definitions
├── utils.ts                   # Color coding, status computation, label generation
├── styles/
│   └── styles.css            # Complete component styling
├── index.ts                   # Public API exports
└── demo/
    ├── App.tsx               # Demo application with mode switching
    └── main.tsx              # React entry point
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and npm/yarn/pnpm
- **React 18+** and **TypeScript 5+** (will be installed automatically)

### Installation & Development

```bash
# Install dependencies
npm install

# Start Vite dev server (opens http://localhost:5173)
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

### Usage in Your Application

```tsx
import React, { useState } from "react";
import { StadiumMap, Section, Thresholds } from "@/index";
import "@/styles/styles.css";

export function MyStadiumApp() {
  const sections: Section[] = [
    {
      id: "north-1",
      name: "North Stand",
      capacity: 2000,
      filled: 1500,
      shapeKey: "north_lower",
    },
    // ... more sections
  ];

  const thresholds: Thresholds = {
    limitedPct: 0.5,  // 50% = Limited
    fullPct: 0.9,     // 90% = Full
  };

  return (
    <StadiumMap
      sections={sections}
      mode="grid"
      thresholds={thresholds}
      onSectionClick={(id) => console.log("Selected:", id)}
    />
  );
}
```

## 📋 Component Props

### StadiumMap

```typescript
interface StadiumMapProps {
  // Array of stadium sections
  sections: Section[];

  // Rendering mode: "svg" for inline SVG, "grid" for cards
  mode: "svg" | "grid";

  // SVG markup (required when mode="svg")
  // Each SVG element id must match a section's shapeKey
  svgMarkup?: string;

  // Callback when section is clicked
  onSectionClick?: (sectionId: string) => void;

  // Callback when hovering (pass null on leave)
  onSectionHover?: (sectionId: string | null) => void;

  // ID of currently selected section (for highlighting)
  selectedSectionId?: string;

  // Custom thresholds for status determination
  thresholds?: Thresholds;
}
```

### Section

```typescript
interface Section {
  id: string;                    // Unique ID
  name: string;                  // Display name (e.g., "North Stand")
  capacity: number;              // Total capacity
  filled: number;                // Currently filled
  status?: SectionStatus;        // Optional override ("AVAILABLE" | "LIMITED" | "FULL" | "BLOCKED")
  shapeKey: string;              // Matches SVG element id (used in SVG mode)
}
```

### Thresholds

```typescript
interface Thresholds {
  limitedPct: number;  // Default: 0.5 (50%)
  fullPct: number;     // Default: 0.9 (90%)
}
```

## 🎨 Color Coding & Status

The component automatically determines status based on fill percentage:

| Status | Fill % | Color | Condition |
|--------|--------|-------|-----------|
| **AVAILABLE** | 0%–50% | Green | `filled / capacity < limitedPct` |
| **LIMITED** | 50%–90% | Amber | `filled / capacity >= limitedPct && < fullPct` |
| **FULL** | 90%+ | Red | `filled / capacity >= fullPct` |
| **BLOCKED** | N/A | Grey | `status === "BLOCKED"` (explicit override) |

## 🖼️ SVG Mode

When `mode="svg"`, provide an SVG markup string. Each SVG element's `id` must match a section's `shapeKey`:

```tsx
const svgMarkup = `
  <svg width="600" height="500" viewBox="0 0 600 500">
    <rect id="north_lower" x="200" y="20" width="200" height="60" />
    <rect id="north_upper" x="220" y="90" width="160" height="40" />
    <!-- ... more shapes -->
  </svg>
`;

<StadiumMap
  sections={sections}
  mode="svg"
  svgMarkup={svgMarkup}
/>
```

### Security Notes

- The component uses `dangerouslySetInnerHTML` for SVG rendering. This is intentional for inline SVG support.
- **Recommendation**: Sanitize `svgMarkup` upstream (e.g., using DOMPurify) before passing to the component, especially if it comes from user input or external sources.
- In production, consider running SVG through a sanitizer like [DOMPurify](https://github.com/cure53/DOMPurify) before rendering.

## ⌨️ Keyboard Accessibility

- **Tab**: Navigate between sections
- **Enter** / **Space**: Select focused section
- **Escape**: Clear selection (can be added to the parent app)
- All sections have `tabIndex={0}` and `role="button"`
- Focus is managed with visible outline and tooltip

### ARIA Labels

- Each section has `aria-label` with name and status
- Grid container has `role="grid"`
- SVG container has `role="img"`

## 🔧 Utility Functions

All color and status functions are exported for external use:

```typescript
import {
  getSectionColor,        // Get color + status info
  getSectionLabel,        // Get human-readable label
  getPercentage,          // Compute fill percentage
  getComputedStatus,      // Determine status from percentage
  colorToCSS,             // Map color scheme to CSS value
  getAvailableSeats,      // Calculate remaining available seats
} from "@/utils";

const colorInfo = getSectionColor(section, thresholds);
console.log(colorInfo.color);       // "green" | "amber" | "red" | "grey"
console.log(colorInfo.status);      // "AVAILABLE" | "LIMITED" | "FULL" | "BLOCKED"
console.log(colorInfo.percentage);  // 0.75 (75%)
```

## 🎯 Performance

- **Event Delegation**: SVG mode uses event delegation to minimize DOM listeners
- **Memoization**: useMemo for filtered sections and lookup maps
- **CSS Transitions**: GPU-accelerated transforms for smooth animations
- **Handles 300+ sections** without noticeable lag

## 🌐 Framework Integration

### Dynamics 365 (PCF)

Create a thin PCF wrapper:

```typescript
import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { StadiumMap, Section } from "cricket-stadium-map";
import "cricket-stadium-map/styles";

export class StadiumMapControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private sections: Section[] = [];
  
  public init(context: ComponentFramework.Context<IInputs>) {
    // Load sections from model/props
    this.sections = context.parameters.sectionsData?.raw || [];
  }

  public updateView(context: ComponentFramework.Context<IInputs>) {
    ReactDOM.render(
      <StadiumMap sections={this.sections} mode="grid" />,
      document.getElementById("reactContainer")
    );
  }
}
```

### Salesforce LWC

Create a thin LWC wrapper:

```javascript
import { LightningElement, track, wire } from "lwc";
import React from "lwc/resources/react";
import { StadiumMap } from "lwc/resources/stadiumMap"; // Import compiled component

export default class StadiumMapLWC extends LightningElement {
  @track sections = [];
  
  connectedCallback() {
    this.loadSections();
  }

  loadSections() {
    // Fetch from Apex or external API
    this.sections = [
      { id: "1", name: "North", capacity: 1000, filled: 700, shapeKey: "n" },
      // ...
    ];
  }

  render() {
    return React.createElement(StadiumMap, {
      sections: this.sections,
      mode: "grid"
    });
  }
}
```

## 📱 Responsive Behavior

- **Desktop**: Grid columns auto-fill with 180px minimum width
- **Tablet (769px–1024px)**: 150px minimum width
- **Mobile (<480px)**: Single column layout
- SVG scales responsively to container

## 🎓 Examples

### Grid Mode with Filtering

```tsx
<StadiumMap
  sections={sections}
  mode="grid"
  selectedSectionId={selectedId}
  onSectionClick={setSelectedId}
  thresholds={{ limitedPct: 0.4, fullPct: 0.85 }}
/>
```

### SVG Mode with Custom SVG

```tsx
const customSvg = `
  <svg viewBox="0 0 1000 800">
    <polygon id="upper_tier" points="100,50 200,50 180,150 120,150" />
    <rect id="lower_tier" x="150" y="200" width="300" height="400" />
  </svg>
`;

<StadiumMap
  sections={sections}
  mode="svg"
  svgMarkup={customSvg}
  onSectionClick={(id) => console.log("Clicked:", id)}
/>
```

### Dynamic Sections

```tsx
const [sections, setSections] = useState(initialSections);

useEffect(() => {
  // Fetch real-time availability
  const interval = setInterval(() => {
    fetchLatestAvailability().then(setSections);
  }, 5000);

  return () => clearInterval(interval);
}, []);

return <StadiumMap sections={sections} mode="grid" />;
```

## 🛠️ Development

### Project Structure

| File | Purpose |
|------|---------|
| `src/types.ts` | TypeScript interfaces and enums |
| `src/utils.ts` | Color logic, status computation |
| `src/components/StadiumMap.tsx` | Main component with dual modes |
| `src/components/Legend.tsx` | Color legend |
| `src/components/Tooltip.tsx` | Hover tooltip |
| `src/styles/styles.css` | All component styling |
| `src/index.ts` | Public API exports |
| `src/demo/App.tsx` | Demo application |

### Building for Production

```bash
# Build the component library
npm run build

# Build output in dist/
# - ES modules: dist/index.js
# - Types: dist/index.d.ts
# - Styles: dist/styles/styles.css
```

### Publishing to npm

```bash
npm login
npm publish
```

Then use in other projects:

```bash
npm install cricket-stadium-map
```

```typescript
import { StadiumMap } from "cricket-stadium-map";
import "cricket-stadium-map/styles";
```

## 📄 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## ⚖️ License

MIT

## 📝 Notes

- **No External UI Libraries**: Uses only CSS3, no Bootstrap, Material-UI, or Chakra
- **TypeScript Strict Mode**: All code is strictly typed
- **Platform Agnostic**: Works with vanilla React, Next.js, Astro, or any React environment
- **Embeddable**: Designed for iframe/shadow DOM embedding if needed

## 🤝 Contributing

Contributions welcome! Please ensure:

1. TypeScript passes strict mode (`npm run type-check`)
2. Code follows the existing style
3. Components remain framework-agnostic
4. Accessibility standards are maintained

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built by Your Company** | **Last Updated**: February 2026
