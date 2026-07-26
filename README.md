<p align="center">
  <img src="https://raw.githubusercontent.com/loungelizard2018/compet-vfd-display-card/main/brand/icon.png" width="150" alt="COMPET VFD Display Card icon">
</p>

# COMPET VFD Display Card

A photorealistic numeric display card for Home Assistant inspired by the individually switched glass-cylinder display of the 1969 SHARP COMPET 18 calculator.

Version **0.3.1** reconstructs the unusual COMPET numeral geometry from the supplied photographic reference. The default glyphs are no longer smooth freehand strokes: each numeral is assembled from separately cut physical electrode segments with flat ends and explicitly sampled phosphor dots.

## Features

- Original COMPET 18 numeral style as the default
- Previous smoother glyph set retained as `style: alternative`
- Individually cut electrode segments instead of a generic seven-segment font
- Explicit phosphor dots distributed uniformly along actual SVG path length
- Independently configurable glow, phosphor, inactive-electrode and marker colours
- External faceted red decimal marker between integer and fractional tubes
- Photorealistic glass cylinders, mesh, support wires and inactive electrodes
- Gauge-black housing matching the Analog Gauge Card and Mechanical Counter Card
- Optional cross-head screws and responsive fitting

## HACS installation

1. Open **HACS → Dashboard**.
2. Open the three-dot menu and choose **Custom repositories**.
3. Add `https://github.com/loungelizard2018/compet-vfd-display-card`.
4. Select **Dashboard** as the category.
5. Install the latest release and reload the frontend.

Resource path:

```text
/hacsfiles/compet-vfd-display-card/compet-vfd-display-card.js
```

## Original COMPET style

`style: original` is the default and may be omitted.

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

## Previous alternative glyph style

```yaml
type: custom:compet-vfd-display-card
entity: sensor.bigpool_ram_usage
integer_digits: 3
decimals: 1
style: alternative
label: RAM USAGE
unit: "%"
```

## Colour example

```yaml
type: custom:compet-vfd-display-card
entity: sensor.bigpool_cpu_temperature
integer_digits: 3
decimals: 1
style: original
label: CPU TEMPERATURE
unit: °C

glow_color: "#ffad32"
phosphor_color: "#fff0bd"
inactive_color: "rgba(255,173,50,0.045)"
decimal_marker_color: "#d9362e"
```

## Static glyph test

The following value displays `0123456789` because the card reserves ten integer positions and adds the leading zero:

```yaml
type: custom:compet-vfd-display-card
value: 123456789
integer_digits: 10
decimals: 0
leading_zeroes: true
style: original
label: ORIGINAL 0–9
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

## Development comparison

Open `demo/glyph-comparison.html` from a local web server. It displays:

- the reconstructed original row `0123456789`
- the previous alternative row
- enlarged views of `0`, `4`, `6`, `8` and `9`
- segment IDs and cut boundaries
- an optional local photographic overlay selected through a file input

## Accuracy

The original-style geometry is reconstructed from an angled photograph of the calculator. Perspective and cell placement were analysed before the segment paths were normalised to an `80 × 132` local coordinate system. Reference fidelity takes precedence over mathematical symmetry.

## Licence

MIT. This project is not affiliated with or endorsed by SHARP Corporation.
