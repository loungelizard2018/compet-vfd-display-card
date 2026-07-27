import test from "node:test";
import assert from "node:assert/strict";

test("self-contained HACS bundle registers its custom element", async () => {
  const registry = new Map();
  globalThis.HTMLElement = class HTMLElement {};
  globalThis.customElements = {
    get(name) { return registry.get(name); },
    define(name, constructor) { registry.set(name, constructor); }
  };
  globalThis.window = { customCards: [] };

  await import(`../compet-vfd-display-card.js?smoke=${Date.now()}`);

  assert.equal(typeof registry.get("compet-vfd-display-card"), "function");
  assert.ok(window.customCards.some((card) => card.type === "compet-vfd-display-card"));
});
