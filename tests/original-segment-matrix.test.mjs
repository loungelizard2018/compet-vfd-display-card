import test from "node:test";
import assert from "node:assert/strict";
import { ORIGINAL_SEGMENTS, ORIGINAL_DIGIT_SEGMENTS, ORIGINAL_FIELD_SEGMENTS, originalSegmentsFor } from "../compet-vfd-segments.js";
import { ALTERNATIVE_GLYPHS, glyphSegments } from "../compet-vfd-glyphs.js";
import { MATRIX_COLS, MATRIX_ROWS, MATRIX_LEVELS, ORIGINAL_SEGMENT_MASKS, activeCellsForSegment, composeDigitLevels, minimumMaskGap } from "../compet-vfd-segment-masks.js";

const EXPECTED = Object.freeze({
  "0":["D","E","F"],"1":["G","H"],"2":["B","C","D","E"],"3":["B","C","E","F"],"4":["A","G","H"],
  "5":["A","B","E","F"],"6":["C","D","E","F"],"7":["B","C","H"],"8":["A","B","C","D","E","F"],"9":["A","B","C","H"]
});

test("canonical shared segment matrix is exact",()=>{for(const[d,ids]of Object.entries(EXPECTED))assert.deepEqual(ORIGINAL_DIGIT_SEGMENTS[d],ids)});
test("there are exactly eight shared physical segments",()=>{assert.deepEqual(Object.keys(ORIGINAL_SEGMENTS),["A","B","C","D","E","F","G","H"]);assert.equal(ORIGINAL_FIELD_SEGMENTS.length,8)});
test("all digit references resolve to identical shared objects",()=>{for(const[d,ids]of Object.entries(EXPECTED)){const resolved=originalSegmentsFor(d);ids.forEach((id,i)=>assert.strictEqual(resolved[i],ORIGINAL_SEGMENTS[id]))}});
test("fine masks are frozen 48 by 80 four-level matrices",()=>{assert.equal(MATRIX_COLS,48);assert.equal(MATRIX_ROWS,80);assert.equal(MATRIX_LEVELS,4);assert.deepEqual(Object.keys(ORIGINAL_SEGMENT_MASKS),["A","B","C","D","E","F","G","H"]);for(const rows of Object.values(ORIGINAL_SEGMENT_MASKS)){assert.equal(rows.length,80);assert.ok(Object.isFrozen(rows));for(const row of rows){assert.equal(row.length,48);assert.match(row,/^[0-3]{48}$/)}}});
test("every shared segment has weak active and bright reference cells",()=>{for(const id of Object.keys(ORIGINAL_SEGMENT_MASKS)){const levels=new Set(activeCellsForSegment(id).map(c=>c.level));assert.ok(levels.has(1),`${id} lacks weak cells`);assert.ok(levels.has(2),`${id} lacks active cells`);assert.ok(levels.has(3),`${id} lacks bright cells`)}});
test("all digits compose into non-empty four-level matrices",()=>{for(const d of Object.keys(EXPECTED)){const grid=composeDigitLevels(d);assert.equal(grid.length,80);assert.equal(grid[0].length,48);assert.ok(grid.flat().some(v=>v===3),`${d} has no bright phosphor`)}});
test("one uses separate G and H wedges with a narrow dark gap",()=>{const gap=minimumMaskGap(ORIGINAL_SEGMENT_MASKS.G,ORIGINAL_SEGMENT_MASKS.H);assert.ok(gap>=0);assert.ok(gap<=3,`G/H gap too large: ${gap}`);const g=activeCellsForSegment("G"),h=activeCellsForSegment("H");assert.ok(Math.max(...g.map(c=>c.row))<Math.min(...h.map(c=>c.row)))});
test("two lower segments are exact stored 180-degree counterparts",()=>{assert.equal(ORIGINAL_SEGMENTS.D.derivedFrom,"C@rotate180(23,28)");assert.equal(ORIGINAL_SEGMENTS.E.derivedFrom,"B@rotate180(23,28)")});
test("alternative glyph set remains available",()=>{assert.deepEqual(Object.keys(ALTERNATIVE_GLYPHS),["0","1","2","3","4","5","6","7","8","9","-"," "]);assert.ok(glyphSegments("alternative","8").length>0)});
