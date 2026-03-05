import { Section } from "../types";
import {
  BoxItemConfig,
  BoxEdgeSide,
  BoxSide,
  LayoutBuildResult,
  ResolvedStadiumLayoutConfig,
  StadiumLayoutConfig,
} from "./types";

const DEFAULT_LAYOUT: ResolvedStadiumLayoutConfig = {
  dimensions: {
    width: 600,
    height: 500,
    groundRadius: 125,
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
    sideCounts: {
      top: 2,
      bottom: 2,
      left: 2,
      right: 2,
    },
    items: [],
    width: 84,
    height: 56,
    gap: 14,
    offsetFromGround: 42,
  },
};

export function resolveLayoutConfig(
  config: StadiumLayoutConfig
): ResolvedStadiumLayoutConfig {
  const resolvedCountPerSide = Math.max(1, config.boxes.countPerSide ?? DEFAULT_LAYOUT.boxes.countPerSide);
  const configuredSideCounts = config.boxes.sideCounts ?? {};
  const resolvedSideCounts = {
    top: sanitizeCount(configuredSideCounts.top, resolvedCountPerSide),
    bottom: sanitizeCount(configuredSideCounts.bottom, resolvedCountPerSide),
    left: sanitizeCount(configuredSideCounts.left, resolvedCountPerSide),
    right: sanitizeCount(configuredSideCounts.right, resolvedCountPerSide),
  };
  const resolvedItems = Array.isArray(config.boxes.items)
    ? sanitizeItems(config.boxes.items)
    : buildItemsFromSideCounts(resolvedSideCounts);

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
      countPerSide: resolvedCountPerSide,
      sideCounts: resolvedSideCounts,
      items: resolvedItems,
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

  layout.boxes.items.forEach((box) => {
    const capacity = clampInteger(
      box.capacity ?? getAutoCapacity(layout, box),
      1,
      100000
    );
    const available = clampInteger(box.available ?? Math.floor(capacity * 0.6), 0, capacity);

    sections.push({
      id: getBoxDomId(box),
      name:
        box.name ??
        `${capitalize(box.type)} Row ${box.row ?? 1} Box ${box.order}`,
      capacity,
      filled: capacity - available,
      status: box.status,
      shapeKey: getBoxShapeKey(box),
    });
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
  const topRows = groupItemsByRow(getItemsForSide(boxes.items, "top"));
  const bottomRows = groupItemsByRow(getItemsForSide(boxes.items, "bottom"));
  const leftRows = groupItemsByRow(getItemsForSide(boxes.items, "left"));
  const rightRows = groupItemsByRow(getItemsForSide(boxes.items, "right"));
  const topLeftItems = getItemsForSide(boxes.items, "top-left");
  const topRightItems = getItemsForSide(boxes.items, "top-right");
  const bottomLeftItems = getItemsForSide(boxes.items, "bottom-left");
  const bottomRightItems = getItemsForSide(boxes.items, "bottom-right");

  const topBaseY = centerY - dimensions.groundRadius - boxes.offsetFromGround - boxes.height;
  topRows.forEach((rowItems, rowIndex) => {
    const rowY = topBaseY - rowIndex * (boxes.height + boxes.gap);
    renderTopBottomRow(markup, rowItems, centerX, rowY, boxes.width, boxes.height, boxes.gap);
  });

  const bottomBaseY = centerY + dimensions.groundRadius + boxes.offsetFromGround;
  bottomRows.forEach((rowItems, rowIndex) => {
    const rowY = bottomBaseY + rowIndex * (boxes.height + boxes.gap);
    renderTopBottomRow(markup, rowItems, centerX, rowY, boxes.width, boxes.height, boxes.gap);
  });

  const leftBaseX = centerX - dimensions.groundRadius - boxes.offsetFromGround - boxes.width;
  leftRows.forEach((rowItems, rowIndex) => {
    const rowX = leftBaseX - rowIndex * (boxes.width + boxes.gap);
    renderLeftRightRow(markup, rowItems, rowX, centerY, boxes.width, boxes.height, boxes.gap);
  });

  const rightBaseX = centerX + dimensions.groundRadius + boxes.offsetFromGround;
  rightRows.forEach((rowItems, rowIndex) => {
    const rowX = rightBaseX + rowIndex * (boxes.width + boxes.gap);
    renderLeftRightRow(markup, rowItems, rowX, centerY, boxes.width, boxes.height, boxes.gap);
  });

  const topRowBounds = getCenteredRowBounds(topRows[0]?.length ?? 0, centerX, boxes.width, boxes.gap);
  const bottomRowBounds = getCenteredRowBounds(bottomRows[0]?.length ?? 0, centerX, boxes.width, boxes.gap);
  const topLeftBaseX = topRowBounds
    ? Math.min(leftBaseX, topRowBounds.left - boxes.gap - boxes.width)
    : leftBaseX;
  const topRightBaseX = topRowBounds
    ? Math.max(rightBaseX, topRowBounds.right + boxes.gap)
    : rightBaseX;
  const bottomLeftBaseX = bottomRowBounds
    ? Math.min(leftBaseX, bottomRowBounds.left - boxes.gap - boxes.width)
    : leftBaseX;
  const bottomRightBaseX = bottomRowBounds
    ? Math.max(rightBaseX, bottomRowBounds.right + boxes.gap)
    : rightBaseX;

  renderCornerItems(
    markup,
    topLeftItems,
    topLeftBaseX,
    topBaseY,
    -1,
    -1,
    boxes.width,
    boxes.height,
    boxes.gap
  );
  renderCornerItems(
    markup,
    topRightItems,
    topRightBaseX,
    topBaseY,
    1,
    -1,
    boxes.width,
    boxes.height,
    boxes.gap
  );
  renderCornerItems(
    markup,
    bottomLeftItems,
    bottomLeftBaseX,
    bottomBaseY,
    -1,
    1,
    boxes.width,
    boxes.height,
    boxes.gap
  );
  renderCornerItems(
    markup,
    bottomRightItems,
    bottomRightBaseX,
    bottomBaseY,
    1,
    1,
    boxes.width,
    boxes.height,
    boxes.gap
  );

  return markup;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function sanitizeCount(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(1, Math.floor(value));
}

function sanitizeItems(items: BoxItemConfig[]): BoxItemConfig[] {
  return items
    .filter((item) => isSide(item.type))
    .map((item) => ({
      type: item.type,
      row: sanitizeCount(item.row, 1),
      order: sanitizeCount(item.order, 1),
      name: item.name,
      capacity: typeof item.capacity === "number" ? sanitizeCount(item.capacity, 1) : undefined,
      available: typeof item.available === "number" ? Math.max(0, Math.floor(item.available)) : undefined,
      status: item.status,
    }));
}

function buildItemsFromSideCounts(sideCounts: Record<BoxEdgeSide, number>): BoxItemConfig[] {
  const items: BoxItemConfig[] = [];

  (["top", "bottom", "left", "right"] as const).forEach((side) => {
    for (let order = 1; order <= sideCounts[side]; order += 1) {
      items.push({ type: side, row: 1, order });
    }
  });

  return items;
}

function getItemsForSide(items: BoxItemConfig[], side: BoxSide): BoxItemConfig[] {
  return items
    .filter((item) => item.type === side)
    .sort((a, b) => {
      const rowDelta = (a.row ?? 1) - (b.row ?? 1);
      if (rowDelta !== 0) return rowDelta;
      return a.order - b.order;
    });
}

function isSide(value: unknown): value is BoxSide {
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

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  const rounded = Math.floor(value);
  return Math.max(min, Math.min(max, rounded));
}

function getAutoCapacity(
  layout: ResolvedStadiumLayoutConfig,
  _box: BoxItemConfig
): number {
  // Derive a consistent capacity from rendered box size.
  const area = layout.boxes.width * layout.boxes.height;
  return Math.max(20, Math.round(area / 35));
}

function groupItemsByRow(items: BoxItemConfig[]): BoxItemConfig[][] {
  const groups = new Map<number, BoxItemConfig[]>();

  items.forEach((item) => {
    const row = item.row ?? 1;
    const existing = groups.get(row);
    if (existing) {
      existing.push(item);
      return;
    }
    groups.set(row, [item]);
  });

  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, rowItems]) => rowItems.sort((a, b) => a.order - b.order));
}

