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

test("canonical COMPET digit matrix is exact", () => {
  for (const [digit, ids] of Object.entries(EXPECTED)) {
    assert.deepEqual(ORIGINAL_DIGIT_SEGMENTS[digit], ids);
  }
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

test("shared segment B has object identity in every numeral that uses it", () => {
  for (const digit of ["2", "3", "5", "7", "8", "9"]) {
    assert.ok(originalSegmentsFor(digit).includes(ORIGINAL_SEGMENTS.B));
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
