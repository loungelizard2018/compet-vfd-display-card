from pathlib import Path
import json
import re

COLS = 72
ROWS = 120
NEXT_VERSION = "0.5.2"


def decode_rle(encoded):
    values = []
    for token in encoded.split("."):
        if not token:
            continue
        count = int(token[:-1], 36)
        value = int(token[-1])
        if count < 1 or value < 0 or value > 6:
            raise ValueError(f"Invalid RLE token: {token}")
        values.extend([value] * count)
    if len(values) != COLS * ROWS:
        raise ValueError(f"Invalid decoded length: {len(values)}")
    return [values[row * COLS:(row + 1) * COLS] for row in range(ROWS)]


def base36(value):
    alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"
    result = ""
    while value:
        value, remainder = divmod(value, 36)
        result = alphabet[remainder] + result
    return result or "0"


def encode_rle(matrix):
    values = [value for row in matrix for value in row]
    tokens = []
    start = 0
    for index in range(1, len(values) + 1):
        if index == len(values) or values[index] != values[start]:
            tokens.append(f"{base36(index - start)}{values[start]}")
            start = index
    return ".".join(tokens)


def extract_rle(text, segment_id):
    match = re.search(rf'\n\s*"?{segment_id}"?\s*:\s*"([^"]+)"', text)
    if not match:
        raise RuntimeError(f"Could not find segment {segment_id}")
    return match.group(1)


def replace_rle(text, segment_id, encoded):
    pattern = rf'(\n\s*"?{segment_id}"?\s*:\s*")[^"]+("\s*,?)'
    updated, count = re.subn(pattern, lambda match: match.group(1) + encoded + match.group(2), text, count=1)
    if count != 1:
        raise RuntimeError(f"Could not replace segment {segment_id}")
    return updated


def active_cells(matrix, minimum=1):
    return [(row, col) for row in range(ROWS) for col in range(COLS) if matrix[row][col] >= minimum]


mask_path = Path("compet-vfd-segment-masks.js")
bundle_path = Path("compet-vfd-display-card.js")
render_path = Path("compet-vfd-render.js")

mask_source = mask_path.read_text()
bundle_source = bundle_path.read_text()
render_source = render_path.read_text()

# Decode the current canonical masks. Only A and E are changed in this release.
a = decode_rle(extract_rle(mask_source, "A"))
e = decode_rle(extract_rle(mask_source, "E"))
h = decode_rle(extract_rle(mask_source, "H"))

# A: move the L-shaped electrode upward by 20 matrix rows. Its horizontal arm
# must sit in the dark interval between G and H and must never cross H.
new_a = [[0 for _ in range(COLS)] for _ in range(ROWS)]
for row in range(ROWS - 20):
    new_a[row] = list(a[row + 20])

# Shorten the right arm before the lower slash and preserve a dark separation.
for row in range(ROWS):
    for col in range(43, COLS):
        new_a[row][col] = 0

h_cells = active_cells(h, 1)
for row, col in active_cells(new_a, 1):
    if any(max(abs(row - h_row), abs(col - h_col)) <= 1 for h_row, h_col in h_cells):
        new_a[row][col] = 0

# E: remove the isolated upper-left remnant visible in 3, 5 and 8. The actual
# lower bowl starts at row 90; everything above it in the left source area is
# extraction residue from the neighbouring electrode.
new_e = [list(row) for row in e]
for row in range(0, 90):
    for col in range(0, 26):
        new_e[row][col] = 0

# Geometry sanity checks before writing anything.
assert any(value >= 5 for row in new_a for value in row)
assert any(value >= 5 for row in new_e for value in row)
assert max(row for row, _ in active_cells(new_a, 1)) <= 58
assert not any(new_e[row][col] for row in range(0, 90) for col in range(0, 26))
assert not set(active_cells(new_a, 1)).intersection(active_cells(h, 1))

encoded_a = encode_rle(new_a)
encoded_e = encode_rle(new_e)

for path, source in ((mask_path, mask_source), (bundle_path, bundle_source)):
    source = replace_rle(source, "A", encoded_a)
    source = replace_rle(source, "E", encoded_e)
    path.write_text(source)

