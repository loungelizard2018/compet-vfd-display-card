import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ORIGINAL_SEGMENT_MASKS, activeCellsForSegment, minimumMaskGap } from "../compet-vfd-segment-masks.js";

test("shared lower bowl E has no upper-left extraction remnant", () => {
  const residue = activeCellsForSegment("E").filter(({ row, col }) => row < 90 && col < 26);
  assert.deepEqual(residue, []);
});

test("shared L electrode A sits above and does not cross lower slash H", () => {
  const a = activeCellsForSegment("A");
  assert.ok(a.length > 0);
  assert.ok(Math.max(...a.map(({ row }) => row)) <= 58);
  assert.ok(minimumMaskGap(ORIGINAL_SEGMENT_MASKS.A, ORIGINAL_SEGMENT_MASKS.H, 1) >= 1);
});

test("renderer uses the physical tube safe area and clip path", () => {
  const modular = fs.readFileSync(new URL("../compet-vfd-render.js", import.meta.url), "utf8");
  const bundle = fs.readFileSync(new URL("../compet-vfd-display-card.js", import.meta.url), "utf8");
  for (const source of [modular, bundle]) {
    assert.match(source, /GLYPH_SAFE_AREA/);
    assert.match(source, /electrode-clip/);
    assert.match(source, /electrode-window/);
  }
  assert.match(bundle, /overflow:hidden/);
});
