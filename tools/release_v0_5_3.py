from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
import base64
import json
import re

ROOT = Path(__file__).resolve().parents[1]
COLS = 72
ROWS = 120
NEW_VERSION = "0.5.3"
SAFE_AREA = {"x": 10.0, "y": 11.0, "width": 56.0, "height": 110.0}
DIGITS = {
    "0": ["D", "E", "F"],
    "1": ["G", "H"],
    "2": ["B", "C", "D", "E"],
    "3": ["B", "C", "E", "F"],
    "4": ["A", "G", "H"],
    "5": ["A", "B", "E", "F"],
    "6": ["C", "D", "E", "F"],
    "7": ["B", "C", "H"],
    "8": ["A", "B", "C", "D", "E", "F"],
    "9": ["A", "B", "C", "H"],
}
SEGMENT_COLORS = {
    "A": (235, 78, 78),
    "B": (245, 154, 52),
    "C": (245, 220, 65),
    "D": (75, 205, 105),
    "E": (50, 205, 220),
    "F": (70, 125, 245),
    "G": (155, 95, 235),
    "H": (235, 85, 205),
}


def base36(value: int) -> str:
    chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    if value == 0:
        return "0"
    out = []
    while value:
        value, rem = divmod(value, 36)
        out.append(chars[rem])
    return "".join(reversed(out))


def decode_rle(encoded: str) -> list[list[int]]:
    values: list[int] = []
    for token in encoded.split("."):
        if not token:
            continue
        level = int(token[-1])
        count = int(token[:-1], 36)
        values.extend([level] * count)
    if len(values) != COLS * ROWS:
        raise ValueError(f"invalid RLE length {len(values)}")
    return [values[row * COLS:(row + 1) * COLS] for row in range(ROWS)]


def encode_rle(mask: list[list[int]]) -> str:
    values = [cell for row in mask for cell in row]
    chunks: list[str] = []
    start = 0
    while start < len(values):
        level = values[start]
        end = start + 1
        while end < len(values) and values[end] == level:
            end += 1
        chunks.append(f"{base36(end - start)}{level}")
        start = end
    return ".".join(chunks)


def extract_masks(source: str) -> dict[str, str]:
    masks: dict[str, str] = {}
    for segment in "ABCDEFGH":
        pattern = rf'["\']?{segment}["\']?\s*:\s*"([^"]+)"'
        match = re.search(pattern, source)
        if not match:
            raise RuntimeError(f"missing segment {segment}")
        masks[segment] = match.group(1)
    return masks


def replace_mask(source: str, segment: str, encoded: str) -> str:
    pattern = rf'(["\']?{segment}["\']?\s*:\s*")[^"]+("\s*,?)'
    updated, count = re.subn(pattern, rf'\g<1>{encoded}\g<2>', source, count=1)
    if count != 1:
        raise RuntimeError(f"could not replace segment {segment}")
    return updated


def rightmost(row: list[int], minimum: int = 1) -> int | None:
    cells = [index for index, level in enumerate(row) if level >= minimum]
    return max(cells) if cells else None


def leftmost(row: list[int], minimum: int = 1) -> int | None:
    cells = [index for index, level in enumerate(row) if level >= minimum]
    return min(cells) if cells else None


def patch_f_connection(masks: dict[str, list[list[int]]]) -> None:
    e = masks["E"]
    f = masks["F"]
    touched = 0
    for row_index in range(92, 101):
        e_right = rightmost(e[row_index], 1)
        f_left = leftmost(f[row_index], 1)
        if e_right is None or f_left is None or f_left <= e_right + 1:
            continue
        e_level = e[row_index][e_right]
        f_level = f[row_index][f_left]
        gap = f_left - e_right - 1
        for offset, column in enumerate(range(e_right + 1, f_left), start=1):
            ratio = offset / (gap + 1)
            level = round(e_level * (1 - ratio) + f_level * ratio)
            f[row_index][column] = max(2, min(5, level))
            touched += 1
    if touched < 8:
        raise RuntimeError(f"F/E bridge unexpectedly small: {touched}")