# Fit the 72x120 electrode matrix into the physical inner tube window instead
# of mapping it to the full 80x132 SVG viewport.
render_source = render_path.read_text()
render_source, count = re.subn(
    r'function maskCoordinate\(row, col\) \{\n\s*return \{\n\s*x: \(\(col \+ 0\.5\) \* 80 / MATRIX_COLS\)\.toFixed\(3\),\n\s*y: \(\(row \+ 0\.5\) \* 132 / MATRIX_ROWS\)\.toFixed\(3\)\n\s*\};\n\}',
    '''const GLYPH_SAFE_AREA = Object.freeze({ x: 10, y: 11, width: 60, height: 110 });\n\nfunction maskCoordinate(row, col) {\n  return {\n    x: (GLYPH_SAFE_AREA.x + ((col + 0.5) * GLYPH_SAFE_AREA.width / MATRIX_COLS)).toFixed(3),\n    y: (GLYPH_SAFE_AREA.y + ((row + 0.5) * GLYPH_SAFE_AREA.height / MATRIX_ROWS)).toFixed(3)\n  };\n}''',
    render_source,
    count=1,
)
assert count == 1, "Could not replace modular maskCoordinate"

render_source = render_source.replace(
    '''        <defs>\n          <filter id="${id}-glow"''',
    '''        <defs>\n          <clipPath id="${id}-electrode-clip"><rect x="9" y="10" width="62" height="112" rx="9"/></clipPath>\n          <filter id="${id}-glow"''',
    1,
)
render_source = render_source.replace(
    '''        <g class="electrode-field">${ghosts}</g>\n        <g class="active-glyph">${active}</g>''',
    '''        <g class="electrode-window" clip-path="url(#${id}-electrode-clip)">\n          <g class="electrode-field">${ghosts}</g>\n          <g class="active-glyph">${active}</g>\n        </g>''',
    1,
)
assert 'id="${id}-electrode-clip"' in render_source
assert 'class="electrode-window"' in render_source
render_path.write_text(render_source)

# Apply the same safe-area and clipping logic to the self-contained HACS bundle.
bundle_source = bundle_path.read_text()
bundle_source, count = re.subn(
    r'const maskCoordinate = \(row, col\) => \(\{\n\s*x: \(\(col \+ 0\.5\) \* 80\) / MATRIX_COLS,\n\s*y: \(\(row \+ 0\.5\) \* 132\) / MATRIX_ROWS,\n\s*\}\);',
    '''const GLYPH_SAFE_AREA = Object.freeze({ x: 10, y: 11, width: 60, height: 110 });\n\n  const maskCoordinate = (row, col) => ({\n    x: GLYPH_SAFE_AREA.x + ((col + 0.5) * GLYPH_SAFE_AREA.width) / MATRIX_COLS,\n    y: GLYPH_SAFE_AREA.y + ((row + 0.5) * GLYPH_SAFE_AREA.height) / MATRIX_ROWS,\n  });''',
    bundle_source,
    count=1,
)
assert count == 1, "Could not replace bundle maskCoordinate"

bundle_source = bundle_source.replace(
    '<defs><filter id="${id}-glow"',
    '<defs><clipPath id="${id}-electrode-clip"><rect x="9" y="10" width="62" height="112" rx="9"/></clipPath><filter id="${id}-glow"',
    1,
)
bundle_source = bundle_source.replace(
    '<g class="electrode-field">${ghosts}</g><g class="active-glyph">${active}</g>',
    '<g class="electrode-window" clip-path="url(#${id}-electrode-clip)"><g class="electrode-field">${ghosts}</g><g class="active-glyph">${active}</g></g>',
    1,
)
bundle_source = bundle_source.replace(
    '.tube svg{position:absolute;z-index:2;inset:0;width:100%;height:100%;overflow:visible}',
    '.tube svg{position:absolute;z-index:2;inset:0;width:100%;height:100%;overflow:hidden}',
    1,
)
assert 'id="${id}-electrode-clip"' in bundle_source
assert 'class="electrode-window"' in bundle_source
assert 'overflow:hidden' in bundle_source

