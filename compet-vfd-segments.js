const fractions = (count, start = 0.04, end = 0.96) => Object.freeze(
  Array.from({ length: count }, (_, index) =>
    Number((start + (end - start) * (count === 1 ? 0.5 : index / (count - 1))).toFixed(6))
  )
);

const physicalSegment = ({
  id,
  name,
  path,
  width,
  dots,
  startInset = 1.0,
  endInset = 1.0,
  derivedFrom = null
}) => Object.freeze({
  id,
  name,
  path,
  d: path,
  width,
  startInset,
  endInset,
  linecap: "butt",
  dotFractions: fractions(dots),
  derivedFrom
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
 */
export const ORIGINAL_SEGMENTS = Object.freeze({
  A: physicalSegment({
    id: "A",
    name: "upper-left-return",
    path: "M32.6 25.8 C28.2 27.2 27.4 34.0 27.9 40.5 C28.4 49.4 25.9 59.2 40.8 66.7",
    width: 3.85,
    dots: 18,
    startInset: 1.15,
    endInset: 1.15
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
    path: "M48.2 17.4 C46.9 24.0 44.7 36.0 42.0 49.0",
    width: 3.90,
    dots: 13,
    startInset: 0.95,
    endInset: 1.00
  }),
  H: physicalSegment({
    id: "H",
    name: "one-lower-slash",
    path: "M40.3 66.0 C38.5 75.0 35.8 90.5 33.7 106.5",
    width: 3.90,
    dots: 15,
    startInset: 1.00,
    endInset: 0.95
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
