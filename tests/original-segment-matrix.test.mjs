import test from "node:test";
import assert from "node:assert/strict";
import {
  ORIGINAL_SEGMENTS,
  ORIGINAL_DIGIT_SEGMENTS,
  ORIGINAL_FIELD_SEGMENTS,
  originalSegmentsFor
} from "../compet-vfd-segments.js";
import { ALTERNATIVE_GLYPHS, glyphSegments } from "../compet-vfd-glyphs.js";
import {
  MATRIX_COLS,
  MATRIX_ROWS,
  MATRIX_LEVELS,
  ORIGINAL_SEGMENT_MASKS,
  activeCellsForSegment,
  composeDigitMask,
  minimumMaskGap,
  maskLevelCounts
} from "../compet-vfd-segment-masks.js";

const EXPECTED = Object.freeze({
  "0": ["D", "E", "F"],
  "1": ["G", "H"],
  "2": ["B", "C", "D", "E"],
  "3": ["B", "C", "E", "F"],
  "4": ["A", "G", "H"],
  "5": ["A", "B", "E", "F"],
  "6": ["C", "D", "E", "F"],
  "7": ["B", "C", "H"],
  "8": ["A", "B", "C", "D", "E", "F"],
  "9": ["A", "B", "C", "H"]
});

const USES = Object.freeze({
  A: ["4", "5", "8", "9"],
  B: ["2", "3", "5", "7", "8", "9"],
  C: ["2", "3", "6", "7", "8", "9"],
  D: ["0", "2", "6", "8"],
  E: ["0", "2", "3", "5", "6", "8"],
  F: ["0", "3", "5", "6", "8"],
  G: ["1", "4"],
  H: ["1", "4", "7", "9"]
});

const rotate180 = (mask) => Object.freeze([...mask].reverse().map((row) => [...row].reverse().join("")));
const weightedCount = (mask, start = 0, end = mask.length) => mask.slice(start, end).reduce(
  (sum, row) => sum + [...row].reduce((rowSum, value) => rowSum + Number(value), 0),
  0
);

test("canonical COMPET digit matrix is exact", () => {
  for (const [digit, ids] of Object.entries(EXPECTED)) assert.deepEqual(ORIGINAL_DIGIT_SEGMENTS[digit], ids);
});

test("there are exactly eight immutable shared original segments", () => {
  assert.deepEqual(Object.keys(ORIGINAL_SEGMENTS), ["A", "B", "C", "D", "E", "F", "G", "H"]);
  assert.equal(ORIGINAL_FIELD_SEGMENTS.length, 8);
  for (const [id, digits] of Object.entries(USES)) for (const digit of digits) {
    assert.ok(originalSegmentsFor(digit).includes(ORIGINAL_SEGMENTS[id]), `${id} missing from ${digit}`);
  }
});

test("fine masks are frozen 48 by 80 matrices with four intensity levels", () => {
  assert.equal(MATRIX_COLS, 48);
  assert.equal(MATRIX_ROWS, 80);
  assert.equal(MATRIX_LEVELS, 4);
  assert.deepEqual(Object.keys(ORIGINAL_SEGMENT_MASKS), ["A", "B", "C", "D", "E", "F", "G", "H"]);
  for (const mask of Object.values(ORIGINAL_SEGMENT_MASKS)) {
    assert.ok(Object.isFrozen(mask));
    assert.equal(mask.length, MATRIX_ROWS);
    for (const row of mask) {
      assert.equal(row.length, MATRIX_COLS);
      assert.match(row, /^[0-3]{48}$/);
    }
    const counts = maskLevelCounts(mask);
    assert.equal(counts.reduce((a, b) => a + b, 0), MATRIX_ROWS * MATRIX_COLS);
    assert.ok(counts[1] + counts[2] + counts[3] > 0);
    assert.ok(counts[3] > 0, "each segment needs a bright phosphor core");
  }
});

test("D and E are exact fixed 180-degree counterparts of C and B", () => {
  assert.deepEqual(ORIGINAL_SEGMENT_MASKS.D, rotate180(ORIGINAL_SEGMENT_MASKS.C));
  assert.deepEqual(ORIGINAL_SEGMENT_MASKS.E, rotate180(ORIGINAL_SEGMENT_MASKS.B));
  assert.equal(ORIGINAL_SEGMENTS.D.derivedFrom, "C@rotate180(40,66)");
  assert.equal(ORIGINAL_SEGMENTS.E.derivedFrom, "B@rotate180(40,66)");
});

test("G and H remain separate reference-derived components with a compact gap", () => {
  assert.ok(activeCellsForSegment("G", ORIGINAL_SEGMENT_MASKS, 2).length > 0);
  assert.ok(activeCellsForSegment("H", ORIGINAL_SEGMENT_MASKS, 2).length > 0);
  const gap = minimumMaskGap(ORIGINAL_SEGMENT_MASKS.G, ORIGINAL_SEGMENT_MASKS.H, 1);
  assert.ok(gap >= 0, "G and H must not share active mask cells");
  assert.ok(gap <= 3, `G-H gap too large: ${gap}`);
});

test("G and H retain graded cores rather than binary blocks", () => {
  for (const id of ["G", "H"]) {
    const counts = maskLevelCounts(ORIGINAL_SEGMENT_MASKS[id]);
    assert.ok(counts[1] > 0);
    assert.ok(counts[2] > 0);
    assert.ok(counts[3] > 0);
  }
  assert.ok(weightedCount(ORIGINAL_SEGMENT_MASKS.G, 20, 37) > 0);
  assert.ok(weightedCount(ORIGINAL_SEGMENT_MASKS.H, 37, 55) > 0);
});

test("all digit matrices compose with maximum intensity and preserve dimensions", () => {
  for (const digit of Object.keys(EXPECTED)) {
    const mask = composeDigitMask(digit);
    assert.equal(mask.length, MATRIX_ROWS);
    assert.ok(mask.every((row) => /^[0-3]{48}$/.test(row)));
    assert.ok(mask.some((row) => /[1-3]/.test(row)));
  }
});

test("all digit references resolve to canonical segment object identity", () => {
  for (const [digit, ids] of Object.entries(EXPECTED)) {
    const resolved = originalSegmentsFor(digit);
    assert.equal(resolved.length, ids.length);
    ids.forEach((id, index) => assert.strictEqual(resolved[index], ORIGINAL_SEGMENTS[id]));
    assert.strictEqual(glyphSegments("original", digit)[0], ORIGINAL_SEGMENTS[ids[0]]);
  }
});

test("previous alternative glyph style remains untouched", () => {
  assert.deepEqual(Object.keys(ALTERNATIVE_GLYPHS), ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", " "]);
  assert.ok(glyphSegments("alternative", "8").length > 0);
  assert.notStrictEqual(glyphSegments("alternative", "8")[0], ORIGINAL_SEGMENTS.A);
});
