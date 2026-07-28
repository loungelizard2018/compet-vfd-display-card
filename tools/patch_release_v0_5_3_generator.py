from pathlib import Path
import re

path = Path(__file__).with_name("release_v0_5_3.py")
source = path.read_text()

replacement = '''def patch_f_connection(masks: dict[str, list[list[int]]]) -> None:
    e = masks["E"]
    f = masks["F"]

    # The photographic F/E junction is diagonal: the bottom tip of F must meet
    # the rising right-hand end of E. Work with active phosphor cores rather
    # than weak edge glow, then fill only the cells between both electrodes.
    f_core = [
        (row, col, f[row][col])
        for row in range(68, ROWS)
        for col in range(24, COLS)
        if f[row][col] >= 3
    ]
    e_core = [
        (row, col, e[row][col])
        for row in range(68, ROWS)
        for col in range(24, COLS)
        if e[row][col] >= 3
    ]
    if not f_core or not e_core:
        raise RuntimeError("missing lower active core for E/F junction")

    max_f_row = max(row for row, _col, _level in f_core)
    f_tips = [cell for cell in f_core if cell[0] >= max_f_row - 2]
    f_tip = max(f_tips, key=lambda cell: (cell[0], cell[1], cell[2]))

    nearby_e = [
        cell for cell in e_core
        if cell[0] >= f_tip[0] - 18 and cell[1] >= f_tip[1] - 20
    ] or e_core
    e_tip = min(
        nearby_e,
        key=lambda cell: ((cell[0] - f_tip[0]) ** 2 + (cell[1] - f_tip[1]) ** 2),
    )

    start_row, start_col, start_level = f_tip
    end_row, end_col, end_level = e_tip
    steps = max(abs(end_row - start_row), abs(end_col - start_col))
    if steps < 2:
        return
    if steps > 18:
        raise RuntimeError(
            f"implausible F/E endpoint distance: F={f_tip}, E={e_tip}, steps={steps}"
        )

    touched = 0
    for index in range(1, steps):
        ratio = index / steps
        row = round(start_row + (end_row - start_row) * ratio)
        col = round(start_col + (end_col - start_col) * ratio)
        if e[row][col] > 0:
            continue
        level = round(start_level * (1 - ratio) + end_level * ratio)
        if f[row][col] < max(3, min(5, level)):
            f[row][col] = max(3, min(5, level))
            touched += 1

        # Add only a weak one-cell halo around the new core. Never write into E.
        for delta_row, delta_col in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            halo_row = row + delta_row
            halo_col = col + delta_col
            if not (0 <= halo_row < ROWS and 0 <= halo_col < COLS):
                continue
            if e[halo_row][halo_col] == 0 and f[halo_row][halo_col] < 2:
                f[halo_row][halo_col] = 2

    if touched == 0:
        raise RuntimeError(
            f"F/E endpoint bridge produced no new active cells: F={f_tip}, E={e_tip}"
        )


def update_safe_area'''

source, count = re.subn(
    r'def patch_f_connection\(masks: dict\[str, list\[list\[int\]\]\]\) -> None:.*?\ndef update_safe_area',
    replacement,
    source,
    count=1,
    flags=re.S,
)
if count != 1:
    raise RuntimeError("could not replace patch_f_connection")

old_test = 'test("F closes flush against E in the lower bowl", () => { const e=rows("E"), f=rows("F"); let checked=0; for(let row=92;row<=100;row+=1){ if(!e.has(row)||!f.has(row)) continue; const eRight=Math.max(...e.get(row)); const fLeft=Math.min(...f.get(row)); assert.ok(fLeft-eRight<=1,`row ${row}: E/F gap ${fLeft-eRight-1}`); assert.ok(fLeft>eRight,`row ${row}: E/F overlap`); checked+=1;} assert.ok(checked>=8); });'
new_test = 'test("F closes flush against E in the lower bowl", () => { const e=activeCellsForSegment("E",3), f=activeCellsForSegment("F",3); const eSet=new Set(e.map(cell=>`${cell.row}:${cell.col}`)); assert.equal(f.filter(cell=>eSet.has(`${cell.row}:${cell.col}`)).length,0,"E/F cores overlap"); const maxFRow=Math.max(...f.map(cell=>cell.row)); const tips=f.filter(cell=>cell.row>=maxFRow-2); const distance=Math.min(...tips.flatMap(a=>e.map(b=>Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))))); assert.ok(distance<=1,`E/F active-core gap ${distance-1}`); });'
if old_test not in source:
    raise RuntimeError("could not replace generated F/E test")
source = source.replace(old_test, new_test)

path.write_text(source)
print("patched v0.5.3 generator for diagonal F/E junction")
