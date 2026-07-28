from __future__ import annotations

from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
VERSION = "0.5.4"

BUNDLE_BRIDGE = r'''
  const originalJunctionBridge = (character, filterId) => {
    const segments = DIGIT_SEGMENTS[String(character)] || [];
    if (!segments.includes("E") || !segments.includes("F")) return "";

    const samples = Object.freeze([
      [97.00, 59.00],
      [97.38, 59.34],
      [97.76, 59.72],
      [98.14, 60.10],
      [98.52, 60.48],
      [98.90, 60.86],
      [99.28, 61.24],
      [99.66, 61.62],
      [100.00, 62.00],
    ]);

    return samples.map(([row, col], index) => {
      const p = maskCoordinate(row, col);
      const cx = Number(p.x).toFixed(3);
      const cy = Number(p.y).toFixed(3);
      const radius = index === 0 || index === samples.length - 1 ? 0.58 : 0.54;
      return `<g class="mask-cell junction-bridge" data-segment-id="F-E">
        <circle class="mask-glow" cx="${cx}" cy="${cy}" r="1.320" opacity="0.94" filter="url(#${filterId}-glow)"/>
        <circle class="mask-dot" cx="${cx}" cy="${cy}" r="${radius.toFixed(3)}" opacity="1"/>
      </g>`;
    }).join("");
  };
'''.strip("\n")

MODULE_BRIDGE = r'''
function originalJunctionBridge(character, filterId) {
  const segments = ORIGINAL_DIGIT_SEGMENTS[String(character)] || [];
  if (!segments.includes("E") || !segments.includes("F")) return "";

  const samples = Object.freeze([
    [97.00, 59.00],
    [97.38, 59.34],
    [97.76, 59.72],
    [98.14, 60.10],
    [98.52, 60.48],
    [98.90, 60.86],
    [99.28, 61.24],
    [99.66, 61.62],
    [100.00, 62.00],
  ]);

  return samples.map(([row, col], index) => {
    const point = maskCoordinate(row, col);
    const radius = index === 0 || index === samples.length - 1 ? 0.58 : 0.54;
    return `<g class="mask-cell junction-bridge" data-segment-id="F-E">
      <circle class="mask-glow" cx="${point.x}" cy="${point.y}" r="1.320" opacity="0.94" filter="url(#${filterId}-glow)"/>
      <circle class="mask-dot" cx="${point.x}" cy="${point.y}" r="${radius.toFixed(3)}" opacity="1"/>
    </g>`;
  }).join("");
}
'''.strip("\n")


def insert_bundle_bridge(source: str) -> str:
    if "const originalJunctionBridge" not in source:
        pattern = re.compile(
            r'(  const originalActiveGlyph = \(character, filterId\) => \{.*?\n  \};)\n\n  const altSegment',
            re.S,
        )
        source, count = pattern.subn(rf'\1\n\n{BUNDLE_BRIDGE}\n\n  const altSegment', source, count=1)
        if count != 1:
            raise RuntimeError("could not insert bundle junction bridge")
    source, count = re.subn(
        r'active=originalActiveGlyph\(character,id\)(?:\+originalJunctionBridge\(character,id\))?;',
        'active=originalActiveGlyph(character,id)+originalJunctionBridge(character,id);',
        source,
        count=1,
    )
    if count != 1:
        raise RuntimeError("could not wire bundle junction bridge")
    return source


def insert_module_bridge(source: str) -> str:
    if "function originalJunctionBridge" not in source:
        pattern = re.compile(
            r'(function originalActiveGlyph\(character, filterId\) \{.*?\n\})\n\nexport const renderMethods',
            re.S,
        )
        source, count = pattern.subn(rf'\1\n\n{MODULE_BRIDGE}\n\nexport const renderMethods', source, count=1)
        if count != 1:
            raise RuntimeError("could not insert module junction bridge")
    source, count = re.subn(
        r'active = originalActiveGlyph\(character, id\)(?: \+ originalJunctionBridge\(character, id\))?;',
        'active = originalActiveGlyph(character, id) + originalJunctionBridge(character, id);',
        source,
        count=1,
    )
    if count != 1:
        raise RuntimeError("could not wire module junction bridge")
    return source


def update_readme(path: Path, german: bool) -> None:
    if not path.exists():
        return
    text = path.read_text()
    if german:
        heading = "## Sichtbarer F/E-Anschluss in v0.5.4"
        body = (
            "Die Ziffern `3`, `5`, `6` und `8` verwenden weiterhin dieselben gemeinsamen Elektroden `E` und `F`. "
            "Der diagonale Übergang wird jetzt jedoch mit neun dicht gesetzten Phosphorpunkten dargestellt, damit der Anschluss "
            "auch im realen Home-Assistant-Rendering sichtbar geschlossen ist."
        )
    else:
        heading = "## Visible F/E junction in v0.5.4"
        body = (
            "Digits `3`, `5`, `6` and `8` still reuse the same shared `E` and `F` electrodes. "
            "The diagonal transition is now rendered with nine tightly spaced phosphor dots so the junction remains visibly closed "
            "in the actual Home Assistant card."
        )
    block = f"{heading}\n\n{body}\n"
    text = re.sub(r'^## Segment F correction in v0\.5\.2\n\n.*?\n\n', block + "\n", text, count=1, flags=re.S)
    if heading not in text:
        text = block + "\n" + text
    path.write_text(text.replace("v0.5.3", "v0.5.4"))


def main() -> None:
    bundle_path = ROOT / "compet-vfd-display-card.js"
    render_path = ROOT / "compet-vfd-render.js"

    bundle = insert_bundle_bridge(bundle_path.read_text())
    render = insert_module_bridge(render_path.read_text())

    bundle = bundle.replace("Version 0.5.3", "Version 0.5.4")
    bundle = bundle.replace('const VERSION = "0.5.3";', 'const VERSION = "0.5.4";')
    bundle = bundle.replace(
        "corrected right fit, F/E junction and documentation reference",
        "visible dotted F/E junction and verified Home Assistant rendering",
    )

    for path in ROOT.glob("compet-vfd-*.js"):
        source = path.read_text().replace("?v=0.5.3", "?v=0.5.4")
        if path == bundle_path:
            source = bundle
        elif path == render_path:
            source = render.replace("?v=0.5.3", "?v=0.5.4")
        path.write_text(source)

    package_path = ROOT / "package.json"
    package = json.loads(package_path.read_text())
    package["version"] = VERSION
    package_path.write_text(json.dumps(package, indent=2) + "\n")

    update_readme(ROOT / "README.md", False)
    update_readme(ROOT / "README.de.md", True)

    changelog = ROOT / "CHANGELOG.md"
    old = changelog.read_text() if changelog.exists() else "# Changelog\n"
    if old.startswith("# Changelog"):
        old = old.split("\n", 1)[1].lstrip("\n")
    changelog.write_text(
        "# Changelog\n\n"
        "## 0.5.4\n\n"
        "- Added a clearly visible nine-dot diagonal phosphor junction between shared electrodes F and E.\n"
        "- Applied the junction only to digits 3, 5, 6 and 8, preserving the canonical shared-electrode model.\n"
        "- Kept the self-contained HACS bundle and modular renderer visually consistent.\n"
        "- Added regression tests that verify the bridge is rendered and versioned in both implementations.\n\n"
        + old
    )

    test_path = ROOT / "tests" / "v0_5_4_visible_junction.test.mjs"
    test_path.write_text(r'''import test from "node:test";
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
''')

    print("v0.5.4 visible F/E junction build completed")


if __name__ == "__main__":
    main()
