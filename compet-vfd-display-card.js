/**
 * COMPET VFD Display Card for Home Assistant
 * Version 0.5.2 - corrected tube fit and shared electrode geometry
 *
 * No external imports are required. This is intentional: HACS dashboard
 * resources may install only the configured entry file.
 */
(() => {
  "use strict";

  const VERSION = "0.5.2";
  const SVG_NS = "http://www.w3.org/2000/svg";
  const MATRIX_COLS = 72;
  const MATRIX_ROWS = 120;

  const DIGIT_SEGMENTS = Object.freeze({
    "0": Object.freeze(["D", "E", "F"]),
    "1": Object.freeze(["G", "H"]),
    "2": Object.freeze(["B", "C", "D", "E"]),
    "3": Object.freeze(["B", "C", "E", "F"]),
    "4": Object.freeze(["A", "G", "H"]),
    "5": Object.freeze(["A", "B", "E", "F"]),
    "6": Object.freeze(["C", "D", "E", "F"]),
    "7": Object.freeze(["B", "C", "H"]),
    "8": Object.freeze(["A", "B", "C", "D", "E", "F"]),
    "9": Object.freeze(["A", "B", "C", "H"]),
  });

  // Perspective-corrected COMPET 18 electrode masks.
  // Values: 0=off, 1-2=edge glow, 3-4=active phosphor, 5-6=bright core.
  const RLE_MASKS = Object.freeze({
    A: "10z0.31.1w0.11.23.12.1w0.12.13.14.13.11.1u0.11.13.35.14.12.1s0.11.12.14.45.14.12.11.1q0.11.13.65.14.13.11.1p0.11.13.15.46.25.14.11.1p0.12.14.15.56.15.14.11.1o0.11.14.15.56.25.14.11.1o0.11.14.15.56.15.24.11.1o0.11.14.76.14.13.1p0.12.15.36.15.26.15.14.11.1p0.13.15.36.45.14.11.1o0.11.14.15.36.45.13.1p0.11.14.15.46.25.14.12.1p0.12.14.46.25.14.13.11.1p0.13.25.36.25.14.12.1q0.13.25.36.25.14.12.1q0.14.15.56.15.13.11.1p0.12.14.66.15.12.1q0.13.25.46.25.12.1q0.13.25.36.25.14.12.1q0.13.15.56.15.14.11.1q0.13.15.66.14.1q0.11.14.25.36.25.14.1q0.11.14.25.26.35.14.11.1p0.11.14.16.15.26.35.13.1q0.11.14.56.25.12.1q0.12.25.46.15.14.11.1q0.13.35.26.25.14.11.1q0.12.15.56.15.14.11.1q0.12.15.56.15.14.12.1q0.12.15.56.25.13.11.1p0.12.25.36.45.14.12.11.1o0.13.25.26.25.26.25.34.1m0.12.14.15.a6.15.1n0.11.13.14.a6.1o0.11.13.25.76.1q0.11.14.55.26.1s0.11.23.34.25.1w0.21.12.3ew0",
    B: "j90.51.1s0.11.13.84.43.42.21.1d0.11.12.13.14.25.76.15.16.75.24.13.42.21.140.11.13.25.m6.45.34.12.100.11.12.14.15.26.75.36.15.d6.55.14.y0.11.13.14.25.46.25.14.93.34.45.46.35.16.15.14.y0.13.25.66.25.13.11.b0.11.32.43.64.y0.13.15.66.24.13.11.k0.41.22.x0.11.13.15.46.15.14.12.11.1p0.11.14.15.46.14.12.1r0.11.14.25.26.15.14.11.1s0.13.14.35.14.12.1t0.11.43.11.1v0.11.12.11.1x0.21.5cz0",
    C: "1hz0.12.1y0.11.12.1y0.11.12.1x0.12.13.14.1w0.11.13.14.15.1w0.11.13.15.16.1x0.12.14.16.1w0.12.14.25.1v0.11.14.15.26.1v0.12.14.36.1v0.12.14.36.1t0.11.12.14.15.36.1t0.12.14.35.26.1s0.11.13.14.35.26.1q0.11.10.11.13.15.56.1p0.11.22.14.25.46.14.1p0.22.13.15.56.15.13.1p0.11.12.14.56.15.14.11.1p0.12.13.15.46.15.14.12.1p0.11.14.15.46.14.13.11.1p0.11.14.15.46.15.14.11.1q0.12.15.56.15.13.1q0.11.13.15.46.15.14.11.1p0.11.13.35.16.15.14.13.12.1p0.11.14.15.16.25.16.15.14.11.1p0.11.13.15.36.25.14.12.1q0.13.15.46.15.13.11.1p0.11.12.15.46.15.14.11.1p0.11.12.14.46.15.14.13.1q0.12.13.14.36.15.14.13.12.11.1o0.12.24.25.16.15.14.32.1o0.12.15.16.15.16.15.14.13.11.1r0.13.45.14.12.1t0.12.35.14.12.11.1u0.12.13.12.11.3ah0",
    D: "3j20.11.32.1u0.11.13.14.15.24.13.1s0.13.14.15.26.25.14.11.1p0.11.12.14.15.36.25.14.11.1n0.11.13.14.15.56.15.14.12.1n0.11.13.25.56.15.13.12.1n0.11.13.35.36.25.13.11.1o0.12.14.15.56.15.14.12.1n0.11.13.14.15.56.15.14.12.1n0.11.14.15.66.14.13.1o0.12.13.15.66.15.13.11.1n0.11.13.14.56.25.14.11.1n0.12.14.15.66.15.14.12.1n0.11.14.25.46.15.14.13.11.1o0.13.25.46.15.14.12.1p0.12.14.56.25.13.11.1n0.11.13.15.56.25.13.11.1n0.11.14.25.56.14.13.1p0.13.25.36.35.13.11.1o0.12.14.56.25.14.11.1o0.13.14.15.56.15.14.12.1o0.13.15.36.25.26.15.13.1p0.14.15.36.55.12.1p0.14.15.46.35.13.11.1p0.13.15.36.15.14.13.12.11.1q0.13.14.35.14.13.11.1r0.12.43.22.11.1s0.13.34.13.12.11.1u0.14.35.14.13.11.1t0.11.42.11.1jf0",
    E: "50b0.11.23.44.13.12.11.1p0.12.14.15.26.45.14.13.11.1n0.11.13.25.36.45.14.11.z0.21.m0.11.15.86.15.13.11.v0.11.52.11.l0.12.15.76.15.14.11.v0.12.24.35.14.12.l0.13.15.76.14.12.v0.11.14.25.36.15.14.11.j0.11.13.25.56.15.13.11.v0.13.35.46.15.12.k0.12.25.56.15.13.11.u0.11.13.15.66.14.11.k0.11.14.15.56.15.13.11.t0.11.13.15.56.15.14.12.m0.14.15.66.14.13.s0.12.14.15.56.15.14.12.n0.13.15.76.15.13.11.p0.11.13.25.36.35.12.o0.12.14.76.25.14.23.12.11.k0.12.13.15.56.25.14.12.11.o0.12.14.15.56.45.24.33.32.11.c0.11.13.14.15.56.15.14.13.22.11.p0.11.13.15.86.55.34.13.42.11.50.12.13.14.15.66.15.13.12.u0.11.14.25.56.25.66.25.54.53.14.15.66.25.14.11.w0.11.13.24.65.26.25.26.25.16.a5.76.15.14.11.100.21.32.13.24.75.16.35.56.25.56.15.14.13.11.170.31.22.43.24.35.46.35.26.25.13.11.1j0.11.32.13.24.45.14.23.12.1q0.21.22.13.12.11.kr0",
    F: "3le0.23.1y0.14.16.13.20.31.1s0.14.16.15.33.22.11.1q0.11.14.26.25.24.13.12.11.1p0.12.14.46.25.14.13.12.11.1o0.12.13.15.56.15.14.13.12.11.1o0.12.14.15.56.15.14.13.11.1o0.11.13.14.15.46.15.14.13.12.11.1o0.12.13.14.15.46.15.14.13.12.11.1n0.11.12.13.14.15.46.15.14.13.11.1n0.21.13.14.15.46.15.14.13.12.11.1n0.11.12.13.14.15.46.15.14.13.12.1o0.11.12.13.14.15.36.15.14.13.12.11.1o0.11.13.14.15.46.15.14.13.11.1o0.11.12.13.14.15.36.15.14.13.12.11.1o0.11.12.13.15.46.15.14.12.11.1o0.11.12.13.14.15.36.15.14.13.12.11.1o0.11.12.14.15.46.15.13.12.11.1o0.11.12.13.14.15.36.15.14.13.12.1p0.11.13.14.15.36.15.14.13.12.11.1o0.11.12.13.14.46.15.13.12.11.1p0.12.13.14.15.36.15.13.12.11.1p0.12.13.14.15.36.15.14.12.11.1p0.11.13.14.15.36.15.14.13.11.1p0.11.12.14.15.36.15.14.13.12.1p0.11.12.13.15.36.15.14.13.12.1p0.11.12.13.15.46.14.13.12.11.1q0.13.14.46.14.13.12.11.1r0.14.15.26.15.14.13.11.1s0.14.15.26.15.14.12.11.1t0.15.26.15.13.12.1u0.15.26.15.13.11.1u0.15.16.15.14.12.11.1u0.26.14.12.1w0.16.15.12.1w0.14.16.13.1x0.23.1290",
    G: "dl0.11.52.11.1r0.11.13.14.35.34.13.12.11.1n0.11.13.45.16.45.14.13.1m0.12.14.15.96.15.13.1l0.13.14.15.36.15.76.14.11.1j0.12.14.25.26.35.66.15.12.1j0.11.13.25.36.25.16.25.26.25.12.1k0.11.13.15.a6.15.13.1m0.11.13.15.86.15.13.11.1m0.11.13.14.16.25.56.14.11.1n0.11.13.15.16.25.36.25.13.1o0.11.14.15.66.15.14.12.1o0.13.15.76.15.13.1o0.13.15.36.15.46.14.12.1o0.13.15.36.25.26.15.14.1p0.14.46.15.36.15.12.1o0.12.14.76.15.13.11.1n0.11.13.25.36.35.14.11.1p0.13.25.26.25.24.13.11.1o0.11.13.15.46.25.14.12.11.1n0.12.14.25.46.25.13.11.1n0.11.14.15.16.25.26.35.13.11.1n0.13.15.36.15.26.35.13.11.1n0.13.15.66.25.14.12.11.1m0.12.14.76.15.14.12.1n0.11.13.15.56.25.13.11.1o0.11.14.15.46.25.14.11.1p0.11.14.56.25.13.1q0.12.14.66.14.12.1p0.11.13.35.36.15.14.12.1o0.11.13.14.25.46.15.14.11.1o0.11.13.14.66.15.13.1p0.11.13.15.66.14.12.1p0.12.14.15.56.15.13.1q0.12.14.35.36.15.13.1q0.11.14.15.56.14.11.1q0.11.14.15.46.14.12.1r0.12.14.45.16.14.11.1r0.12.14.55.13.1s0.11.13.14.35.14.12.1u0.12.34.13.11.1v0.11.12.11.40m0",
    H: "3570.11.22.11.1v0.11.13.24.13.1v0.12.14.25.13.1u0.11.14.35.13.1t0.11.12.45.13.1t0.11.13.45.13.1t0.11.13.25.16.15.12.1s0.11.12.14.25.16.14.12.1s0.13.14.45.14.11.1r0.11.13.55.13.11.1r0.12.14.15.16.25.14.12.1r0.11.14.15.36.15.13.1s0.13.35.26.15.13.1r0.11.13.35.16.25.13.1r0.11.14.15.36.15.14.12.1r0.12.14.36.15.14.13.1r0.12.14.35.16.15.14.12.1r0.13.15.16.45.14.12.1r0.14.15.46.15.13.11.1q0.12.14.56.14.11.1r0.13.15.56.14.1r0.12.14.15.26.25.16.14.1r0.12.15.66.14.1q0.11.13.15.66.13.1q0.12.14.25.46.15.13.1p0.11.12.35.36.25.12.1p0.11.13.15.56.15.14.11.1p0.12.14.66.15.13.1p0.12.14.76.15.12.1p0.12.15.36.15.36.15.12.1p0.13.15.66.25.12.1o0.11.14.76.15.14.11.1o0.12.25.66.15.13.1p0.13.25.36.45.13.1p0.12.14.15.26.45.14.12.1q0.12.13.54.13.12.1t0.21.22.11.1iz0",
  });

  function decodeMask(encoded) {
    const values = [];
    for (const token of encoded.split(".")) {
      const value = Number(token.slice(-1));
      const count = Number.parseInt(token.slice(0, -1), 36);
      if (!Number.isFinite(count) || count < 1 || value < 0 || value > 6) {
        throw new Error(`COMPET VFD: invalid mask token "${token}"`);
      }
      values.push(...Array(count).fill(value));
    }
    if (values.length !== MATRIX_COLS * MATRIX_ROWS) {
      throw new Error(`COMPET VFD: invalid mask length ${values.length}`);
    }
    return Object.freeze(
      Array.from({ length: MATRIX_ROWS }, (_, row) =>
        Object.freeze(values.slice(row * MATRIX_COLS, (row + 1) * MATRIX_COLS))
      )
    );
  }

  const SEGMENT_MASKS = Object.freeze(
    Object.fromEntries(Object.entries(RLE_MASKS).map(([id, encoded]) => [id, decodeMask(encoded)]))
  );

  const activeCellsForSegment = (id, minimumLevel = 1) => {
    const mask = SEGMENT_MASKS[id];
    if (!mask) return [];
    const result = [];
    mask.forEach((row, r) =>
      row.forEach((level, c) => {
        if (level >= minimumLevel) result.push({ row: r, col: c, level, id });
      })
    );
    return result;
  };

  const GLYPH_SAFE_AREA = Object.freeze({ x: 10, y: 11, width: 60, height: 110 });

  const maskCoordinate = (row, col) => ({
    x: GLYPH_SAFE_AREA.x + ((col + 0.5) * GLYPH_SAFE_AREA.width) / MATRIX_COLS,
    y: GLYPH_SAFE_AREA.y + ((row + 0.5) * GLYPH_SAFE_AREA.height) / MATRIX_ROWS,
  });

  const originalGhostField = () => {
    const seen = new Map();
    for (const id of Object.keys(SEGMENT_MASKS)) {
      for (const cell of activeCellsForSegment(id)) {
        const key = `${cell.row}:${cell.col}`;
        const current = seen.get(key);
        if (!current || cell.level > current.level) seen.set(key, cell);
      }
    }
    return [...seen.values()]
      .map((cell) => {
        const p = maskCoordinate(cell.row, cell.col);
        const radius = 0.08 + cell.level * 0.024;
        const opacity = 0.10 + cell.level * 0.045;
        return `<circle class="mask-ghost" cx="${p.x.toFixed(3)}" cy="${p.y.toFixed(3)}" r="${radius.toFixed(3)}" opacity="${opacity.toFixed(2)}" data-segment-id="${cell.id}"/>`;
      })
      .join("");
  };

  const originalActiveGlyph = (character, filterId) => {
    const cells = new Map();
    for (const id of DIGIT_SEGMENTS[String(character)] || []) {
      for (const cell of activeCellsForSegment(id)) {
        const key = `${cell.row}:${cell.col}`;
        const current = cells.get(key);
        if (!current || cell.level > current.level) cells.set(key, cell);
      }
    }
    return [...cells.values()]
      .map((cell, index) => {
        const p = maskCoordinate(cell.row, cell.col);
        const glowRadius = 0.20 + cell.level * 0.075;
        const dotRadius = 0.08 + cell.level * 0.043;
        const opacity = Math.min(0.96, 0.24 + cell.level * 0.12);
        const coreOpacity = Math.min(1, 0.30 + cell.level * 0.105 + (index % 5) * 0.006);
        return `<g class="mask-cell level-${cell.level}" data-segment-id="${cell.id}">
          <circle class="mask-glow" cx="${p.x.toFixed(3)}" cy="${p.y.toFixed(3)}" r="${glowRadius.toFixed(3)}" opacity="${opacity.toFixed(2)}" filter="url(#${filterId}-glow)"/>
          <circle class="mask-dot" cx="${p.x.toFixed(3)}" cy="${p.y.toFixed(3)}" r="${dotRadius.toFixed(3)}" opacity="${coreOpacity.toFixed(2)}"/>
        </g>`;
      })
      .join("");
  };

  const altSegment = (id, d, width = 4.45, startInset = 0.3, endInset = 0.3) =>
    Object.freeze({ id, d, width, startInset, endInset });

  const ALT_PATHS = Object.freeze({
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
    " ": [],
  });

  const ALT_GLYPHS = Object.freeze(
    Object.fromEntries(
      Object.entries(ALT_PATHS).map(([character, paths]) => [
        character,
        Object.freeze(paths.map((d, index) => altSegment(`alternative-${character}-${index + 1}`, d))),
      ])
    )
  );

  const ALT_FIELD = Object.freeze([
    altSegment("alternative-field-top", "M23 18 C34 13 51 13 62 18", 4.2),
    altSegment("alternative-field-upper-right", "M63 22 C66 36 65 48 61 58", 4.2),
    altSegment("alternative-field-lower-right", "M60 72 C64 86 61 101 54 110", 4.2),
    altSegment("alternative-field-bottom", "M53 112 C42 116 29 116 18 111", 4.2),
    altSegment("alternative-field-lower-left", "M16 106 C12 91 13 79 17 68", 4.2),
    altSegment("alternative-field-upper-left", "M19 57 C15 44 16 31 22 21", 4.2),
    altSegment("alternative-field-middle", "M20 64 C31 60 49 60 60 64", 4.2),
  ]);

  class CompetVfdDisplayCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._config = null;
      this._hass = null;
      this._last = [];
      this._observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => this._fit()) : null;
    }

    static getStubConfig() {
      return { type: "custom:compet-vfd-display-card", entity: "sensor.example_value", integer_digits: 8, decimals: 1, style: "original", label: "COMPET DISPLAY", unit: "", screws: true };
    }

    setConfig(config) {
      if (!config || (!config.entity && config.value === undefined)) throw new Error("COMPET VFD Display Card: configure 'entity' or 'value'.");
      const requestedStyle = String(config.style ?? config.glyph_style ?? "original").toLowerCase();
      if (!["original", "alternative"].includes(requestedStyle)) throw new Error("style must be 'original' or 'alternative'.");
      this._config = {
        entity: null, attribute: null, value: undefined, integer_digits: 8, decimals: 0, leading_zeroes: false,
        reserve_sign_slot: false, style: "original", label: "COMPET DISPLAY", unit: "", show_label: true,
        show_unit: true, frame: "gauge_black", screws: true, screw_size: 28, transparent_card: true,
        glow_color: "#20f56b", phosphor_color: "#d8ffe3", inactive_color: "rgba(32,245,107,.035)",
        show_mesh: true, tube_width: 58, tube_height: 112, tube_gap: 8, decimal_marker: true,
        decimal_marker_color: "#d9362e", show_red_markers: false, marker_positions: [], animation: true,
        animation_duration: 190, fit_to_card: true, allow_upscale: false, max_fit_scale: 1, scale: 1,
        tap_action: "more-info", ...config, style: requestedStyle,
        integer_digits: this._int(config.integer_digits, 1, 24, 8), decimals: this._int(config.decimals, 0, 8, 0),
        screw_size: this._num(config.screw_size, 12, 56, 28), tube_width: this._num(config.tube_width, 38, 90, 58),
        tube_height: this._num(config.tube_height, 78, 170, 112), tube_gap: this._num(config.tube_gap, 1, 24, 8),
        scale: this._num(config.scale, 0.35, 2.5, 1), max_fit_scale: this._num(config.max_fit_scale, 0.25, 2.5, 1),
      };
      this._render();
    }

    set hass(hass) { this._hass = hass; if (!this._config) return; if (!this._stage) this._render(); else this._update(); }
    connectedCallback() { requestAnimationFrame(() => this._fit()); }
    disconnectedCallback() { this._observer?.disconnect(); }
    getCardSize() { return 2; }
    _int(value, min, max, fallback) { const n = Number.parseInt(value, 10); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback; }
    _num(value, min, max, fallback) { const n = Number(value); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback; }
    _esc(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
    _color(value, fallback) { const s = String(value ?? "").trim(); return /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]{3,24}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%deg]+\)|var\(--[-\w]+\))$/.test(s) ? s : fallback; }
    _raw() { if (this._config.value !== undefined) return this._config.value; const state = this._hass?.states?.[this._config.entity]; return this._config.attribute ? state?.attributes?.[this._config.attribute] : state?.state; }
    _format(raw) { let value = Number(raw); if (!Number.isFinite(value)) value = 0; const negative = value < 0; let [whole, fraction = ""] = Math.abs(value).toFixed(this._config.decimals).split("."); whole = whole.slice(-this._config.integer_digits).padStart(this._config.integer_digits, this._config.leading_zeroes ? "0" : " "); const characters = []; if (negative || this._config.reserve_sign_slot) characters.push(negative ? "-" : " "); characters.push(...whole); const decimalBoundary = characters.length; if (this._config.decimals > 0) characters.push(...fraction); return { characters, decimalBoundary }; }

    _render() {
      if (!this._config) return;
      const c = this._config, formatted = this._format(this._raw()), chars = formatted.characters;
      const frameless = ["none", "frameless", "transparent"].includes(String(c.frame).toLowerCase());
      this._observer?.disconnect();
      this.shadowRoot.innerHTML = `<style>${this._styles()}</style><ha-card class="${c.transparent_card ? "transparent" : ""}"><div class="host" role="button" tabindex="0" aria-label="${this._esc(c.label || c.entity || "COMPET display")}"><div class="stage"><div class="assembly ${frameless ? "frameless" : "black"}" style="--s:${c.scale};--tw:${c.tube_width}px;--th:${c.tube_height}px;--gap:${c.tube_gap}px;--screw:${c.screw_size}px;--glow:${this._color(c.glow_color,"#20f56b")};--phosphor:${this._color(c.phosphor_color,"#d8ffe3")};--off:${this._color(c.inactive_color,"rgba(32,245,107,.035)")};--marker:${this._color(c.decimal_marker_color,"#d9362e")};--duration:${this._int(c.animation_duration,0,1500,190)}ms">${c.screws && !frameless ? this._screws() : ""}<div class="window"><div class="row">${chars.map((x,i)=>this._tube(i,x)).join("")}</div>${c.decimal_marker && c.decimals > 0 ? this._decimalMarker(formatted.decimalBoundary) : ""}${c.show_red_markers ? this._markers(chars.length) : ""}<div class="glass"></div><div class="glare"></div></div>${(c.show_label && c.label)||(c.show_unit && c.unit) ? `<div class="meta">${c.show_label && c.label ? `<span>${this._esc(c.label)}</span>` : ""}${c.show_unit && c.unit ? `<small>${this._esc(c.unit)}</small>` : ""}</div>` : ""}</div></div></div></ha-card>`;
      this._host=this.shadowRoot.querySelector(".host"); this._stage=this.shadowRoot.querySelector(".stage"); this._assembly=this.shadowRoot.querySelector(".assembly");
      this._host?.addEventListener("click",()=>this._moreInfo()); this._host?.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();this._moreInfo();}});
      this._observer?.observe(this._host); this._last=chars; this._populatePhosphor(this.shadowRoot); requestAnimationFrame(()=>this._fit());
    }

    _tube(index, character) {
      const id=`cvfd-${index}`, style=this._config.style==="alternative"?"alternative":"original"; let ghosts="", active="";
      if(style==="original"){ghosts=originalGhostField();active=originalActiveGlyph(character,id);}else{
        ghosts=ALT_FIELD.map(s=>`<path class="ghost-segment" d="${s.d}" style="--segment-width:${s.width}" data-segment-id="${this._esc(s.id)}"/>`).join("");
        active=(ALT_GLYPHS[character]||ALT_GLYPHS[" "]).map(s=>`<g class="physical-segment" data-segment-id="${this._esc(s.id)}"><path class="segment-glow" d="${s.d}" style="--segment-width:${s.width};--segment-glow-width:${(s.width+2.8).toFixed(2)}" filter="url(#${id}-glow)"/><path class="segment-band" d="${s.d}" style="--segment-width:${s.width}"/><path class="segment-guide" d="${s.d}" data-start-inset="${s.startInset}" data-end-inset="${s.endInset}"/><g class="phosphor-dots"></g></g>`).join("");
      }
      return `<div class="tube ${style}" data-index="${index}" data-character="${this._esc(character)}"><i class="cap top"></i><svg viewBox="0 0 80 132" aria-hidden="true"><defs><clipPath id="${id}-electrode-clip"><rect x="9" y="10" width="62" height="112" rx="9"/></clipPath><filter id="${id}-glow" x="-90%" y="-90%" width="280%" height="280%"><feGaussianBlur stdDeviation="1.15" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><pattern id="${id}-mesh" width="9" height="7.8" patternUnits="userSpaceOnUse"><path d="M2.25 0L6.75 0L9 3.9L6.75 7.8L2.25 7.8L0 3.9Z" fill="none" stroke="rgba(165,218,181,.12)" stroke-width=".52"/></pattern><linearGradient id="${id}-shade"><stop stop-color="rgba(255,255,255,.18)"/><stop offset=".15" stop-color="rgba(255,255,255,.02)"/><stop offset=".85" stop-color="rgba(0,0,0,.03)"/><stop offset="1" stop-color="rgba(255,255,255,.13)"/></linearGradient></defs><rect x="7" y="3" width="66" height="126" rx="13" fill="rgba(0,5,2,.28)" stroke="rgba(188,219,197,.20)" stroke-width="1.1"/><path d="M20 5V13M30 4V12M50 4V12M60 5V13M21 120V129M31 120V130M49 120V130M59 120V129" stroke="#9c8c65" stroke-width="1.2" opacity=".42"/>${this._config.show_mesh?`<rect x="9" y="10" width="62" height="112" rx="9" fill="url(#${id}-mesh)"/>`:""}<g class="electrode-window" clip-path="url(#${id}-electrode-clip)"><g class="electrode-field">${ghosts}</g><g class="active-glyph">${active}</g></g><path class="support-wire" d="M40 8V121"/><rect x="7" y="3" width="66" height="126" rx="13" fill="url(#${id}-shade)" opacity=".48"/><path d="M17 11C29 7 39 7 49 9" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.4" stroke-linecap="round"/></svg><b class="reflection"></b><i class="cap bottom"></i></div>`;
    }

    _populatePhosphor(root=this.shadowRoot){root?.querySelectorAll?.(".physical-segment").forEach(group=>{const guide=group.querySelector(".segment-guide"),dots=group.querySelector(".phosphor-dots");if(!guide||!dots||dots.childElementCount)return;let length;try{length=guide.getTotalLength();}catch{return;}if(!Number.isFinite(length)||length<=0)return;const start=Number(guide.dataset.startInset||1),end=Number(guide.dataset.endInset||1),usable=Math.max(0,length-start-end),count=Math.max(1,Math.floor(usable/2.75));for(let index=0;index<count;index++){const distance=start+(count>1?index*usable/(count-1):0),point=guide.getPointAtLength(Math.min(length-end,distance)),circle=document.createElementNS(SVG_NS,"circle");circle.setAttribute("cx",point.x.toFixed(3));circle.setAttribute("cy",point.y.toFixed(3));circle.setAttribute("r",index%5===0?"0.69":"0.62");circle.setAttribute("class","phosphor-dot");dots.appendChild(circle);}});}
    _update(initial=false){const chars=this._format(this._raw()).characters;if(chars.length!==this._last.length){this._render();return;}chars.forEach((character,index)=>{const tube=this.shadowRoot.querySelector(`.tube[data-index="${index}"]`);if(!tube||character===this._last[index])return;tube.outerHTML=this._tube(index,character);const replacement=this.shadowRoot.querySelector(`.tube[data-index="${index}"]`);this._populatePhosphor(replacement);if(replacement&&!initial&&this._config.animation!==false){replacement.classList.add("switching");setTimeout(()=>replacement.classList.remove("switching"),this._config.animation_duration+30);}});this._last=chars;}
    _fit(){if(!this._host||!this._assembly||!this._stage)return;const width=this._assembly.offsetWidth,height=this._assembly.offsetHeight,available=this._host.clientWidth;if(!width||!available)return;let fit=this._config.fit_to_card===false?1:available/width;if(!this._config.allow_upscale)fit=Math.min(1,fit);fit=Math.max(.05,Math.min(fit,this._config.max_fit_scale));this._stage.style.setProperty("--fit",fit);this._stage.style.width=`${width*fit}px`;this._stage.style.height=`${height*fit}px`;}
    _moreInfo(){if(this._config.tap_action==="none"||!this._config.entity)return;const event=new Event("hass-more-info",{bubbles:true,composed:true});event.detail={entityId:this._config.entity};this.dispatchEvent(event);}
    _decimalMarker(boundary){const c=this._config,x=15+boundary*(c.tube_width+c.tube_gap)-c.tube_gap/2;return `<span class="decimal-marker-wrap" style="left:calc(${x}px * var(--s))" aria-hidden="true"><svg class="decimal-marker-svg" viewBox="0 0 26 34" preserveAspectRatio="xMidYMid meet"><ellipse class="marker-shadow" cx="13" cy="31" rx="7.8" ry="2.2"/><polygon class="marker-left" points="13,1 4,11 7,25 13,33 13,8"/><polygon class="marker-centre" points="13,1 13,8 13,33 19,24 22,11"/><polygon class="marker-right" points="13,1 22,11 19,24 13,33 15,10"/><polygon class="marker-lower" points="7,25 13,33 19,24 13,27"/><path class="marker-highlight" d="M15 5 C17 9 17 17 15 24"/><path class="marker-scratch" d="M9 10 L8 19 M18 13 L17 20"/></svg></span>`;}
    _markers(count){const items=Array.isArray(this._config.marker_positions)?this._config.marker_positions:[];return `<div class="markers">${items.map(position=>`<i style="left:${((this._int(position,1,count,1)-.5)/count)*100}%"></i>`).join("")}</div>`;}
    _screws(){return '<i class="screw tl"></i><i class="screw tr"></i><i class="screw bl"></i><i class="screw br"></i>';}
    _styles(){return String.raw`
:host{display:block;width:100%;max-width:100%;min-width:0;overflow:hidden}*{box-sizing:border-box}ha-card{width:100%;max-width:100%;padding:14px;overflow:hidden}ha-card.transparent{background:transparent;border:0;box-shadow:none}.host{width:100%;overflow:hidden;cursor:pointer}.stage{width:max-content;transform:scale(var(--fit,1));transform-origin:top left}.assembly{position:relative;width:max-content;padding:calc(24px*var(--s)) calc(48px*var(--s)) calc(22px*var(--s));border-radius:calc(10px*var(--s));filter:drop-shadow(0 calc(8px*var(--s)) calc(14px*var(--s)) rgba(0,0,0,.52))}.black{border:calc(1px*var(--s)) solid #000;background:repeating-linear-gradient(0deg,rgba(255,255,255,.018) 0 1px,rgba(0,0,0,.025) 1px 3px),linear-gradient(180deg,#282a2c,#101112 45%,#070708);box-shadow:inset 0 0 0 calc(1px*var(--s)) rgba(255,255,255,.1),inset 0 0 0 calc(3px*var(--s)) #050505,inset 0 0 0 calc(4px*var(--s)) rgba(172,172,172,.72),inset 0 0 0 calc(6px*var(--s)) #080808}.black:before{content:"";position:absolute;inset:calc(7px*var(--s));border:calc(1px*var(--s)) solid rgba(194,194,194,.48);border-radius:calc(6px*var(--s));pointer-events:none}.frameless{padding:0;filter:none}.window{position:relative;padding:calc(13px*var(--s)) calc(15px*var(--s)) calc(25px*var(--s));overflow:hidden;border-radius:calc(5px*var(--s));border:calc(2px*var(--s)) solid #020303;background:radial-gradient(ellipse at 50% 28%,rgba(10,38,20,.20),transparent 56%),linear-gradient(180deg,#010302,#020b06 46%,#010402);box-shadow:0 0 0 calc(1px*var(--s)) rgba(169,176,171,.53),0 0 0 calc(3px*var(--s)) #040505,0 0 0 calc(5px*var(--s)) #1d1f1e,inset 0 calc(10px*var(--s)) calc(16px*var(--s)) #000}.row{display:flex;gap:calc(var(--gap)*var(--s));height:calc((var(--th) + 4px)*var(--s))}.tube{position:relative;flex:0 0 calc(var(--tw)*var(--s));width:calc(var(--tw)*var(--s));height:calc(var(--th)*var(--s));border-radius:calc(13px*var(--s));background:radial-gradient(ellipse at 50% 46%,rgba(10,38,20,.20),rgba(0,7,3,.88) 64%,#000),linear-gradient(90deg,rgba(255,255,255,.10),transparent 14% 84%,rgba(255,255,255,.08));box-shadow:inset calc(4px*var(--s)) 0 calc(8px*var(--s)) rgba(255,255,255,.04),inset calc(-4px*var(--s)) 0 calc(9px*var(--s)) rgba(0,0,0,.88),0 calc(2px*var(--s)) calc(3px*var(--s)) rgba(0,0,0,.9)}.tube svg{position:absolute;z-index:2;inset:0;width:100%;height:100%;overflow:hidden}.cap{position:absolute;left:14%;width:72%;height:calc(6px*var(--s));border-radius:50%;background:linear-gradient(180deg,rgba(190,209,196,.18),rgba(15,25,18,.04) 35%,rgba(0,0,0,.86))}.top{top:calc(-1px*var(--s))}.bottom{bottom:calc(-1px*var(--s));transform:rotate(180deg)}.reflection{position:absolute;z-index:4;top:6%;left:12%;width:13%;height:80%;border-radius:50%;background:linear-gradient(180deg,rgba(255,255,255,.20),rgba(255,255,255,.012) 52%,rgba(255,255,255,.08));filter:blur(calc(.55px*var(--s)));opacity:.38}.ghost-segment,.segment-glow,.segment-band,.segment-guide{fill:none;stroke-linecap:butt;stroke-linejoin:round}.ghost-segment{stroke:var(--off);stroke-width:var(--segment-width);opacity:.48}.segment-glow{stroke:var(--glow);stroke-width:var(--segment-glow-width);opacity:.34}.segment-band{stroke:var(--glow);stroke-width:var(--segment-width);opacity:.86}.segment-guide{stroke:transparent;stroke-width:.1;pointer-events:none}.phosphor-dot,.mask-dot{fill:var(--phosphor);filter:drop-shadow(0 0 .7px var(--glow));pointer-events:none}.mask-glow{fill:var(--glow);pointer-events:none}.mask-ghost{fill:var(--off);pointer-events:none}.tube.original .active-glyph{isolation:isolate}.tube.alternative .segment-band,.tube.alternative .segment-glow{stroke-linecap:round}.support-wire{fill:none;stroke:rgba(84,177,107,.22);stroke-width:.65;stroke-dasharray:1 2}.tube.switching .segment-band,.tube.switching .segment-glow,.tube.switching .phosphor-dot,.tube.switching .mask-cell{animation:sw var(--duration)}@keyframes sw{0%{opacity:1}32%{opacity:.05}51%{opacity:.95}70%{opacity:.55}100%{opacity:1}}.decimal-marker-wrap{position:absolute;z-index:9;bottom:calc(-1px*var(--s));width:calc(17px*var(--s));height:calc(23px*var(--s));transform:translateX(-50%) rotate(-1.5deg);pointer-events:none}.decimal-marker-svg{display:block;width:100%;height:100%;overflow:visible}.marker-shadow{fill:rgba(0,0,0,.75);filter:blur(.75px)}.marker-left{fill:#65100d}.marker-centre{fill:var(--marker)}.marker-right{fill:#ff5f53;opacity:.72}.marker-lower{fill:#8b1712}.marker-highlight{fill:none;stroke:#ffc1ba;stroke-width:1.15;stroke-linecap:round;opacity:.62}.marker-scratch{fill:none;stroke:#6b0b08;stroke-width:.45;stroke-linecap:round;opacity:.42}.glass{position:absolute;z-index:7;inset:0;background:linear-gradient(112deg,rgba(255,255,255,.085),rgba(255,255,255,.01) 24%,transparent 49%,rgba(255,255,255,.065));pointer-events:none}.glare{position:absolute;z-index:8;top:-43%;left:-7%;width:72%;height:64%;border-radius:50%;transform:rotate(-4deg);background:linear-gradient(180deg,rgba(255,255,255,.11),rgba(255,255,255,.012) 58%,transparent);filter:blur(calc(2px*var(--s)))}.markers{position:absolute;z-index:6;left:calc(15px*var(--s));right:calc(15px*var(--s));bottom:calc(5px*var(--s));height:calc(12px*var(--s))}.markers i{position:absolute;width:calc(10px*var(--s));height:calc(12px*var(--s));transform:translateX(-50%);clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%);background:linear-gradient(90deg,#7f0c09,#ff493f 48%,#7c0705)}.meta{display:flex;justify-content:center;align-items:baseline;gap:calc(10px*var(--s));margin-top:calc(13px*var(--s));color:#dedede;font:calc(18px*var(--s))/1 "Helvetica Neue",Arial,sans-serif;text-shadow:0 1px 2px #000}.meta small{font-size:calc(16px*var(--s));opacity:.92}.screw{position:absolute;z-index:10;width:calc(var(--screw)*var(--s));height:calc(var(--screw)*var(--s));border-radius:50%;background:radial-gradient(circle at 32% 30%,rgba(255,255,255,.34),transparent 34%),radial-gradient(circle,#4c4d50,#2e3033 24%,#121314 58%,#020202 78%,#5a5c60);box-shadow:inset 0 1px 1px rgba(255,255,255,.14),inset 0 -2px 4px #000}.screw:before,.screw:after{content:"";position:absolute;left:50%;top:50%;width:62%;height:14%;border-radius:999px;background:linear-gradient(180deg,#050505,#393b3f 45%,#090909);transform:translate(-50%,-50%) rotate(var(--rot))}.screw:after{transform:translate(-50%,-50%) rotate(calc(var(--rot) + 90deg))}.tl{top:calc(9px*var(--s));left:calc(9px*var(--s));--rot:-18deg}.tr{top:calc(9px*var(--s));right:calc(9px*var(--s));--rot:12deg}.bl{bottom:calc(9px*var(--s));left:calc(9px*var(--s));--rot:8deg}.br{bottom:calc(9px*var(--s));right:calc(9px*var(--s));--rot:-12deg}@media(max-width:600px){ha-card{padding:8px}}`;
    }
  }

  if (!customElements.get("compet-vfd-display-card")) customElements.define("compet-vfd-display-card", CompetVfdDisplayCard);
  window.customCards = window.customCards || [];
  if (!window.customCards.some(card => card.type === "compet-vfd-display-card")) window.customCards.push({type:"compet-vfd-display-card",name:"COMPET VFD Display",description:"Photorealistic SHARP COMPET 18 glass-cylinder display reconstructed from the original shared electrode matrix.",preview:true,documentationURL:"https://github.com/loungelizard2018/compet-vfd-display-card"});
  console.info(`%c COMPET-VFD-DISPLAY-CARD %c v${VERSION} (safe-area 72x120) `,"color:white;background:#123b21;font-weight:700;","color:#07150c;background:#45f47e;");
})();
