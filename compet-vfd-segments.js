const fractions = (count, start = 0.04, end = 0.96) => Object.freeze(
  Array.from({ length: count }, (_, index) =>
    Number((start + (end - start) * (count === 1 ? 0.5 : index / (count - 1))).toFixed(6))
  )
);

const physicalSegment = ({
  id,
  name,
  path,
  guidePath = path,
  shape = null,
  width,
  dots,
  startInset = 1.0,
  endInset = 1.0,
  derivedFrom = null,
  maskSource = null
}) => Object.freeze({
  id,
  name,
  path,
  d: guidePath,
  guidePath,
  shape,
  width,
  startInset,
  endInset,
  linecap: "butt",
  dotFractions: fractions(dots),
  derivedFrom,
  maskSource
});

/**
 * Canonical SHARP COMPET 18 electrode set reconstructed from the supplied
 * calculator photographs. Each segment exists exactly once and is reused by
 * object identity in every numeral that lights it.
 *
 * Coordinate system: SVG viewBox 0 0 80 132.
 *
 * D is the fixed 180-degree counterpart of C around the cell centre (40, 66).
 * E is the fixed 180-degree counterpart of B around the same centre.
 * These are final stored paths; no runtime transform is used.
 *
 * A, G and H are shaped from their canonical 24x40 dot masks. Their guide
 * paths drive the phosphor dots while the closed shape supplies the angular
 * or tapered physical electrode body.
 */
export const ORIGINAL_SEGMENTS = Object.freeze({
  A: physicalSegment({
    id: "A",
    name: "upper-left-return",
    path: "M33.8 25.5 L30.3 59.2 L41.5 65.0",
    guidePath: "M33.8 25.5 L30.3 59.2 L41.5 65.0",
    shape: "M30.5 23.8 L36.5 25.0 L33.2 56.8 L44.5 62.5 L41.5 69.1 L26.8 61.6 L27.0 56.8 Z",
    width: 4.05,
    dots: 18,
    startInset: 1.05,
    endInset: 1.05,
    maskSource: "A@24x40"
  }),
  B: physicalSegment({
    id: "B",
    name: "upper-roof",
    path: "M30.0 23.7 C35.7 17.2 47.7 16.7 59.8 19.6",
    width: 3.85,
    dots: 13,
    startInset: 1.05,
    endInset: 1.05
  }),
  C: physicalSegment({
    id: "C",
    name: "upper-right-hook",
    path: "M62.4 25.2 C64.0 31.0 61.3 38.1 56.6 44.4 C52.5 50.0 48.7 56.5 46.0 64.7",
    width: 3.85,
    dots: 18,
    startInset: 1.10,
    endInset: 1.20
  }),
  D: physicalSegment({
    id: "D",
    name: "lower-left-sweep",
    path: "M34.0 67.3 C31.3 75.5 27.5 82.0 23.4 87.6 C18.7 93.9 16.0 101.0 17.6 106.8",
    width: 3.85,
    dots: 18,
    startInset: 1.20,
    endInset: 1.10,
    derivedFrom: "C@rotate180(40,66)"
  }),
  E: physicalSegment({
    id: "E",
    name: "lower-base",
    path: "M20.2 112.4 C32.3 115.3 44.3 114.8 50.0 108.3",
    width: 3.85,
    dots: 13,
    startInset: 1.05,
    endInset: 1.05,
    derivedFrom: "B@rotate180(40,66)"
  }),
  F: physicalSegment({
    id: "F",
    name: "lower-right-return",
    path: "M41.6 69.9 C48.3 72.5 52.0 79.2 50.7 85.8 C49.9 90.8 49.0 94.9 47.5 97.9",
    width: 3.90,
    dots: 13,
    startInset: 1.15,
    endInset: 1.10
  }),
  G: physicalSegment({
    id: "G",
    name: "one-upper-slash",
    path: "M48.7 17.5 L45.6 20.4 L43.4 49.0",
    guidePath: "M48.7 17.5 L45.6 20.4 L43.4 49.0",
    shape: "M49.6 14.9 L43.8 17.7 L42.4 22.1 L45.2 21.4 L39.4 48.8 L47.0 50.3 L52.1 17.8 Z",
    width: 4.15,
    dots: 13,
    startInset: 0.75,
    endInset: 0.80,
    maskSource: "G@24x40"
  }),
  H: physicalSegment({
    id: "H",
    name: "one-lower-slash",
    path: "M42.4 55.0 L34.2 106.0",
    guidePath: "M42.4 55.0 L34.2 106.0",
    shape: "M40.8 52.8 L45.7 55.1 L39.2 104.8 L29.8 108.2 L35.7 58.7 Z",
    width: 4.25,
    dots: 15,
    startInset: 0.80,
    endInset: 0.75,
    maskSource: "H@24x40"
  })
});

export const ORIGINAL_DIGIT_SEGMENTS = Object.freeze({
  "0": Object.freeze(["D", "E", "F"]),
  "1": Object.freeze(["G", "H"]),
  "2": Object.freeze(["B", "C", "D", "E"]),
  "3": Object.freeze(["B", "C", "E", "F"]),
  "4": Object.freeze(["A", "G", "H"]),
  "5": Object.freeze(["A", "B", "E", "F"]),
  "6": Object.freeze(["C", "D", "E", "F"]),
  "7": Object.freeze(["B", "C", "H"]),
  "8": Object.freeze(["A", "B", "C", "D", "E", "F"]),
  "9": Object.freeze(["A", "B", "C", "H"])
});

export const ORIGINAL_FIELD_SEGMENTS = Object.freeze(Object.values(ORIGINAL_SEGMENTS));

export function originalSegmentsFor(character) {
  const ids = ORIGINAL_DIGIT_SEGMENTS[String(character)] || [];
  return Object.freeze(ids.map((id) => ORIGINAL_SEGMENTS[id]));
}
