import { fieldSegments, glyphSegments, ORIGINAL_DIGIT_SEGMENTS } from "./compet-vfd-glyphs.js?v=0.5.3";
import {
  MATRIX_COLS,
  MATRIX_ROWS,
  ORIGINAL_SEGMENT_MASKS,
  activeCellsForSegment
} from "./compet-vfd-segment-masks.js?v=0.5.3";

const SVG_NS = "http://www.w3.org/2000/svg";

const GLYPH_SAFE_AREA = Object.freeze({ x: 10, y: 11, width: 56, height: 110 });

function maskCoordinate(row, col) {
  return {
    x: (GLYPH_SAFE_AREA.x + ((col + 0.5) * GLYPH_SAFE_AREA.width / MATRIX_COLS)).toFixed(3),
    y: (GLYPH_SAFE_AREA.y + ((row + 0.5) * GLYPH_SAFE_AREA.height / MATRIX_ROWS)).toFixed(3)
  };
}

function originalGhostField() {
  const seen = new Map();
  for (const [id] of Object.entries(ORIGINAL_SEGMENT_MASKS)) {
    for (const cell of activeCellsForSegment(id)) {
      const key = `${cell.row}:${cell.col}`;
      const current = seen.get(key);
      if (!current || cell.level > current.level) seen.set(key, { ...cell, id });
    }
  }
  return [...seen.values()].map((cell) => {
    const point = maskCoordinate(cell.row, cell.col);
    const radius = (0.22 + cell.level * 0.055).toFixed(3);
    const opacity = (0.18 + cell.level * 0.055).toFixed(2);
    return `<circle class="mask-ghost" cx="${point.x}" cy="${point.y}" r="${radius}" opacity="${opacity}" data-segment-id="${cell.id}"/>`;
  }).join("");
}

function originalActiveGlyph(character, filterId) {
  const cells = new Map();
  for (const id of ORIGINAL_DIGIT_SEGMENTS[String(character)] || []) {
    for (const cell of activeCellsForSegment(id)) {
      const key = `${cell.row}:${cell.col}`;
      const current = cells.get(key);
      if (!current || cell.level > current.level) cells.set(key, { ...cell, id });
    }
  }
  return [...cells.values()].map((cell, index) => {
    const point = maskCoordinate(cell.row, cell.col);
    const glowRadius = (0.42 + cell.level * 0.13).toFixed(3);
    const dotRadius = (0.19 + cell.level * 0.095).toFixed(3);
    const opacity = (0.48 + cell.level * 0.16).toFixed(2);
    const coreOpacity = Math.min(1, 0.62 + cell.level * 0.12 + (index % 5) * 0.01).toFixed(2);
    return `<g class="mask-cell level-${cell.level}" data-segment-id="${cell.id}">
      <circle class="mask-glow" cx="${point.x}" cy="${point.y}" r="${glowRadius}" opacity="${opacity}" filter="url(#${filterId}-glow)"/>
      <circle class="mask-dot" cx="${point.x}" cy="${point.y}" r="${dotRadius}" opacity="${coreOpacity}"/>
    </g>`;
  }).join("");
}