bundle_source = bundle_source.replace('Version 0.5.1 - corrected shared lower-right electrode', 'Version 0.5.2 - corrected tube fit and shared electrode geometry')
bundle_source = bundle_source.replace('const VERSION = "0.5.1";', 'const VERSION = "0.5.2";')
bundle_source = bundle_source.replace('v${VERSION} (precision 72x120)', 'v${VERSION} (safe-area 72x120)')
bundle_path.write_text(bundle_source)

# Keep modular cache-busting imports coherent.
for path in Path('.').glob('compet-vfd-*.js'):
    if path == bundle_path:
        continue
    source = path.read_text()
    source = re.sub(r'\?v=0\.(?:4\.0|5\.0|5\.1)', f'?v={NEXT_VERSION}', source)
    path.write_text(source)

# Version metadata and documentation.
package_path = Path('package.json')
package = json.loads(package_path.read_text())
package['version'] = NEXT_VERSION
package_path.write_text(json.dumps(package, indent=2) + '\n')

readme_path = Path('README.md')
readme = readme_path.read_text().replace('v0.5.1', 'v0.5.2')
feature = '- Glyphs are fitted and clipped to the physical inner tube window, preventing phosphor and glow from crossing the glass border.\n- Removed the upper-left extraction remnant from the shared lower bowl used by 3, 5 and 8.\n- Raised the shared L-electrode of 4 into the gap between the two slash electrodes without crossing the lower slash.\n'
if feature not in readme:
    anchor = '## Original shared-electrode construction\n'
    readme = readme.replace(anchor, anchor + '\n' + feature, 1)
readme_path.write_text(readme)

changelog_path = Path('CHANGELOG.md')
previous = changelog_path.read_text() if changelog_path.exists() else ''
if previous.startswith('# Changelog'):
    previous = previous.split('\n', 1)[1].lstrip()
entry = '''# Changelog\n\n## 0.5.2\n\n- Fit the complete original phosphor matrix into a fixed inner-tube safe area.\n- Added an SVG clip path so active phosphor and glow cannot cross the glass boundary.\n- Removed the isolated upper-left remnant from shared lower segment E in 3, 5 and 8.\n- Raised shared L-segment A and separated it from lower slash H in digit 4.\n- Added focused geometry regression tests.\n\n'''
changelog_path.write_text(entry + previous)

Path('tests/v0.5.2-geometry.test.mjs').write_text('''import test from "node:test";\nimport assert from "node:assert/strict";\nimport fs from "node:fs";\nimport { ORIGINAL_SEGMENT_MASKS, activeCellsForSegment, minimumMaskGap } from "../compet-vfd-segment-masks.js";\n\ntest("shared lower bowl E has no upper-left extraction remnant", () => {\n  const residue = activeCellsForSegment("E").filter(({ row, col }) => row < 90 && col < 26);\n  assert.deepEqual(residue, []);\n});\n\ntest("shared L electrode A sits above and does not cross lower slash H", () => {\n  const a = activeCellsForSegment("A");\n  assert.ok(a.length > 0);\n  assert.ok(Math.max(...a.map(({ row }) => row)) <= 58);\n  assert.ok(minimumMaskGap(ORIGINAL_SEGMENT_MASKS.A, ORIGINAL_SEGMENT_MASKS.H, 1) >= 1);\n});\n\ntest("renderer uses the physical tube safe area and clip path", () => {\n  const modular = fs.readFileSync(new URL("../compet-vfd-render.js", import.meta.url), "utf8");\n  const bundle = fs.readFileSync(new URL("../compet-vfd-display-card.js", import.meta.url), "utf8");\n  for (const source of [modular, bundle]) {\n    assert.match(source, /GLYPH_SAFE_AREA/);\n    assert.match(source, /electrode-clip/);\n    assert.match(source, /electrode-window/);\n  }\n  assert.match(bundle, /overflow:hidden/);\n});\n''')

# Final invariants.
assert 'const VERSION = "0.5.2";' in bundle_path.read_text()
assert json.loads(package_path.read_text())['version'] == '0.5.2'
print('Applied v0.5.2 geometry correction')
