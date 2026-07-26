import { GLYPH_PATHS } from "./compet-vfd-glyphs.js?v=0.2.0";

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
            style="--s:${c.scale};--tw:${c.tube_width}px;--th:${c.tube_height}px;--gap:${c.tube_gap}px;--screw:${c.screw_size}px;--glow:${this._color(c.glow_color,"#20f56b")};--off:${this._color(c.inactive_color,"rgba(32,245,107,.035)")};--marker:${this._color(c.decimal_marker_color,"#e33b32")};--duration:${this._int(c.animation_duration,0,1500,190)}ms">
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
    this._update(true);
    requestAnimationFrame(() => this._fit());
  },

  _tube(index, character) {
    const id = `cvfd-${index}`;
    const ghostPaths = [
      "M23 18 C34 13 51 13 62 18",
      "M63 22 C66 36 65 48 61 58",
      "M60 72 C64 86 61 101 54 110",
      "M53 112 C42 116 29 116 18 111",
      "M16 106 C12 91 13 79 17 68",
      "M19 57 C15 44 16 31 22 21",
      "M20 64 C31 60 49 60 60 64"
    ];
    const ghosts = ghostPaths.map((d) => `<path class="ghost" d="${d}"/>`).join("");
    const glyph = (GLYPH_PATHS[character] || []).map((d) => `<path class="glyph" d="${d}" filter="url(#${id}-glow)"/><path class="phosphor" d="${d}"/>`).join("");
    return `<div class="tube" data-index="${index}" data-character="${this._esc(character)}">
      <i class="cap top"></i><svg viewBox="0 0 80 132" aria-hidden="true">
        <defs>
          <filter id="${id}-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="1.45" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <pattern id="${id}-mesh" width="9" height="7.8" patternUnits="userSpaceOnUse"><path d="M2.25 0L6.75 0L9 3.9L6.75 7.8L2.25 7.8L0 3.9Z" fill="none" stroke="rgba(165,218,181,.12)" stroke-width=".52"/></pattern>
          <linearGradient id="${id}-shade"><stop stop-color="rgba(255,255,255,.18)"/><stop offset=".15" stop-color="rgba(255,255,255,.02)"/><stop offset=".85" stop-color="rgba(0,0,0,.03)"/><stop offset="1" stop-color="rgba(255,255,255,.13)"/></linearGradient>
        </defs>
        <rect x="7" y="3" width="66" height="126" rx="13" fill="rgba(0,5,2,.28)" stroke="rgba(188,219,197,.20)" stroke-width="1.1"/>
        <path d="M20 5V13M30 4V12M50 4V12M60 5V13M21 120V129M31 120V130M49 120V130M59 120V129" stroke="#9c8c65" stroke-width="1.2" opacity=".42"/>
        ${this._config.show_mesh ? `<rect x="9" y="10" width="62" height="112" rx="9" fill="url(#${id}-mesh)"/>` : ""}
        <g class="ghosts">${ghosts}</g><g class="active-glyph">${glyph}</g><path class="support-wire" d="M40 8V121"/>
        <rect x="7" y="3" width="66" height="126" rx="13" fill="url(#${id}-shade)" opacity=".48"/>
        <path d="M17 11C29 7 39 7 49 9" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.4" stroke-linecap="round"/>
      </svg><b class="reflection"></b><i class="cap bottom"></i>
    </div>`;
  },

  _decimalMarker(boundary) {
    const c = this._config;
    const x = 15 + boundary * (c.tube_width + c.tube_gap) - c.tube_gap / 2;
    return `<i class="decimal-marker" style="left:calc(${x}px * var(--s))" aria-hidden="true"></i>`;
  },

  _markers(count) {
    const items = Array.isArray(this._config.marker_positions) ? this._config.marker_positions : [];
    return `<div class="markers">${items.map((position) => `<i style="left:${((this._int(position,1,count,1)-.5)/count)*100}%"></i>`).join("")}</div>`;
  },

  _screws() { return `<i class="screw tl"></i><i class="screw tr"></i><i class="screw bl"></i><i class="screw br"></i>`; }
};