export const renderMethods = {
  _render() {
    if (!this._config) return;
    const c = this._config;
    const formatted = this._format(this._raw());
    const chars = formatted.characters;
    const frameless = ["none", "frameless", "transparent"].includes(String(c.frame).toLowerCase());
    this._observer?.disconnect();
    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      <ha-card class="${c.transparent_card ? "transparent" : ""}">
        <div class="host" role="button" tabindex="0" aria-label="${this._esc(c.label || c.entity || "COMPET display")}">
          <div class="stage"><div class="assembly ${frameless ? "frameless" : "black"}"
            style="--s:${c.scale};--tw:${c.tube_width}px;--th:${c.tube_height}px;--gap:${c.tube_gap}px;--screw:${c.screw_size}px;--glow:${this._color(c.glow_color,"#20f56b")};--phosphor:${this._color(c.phosphor_color,"#d8ffe3")};--off:${this._color(c.inactive_color,"rgba(32,245,107,.035)")};--marker:${this._color(c.decimal_marker_color,"#d9362e")};--duration:${this._int(c.animation_duration,0,1500,190)}ms">
            ${c.screws && !frameless ? this._screws() : ""}
            <div class="window">
              <div class="row">${chars.map((x, i) => this._tube(i, x)).join("")}</div>
              ${c.decimal_marker && c.decimals > 0 ? this._decimalMarker(formatted.decimalBoundary) : ""}
              ${c.show_red_markers ? this._markers(chars.length) : ""}
              <div class="glass"></div><div class="glare"></div>
            </div>
            ${(c.show_label && c.label) || (c.show_unit && c.unit) ? `<div class="meta">${c.show_label && c.label ? `<span>${this._esc(c.label)}</span>` : ""}${c.show_unit && c.unit ? `<small>${this._esc(c.unit)}</small>` : ""}</div>` : ""}
          </div></div>
        </div>
      </ha-card>`;
    this._host = this.shadowRoot.querySelector(".host");
    this._stage = this.shadowRoot.querySelector(".stage");
    this._assembly = this.shadowRoot.querySelector(".assembly");
    this._host?.addEventListener("click", () => this._moreInfo());
    this._host?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); this._moreInfo(); }
    });
    this._observer?.observe(this._host);
    this._last = chars;
    this._populatePhosphor(this.shadowRoot);
    this._update(true);
    requestAnimationFrame(() => this._fit());
  },

  _tube(index, character) {
    const id = `cvfd-${index}`;
    const style = this._config.style === "alternative" ? "alternative" : "original";
    let ghosts;
    let active;

    if (style === "original") {
      ghosts = originalGhostField();
      active = originalActiveGlyph(character, id);
    } else {
      ghosts = fieldSegments(style).map((s) => `<path class="ghost-segment" d="${s.d}" style="--segment-width:${s.width}" data-segment-id="${this._esc(s.id)}"/>`).join("");
      active = glyphSegments(style, character).map((s) => `<g class="physical-segment" data-segment-id="${this._esc(s.id)}" data-segment-name="${this._esc(s.name || s.id)}">
        <path class="segment-glow" d="${s.d}" style="--segment-width:${s.width};--segment-glow-width:${(s.width + 2.8).toFixed(2)}" filter="url(#${id}-glow)"/>
        <path class="segment-band" d="${s.d}" style="--segment-width:${s.width}"/>
        <path class="segment-guide" d="${s.d}" data-start-inset="${s.startInset}" data-end-inset="${s.endInset}" data-dot-fractions="${Array.isArray(s.dotFractions) ? s.dotFractions.join(",") : ""}"/>
        <g class="phosphor-dots"></g>
      </g>`).join("");
    }

    return `<div class="tube ${style}" data-index="${index}" data-character="${this._esc(character)}">
      <i class="cap top"></i><svg viewBox="0 0 80 132" aria-hidden="true">
        <defs>
          <clipPath id="${id}-electrode-clip"><rect x="9.5" y="10.5" width="59" height="111" rx="8.5"/></clipPath>
          <filter id="${id}-glow" x="-90%" y="-90%" width="280%" height="280%"><feGaussianBlur stdDeviation="1.15" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <pattern id="${id}-mesh" width="9" height="7.8" patternUnits="userSpaceOnUse"><path d="M2.25 0L6.75 0L9 3.9L6.75 7.8L2.25 7.8L0 3.9Z" fill="none" stroke="rgba(165,218,181,.12)" stroke-width=".52"/></pattern>
          <linearGradient id="${id}-shade"><stop stop-color="rgba(255,255,255,.18)"/><stop offset=".15" stop-color="rgba(255,255,255,.02)"/><stop offset=".85" stop-color="rgba(0,0,0,.03)"/><stop offset="1" stop-color="rgba(255,255,255,.13)"/></linearGradient>
        </defs>
        <rect x="7" y="3" width="66" height="126" rx="13" fill="rgba(0,5,2,.28)" stroke="rgba(188,219,197,.20)" stroke-width="1.1"/>
        <path d="M20 5V13M30 4V12M50 4V12M60 5V13M21 120V129M31 120V130M49 120V130M59 120V129" stroke="#9c8c65" stroke-width="1.2" opacity=".42"/>
        ${this._config.show_mesh ? `<rect x="9.5" y="10.5" width="59" height="111" rx="8.5" fill="url(#${id}-mesh)"/>` : ""}
        <g class="electrode-window" clip-path="url(#${id}-electrode-clip)">
          <g class="electrode-field">${ghosts}</g>
          <g class="active-glyph">${active}</g>
        </g>
        <path class="support-wire" d="M40 8V121"/>
        <rect x="7" y="3" width="66" height="126" rx="13" fill="url(#${id}-shade)" opacity=".48"/>
        <path d="M17 11C29 7 39 7 49 9" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.4" stroke-linecap="round"/>
      </svg><b class="reflection"></b><i class="cap bottom"></i>
    </div>`;
  },

  _populatePhosphor(root = this.shadowRoot) {
    root?.querySelectorAll?.(".physical-segment").forEach((group) => {
      const guide = group.querySelector(".segment-guide");
      const dots = group.querySelector(".phosphor-dots");
      if (!guide || !dots || dots.childElementCount) return;
      let length;
      try { length = guide.getTotalLength(); } catch { return; }
      if (!Number.isFinite(length) || length <= 0) return;
      const storedFractions = String(guide.dataset.dotFractions || "").split(",").map(Number).filter((value) => Number.isFinite(value) && value >= 0 && value <= 1);
      const start = Number(guide.dataset.startInset || 1.0);
      const end = Number(guide.dataset.endInset || 1.0);
      const usable = Math.max(0, length - start - end);
      const distances = storedFractions.length
        ? storedFractions.map((fraction) => fraction * length)
        : Array.from({ length: Math.max(1, Math.floor(usable / 2.75)) }, (_, index, items) => start + (items.length > 1 ? index * usable / (items.length - 1) : 0));
      distances.forEach((distance, index) => {
        const point = guide.getPointAtLength(Math.min(length - end, distance));
        const circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute("cx", point.x.toFixed(3));
        circle.setAttribute("cy", point.y.toFixed(3));
        circle.setAttribute("r", (index % 5 === 0 ? 0.69 : 0.62).toString());
        circle.setAttribute("class", "phosphor-dot");
        dots.appendChild(circle);
      });
    });
  },

  _decimalMarker(boundary) {
    const c = this._config;
    const x = 15 + boundary * (c.tube_width + c.tube_gap) - c.tube_gap / 2;
    return `<span class="decimal-marker-wrap" style="left:calc(${x}px * var(--s))" aria-hidden="true"><svg class="decimal-marker-svg" viewBox="0 0 26 34" preserveAspectRatio="xMidYMid meet"><ellipse class="marker-shadow" cx="13" cy="31" rx="7.8" ry="2.2"/><polygon class="marker-left" points="13,1 4,11 7,25 13,33 13,8"/><polygon class="marker-centre" points="13,1 13,8 13,33 19,24 22,11"/><polygon class="marker-right" points="13,1 22,11 19,24 13,33 15,10"/><polygon class="marker-lower" points="7,25 13,33 19,24 13,27"/><path class="marker-highlight" d="M15 5 C17 9 17 17 15 24"/><path class="marker-scratch" d="M9 10 L8 19 M18 13 L17 20"/></svg></span>`;
  },

  _markers(count) {
    const items = Array.isArray(this._config.marker_positions) ? this._config.marker_positions : [];
    return `<div class="markers">${items.map((position) => `<i style="left:${((this._int(position,1,count,1)-.5)/count)*100}%"></i>`).join("")}</div>`;
  },

  _screws() { return `<i class="screw tl"></i><i class="screw tr"></i><i class="screw bl"></i><i class="screw br"></i>`; }
};
