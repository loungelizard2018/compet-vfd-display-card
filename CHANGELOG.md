# Changelog

## 0.3.1

- Reconstructed the original SHARP COMPET 18 numeral geometry from the supplied photographic reference.
- Replaced smooth free-form glyph strokes with separately cut physical electrode segments.
- Added explicit phosphor dots sampled uniformly along each segment path.
- Preserved the previous smoother glyph set as `style: alternative`.
- Kept configurable `glow_color`, `phosphor_color`, `inactive_color` and `decimal_marker_color`.
- Rebuilt the decimal marker as a multi-facet physical component with highlight, wear marks and a contact shadow.
- Added original-versus-alternative comparison tooling and dedicated YAML examples.

## 0.3.0

- Added a newly reconstructed `original` COMPET 18 glyph set based on the supplied calculator display photograph.
- Kept the previous numeral geometry as optional `style: alternative`.
- Made `original` the default style when no style parameter is supplied.
- Retained configurable phosphor colour through `glow_color`; the default remains the original green.
- Reworked the external decimal marker with a more dimensional, faceted red plastic appearance.

## 0.2.1

- Added a versioned GitHub release intended for normal HACS installation instead of the default-branch commit.
- Fixed the COMPET icon in GitHub and the HACS README view by using the generated PNG asset.
- Added complete copy-paste and sensor YAML examples.
- Refreshed JavaScript module cache keys for reliable frontend updates.

## 0.2.0

- Replaced the generic seven-segment construction with individually drawn curved numeral paths based on the original COMPET 18 display.
- Removed the decimal point/comma glass cylinder.
- Added an automatic external red decimal marker between the integer and fractional tubes, matching the original calculator arrangement.
- Refined phosphor dots, support wire, tube glass and inactive structure.
- Split the card into HACS-compatible JavaScript modules.

## 0.1.0

- Initial HACS-ready implementation.
- Custom curved COMPET-style segment paths for digits `0–9`.
- Photorealistic phosphor glow, inactive segments, mesh and electrodes.
- Gauge-black housing with optional cross-head screws.
- Optional red position markers.
- Responsive fitting for Home Assistant layouts.
