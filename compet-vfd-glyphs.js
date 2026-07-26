import {
  ORIGINAL_FIELD_SEGMENTS,
  ORIGINAL_SEGMENTS,
  ORIGINAL_DIGIT_SEGMENTS,
  originalSegmentsFor
} from "./compet-vfd-segments.js";

const segment = (id, d, width = 4.0, startInset = 1.0, endInset = 1.0) =>
  Object.freeze({ id, d, path: d, width, startInset, endInset, linecap: "round", dotFractions: null });

// Previous smoother glyph set retained verbatim for style: alternative.
const ALT = Object.freeze({
  "0": ["M29 19 C20 29 17 45 18 65 C18 87 22 104 31 111", "M31 111 C43 117 55 114 61 103 C66 91 66 75 64 61", "M64 61 C63 39 58 23 48 18 C41 14 34 15 29 19"],
  "1": ["M28 31 C34 25 39 21 44 18", "M44 18 C42 42 39 67 36 91 C35 100 34 107 33 113"],
  "2": ["M22 31 C27 20 37 16 48 17 C59 18 64 25 62 35", "M62 35 C60 48 49 58 38 69 C29 78 21 87 18 98", "M18 98 C28 103 43 107 59 108"],
  "3": ["M21 28 C29 19 40 16 51 18 C60 20 64 27 60 36", "M60 36 C56 45 48 51 39 58", "M39 58 C49 58 58 62 61 71 C65 82 60 97 50 105 C40 112 28 111 20 105"],
  "4": ["M53 17 C47 33 40 49 31 65 C27 72 23 78 19 84", "M19 84 C31 85 45 85 60 84", "M53 17 C52 43 51 69 50 112"],
  "5": ["M60 18 C48 18 36 18 25 20", "M25 20 C23 35 22 48 21 61", "M21 61 C31 56 43 56 52 61 C63 68 65 82 59 94 C52 108 35 114 20 106"],
  "6": ["M57 23 C49 16 37 17 29 24 C19 34 16 52 17 70", "M17 70 C18 92 26 107 39 111 C52 114 62 104 63 88 C64 73 56 63 44 61 C34 59 25 63 18 72"],
  "7": ["M20 20 C34 18 49 18 63 21", "M63 21 C55 39 47 57 42 76 C38 90 36 101 35 113"],
  "8": ["M40 16 C27 16 20 24 21 36 C22 48 30 56 40 60", "M40 60 C28 64 20 73 20 87 C20 102 29 111 41 112", "M41 112 C54 112 63 102 62 88 C61 75 53 66 40 60", "M40 60 C51 55 59 47 59 35 C59 23 52 16 40 16"],
  "9": ["M60 58 C54 65 45 68 35 65 C23 62 17 51 19 36 C21 21 31 15 43 17 C56 19 63 33 62 53", "M62 53 C61 78 57 98 47 108 C39 115 28 113 21 107"],
  "-": ["M25 65 C35 63 46 63 57 65"],
  " ": []
});

export const ALTERNATIVE_GLYPHS = Object.freeze(Object.fromEntries(
  Object.entries(ALT).map(([character, paths]) => [
    character,
    Object.freeze(paths.map((d, index) => segment(`alternative-${character}-${index + 1}`, d, 4.45, 0.3, 0.3)))
  ])
));

export const ALTERNATIVE_FIELD_SEGMENTS = Object.freeze([
  segment("alternative-field-top", "M23 18 C34 13 51 13 62 18", 4.2),
  segment("alternative-field-upper-right", "M63 22 C66 36 65 48 61 58", 4.2),
  segment("alternative-field-lower-right", "M60 72 C64 86 61 101 54 110", 4.2),
  segment("alternative-field-bottom", "M53 112 C42 116 29 116 18 111", 4.2),
  segment("alternative-field-lower-left", "M16 106 C12 91 13 79 17 68", 4.2),
  segment("alternative-field-upper-left", "M19 57 C15 44 16 31 22 21", 4.2),
  segment("alternative-field-middle", "M20 64 C31 60 49 60 60 64", 4.2)
]);

export { ORIGINAL_SEGMENTS, ORIGINAL_DIGIT_SEGMENTS, ORIGINAL_FIELD_SEGMENTS };

export function glyphSegments(style = "original", character = " ") {
  if (String(style).toLowerCase() === "alternative") {
    return ALTERNATIVE_GLYPHS[character] || ALTERNATIVE_GLYPHS[" "];
  }
  return originalSegmentsFor(character);
}

export function fieldSegments(style = "original") {
  return String(style).toLowerCase() === "alternative"
    ? ALTERNATIVE_FIELD_SEGMENTS
    : ORIGINAL_FIELD_SEGMENTS;
}
