const segment = (id, d, width = 4.0, startInset = 1.0, endInset = 1.0) =>
  Object.freeze({ id, d, width, startInset, endInset });

/**
 * SHARP COMPET 18 reference reconstruction.
 *
 * The original hardware did not draw a smooth font. Each numeral was made
 * from separately switched phosphor electrodes. The paths below therefore
 * describe independent physical segment centre-lines. Rendering uses flat,
 * cut ends and explicitly sampled phosphor dots rather than a dashed stroke.
 */
export const ORIGINAL_GLYPHS = Object.freeze({
  "0": Object.freeze([
    segment("0-upper-left", "M29 75 C23 77 19 83 18 90", 3.8),
    segment("0-lower-left", "M18 92 C18 100 25 105 34 107", 3.9),
    segment("0-bottom-right", "M36 107 C45 108 53 104 57 98", 3.9),
    segment("0-upper-right", "M58 96 C61 87 58 79 51 76", 3.8),
    segment("0-top", "M49 75 C42 72 35 72 30 74", 3.8)
  ]),

  "1": Object.freeze([
    segment("1-upper", "M45 18 C42 28 39 39 36 51", 3.7, 1.0, 1.2),
    segment("1-lower", "M32 66 C29 78 25 95 21 112", 3.7, 1.2, 1.0)
  ]),

  "2": Object.freeze([
    segment("2-top", "M22 24 C31 19 43 19 52 22", 3.9),
    segment("2-upper-right", "M54 23 C60 27 59 34 55 41", 3.9),
    segment("2-diagonal", "M53 43 C48 51 41 57 35 63", 3.9),
    segment("2-lower-left", "M33 65 C25 73 18 82 17 90", 3.9),
    segment("2-bottom", "M18 93 C25 100 42 101 56 96", 4.0)
  ]),

  "3": Object.freeze([
    segment("3-top", "M22 24 C31 19 43 19 52 22", 3.9),
    segment("3-upper-right", "M54 23 C60 27 59 35 54 42", 3.9),
    segment("3-waist-in", "M53 44 C49 51 44 55 38 59", 3.8),
    segment("3-waist-out", "M39 61 C49 59 56 63 58 72", 3.9),
    segment("3-lower-right", "M59 74 C61 85 54 97 44 103", 4.0),
    segment("3-bottom", "M42 104 C33 108 24 106 18 101", 4.0)
  ]),

  "4": Object.freeze([
    segment("4-upper-left", "M24 31 C21 42 20 52 22 59", 3.9),
    segment("4-bowl", "M23 61 C29 65 37 65 43 61", 3.9),
    segment("4-upper-stem", "M45 59 C47 47 49 34 50 21", 3.8),
    segment("4-crossbar", "M20 66 C31 66 43 65 55 64", 3.8),
    segment("4-lower-stem", "M43 71 C41 84 39 99 37 113", 3.8)
  ]),

  "5": Object.freeze([
    segment("5-top", "M56 22 C46 20 34 20 24 23", 3.9),
    segment("5-upper-left", "M23 25 C20 36 19 47 20 56", 3.9),
    segment("5-middle", "M21 58 C30 56 41 56 49 61", 3.9),
    segment("5-lower-right", "M51 62 C58 68 58 79 54 90", 4.0),
    segment("5-bottom", "M52 92 C46 103 32 108 19 103", 4.0)
  ]),

  "6": Object.freeze([
    segment("6-upper-hook", "M52 27 C49 37 43 47 36 55", 3.8),
    segment("6-upper-entry", "M34 58 C27 63 20 72 18 82", 3.9),
    segment("6-lower-left", "M18 84 C17 95 24 103 34 106", 4.0),
    segment("6-bottom", "M36 106 C46 107 54 101 57 93", 4.0),
    segment("6-lower-right", "M58 91 C60 80 55 70 47 65", 4.0),
    segment("6-loop-close", "M45 64 C37 60 29 64 22 72", 3.9)
  ]),

  "7": Object.freeze([
    segment("7-top", "M22 24 C31 19 43 19 52 22", 3.9),
    segment("7-upper-right", "M54 23 C60 27 59 34 55 41", 3.9),
    segment("7-diagonal", "M53 43 C48 51 42 57 38 62", 3.8),
    segment("7-lower", "M32 69 C29 82 25 97 21 112", 3.8)
  ]),

  "8": Object.freeze([
    segment("8-upper-left-a", "M39 20 C30 20 23 25 21 34", 3.8),
    segment("8-upper-left-b", "M21 36 C20 46 27 54 38 59", 3.9),
    segment("8-upper-right-a", "M41 20 C51 20 57 26 58 35", 3.8),
    segment("8-upper-right-b", "M58 37 C57 47 51 55 41 59", 3.9),
    segment("8-lower-left-a", "M38 63 C27 66 21 75 21 86", 4.0),
    segment("8-lower-left-b", "M21 88 C22 100 29 108 39 109", 4.0),
    segment("8-lower-right-a", "M42 109 C52 108 59 100 59 88", 4.0),
    segment("8-lower-right-b", "M59 86 C58 75 52 66 42 63", 4.0)
  ]),

  "9": Object.freeze([
    segment("9-upper-left-a", "M39 22 C29 22 22 28 21 38", 3.9),
    segment("9-upper-left-b", "M21 40 C21 51 28 59 38 63", 3.9),
    segment("9-upper-right-a", "M41 22 C51 22 57 29 58 39", 3.9),
    segment("9-upper-right-b", "M58 41 C57 52 51 59 41 63", 3.9),
    segment("9-loop-close", "M38 64 C31 62 26 58 23 52", 3.8),
    segment("9-lower", "M45 70 C42 84 38 99 35 113", 3.8)
  ]),

  "-": Object.freeze([
    segment("minus", "M24 65 C34 64 46 64 56 65", 3.8)
  ]),
  " ": Object.freeze([])
});

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

