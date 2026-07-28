import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("v0.5.4 is present in the self-contained HACS bundle", () => {
  const source = read("compet-vfd-display-card.js");
  assert.match(source, /const VERSION = "0\.5\.4";/);
  assert.match(source, /Version 0\.5\.4/);
});

test("bundle renders a dedicated nine-dot F-E junction", () => {
  const source = read("compet-vfd-display-card.js");
  assert.match(source, /const originalJunctionBridge/);
  assert.match(source, /data-segment-id="F-E"/);
  assert.match(source, /active=originalActiveGlyph\(character,id\)\+originalJunctionBridge\(character,id\)/);
  const block = source.match(/const samples = Object\.freeze\(\[(.*?)\]\);/s)?.[1] || "";
  assert.equal((block.match(/\[\d/g) || []).length, 9);
});

test("modular renderer uses the same visible junction", () => {
  const source = read("compet-vfd-render.js");
  assert.match(source, /function originalJunctionBridge/);
  assert.match(source, /data-segment-id="F-E"/);
  assert.match(source, /active = originalActiveGlyph\(character, id\) \+ originalJunctionBridge\(character, id\)/);
});

test("junction remains limited to digits that share E and F", () => {
  for (const file of ["compet-vfd-display-card.js", "compet-vfd-render.js"]) {
    const source = read(file);
    assert.match(source, /segments\.includes\("E"\) \|\| !segments\.includes\("F"\)/);
  }
});