function renderTopBottomRow(
  markup: string[],
  items: BoxItemConfig[],
  centerX: number,
  y: number,
  boxWidth: number,
  boxHeight: number,
  gap: number
): void {
  const totalWidth = items.length * boxWidth + (items.length - 1) * gap;
  const startX = centerX - totalWidth / 2;

  items.forEach((box, index) => {
    const x = startX + index * (boxWidth + gap);
    markup.push(
      `<rect id="${getBoxShapeKey(box)}" x="${x}" y="${y}" width="${boxWidth}" height="${boxHeight}" rx="5" />`
    );
  });
}

function renderLeftRightRow(
  markup: string[],
  items: BoxItemConfig[],
  x: number,
  centerY: number,
  boxWidth: number,
  boxHeight: number,
  gap: number
): void {
  const totalHeight = items.length * boxHeight + (items.length - 1) * gap;
  const startY = centerY - totalHeight / 2;

  items.forEach((box, index) => {
    const y = startY + index * (boxHeight + gap);
    markup.push(
      `<rect id="${getBoxShapeKey(box)}" x="${x}" y="${y}" width="${boxWidth}" height="${boxHeight}" rx="5" />`
    );
  });
}

function getCenteredRowBounds(
  count: number,
  centerX: number,
  boxWidth: number,
  gap: number
): { left: number; right: number } | null {
  if (count <= 0) return null;
  const totalWidth = count * boxWidth + (count - 1) * gap;
  const left = centerX - totalWidth / 2;
  return {
    left,
    right: left + totalWidth,
  };
}

function renderCornerItems(
  markup: string[],
  items: BoxItemConfig[],
  baseX: number,
  baseY: number,
  xDirection: 1 | -1,
  yDirection: 1 | -1,
  boxWidth: number,
  boxHeight: number,
  gap: number
): void {
  const xStep = boxWidth + gap;
  const yStep = boxHeight + gap;
  const rows = groupItemsByRow(items);

  rows.forEach((rowItems, rowIndex) => {
    const y = baseY + yDirection * rowIndex * yStep;

    rowItems.forEach((box, index) => {
      const x = baseX + xDirection * index * xStep;
      markup.push(
        `<rect id="${getBoxShapeKey(box)}" x="${x}" y="${y}" width="${boxWidth}" height="${boxHeight}" rx="5" />`
      );
    });
  });
}

function getBoxShapeKey(box: BoxItemConfig): string {
  return `box_${box.type}_r${box.row ?? 1}_o${box.order}`;
}

function getBoxDomId(box: BoxItemConfig): string {
  return `box-${box.type}-r${box.row ?? 1}-o${box.order}`;
}
