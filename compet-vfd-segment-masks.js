import { ORIGINAL_DIGIT_SEGMENTS } from "./compet-vfd-segments.js";

export const MATRIX_COLS = 48;
export const MATRIX_ROWS = 80;
export const MATRIX_LEVELS = 4;

const RLE_MASKS = Object.freeze({
  "A": "18g0.11.32.180.12.33.12.160.11.43.12.160.11.43.12.160.12.33.12.11.160.12.33.12.160.11.43.12.160.11.43.11.160.12.43.11.160.12.33.12.11.160.12.43.12.21.140.11.73.32.120.11.12.83.12.130.11.32.43.11.190.21.17b0",
  "B": "tz0.11.32.51.110.12.c3.22.11.u0.11.63.32.73.12.u0.12.33.12.11.50.61.v0.11.23.12.11.180.21.1y20",
  "C": "zo0.32.11.170.11.12.23.12.170.12.33.12.160.11.43.12.11.150.12.43.12.150.12.43.12.150.12.43.12.150.12.53.11.140.11.12.33.12.11.150.12.33.12.160.12.33.12.11.150.12.33.12.150.11.12.33.12.160.12.23.12.11.170.11.12.11.1gj0",
  "D": "1gj0.11.12.11.170.11.12.23.12.160.12.33.12.11.150.12.33.12.150.11.12.33.12.160.12.33.12.150.11.12.33.12.11.140.11.53.12.150.12.43.12.150.12.43.12.150.12.43.12.150.11.12.43.11.160.12.33.12.170.12.23.12.11.170.11.32.zo0",
  "E": "1y20.21.180.11.12.23.11.v0.61.50.11.12.33.12.u0.12.73.32.63.11.u0.11.22.c3.12.110.51.32.11.tz0",
  "F": "1gr0.11.22.11.170.12.33.12.11.150.12.33.12.170.42.170.11.42.170.12.43.12.11.160.22.33.12.11.160.11.12.33.12.11.160.11.12.33.12.160.11.12.33.12.160.11.12.33.12.160.11.12.33.12.160.11.12.33.12.160.11.12.33.11.160.12.43.11.160.12.33.12.11.150.12.33.12.11.150.12.43.12.130.21.22.33.12.130.22.53.12.11.130.53.22.11.140.11.32.11.py0",
  "G": "su0.11.32.11.150.11.12.53.11.140.12.63.12.140.11.12.53.11.140.12.53.12.140.11.12.43.12.11.140.11.12.33.12.11.140.11.12.43.12.150.12.53.12.140.11.12.33.12.11.150.12.43.12.160.12.43.11.160.12.33.12.11.160.12.33.11.170.11.32.1n70",
  "H": "1fc0.31.190.12.13.12.11.170.12.23.12.11.160.11.12.23.12.170.12.33.11.160.11.33.12.170.12.33.12.160.11.43.11.150.11.12.33.12.11.150.12.43.12.160.12.43.12.150.11.53.11.150.11.12.33.12.180.31.1210"
});

function decodeMask(encoded) {
  const values = [];
  for (const token of encoded.split(".")) {
    const value = token.slice(-1);
    const count = Number.parseInt(token.slice(0, -1), 36);
    values.push(...Array(count).fill(value));
  }
  if (values.length !== MATRIX_COLS * MATRIX_ROWS) throw new Error(`Invalid mask length: ${values.length}`);
  return Object.freeze(Array.from({ length: MATRIX_ROWS }, (_, row) =>
    values.slice(row * MATRIX_COLS, (row + 1) * MATRIX_COLS).join("")
  ));
}

/** Fine 48x80, four-level masks derived from perspective-corrected COMPET 18 digit references. */
export const ORIGINAL_SEGMENT_MASKS = Object.freeze(Object.fromEntries(
  Object.entries(RLE_MASKS).map(([id, encoded]) => [id, decodeMask(encoded)])
));

const blank = () => Array.from({ length: MATRIX_ROWS }, () => Array(MATRIX_COLS).fill(0));

export function activeCellsForSegment(id, source = ORIGINAL_SEGMENT_MASKS, minimumLevel = 1) {
  const maskRows = source[id];
  if (!maskRows) return Object.freeze([]);
  const result = [];
  maskRows.forEach((row, r) => [...row].forEach((value, c) => {
    const level = Number(value);
    if (level >= minimumLevel) result.push(Object.freeze({ row: r, col: c, level }));
  }));
  return Object.freeze(result);
}

export function composeDigitLevels(digit, source = ORIGINAL_SEGMENT_MASKS) {
  const grid = blank();
  for (const id of ORIGINAL_DIGIT_SEGMENTS[String(digit)] || []) {
    const mask = source[id];
    if (!mask) continue;
    mask.forEach((row, r) => [...row].forEach((value, c) => {
      grid[r][c] = Math.max(grid[r][c], Number(value));
    }));
  }
  return Object.freeze(grid.map((row) => Object.freeze(row)));
}

export function composeDigitMask(digit, source = ORIGINAL_SEGMENT_MASKS) {
  return Object.freeze(composeDigitLevels(digit, source).map((row) => row.join("")));
}

export function maskToPointList(maskRows, minimumLevel = 1) {
  const result = [];
  maskRows.forEach((row, r) => [...row].forEach((value, c) => {
    const level = Number(value);
    if (level >= minimumLevel) result.push(Object.freeze({ x: c + 0.5, y: r + 0.5, row: r, col: c, level }));
  }));
  return Object.freeze(result);
}

export function maskToSvgCellPath(maskRows, cellWidth = 1, cellHeight = 1, minimumLevel = 1) {
  return maskToPointList(maskRows, minimumLevel).map(({ x, y }) => `M${(x - 0.5) * cellWidth} ${(y - 0.5) * cellHeight}h${cellWidth}v${cellHeight}h-${cellWidth}Z`).join("");
}

export function minimumMaskGap(maskA, maskB, minimumLevel = 1) {
  const a = maskToPointList(maskA, minimumLevel);
  const b = maskToPointList(maskB, minimumLevel);
  let minimum = Infinity;
  for (const p of a) for (const q of b) minimum = Math.min(minimum, Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y)) - 1);
  return minimum;
}

export function maskLevelCounts(maskRows) {
  const counts = [0, 0, 0, 0];
  maskRows.forEach((row) => [...row].forEach((value) => { counts[Number(value)] += 1; }));
  return Object.freeze(counts);
}
