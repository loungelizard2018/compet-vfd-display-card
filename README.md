# COMPET VFD Display Card

A photorealistic numeric display card for Home Assistant, inspired by the individual segmented glass cylinders used in the 1969 SHARP COMPET 18 calculator.

The digits are drawn with custom curved segment paths. No generic seven-segment font, external JavaScript library, web font or CDN is used.

## Features

- Numeric characters `0–9` and minus sign
- Decimal point or comma in a separate glass cylinder
- Visible inactive segments, honeycomb mesh, electrodes and phosphor dots
- Configurable green glow and inactive-segment colour
- Black instrument housing matching the Analog Gauge Card and Mechanical Counter Card
- Optional black cross-head mounting screws
- Optional red position markers
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

## Minimal configuration

```yaml
type: custom:compet-vfd-display-card
entity: sensor.energy_total
integer_digits: 8
decimals: 1
unit: kWh
label: ENERGY
```

## Full reference configuration

```yaml
type: custom:compet-vfd-display-card
entity: sensor.energy_total
attribute: null

integer_digits: 10
decimals: 1
decimal_separator: "."
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
inactive_color: "rgba(32,245,107,0.055)"
show_mesh: true

tube_width: 64
tube_height: 124
tube_gap: 8

show_red_markers: true
marker_positions: [5, 8, 10]

animation: true
animation_duration: 190

fit_to_card: true
allow_upscale: false
max_fit_scale: 1
scale: 1

tap_action: more-info
```

`marker_positions` is one-based and includes the decimal point or comma cylinder.

## Static design preview

```yaml
type: custom:compet-vfd-display-card
value: 1234567890.5
integer_digits: 10
decimals: 1
leading_zeroes: true
label: COMPET 18 NUMERIC DISPLAY
```

## Main options

| Option | Default | Description |
|---|---:|---|
| `entity` | required* | Numeric Home Assistant entity |
| `attribute` | unset | Numeric attribute instead of the entity state |
| `value` | unset | Static value for design tests |
| `integer_digits` | `8` | Number of integer cylinders |
| `decimals` | `0` | Number of decimal cylinders |
| `decimal_separator` | `.` | `.` or `,` |
| `leading_zeroes` | `false` | Fill unused positions with zeroes |
| `reserve_sign_slot` | `false` | Always reserve a sign cylinder |
| `frame` | `gauge_black` | `gauge_black` or `none` |
| `screws` | `true` | Show four cross-head screws |
| `glow_color` | `#20f56b` | Active phosphor colour |
| `show_mesh` | `true` | Show internal honeycomb mesh |
| `show_red_markers` | `false` | Show selected red index markers |
| `fit_to_card` | `true` | Fit the complete instrument to its column |

`entity` is not required when `value` is configured.

## Accuracy

The segment geometry was reconstructed from angled photographs of the original display. It intentionally reproduces its narrow, curved and dotted appearance rather than using a modern seven-segment typeface.

## Licence

MIT. This project is not affiliated with or endorsed by SHARP Corporation.
