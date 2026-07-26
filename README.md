<p align="center">
  <img src="https://raw.githubusercontent.com/loungelizard2018/compet-vfd-display-card/main/brand/icon.png" width="150" alt="COMPET VFD Display Card icon">
</p>

# COMPET VFD Display Card

A photorealistic numeric display card for Home Assistant, inspired by the individual segmented glass cylinders used in the 1969 SHARP COMPET 18 calculator.

The digits are drawn with custom curved paths reconstructed from photographs of the original display. No generic seven-segment font, external JavaScript library, web font or CDN is used.

## Features

- Numeric characters `0–9` and minus sign
- Individually shaped COMPET-style numerals instead of a modern seven-segment typeface
- Decimal position indicated by a red external marker between the integer and decimal tubes, as on the original calculator
- Visible inactive geometry, honeycomb mesh, electrodes, support wires and phosphor dots
- Configurable green glow and inactive-segment colour
- Black instrument housing matching the Analog Gauge Card and Mechanical Counter Card
- Optional black cross-head mounting screws
- Optional additional red position markers
- Responsive fitting for Sections, Grid, Masonry and mobile layouts
- Entity state, entity attribute or static preview value

## HACS installation

1. Open **HACS → Dashboard**.
2. Open the three-dot menu and choose **Custom repositories**.
3. Add `https://github.com/loungelizard2018/compet-vfd-display-card`.
4. Select **Dashboard** as the category.
5. Install **COMPET VFD Display Card** and reload the frontend.

The resource path is:

```text
/hacsfiles/compet-vfd-display-card/compet-vfd-display-card.js
```

## Copy-paste example

This static configuration is useful for checking the design before connecting a sensor:

```yaml
type: custom:compet-vfd-display-card
value: 1234567890.5

integer_digits: 10
decimals: 1
leading_zeroes: true
reserve_sign_slot: false

label: COMPET DISPLAY
unit: ""
show_label: true
show_unit: false

frame: gauge_black
screws: true
screw_size: 30
transparent_card: true

glow_color: "#20f56b"
inactive_color: "rgba(32,245,107,0.035)"
show_mesh: true

tube_width: 64
tube_height: 124
tube_gap: 8

decimal_marker: true
decimal_marker_color: "#e33b32"

show_red_markers: false
marker_positions: []

animation: true
animation_duration: 190

fit_to_card: true
allow_upscale: false
max_fit_scale: 1
scale: 1

tap_action: none
```

## Sensor example

```yaml
type: custom:compet-vfd-display-card
entity: sensor.bigpool_cpu_temperature
integer_digits: 3
decimals: 1
leading_zeroes: false
label: CPU TEMPERATURE
unit: °C
frame: gauge_black
screws: true
decimal_marker: true
fit_to_card: true
```

## Full reference configuration

```yaml
type: custom:compet-vfd-display-card
entity: sensor.energy_total
attribute: null

integer_digits: 10
decimals: 1
leading_zeroes: true
reserve_sign_slot: false

label: COMPET 18 NUMERIC DISPLAY
unit: kWh
show_label: true
show_unit: true

frame: gauge_black
screws: true
screw_size: 30
transparent_card: true

glow_color: "#20f56b"
inactive_color: "rgba(32,245,107,0.035)"
show_mesh: true

tube_width: 64
tube_height: 124
tube_gap: 8

decimal_marker: true
decimal_marker_color: "#e33b32"

show_red_markers: false
marker_positions: []

animation: true
animation_duration: 190

fit_to_card: true
allow_upscale: false
max_fit_scale: 1
scale: 1

tap_action: more-info
```

The decimal marker does not consume a display tube. It is placed outside the glass tubes between the final integer digit and the first decimal digit.

## Main options

| Option | Default | Description |
|---|---:|---|
| `entity` | required* | Numeric Home Assistant entity |
| `attribute` | unset | Numeric attribute instead of the entity state |
| `value` | unset | Static value for design tests |
| `integer_digits` | `8` | Number of integer tubes |
| `decimals` | `0` | Number of decimal tubes |
| `leading_zeroes` | `false` | Fill unused positions with zeroes |
| `reserve_sign_slot` | `false` | Always reserve a sign tube |
| `decimal_marker` | `true` | Show the external red decimal marker |
| `decimal_marker_color` | `#e33b32` | Colour of the external decimal marker |
| `frame` | `gauge_black` | `gauge_black` or `none` |
| `screws` | `true` | Show four cross-head screws |
| `glow_color` | `#20f56b` | Active phosphor colour |
| `show_mesh` | `true` | Show the internal honeycomb mesh |
| `show_red_markers` | `false` | Show additional selected red index markers |
| `fit_to_card` | `true` | Fit the complete instrument to its column |

`entity` is not required when `value` is configured.

## Branding

The repository includes matching COMPET-style artwork in `brand/icon.svg`, `brand/icon.png` and `brand/icon@2x.png`. The absolute PNG URL above is used so the icon also renders inside the HACS README view.

HACS currently uses its generic Dashboard-card symbol for plugin repositories. Repository-specific brand icons are displayed for Home Assistant integrations, not for Dashboard cards.

## Accuracy

The display geometry was reconstructed from angled photographs of the original calculator. It intentionally reproduces its narrow, curved and dotted appearance rather than using a modern seven-segment typeface.

## Licence

MIT. This project is not affiliated with or endorsed by SHARP Corporation.
