import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ORIGINAL_DIGIT_SEGMENTS, ORIGINAL_SEGMENTS } from "../compet-vfd-segments.js";
import { activeCellsForSegment } from "../compet-vfd-segment-masks.js";
const rows = (id) => { const map = new Map(); for (const cell of activeCellsForSegment(id)) { if (!map.has(cell.row)) map.set(cell.row, []); map.get(cell.row).push(cell.col); } return map; };
test("F closes flush against E in the lower bowl", () => { const e=rows("E"), f=rows("F"); let checked=0; for(let row=92;row<=100;row+=1){ if(!e.has(row)||!f.has(row)) continue; const eRight=Math.max(...e.get(row)); const fLeft=Math.min(...f.get(row)); assert.ok(fLeft-eRight<=1,`row ${row}: E/F gap ${fLeft-eRight-1}`); assert.ok(fLeft>eRight,`row ${row}: E/F overlap`); checked+=1;} assert.ok(checked>=8); });
test("corrected F remains one canonical shared segment",()=>{ for(const digit of ["3","5","6","8"]) assert.ok(ORIGINAL_DIGIT_SEGMENTS[digit].includes("F")); assert.ok(ORIGINAL_SEGMENTS.F); });
test("renderer keeps glyphs inside a narrower right-safe area",()=>{ for(const file of ["compet-vfd-render.js","compet-vfd-display-card.js"]){ const source=fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8"); assert.match(source,/GLYPH_SAFE_AREA[^
]+width: 56/); assert.match(source,/x="9\.5" y="10\.5" width="59" height="111"/); assert.match(source,/\.tube svg\{[^}]*overflow:hidden/); } });
test("reference documentation assets exist",()=>{ for(const file of ["docs/compet-original-rectified.jpg","docs/compet-implementation-0-9.png","docs/compet-original-vs-implementation.png","docs/compet-segment-reference.png"]) assert.ok(fs.existsSync(new URL(`../${file}`,import.meta.url))); });
