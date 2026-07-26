const fractions = (count, start = 0.04, end = 0.96) => Object.freeze(
  Array.from({ length: count }, (_, index) =>
    Number((start + (end - start) * (count === 1 ? 0.5 : index / (count - 1))).toFixed(6))
  )
);

const physicalSegment = ({ id, name, path, width, dots, startInset = 1.0, endInset = 1.0 }) => Object.freeze({
  id,
  name,
  path,
  d: path,
  width,
  startInset,
  endInset,
  linecap: "butt",
  dotFractions: fractions(dots)
});

/**
 * Canonical SHARP COMPET 18 electrode set reconstructed from the supplied
 * calculator photograph. Each segment exists exactly once and is reused by
 * object identity in every numeral that lights it.
 *
 * Coordinate system: SVG viewBox 0 0 80 132.
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
    path: "M34.3 69.6 C31.2 75.4 24.4 83.6 18.4 93.6",
    width: 3.90,
    dots: 12,
    startInset: 1.15,
    endInset: 1.15
  }),
  E: physicalSegment({
    id: "E",
    name: "lower-base",
    path: "M12.0 101.3 C18.3 111.8 35.2 114.7 50.1 100.6",
    width: 3.95,
    dots: 18,
    startInset: 1.10,
    endInset: 1.10
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
    path: "M47.5 16.0 C45.9 26.7 42.6 43.7 39.0 61.7",
    width: 3.75,
    dots: 19,
    startInset: 1.10,
    endInset: 1.20
  }),
  H: physicalSegment({
    id: "H",
    name: "one-lower-slash",
    path: "M35.6 75.8 C33.9 87.6 31.2 101.7 28.4 114.0",
    width: 3.75,
    dots: 16,
    startInset: 1.15,
    endInset: 1.10
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
