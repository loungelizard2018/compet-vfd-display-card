import { ORIGINAL_DIGIT_SEGMENTS } from "./compet-vfd-segments.js";

export const MATRIX_COLS = 24;
export const MATRIX_ROWS = 40;

const blank = () => Array.from({ length: MATRIX_ROWS }, () => Array(MATRIX_COLS).fill(false));

function setCell(grid, row, col) {
  if (row >= 0 && row < MATRIX_ROWS && col >= 0 && col < MATRIX_COLS) grid[row][col] = true;
}

function paintDisc(grid, row, col, radius = 0) {
  for (let dr = -radius; dr <= radius; dr += 1) {
    for (let dc = -radius; dc <= radius; dc += 1) {
      if (Math.max(Math.abs(dr), Math.abs(dc)) <= radius) setCell(grid, row + dr, col + dc);
    }
  }
}

function paintLine(grid, r1, c1, r2, c2, radius = 0) {
  const steps = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1), 1);
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    paintDisc(grid, Math.round(r1 + (r2 - r1) * t), Math.round(c1 + (c2 - c1) * t), radius);
  }
}

function rows(grid) {
  return Object.freeze(grid.map((row) => row.map((cell) => cell ? "1" : "0").join("")));
}

function mask(draw) {
  const grid = blank();
  draw(grid);
  return rows(grid);
}

/*
 * The masks are the design/debug source of truth. They intentionally preserve
 * one or two dark cells between neighbouring physical electrodes.
 */
export const ORIGINAL_SEGMENT_MASKS = Object.freeze({
  A: mask((g) => {
    // Angular left leg of 4: descending stem with a clear near-90-degree turn.
    paintLine(g, 7, 8, 20, 7, 1);
    paintLine(g, 20, 7, 22, 13, 1);
    setCell(g, 19, 9); setCell(g, 20, 10); setCell(g, 21, 11);
  }),
  B: mask((g) => {
    paintLine(g, 6, 8, 4, 12, 1);
    paintLine(g, 4, 12, 5, 18, 1);
  }),
  C: mask((g) => {
    paintLine(g, 7, 19, 11, 18, 1);
    paintLine(g, 11, 18, 19, 14, 1);
  }),
  D: mask((g) => {
    paintLine(g, 21, 10, 29, 6, 1);
    paintLine(g, 29, 6, 33, 5, 1);
  }),
  E: mask((g) => {
    paintLine(g, 35, 6, 37, 12, 1);
    paintLine(g, 37, 12, 35, 17, 1);
  }),
  F: mask((g) => {
    paintLine(g, 22, 14, 27, 17, 1);
    paintLine(g, 27, 17, 33, 16, 1);
  }),
  G: mask((g) => {
    // Upper 1 electrode: top-left barb, then a compact wedge widening downward.
    setCell(g, 4, 17); setCell(g, 5, 16); setCell(g, 6, 15);
    setCell(g, 6, 16); // small hook/zack towards lower left
    paintLine(g, 6, 16, 14, 13, 0);
    for (let row = 10; row <= 15; row += 1) {
      const centre = Math.round(16 - (row - 6) * 0.36);
      const half = row >= 13 ? 1 : 0;
      for (let col = centre - half; col <= centre + 1; col += 1) setCell(g, row, col);
    }
  }),
  H: mask((g) => {
    // Lower 1 electrode: separate triangular wedge, wider at its lower end.
    setCell(g, 17, 13);
    for (let row = 18; row <= 31; row += 1) {
      const centre = Math.round(13 - (row - 17) * 0.27);
      const half = row >= 25 ? 1 : 0;
      for (let col = centre - half; col <= centre + (row >= 28 ? 1 : 0); col += 1) setCell(g, row, col);
    }
    setCell(g, 31, 9); setCell(g, 31, 10); setCell(g, 31, 11);
  })
});

export function activeCellsForSegment(id, source = ORIGINAL_SEGMENT_MASKS) {
  const maskRows = source[id];
  if (!maskRows) return Object.freeze([]);
  const result = [];
  maskRows.forEach((row, r) => [...row].forEach((value, c) => {
    if (value === "1") result.push(Object.freeze({ row: r, col: c }));
  }));
  return Object.freeze(result);
}

export function composeDigitMask(digit, source = ORIGINAL_SEGMENT_MASKS) {
  const grid = blank();
  for (const id of ORIGINAL_DIGIT_SEGMENTS[String(digit)] || []) {
    for (const { row, col } of activeCellsForSegment(id, source)) setCell(grid, row, col);
  }
  return rows(grid);
}

export function maskToPointList(maskRows) {
  const result = [];
  maskRows.forEach((row, r) => [...row].forEach((value, c) => {
    if (value === "1") result.push(Object.freeze({ x: c + 0.5, y: r + 0.5 }));
  }));
  return Object.freeze(result);
}

export function maskToSvgCellPath(maskRows, cellWidth = 1, cellHeight = 1) {
  return maskToPointList(maskRows)
    .map(({ x, y }) => `M${(x - 0.5) * cellWidth} ${(y - 0.5) * cellHeight}h${cellWidth}v${cellHeight}h-${cellWidth}Z`)
    .join("");
}

export function minimumMaskGap(maskA, maskB) {
  const a = maskToPointList(maskA);
  const b = maskToPointList(maskB);
  let minimum = Infinity;
  for (const p of a) for (const q of b) {
    minimum = Math.min(minimum, Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y)) - 1);
  }
  return minimum;
}
