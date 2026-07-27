from pathlib import Path
import json
import re

NEW_F = "3le0.23.1y0.14.16.13.20.31.1s0.14.16.15.33.22.11.1q0.11.14.26.25.24.13.12.11.1p0.12.14.46.25.14.13.12.11.1o0.12.13.15.56.15.14.13.12.11.1o0.12.14.15.56.15.14.13.11.1o0.11.13.14.15.46.15.14.13.12.11.1o0.12.13.14.15.46.15.14.13.12.11.1n0.11.12.13.14.15.46.15.14.13.11.1n0.21.13.14.15.46.15.14.13.12.11.1n0.11.12.13.14.15.46.15.14.13.12.1o0.11.12.13.14.15.36.15.14.13.12.11.1o0.11.13.14.15.46.15.14.13.11.1o0.11.12.13.14.15.36.15.14.13.12.11.1o0.11.12.13.15.46.15.14.12.11.1o0.11.12.13.14.15.36.15.14.13.12.11.1o0.11.12.14.15.46.15.13.12.11.1o0.11.12.13.14.15.36.15.14.13.12.1p0.11.13.14.15.36.15.14.13.12.11.1o0.11.12.13.14.46.15.13.12.11.1p0.12.13.14.15.36.15.13.12.11.1p0.12.13.14.15.36.15.14.12.11.1p0.11.13.14.15.36.15.14.13.11.1p0.11.12.14.15.36.15.14.13.12.1p0.11.12.13.15.36.15.14.13.12.1p0.11.12.13.15.46.14.13.12.11.1q0.13.14.46.14.13.12.11.1r0.14.15.26.15.14.13.11.1s0.14.15.26.15.14.12.11.1t0.15.26.15.13.12.1u0.15.26.15.13.11.1u0.15.16.15.14.12.11.1u0.26.14.12.1w0.16.15.12.1w0.14.16.13.1x0.23.1290"


def replace_once(path: Path, pattern: str) -> None:
    text = path.read_text()
    updated, count = re.subn(pattern, lambda match: match.group(1) + NEW_F + match.group(2), text, count=1)
    if count != 1:
        raise RuntimeError(f"Could not replace F in {path}")
    path.write_text(updated)


def decode(encoded: str) -> list[int]:
    values: list[int] = []
    for token in encoded.split('.'):
        count = int(token[:-1], 36)
        level = int(token[-1])
        values.extend([level] * count)
    if len(values) != 72 * 120:
        raise RuntimeError(f"F mask length is {len(values)}, expected 8640")
    return values


def extract_mask(path: Path, pattern: str) -> str:
    match = re.search(pattern, path.read_text())
    if not match:
        raise RuntimeError(f"Could not read mask from {path}")
    return match.group(1)


def minimum_gap(left: list[int], right: list[int], minimum_level: int) -> int:
    a = [(index // 72, index % 72) for index, value in enumerate(left) if value >= minimum_level]
    b = [(index // 72, index % 72) for index, value in enumerate(right) if value >= minimum_level]
    return min(max(abs(ar - br), abs(ac - bc)) - 1 for ar, ac in a for br, bc in b)


replace_once(Path('compet-vfd-segment-masks.js'), r'(\n\s*"F"\s*:\s*")[^"]+("\s*,)')
replace_once(Path('compet-vfd-display-card.js'), r'(\n\s*F\s*:\s*")[^"]+("\s*,)')

module_path = Path('compet-vfd-segment-masks.js')
e_encoded = extract_mask(module_path, r'\n\s*"E"\s*:\s*"([^"]+)"')
f_encoded = extract_mask(module_path, r'\n\s*"F"\s*:\s*"([^"]+)"')
e_values = decode(e_encoded)
f_values = decode(f_encoded)
if minimum_gap(e_values, f_values, 1) < 1:
    raise RuntimeError('F edge mask still overlaps E')
if minimum_gap(e_values, f_values, 3) < 1:
    raise RuntimeError('F active mask still overlaps E')
f_rows = [index // 72 for index, value in enumerate(f_values) if value >= 1]
if max(f_rows) > 100:
    raise RuntimeError('F extends below row 100')

bundle_path = Path('compet-vfd-display-card.js')
bundle = bundle_path.read_text()
bundle = bundle.replace('Version 0.5.0 - precision photo-traced HACS bundle', 'Version 0.5.1 - corrected shared lower-right electrode')
bundle = bundle.replace('const VERSION = "0.5.0";', 'const VERSION = "0.5.1";')
bundle_path.write_text(bundle)

package_path = Path('package.json')
package = json.loads(package_path.read_text())
if package['version'] != '0.5.0':
    raise RuntimeError(f"Unexpected package version {package['version']}")
package['version'] = '0.5.1'
package_path.write_text(json.dumps(package, indent=2) + '\n')

readme_path = Path('README.md')
readme = readme_path.read_text().replace('v0.5.0', 'v0.5.1')
note = (
    '## Segment F correction in v0.5.1\n\n'
    'The canonical lower-right electrode `F` is now an independent return segment with a dark optical gap to the shared lower-base electrode `E`. '
    'The same corrected mask is reused without transforms in `3`, `5`, `6` and `8`.\n\n'
)
if note not in readme:
    readme = note + readme
readme_path.write_text(readme)

changelog_path = Path('CHANGELOG.md')
previous = changelog_path.read_text() if changelog_path.exists() else ''
if previous.startswith('# Changelog'):
    previous = previous.split('\n', 1)[1].lstrip()
changelog_path.write_text(
    '# Changelog\n\n## 0.5.1\n\n'
    '- Redrew only the shared lower-right electrode `F`.\n'
    '- Removed its broad overlap with shared lower-base electrode `E`.\n'
    '- Added a stable dark cell gap at edge and active phosphor levels.\n'
    '- Verified unchanged reuse in digits `3`, `5`, `6` and `8`.\n\n'
    + previous
)

test_path = Path('tests/original-segment-matrix.test.mjs')
tests = test_path.read_text()
block = '''\n\ntest("F is an independent lower-right electrode in 3, 5, 6 and 8",()=>{\n  const edgeGap=minimumMaskGap(ORIGINAL_SEGMENT_MASKS.E,ORIGINAL_SEGMENT_MASKS.F,1);\n  const activeGap=minimumMaskGap(ORIGINAL_SEGMENT_MASKS.E,ORIGINAL_SEGMENT_MASKS.F,3);\n  assert.ok(edgeGap>=1,`E/F edge masks overlap: ${edgeGap}`);\n  assert.ok(activeGap>=1,`E/F active masks overlap: ${activeGap}`);\n  const f=activeCellsForSegment("F",ORIGINAL_SEGMENT_MASKS,1);\n  assert.ok(Math.max(...f.map(cell=>cell.row))<=100,"F extends below its intended return");\n  for(const digit of ["3","5","6","8"]){\n    assert.ok(ORIGINAL_DIGIT_SEGMENTS[digit].includes("F"),`${digit} does not reuse canonical F`);\n    assert.ok(composeDigitLevels(digit).flat().some(value=>value>=5),`${digit} lost its bright core`);\n  }\n});\n'''
if 'F is an independent lower-right electrode' not in tests:
    tests += block
test_path.write_text(tests)

print('Segment F v0.5.1 correction applied and geometry preflight passed.')
