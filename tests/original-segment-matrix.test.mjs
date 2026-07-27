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
test("precision masks are frozen 72 by 120 seven-level matrices",()=>{assert.equal(MATRIX_COLS,72);assert.equal(MATRIX_ROWS,120);assert.equal(MATRIX_LEVELS,7);assert.deepEqual(Object.keys(ORIGINAL_SEGMENT_MASKS),["A","B","C","D","E","F","G","H"]);for(const rows of Object.values(ORIGINAL_SEGMENT_MASKS)){assert.equal(rows.length,120);assert.ok(Object.isFrozen(rows));for(const row of rows){assert.equal(row.length,72);assert.match(row,/^[0-6]{72}$/)}}});
test("every segment includes edge, active and bright reference cells",()=>{for(const id of Object.keys(ORIGINAL_SEGMENT_MASKS)){const levels=new Set(activeCellsForSegment(id).map(c=>c.level));assert.ok([...levels].some(v=>v>=1&&v<=2),`${id} lacks edge cells`);assert.ok([...levels].some(v=>v>=3&&v<=4),`${id} lacks active cells`);assert.ok([...levels].some(v=>v>=5),`${id} lacks bright cells`)}});
test("all digits compose into non-empty precision matrices",()=>{for(const d of Object.keys(EXPECTED)){const grid=composeDigitLevels(d);assert.equal(grid.length,120);assert.equal(grid[0].length,72);assert.ok(grid.flat().some(v=>v>=5),`${d} has no bright phosphor`)}});
test("one uses separate G and H electrodes with a narrow optical gap",()=>{const level=3;const gap=minimumMaskGap(ORIGINAL_SEGMENT_MASKS.G,ORIGINAL_SEGMENT_MASKS.H,level);assert.ok(gap>=0);assert.ok(gap<=12,`G/H gap too large: ${gap}`);const g=activeCellsForSegment("G",ORIGINAL_SEGMENT_MASKS,level),h=activeCellsForSegment("H",ORIGINAL_SEGMENT_MASKS,level);assert.ok(Math.max(...g.map(c=>c.row))<Math.min(...h.map(c=>c.row)))});
test("alternative glyph set remains available",()=>{assert.deepEqual(Object.keys(ALTERNATIVE_GLYPHS),["0","1","2","3","4","5","6","7","8","9","-"," "]);assert.ok(glyphSegments("alternative","8").length>0)});



test("F is an independent lower-right electrode in 3, 5, 6 and 8",()=>{
  const edgeGap=minimumMaskGap(ORIGINAL_SEGMENT_MASKS.E,ORIGINAL_SEGMENT_MASKS.F,1);
  const activeGap=minimumMaskGap(ORIGINAL_SEGMENT_MASKS.E,ORIGINAL_SEGMENT_MASKS.F,3);
  assert.ok(edgeGap>=1,`E/F edge masks overlap: ${edgeGap}`);
  assert.ok(activeGap>=1,`E/F active masks overlap: ${activeGap}`);
  const f=activeCellsForSegment("F",ORIGINAL_SEGMENT_MASKS,1);
  assert.ok(Math.max(...f.map(cell=>cell.row))<=100,"F extends below its intended return");
  for(const digit of ["3","5","6","8"]){
    assert.ok(ORIGINAL_DIGIT_SEGMENTS[digit].includes("F"),`${digit} does not reuse canonical F`);
    assert.ok(composeDigitLevels(digit).flat().some(value=>value>=5),`${digit} lost its bright core`);
  }
});
