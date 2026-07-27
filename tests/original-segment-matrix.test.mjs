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

const USES = Object.freeze({
  B: ["2", "3", "5", "7", "8", "9"],
  C: ["2", "3", "6", "7", "8", "9"],
  D: ["0", "2", "6", "8"],
  E: ["0", "2", "3", "5", "6", "8"],
  G: ["1", "4"],
  H: ["1", "4", "7", "9"]
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

test("B C D E G H remain stable shared objects in every numeral that uses them", () => {
  for (const [id, digits] of Object.entries(USES)) {
    for (const digit of digits) {
      assert.ok(originalSegmentsFor(digit).includes(ORIGINAL_SEGMENTS[id]), `${id} missing from ${digit}`);
    }
  }
});

test("D and E are fixed stored 180-degree counterparts of C and B", () => {
  assert.equal(ORIGINAL_SEGMENTS.D.derivedFrom, "C@rotate180(40,66)");
  assert.equal(ORIGINAL_SEGMENTS.E.derivedFrom, "B@rotate180(40,66)");
  assert.equal(
    ORIGINAL_SEGMENTS.D.path,
    "M34.0 67.3 C31.3 75.5 27.5 82.0 23.4 87.6 C18.7 93.9 16.0 101.0 17.6 106.8"
  );
  assert.equal(
    ORIGINAL_SEGMENTS.E.path,
    "M20.2 112.4 C32.3 115.3 44.3 114.8 50.0 108.3"
  );
  assert.equal(ORIGINAL_SEGMENTS.D.width, ORIGINAL_SEGMENTS.C.width);
  assert.equal(ORIGINAL_SEGMENTS.E.width, ORIGINAL_SEGMENTS.B.width);
  assert.equal(ORIGINAL_SEGMENTS.D.dotFractions.length, ORIGINAL_SEGMENTS.C.dotFractions.length);
  assert.equal(ORIGINAL_SEGMENTS.E.dotFractions.length, ORIGINAL_SEGMENTS.B.dotFractions.length);
});

test("digit one uses two separate compact cut electrodes", () => {
  assert.deepEqual(ORIGINAL_DIGIT_SEGMENTS["1"], ["G", "H"]);
  assert.equal(ORIGINAL_SEGMENTS.G.linecap, "butt");
  assert.equal(ORIGINAL_SEGMENTS.H.linecap, "butt");
  assert.notEqual(ORIGINAL_SEGMENTS.G.path, ORIGINAL_SEGMENTS.H.path);
  assert.ok(ORIGINAL_SEGMENTS.G.dotFractions.length < ORIGINAL_SEGMENTS.H.dotFractions.length);
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