def update_safe_area(source: str) -> str:
    replacement = (
        'const GLYPH_SAFE_AREA = Object.freeze({ '
        f'x: {SAFE_AREA["x"]:g}, y: {SAFE_AREA["y"]:g}, '
        f'width: {SAFE_AREA["width"]:g}, height: {SAFE_AREA["height"]:g} '
        '});'
    )
    source, count = re.subn(
        r'const GLYPH_SAFE_AREA\s*=\s*Object\.freeze\(\{[^}]+\}\);',
        replacement,
        source,
        count=1,
    )
    if count != 1:
        raise RuntimeError("GLYPH_SAFE_AREA not found")
    source = source.replace(
        'x="9" y="10" width="62" height="112" rx="9"',
        'x="9.5" y="10.5" width="59" height="111" rx="8.5"',
    )
    source = re.sub(
        r'(\.tube svg\{[^}]*?)overflow:visible',
        r'\1overflow:hidden',
        source,
        count=1,
    )
    return source


def find_font(size: int, bold: bool = False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def compose_digit(masks: dict[str, list[list[int]]], digit: str) -> list[list[int]]:
    result = [[0 for _ in range(COLS)] for _ in range(ROWS)]
    for segment in DIGITS[digit]:
        mask = masks[segment]
        for row in range(ROWS):
            for col in range(COLS):
                result[row][col] = max(result[row][col], mask[row][col])
    return result


def render_mask(canvas: Image.Image, mask: list[list[int]], box, color=(65, 245, 112), point_scale=0.37):
    draw = ImageDraw.Draw(canvas, "RGBA")
    left, top, right, bottom = box
    width = right - left
    height = bottom - top
    step_x = width / COLS
    step_y = height / ROWS
    base_radius = min(step_x, step_y) * point_scale
    for row in range(ROWS):
        for col in range(COLS):
            level = mask[row][col]
            if level <= 0:
                continue
            x = left + (col + 0.5) * step_x
            y = top + (row + 0.5) * step_y
            glow_radius = base_radius * (1.5 + level * 0.17)
            alpha = min(180, 26 + level * 22)
            draw.ellipse((x-glow_radius, y-glow_radius, x+glow_radius, y+glow_radius), fill=(*color, alpha))
            radius = base_radius * (0.55 + level * 0.10)
            core = tuple(min(255, int(component + (255-component)*level/14)) for component in color)
            draw.ellipse((x-radius, y-radius, x+radius, y+radius), fill=(*core, 230))


def render_digit_tube(canvas: Image.Image, masks, digit: str, box, colored_segments=False):
    draw = ImageDraw.Draw(canvas, "RGBA")
    left, top, right, bottom = box
    draw.rounded_rectangle(box, radius=17, fill=(2,11,6,255), outline=(70,92,76,255), width=2)
    inset = 11
    inner = (left+inset, top+inset, right-inset, bottom-inset)
    draw.rounded_rectangle(inner, radius=12, fill=(0,9,4,255), outline=(120,155,128,70), width=1)
    if colored_segments:
        for segment in DIGITS[digit]:
            render_mask(canvas, masks[segment], inner, SEGMENT_COLORS[segment], 0.33)
    else:
        render_mask(canvas, compose_digit(masks, digit), inner, (44,242,101), 0.34)


def build_implementation_image(masks, output: Path) -> Image.Image:
    image = Image.new("RGB", (1400, 280), (5,8,10))
    draw = ImageDraw.Draw(image)
    title_font = find_font(28, True)
    digit_font = find_font(22, True)
    draw.text((35,18), "COMPET VFD implementation — digits 0–9", font=title_font, fill=(230,235,232))
    start_x, tube_w, gap, top, bottom = 30, 124, 11, 62, 245
    for index, digit in enumerate("0123456789"):
        left = start_x + index * (tube_w + gap)
        render_digit_tube(image, masks, digit, (left,top,left+tube_w,bottom), False)
        label_box = draw.textbbox((0,0), digit, font=digit_font)
        draw.text((left+(tube_w-(label_box[2]-label_box[0]))/2,249), digit, font=digit_font, fill=(210,215,212))
    image.save(output, optimize=True)
    return image


def build_segment_reference(masks, output: Path) -> Image.Image:
    image = Image.new("RGB", (1600, 900), (7,10,12))
    draw = ImageDraw.Draw(image)
    title = find_font(30, True)
    label = find_font(20, True)
    small = find_font(15, False)
    draw.text((35,24), "COMPET shared electrode reference", font=title, fill=(235,238,236))
    cell_w, cell_h = 185, 250
    for index, segment in enumerate("ABCDEFGH"):
        row, col = divmod(index, 4)
        left = 30 + col * (cell_w + 12)
        top = 75 + row * (cell_h + 15)
        draw.rounded_rectangle((left,top,left+cell_w,top+cell_h), radius=16, fill=(1,8,4), outline=(65,80,70), width=2)
        render_mask(image, masks[segment], (left+25,top+25,left+cell_w-25,top+cell_h-45), SEGMENT_COLORS[segment], 0.35)
        draw.text((left+12,top+cell_h-34), f"Segment {segment}", font=label, fill=SEGMENT_COLORS[segment])
    digit_top, digit_w = 625, 145
    for index, digit in enumerate("0123456789"):
        left = 25 + index * (digit_w + 10)
        render_digit_tube(image, masks, digit, (left,digit_top,left+digit_w,830), True)
        formula = f"{digit} = {'+'.join(DIGITS[digit])}"
        text_box = draw.textbbox((0,0), formula, font=small)
        draw.text((left+(digit_w-(text_box[2]-text_box[0]))/2,842), formula, font=small, fill=(220,224,222))
    image.save(output, optimize=True)
    return image


def build_comparison(original_path: Path, implementation: Image.Image, output: Path):
    original = Image.open(original_path).convert("RGB")
    width = 1400
    original = ImageOps.contain(original, (width-50, 320))
    canvas = Image.new("RGB", (width, original.height+implementation.height+115), (6,8,10))
    draw = ImageDraw.Draw(canvas)
    title = find_font(28, True)
    draw.text((28,18), "Original SHARP COMPET 18 reference", font=title, fill=(235,237,236))
    canvas.paste(original, ((width-original.width)//2,58))
    y = 70 + original.height
    draw.text((28,y), "Current implementation", font=title, fill=(235,237,236))
    canvas.paste(implementation, (0,y+42))
    canvas.save(output, optimize=True)


def update_readme(path: Path, german=False):
    if not path.exists():
        return
    text = path.read_text()
    start, end = "<!-- COMPET_REFERENCE_START -->", "<!-- COMPET_REFERENCE_END -->"
    if german:
        heading = "Originalreferenz und Segmentaufbau"
        original_text = "Der perspektivisch ausgerichtete Screenshot des originalen SHARP COMPET 18 dient als verbindliche Formreferenz:"
        comparison_text = "Direkter Vergleich zwischen Original und aktueller Implementierung:"
        atlas_text = "Die folgende Grafik zeigt die acht gemeinsam wiederverwendeten Elektroden `A–H` und für jede Ziffer die verbindliche Zusammensetzung:"
        original_alt, compare_alt, atlas_alt = "Ausgerichtete Originalreferenz", "Original und Implementierung im Vergleich", "Segmentreferenz A–H und Ziffern 0–9"
        col1, col2 = "Ziffer", "Segmente"
    else:
        heading = "Original reference and shared segment construction"
        original_text = "The perspective-corrected SHARP COMPET 18 screenshot is the canonical visual reference:"
        comparison_text = "Side-by-side visual comparison of the original and the current implementation:"
        atlas_text = "The segment atlas below identifies all eight shared electrodes `A–H` and the exact composition of every digit:"
        original_alt, compare_alt, atlas_alt = "Rectified original reference", "Original versus implementation", "Shared segment atlas A–H and digits 0–9"
        col1, col2 = "Digit", "Shared segments"
    rows = "\n".join(f"| {digit} | {' + '.join(DIGITS[digit])} |" for digit in "0123456789")
    block = f'''{start}
## {heading}

{original_text}

![{original_alt}](docs/compet-original-rectified.jpg)

{comparison_text}

![{compare_alt}](docs/compet-original-vs-implementation.png)

{atlas_text}

![{atlas_alt}](docs/compet-segment-reference.png)

| {col1} | {col2} |
|---:|---|
{rows}
{end}
'''
    pattern = re.compile(re.escape(start)+r".*?"+re.escape(end), re.S)
    text = pattern.sub(block.strip(), text) if pattern.search(text) else text.rstrip()+"\n\n"+block
    path.write_text(text.replace("v0.5.2", "v0.5.3"))


def main():
    masks_path = ROOT / "compet-vfd-segment-masks.js"
    bundle_path = ROOT / "compet-vfd-display-card.js"
    render_path = ROOT / "compet-vfd-render.js"
    masks_source = masks_path.read_text()
    bundle_source = bundle_path.read_text()
    masks = {segment: decode_rle(encoded) for segment, encoded in extract_masks(masks_source).items()}
    patch_f_connection(masks)
    new_f = encode_rle(masks["F"])
    masks_source = replace_mask(masks_source, "F", new_f)
    bundle_source = replace_mask(bundle_source, "F", new_f)
    render_source = update_safe_area(render_path.read_text())
    bundle_source = update_safe_area(bundle_source)
    bundle_source = bundle_source.replace("Version 0.5.2", "Version 0.5.3")
    bundle_source = bundle_source.replace('const VERSION = "0.5.2";', 'const VERSION = "0.5.3";')
    bundle_source = bundle_source.replace("corrected tube fit and shared electrode geometry", "corrected right fit, F/E junction and documentation reference")
    for path in ROOT.glob("compet-vfd-*.js"):
        if path in {masks_path, bundle_path, render_path}:
            continue
        path.write_text(path.read_text().replace("?v=0.4.0", "?v=0.5.3").replace("?v=0.5.2", "?v=0.5.3"))
    masks_path.write_text(masks_source.replace("?v=0.4.0", "?v=0.5.3").replace("?v=0.5.2", "?v=0.5.3"))
    render_path.write_text(render_source.replace("?v=0.4.0", "?v=0.5.3").replace("?v=0.5.2", "?v=0.5.3"))
    bundle_path.write_text(bundle_source)
    package_path = ROOT / "package.json"
    package = json.loads(package_path.read_text())
    package["version"] = NEW_VERSION
    package_path.write_text(json.dumps(package, indent=2)+"\n")
    docs = ROOT / "docs"
    docs.mkdir(exist_ok=True)
    original_path = docs / "compet-original-rectified.jpg"
    original_path.write_bytes(base64.b64decode((ROOT/"tools"/"compet-original-rectified.b64").read_text().strip()))
    implementation = build_implementation_image(masks, docs/"compet-implementation-0-9.png")
    build_segment_reference(masks, docs/"compet-segment-reference.png")
    build_comparison(original_path, implementation, docs/"compet-original-vs-implementation.png")
    update_readme(ROOT/"README.md", False)
    update_readme(ROOT/"README.de.md", True)
    changelog_path = ROOT/"CHANGELOG.md"
    old = changelog_path.read_text() if changelog_path.exists() else "# Changelog\n"
    if old.startswith("# Changelog"):
        old = old.split("\n",1)[1].lstrip("\n")
    changelog_path.write_text("""# Changelog

## 0.5.3

- Reduced and left-shifted the original glyph safe area so active electrodes and glow stay inside the right tube border.
- Closed the lower-right `F` electrode flush against shared lower bowl `E` in digits 3, 5, 6 and 8 without overlapping cells.
- Added a perspective-corrected original COMPET 18 reference image to the documentation.
- Added current implementation, original-versus-implementation and shared-segment atlas renderings.

"""+old)
    test_path = ROOT/"tests"/"v0_5_3_geometry_and_docs.test.mjs"
    test_path.write_text('''import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ORIGINAL_DIGIT_SEGMENTS, ORIGINAL_SEGMENTS } from "../compet-vfd-segments.js";
import { activeCellsForSegment } from "../compet-vfd-segment-masks.js";
const rows = (id) => { const map = new Map(); for (const cell of activeCellsForSegment(id)) { if (!map.has(cell.row)) map.set(cell.row, []); map.get(cell.row).push(cell.col); } return map; };
test("F closes flush against E in the lower bowl", () => { const e=rows("E"), f=rows("F"); let checked=0; for(let row=92;row<=100;row+=1){ if(!e.has(row)||!f.has(row)) continue; const eRight=Math.max(...e.get(row)); const fLeft=Math.min(...f.get(row)); assert.ok(fLeft-eRight<=1,`row ${row}: E/F gap ${fLeft-eRight-1}`); assert.ok(fLeft>eRight,`row ${row}: E/F overlap`); checked+=1;} assert.ok(checked>=8); });
test("corrected F remains one canonical shared segment",()=>{ for(const digit of ["3","5","6","8"]) assert.ok(ORIGINAL_DIGIT_SEGMENTS[digit].includes("F")); assert.ok(ORIGINAL_SEGMENTS.F); });
test("renderer keeps glyphs inside a narrower right-safe area",()=>{ for(const file of ["compet-vfd-render.js","compet-vfd-display-card.js"]){ const source=fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8"); assert.match(source,/GLYPH_SAFE_AREA[^\n]+width: 56/); assert.match(source,/x="9\.5" y="10\.5" width="59" height="111"/); assert.match(source,/\.tube svg\{[^}]*overflow:hidden/); } });
test("reference documentation assets exist",()=>{ for(const file of ["docs/compet-original-rectified.jpg","docs/compet-implementation-0-9.png","docs/compet-original-vs-implementation.png","docs/compet-segment-reference.png"]) assert.ok(fs.existsSync(new URL(`../${file}`,import.meta.url))); });
''')
    print("v0.5.3 geometry and documentation build completed")

if __name__ == "__main__":
    main()