/** Faint electrode field visible when a tube is not lit. */
export const ORIGINAL_FIELD_SEGMENTS = Object.freeze([
  segment("field-top-left", "M22 24 C31 19 43 19 52 22", 3.4),
  segment("field-upper-right", "M54 23 C60 28 58 38 52 47", 3.4),
  segment("field-upper-left", "M24 31 C20 43 20 53 23 61", 3.4),
  segment("field-middle", "M21 63 C31 65 43 64 55 62", 3.4),
  segment("field-lower-left", "M31 66 C23 74 18 84 19 94", 3.4),
  segment("field-lower-right", "M47 65 C57 71 60 82 56 93", 3.4),
  segment("field-bottom", "M20 101 C31 108 45 108 56 99", 3.4),
  segment("field-centre-upper", "M49 20 C47 34 44 48 41 60", 3.4),
  segment("field-centre-lower", "M42 69 C40 84 37 99 34 113", 3.4)
]);

export const ALTERNATIVE_FIELD_SEGMENTS = Object.freeze([
  segment("alternative-field-top", "M23 18 C34 13 51 13 62 18", 4.2),
  segment("alternative-field-upper-right", "M63 22 C66 36 65 48 61 58", 4.2),
  segment("alternative-field-lower-right", "M60 72 C64 86 61 101 54 110", 4.2),
  segment("alternative-field-bottom", "M53 112 C42 116 29 116 18 111", 4.2),
  segment("alternative-field-lower-left", "M16 106 C12 91 13 79 17 68", 4.2),
  segment("alternative-field-upper-left", "M19 57 C15 44 16 31 22 21", 4.2),
  segment("alternative-field-middle", "M20 64 C31 60 49 60 60 64", 4.2)
]);

export function glyphSegments(style = "original", character = " ") {
  const source = String(style).toLowerCase() === "alternative"
    ? ALTERNATIVE_GLYPHS
    : ORIGINAL_GLYPHS;
  return source[character] || source[" "];
}

export function fieldSegments(style = "original") {
  return String(style).toLowerCase() === "alternative"
    ? ALTERNATIVE_FIELD_SEGMENTS
    : ORIGINAL_FIELD_SEGMENTS;
}
