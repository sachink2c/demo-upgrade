import { Section } from "../types";
import {
  LayoutBuildResult,
  ResolvedStadiumLayoutConfig,
  StadiumLayoutConfig,
} from "./types";

const DEFAULT_LAYOUT: ResolvedStadiumLayoutConfig = {
  dimensions: {
    width: 600,
    height: 500,
    groundRadius: 100,
  },
  stands: {
    north: true,
    south: true,
    east: false,
    west: false,
    thickness: 56,
  },
  boxes: {
    placement: "left-right",
    countPerSide: 2,
    width: 84,
    height: 56,
    gap: 14,
    offsetFromGround: 42,
  },
};

export function resolveLayoutConfig(
  config: StadiumLayoutConfig
): ResolvedStadiumLayoutConfig {
  return {
    dimensions: {
      ...DEFAULT_LAYOUT.dimensions,
      ...config.dimensions,
    },
    stands: {
      ...DEFAULT_LAYOUT.stands,
      ...config.stands,
    },
    boxes: {
      ...DEFAULT_LAYOUT.boxes,
      ...config.boxes,
      countPerSide: Math.max(1, config.boxes.countPerSide),
    },
  };
}

export function buildSectionsFromLayout(config: StadiumLayoutConfig): Section[] {
  const layout = resolveLayoutConfig(config);
  const sections: Section[] = [];

  const standSides: Array<["north" | "south" | "east" | "west", string]> = [
    ["north", "North Stand"],
    ["south", "South Stand"],
    ["east", "East Stand"],
    ["west", "West Stand"],
  ];

  standSides.forEach(([side, label]) => {
    if (!layout.stands[side]) return;

    sections.push({
      id: `stand-${side}`,
      name: label,
      capacity: 2200,
      filled: 0,
      shapeKey: `stand_${side}`,
    });
  });

  const sides = layout.boxes.placement === "left-right"
    ? (["left", "right"] as const)
    : (["top", "bottom"] as const);

  sides.forEach((side) => {
    for (let i = 1; i <= layout.boxes.countPerSide; i += 1) {
      sections.push({
        id: `box-${side}-${i}`,
        name: `${capitalize(side)} Box ${i}`,
        capacity: 120,
        filled: 0,
        shapeKey: `box_${side}_${i}`,
      });
    }
  });

  return sections;
}

export function buildSvgMarkupFromLayout(config: StadiumLayoutConfig): string {
  const layout = resolveLayoutConfig(config);
  const { width, height, groundRadius } = layout.dimensions;
  const centerX = width / 2;
  const centerY = height / 2;

  const standMarkup: string[] = [];

  if (layout.stands.north) {
    standMarkup.push(
      `<rect id="stand_north" x="${width * 0.2}" y="20" width="${width * 0.6}" height="${layout.stands.thickness}" rx="6" />`
    );
  }

  if (layout.stands.south) {
    standMarkup.push(
      `<rect id="stand_south" x="${width * 0.2}" y="${height - 20 - layout.stands.thickness}" width="${width * 0.6}" height="${layout.stands.thickness}" rx="6" />`
    );
  }

  if (layout.stands.west) {
    standMarkup.push(
      `<rect id="stand_west" x="20" y="${height * 0.2}" width="${layout.stands.thickness}" height="${height * 0.6}" rx="6" />`
    );
  }

  if (layout.stands.east) {
    standMarkup.push(
      `<rect id="stand_east" x="${width - 20 - layout.stands.thickness}" y="${height * 0.2}" width="${layout.stands.thickness}" height="${height * 0.6}" rx="6" />`
    );
  }

  const boxMarkup = buildBoxesMarkup(layout, centerX, centerY);

  return `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    ${standMarkup.join("\n    ")}
    ${boxMarkup.join("\n    ")}

    <!-- Fixed central ground circle (not controlled by box layout JSON) -->
    <circle cx="${centerX}" cy="${centerY}" r="${groundRadius}" fill="#d1fae5" stroke="#16a34a" stroke-width="3" />
  </svg>
  `;
}

export function buildLayout(config: StadiumLayoutConfig): LayoutBuildResult {
  return {
    sections: buildSectionsFromLayout(config),
    svgMarkup: buildSvgMarkupFromLayout(config),
  };
}

function buildBoxesMarkup(
  layout: ResolvedStadiumLayoutConfig,
  centerX: number,
  centerY: number
): string[] {
  const { boxes, dimensions } = layout;
  const markup: string[] = [];

  if (boxes.placement === "left-right") {
    const totalHeight =
      boxes.countPerSide * boxes.height + (boxes.countPerSide - 1) * boxes.gap;
    const startY = centerY - totalHeight / 2;

    const leftX = centerX - dimensions.groundRadius - boxes.offsetFromGround - boxes.width;
    const rightX = centerX + dimensions.groundRadius + boxes.offsetFromGround;

    for (let i = 0; i < boxes.countPerSide; i += 1) {
      const y = startY + i * (boxes.height + boxes.gap);
      const n = i + 1;
      markup.push(`<rect id="box_left_${n}" x="${leftX}" y="${y}" width="${boxes.width}" height="${boxes.height}" rx="5" />`);
      markup.push(`<rect id="box_right_${n}" x="${rightX}" y="${y}" width="${boxes.width}" height="${boxes.height}" rx="5" />`);
    }

    return markup;
  }

  const totalWidth =
    boxes.countPerSide * boxes.width + (boxes.countPerSide - 1) * boxes.gap;
  const startX = centerX - totalWidth / 2;

  const topY = centerY - dimensions.groundRadius - boxes.offsetFromGround - boxes.height;
  const bottomY = centerY + dimensions.groundRadius + boxes.offsetFromGround;

  for (let i = 0; i < boxes.countPerSide; i += 1) {
    const x = startX + i * (boxes.width + boxes.gap);
    const n = i + 1;
    markup.push(`<rect id="box_top_${n}" x="${x}" y="${topY}" width="${boxes.width}" height="${boxes.height}" rx="5" />`);
    markup.push(`<rect id="box_bottom_${n}" x="${x}" y="${bottomY}" width="${boxes.width}" height="${boxes.height}" rx="5" />`);
  }

  return markup;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
