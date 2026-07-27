import test from "node:test";
import assert from "node:assert/strict";
import {
  ORIGINAL_SEGMENTS,
  ORIGINAL_DIGIT_SEGMENTS,
  ORIGINAL_FIELD_SEGMENTS,
  originalSegmentsFor
} from "../compet-vfd-segments.js";
import {
  ALTERNATIVE_GLYPHS,
  glyphSegments
} from "../compet-vfd-glyphs.js";
import {
  MATRIX_COLS,
  MATRIX_ROWS,
  ORIGINAL_SEGMENT_MASKS,
  activeCellsForSegment,
  composeDigitMask,
  minimumMaskGap
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
  B: ["2", "3", "5", "7", "8", "9"],
  C: ["2", "3", "6", "7", "8", "9"],
  D: ["0", "2", "6", "8"],
  E: ["0", "2", "3", "5", "6", "8"],
  G: ["1", "4"],
  H: ["1", "4", "7", "9"]
});

const countRange = (mask, start, end) => mask.slice(start, end).reduce(
  (sum, row) => sum + [...row].filter((cell) => cell === "1").length,
  0
);

const cellsIn = (id, predicate) => activeCellsForSegment(id).filter(predicate);

test("canonical COMPET digit matrix is exact", () => {
  for (const [digit, ids] of Object.entries(EXPECTED)) assert.deepEqual(ORIGINAL_DIGIT_SEGMENTS[digit], ids);
});

test("there are exactly eight original segments A-H", () => {
  assert.deepEqual(Object.keys(ORIGINAL_SEGMENTS), ["A", "B", "C", "D", "E", "F", "G", "H"]);
  assert.equal(ORIGINAL_FIELD_SEGMENTS.length, 8);
});

test("all digit references resolve to the same canonical objects", () => {
  for (const [digit, ids] of Object.entries(EXPECTED)) {
    const resolved = originalSegmentsFor(digit);
    assert.equal(resolved.length, ids.length);
    ids.forEach((id, index) => assert.strictEqual(resolved[index], ORIGINAL_SEGMENTS[id]));
    assert.strictEqual(glyphSegments("original", digit)[0], ORIGINAL_SEGMENTS[ids[0]]);
  }
});

test("B C D E G H remain stable shared objects in every numeral that uses them", () => {
  for (const [id, digits] of Object.entries(USES)) for (const digit of digits) {
    assert.ok(originalSegmentsFor(digit).includes(ORIGINAL_SEGMENTS[id]), `${id} missing from ${digit}`);
  }
});

test("D and E are fixed stored 180-degree counterparts of C and B", () => {
  assert.equal(ORIGINAL_SEGMENTS.D.derivedFrom, "C@rotate180(40,66)");
  assert.equal(ORIGINAL_SEGMENTS.E.derivedFrom, "B@rotate180(40,66)");
  assert.equal(ORIGINAL_SEGMENTS.D.width, ORIGINAL_SEGMENTS.C.width);
  assert.equal(ORIGINAL_SEGMENTS.E.width, ORIGINAL_SEGMENTS.B.width);
  assert.equal(ORIGINAL_SEGMENTS.D.dotFractions.length, ORIGINAL_SEGMENTS.C.dotFractions.length);
  assert.equal(ORIGINAL_SEGMENTS.E.dotFractions.length, ORIGINAL_SEGMENTS.B.dotFractions.length);
});

test("all canonical masks A-H are frozen 24 by 40 matrices", () => {
  assert.equal(MATRIX_COLS, 24);
  assert.equal(MATRIX_ROWS, 40);
  assert.deepEqual(Object.keys(ORIGINAL_SEGMENT_MASKS), ["A", "B", "C", "D", "E", "F", "G", "H"]);
  for (const mask of Object.values(ORIGINAL_SEGMENT_MASKS)) {
    assert.ok(Object.isFrozen(mask));
    assert.equal(mask.length, MATRIX_ROWS);
    for (const row of mask) {
      assert.equal(row.length, MATRIX_COLS);
      assert.match(row, /^[01]{24}$/);
    }
  }
});

test("A G and H masks are non-empty and drive shaped production electrodes", () => {
  for (const id of ["A", "G", "H"]) {
    assert.ok(activeCellsForSegment(id).length > 0);
    assert.equal(ORIGINAL_SEGMENTS[id].maskSource, `${id}@24x40`);
    assert.match(ORIGINAL_SEGMENTS[id].shape, /^M/);
  }
});

test("G contains an upper-left barb and widens towards its lower end", () => {
  const cells = activeCellsForSegment("G");
  const upper = cells.filter(({ row }) => row <= 8);
  assert.ok(upper.some(({ row, col }) => row >= 5 && col <= 15), "G needs the upper-left barb");
  assert.ok(countRange(ORIGINAL_SEGMENT_MASKS.G, 10, 16) > countRange(ORIGINAL_SEGMENT_MASKS.G, 4, 10));
});

test("H forms a separate wedge that becomes broader near its bottom", () => {
  assert.ok(countRange(ORIGINAL_SEGMENT_MASKS.H, 25, 32) > countRange(ORIGINAL_SEGMENT_MASKS.H, 17, 24));
  assert.ok(Math.min(...activeCellsForSegment("H").map(({ row }) => row)) > Math.max(...activeCellsForSegment("G").map(({ row }) => row)));
});

test("A has an angular vertical leg and a distinct rightward arm", () => {
  const vertical = cellsIn("A", ({ row, col }) => row >= 7 && row <= 19 && col <= 9);
  const arm = cellsIn("A", ({ row, col }) => row >= 19 && row <= 23 && col >= 10);
  assert.ok(vertical.length >= 15, "A needs a strong descending leg");
  assert.ok(arm.length >= 8, "A needs a clear rightward arm");
});

test("the G-H inter-segment gap is no more than two mask cells", () => {
  const gap = minimumMaskGap(ORIGINAL_SEGMENT_MASKS.G, ORIGINAL_SEGMENT_MASKS.H);
  assert.ok(gap >= 0, "G and H must remain separate");
  assert.ok(gap <= 2, `G-H gap is too large: ${gap}`);
});

test("digit masks compose without changing the canonical matrix", () => {
  for (const digit of Object.keys(EXPECTED)) {
    const composed = composeDigitMask(digit);
    assert.equal(composed.length, 40);
    assert.ok(composed.some((row) => row.includes("1")));
  }
});

test("all original segments use cut ends and stable dot positions", () => {
  for (const [id, segment] of Object.entries(ORIGINAL_SEGMENTS)) {
    assert.equal(segment.id, id);
    assert.equal(segment.linecap, "butt");
    assert.match(segment.path, /^M/);
    assert.ok(Object.isFrozen(segment));
    assert.ok(Array.isArray(segment.dotFractions));
    assert.ok(segment.dotFractions.length >= 10);
    assert.ok(Object.isFrozen(segment.dotFractions));
  }
});

test("digits contain no duplicate or unknown segment IDs", () => {
  const valid = new Set(Object.keys(ORIGINAL_SEGMENTS));
  for (const ids of Object.values(ORIGINAL_DIGIT_SEGMENTS)) {
    assert.equal(new Set(ids).size, ids.length);
    ids.forEach((id) => assert.ok(valid.has(id)));
  }
});

test("previous alternative glyph set remains available", () => {
  assert.deepEqual(Object.keys(ALTERNATIVE_GLYPHS), ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", " "]);
  assert.ok(glyphSegments("alternative", "8").length > 0);
  assert.notStrictEqual(glyphSegments("alternative", "8")[0], ORIGINAL_SEGMENTS.A);
});
