# Changelog

## 0.5.4

- Added a clearly visible nine-dot diagonal phosphor junction between shared electrodes F and E.
- Applied the junction only to digits 3, 5, 6 and 8, preserving the canonical shared-electrode model.
- Kept the self-contained HACS bundle and modular renderer visually consistent.
- Added regression tests that verify the bridge is rendered and versioned in both implementations.

## 0.5.3

- Reduced and left-shifted the original glyph safe area so active electrodes and glow stay inside the right tube border.
- Closed the lower-right `F` electrode flush against shared lower bowl `E` in digits 3, 5, 6 and 8 without overlapping cells.
- Added a perspective-corrected original COMPET 18 reference image to the documentation.
- Added current implementation, original-versus-implementation and shared-segment atlas renderings.

## 0.5.3

- Reduced and left-shifted the original glyph safe area so active electrodes and glow stay inside the right tube border.
- Closed the lower-right `F` electrode flush against shared lower bowl `E` in digits 3, 5, 6 and 8 without overlapping cells.
- Added a perspective-corrected original COMPET 18 reference image to the documentation.
- Added current implementation, original-versus-implementation and shared-segment atlas renderings.

## 0.5.3

- Reduced and left-shifted the original glyph safe area so active electrodes and glow stay inside the right tube border.
- Closed the lower-right `F` electrode flush against shared lower bowl `E` in digits 3, 5, 6 and 8 without overlapping cells.
- Added a perspective-corrected original COMPET 18 reference image to the documentation.
- Added current implementation, original-versus-implementation and shared-segment atlas renderings.

## 0.5.2

- Fit the complete original phosphor matrix into a fixed inner-tube safe area.
- Added an SVG clip path so active phosphor and glow cannot cross the glass boundary.
- Removed the isolated upper-left remnant from shared lower segment E in 3, 5 and 8.
- Raised shared L-segment A and separated it from lower slash H in digit 4.
- Added focused geometry regression tests.

## 0.5.1

- Redrew only the shared lower-right electrode `F`.
- Removed its broad overlap with shared lower-base electrode `E`.
- Added a stable dark cell gap at edge and active phosphor levels.
- Verified unchanged reuse in digits `3`, `5`, `6` and `8`.

## 0.5.0

- Retraced all eight shared COMPET electrodes directly from the perspective-corrected reference digits instead of enlarging the previous coarse masks.
- Increased the photographic matrix from 48x80 to 72x120 cells.
- Increased phosphor precision from four to seven intensity levels.
- Reduced individual dot size and separated edge glow, active phosphor and bright cores more accurately.
- Preserved the canonical shared segment matrix and the optional `style: alternative`.
- Added updated mask and registration tests for the precision renderer.

## 0.4.2

- Fixed the photographic `F` electrode mask length from 3888 to the required 3840 cells.
- Prevented the bundle from throwing before `customElements.define()`.
- Added a runtime registration smoke test for the self-contained HACS bundle.

## 0.4.1

- Replaced the HACS entry point with a fully self-contained JavaScript bundle.
- Removed all runtime `import` dependencies from `compet-vfd-display-card.js`.
- Fixed `Custom element doesn't exist: compet-vfd-display-card` when HACS installed only the configured entry file.
- Preserved the 48×80 four-level COMPET electrode matrices and the optional `alternative` glyph style.

## 0.4.0

- Rebuilt the default `original` glyph set from perspective-corrected photographs of the SHARP COMPET 18 display.
- Replaced guessed Bézier numerals with one canonical eight-electrode system shared by all digits.
- Added 48×80 photographic masks with four phosphor levels: off, weak glow, active phosphor and bright core.
- Preserved the exact segment matrix: `0=DEF`, `1=GH`, `2=BCDE`, `3=BCEF`, `4=AGH`, `5=ABEF`, `6=CDEF`, `7=BCH`, `8=ABCDEF`, `9=ABCH`.
- Kept the previous smooth glyphs unchanged as `style: alternative`.
- Added the fine dot-matrix editor and reference-overlay tooling.
- Retained configurable glow, phosphor, inactive-segment and decimal-marker colours.

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
