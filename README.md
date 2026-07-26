<p align="center">
  <img src="https://raw.githubusercontent.com/loungelizard2018/compet-vfd-display-card/main/brand/icon.png" width="150" alt="COMPET VFD Display Card icon">
</p>

# COMPET VFD Display Card

A photorealistic numeric display card for Home Assistant inspired by the individually switched glass-cylinder display of the 1969 SHARP COMPET 18 calculator.

> **Experimental visual-review branch:** `fix/true-compet-shared-segments`
>
> This branch does not contain a new release or version bump. It replaces the incorrect per-digit original paths with one canonical set of exactly eight shared physical electrode segments. It must not be merged or released until the visual atlas is approved.

## True shared-segment model

The original style is now defined by these eight immutable objects:

| ID | Name | Source numeral |
|---|---|---:|
| `A` | upper-left-return | `4` |
| `B` | upper-roof | `2` |
| `C` | upper-right-hook | `2` |
| `D` | lower-left-sweep | `2` |
| `E` | lower-base | `2` |
| `F` | lower-right-return | `3` |
| `G` | one-upper-slash | `1` |
| `H` | one-lower-slash | `1` |

No original numeral owns a private path and no segment is transformed for a particular digit. The binding matrix is fixed:

```text
0 = D E F
1 = G H
2 = B C D E
3 = B C E F
4 = A G H
5 = A B E F
6 = C D E F
7 = B C H
8 = A B C D E F
9 = A B C H
```

The previous smoother glyph set remains available unchanged as `style: alternative`.

## Branch verification

Run:

```bash
npm run verify
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/demo/segment-atlas.html
http://localhost:8000/demo/reference-overlay.html
```

The atlas contains:

- each physical segment A–H separately with cut endpoints,
- `0123456789` assembled from the shared original objects,
- the unchanged alternative row,
- a colour-coded identity view proving reuse.

The overlay tool accepts the supplied photograph locally, provides whole-cell position/scale/rotation controls, segment toggles, opacity controls and PNG export. It never performs OCR and never transforms an individual segment.

## HACS installation

The stable release remains available through HACS:

1. Open **HACS → Dashboard**.
2. Open the three-dot menu and choose **Custom repositories**.
3. Add `https://github.com/loungelizard2018/compet-vfd-display-card`.
4. Select **Dashboard** as the category.
5. Install the latest published release and reload the frontend.

Resource path:

```text
/hacsfiles/compet-vfd-display-card/compet-vfd-display-card.js
```

## Original-style YAML

```yaml
type: custom:compet-vfd-display-card
entity: sensor.bigpool_ram_usage

integer_digits: 3
decimals: 1
leading_zeroes: false
style: original

label: RAM USAGE
unit: "%"
show_label: true
show_unit: true

frame: gauge_black
screws: true
screw_size: 30
transparent_card: true

glow_color: "#20f56b"
phosphor_color: "#d8ffe3"
inactive_color: "rgba(32,245,107,0.035)"
show_mesh: true

tube_width: 64
tube_height: 124
tube_gap: 8

decimal_marker: true
decimal_marker_color: "#d9362e"

fit_to_card: true
allow_upscale: false
max_fit_scale: 1
```

## Alternative style

```yaml
type: custom:compet-vfd-display-card
entity: sensor.bigpool_ram_usage
integer_digits: 3
decimals: 1
style: alternative
label: RAM USAGE
unit: "%"
```

## Static digit test

```yaml
type: custom:compet-vfd-display-card
value: 123456789
integer_digits: 10
decimals: 0
leading_zeroes: true
style: original
label: SHARED SEGMENTS 0–9
unit: ""
show_unit: false
```

## Main options

| Option | Default | Description |
|---|---:|---|
| `entity` | required* | Numeric Home Assistant entity |
| `value` | unset | Static numeric test value |
| `attribute` | unset | Numeric entity attribute |
| `style` | `original` | `original` or `alternative` |
| `integer_digits` | `8` | Integer display tubes |
| `decimals` | `0` | Fractional display tubes |
| `leading_zeroes` | `false` | Fill unused integer positions with zeroes |
| `glow_color` | `#20f56b` | Active electrode glow |
| `phosphor_color` | `#d8ffe3` | Sharp phosphor-dot colour |
| `inactive_color` | green transparent | Inactive electrode field |
| `decimal_marker` | `true` | External physical decimal marker |
| `decimal_marker_color` | `#d9362e` | Marker centre colour |
| `frame` | `gauge_black` | `gauge_black` or `none` |
| `screws` | `true` | Show four mounting screws |
| `fit_to_card` | `true` | Fit the instrument to its column |

`entity` is not required when `value` is configured.

## Licence

MIT. This project is not affiliated with or endorsed by SHARP Corporation.
