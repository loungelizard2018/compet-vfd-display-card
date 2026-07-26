import { fieldSegments, glyphSegments } from "./compet-vfd-glyphs.js?v=0.3.1";

const SVG_NS = "http://www.w3.org/2000/svg";

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
    const ghosts = fieldSegments(style).map((s) =>
      `<path class="ghost-segment" d="${s.d}" style="--segment-width:${s.width}"/>`
    ).join("");
    const active = glyphSegments(style, character).map((s) => `
      <g class="physical-segment" data-segment-id="${this._esc(s.id)}">
        <path class="segment-glow" d="${s.d}" style="--segment-width:${s.width};--segment-glow-width:${(s.width + 2.8).toFixed(2)}" filter="url(#${id}-glow)"/>
        <path class="segment-band" d="${s.d}" style="--segment-width:${s.width}"/>
        <path class="segment-guide" d="${s.d}" data-start-inset="${s.startInset}" data-end-inset="${s.endInset}"/>
        <g class="phosphor-dots"></g>
      </g>`).join("");

    return `<div class="tube ${style}" data-index="${index}" data-character="${this._esc(character)}">
      <i class="cap top"></i><svg viewBox="0 0 80 132" aria-hidden="true">
        <defs>
          <filter id="${id}-glow" x="-90%" y="-90%" width="280%" height="280%"><feGaussianBlur stdDeviation="1.7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <pattern id="${id}-mesh" width="9" height="7.8" patternUnits="userSpaceOnUse"><path d="M2.25 0L6.75 0L9 3.9L6.75 7.8L2.25 7.8L0 3.9Z" fill="none" stroke="rgba(165,218,181,.12)" stroke-width=".52"/></pattern>
          <linearGradient id="${id}-shade"><stop stop-color="rgba(255,255,255,.18)"/><stop offset=".15" stop-color="rgba(255,255,255,.02)"/><stop offset=".85" stop-color="rgba(0,0,0,.03)"/><stop offset="1" stop-color="rgba(255,255,255,.13)"/></linearGradient>
        </defs>
        <rect x="7" y="3" width="66" height="126" rx="13" fill="rgba(0,5,2,.28)" stroke="rgba(188,219,197,.20)" stroke-width="1.1"/>
        <path d="M20 5V13M30 4V12M50 4V12M60 5V13M21 120V129M31 120V130M49 120V130M59 120V129" stroke="#9c8c65" stroke-width="1.2" opacity=".42"/>
        ${this._config.show_mesh ? `<rect x="9" y="10" width="62" height="112" rx="9" fill="url(#${id}-mesh)"/>` : ""}
        <g class="electrode-field">${ghosts}</g>
        <g class="active-glyph">${active}</g>
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
      const start = Number(guide.dataset.startInset || 1.0);
      const end = Number(guide.dataset.endInset || 1.0);
      const usable = Math.max(0, length - start - end);
      const spacing = this._config.style === "alternative" ? 2.75 : 2.55;
      const count = Math.max(1, Math.floor(usable / spacing));
      const actualSpacing = count > 1 ? usable / (count - 1) : 0;
      for (let i = 0; i < count; i += 1) {
        const distance = Math.min(length - end, start + i * actualSpacing);
        const point = guide.getPointAtLength(distance);
        const circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute("cx", point.x.toFixed(3));
        circle.setAttribute("cy", point.y.toFixed(3));
        circle.setAttribute("r", (i % 5 === 0 ? 0.69 : 0.62).toString());
        circle.setAttribute("class", "phosphor-dot");
        circle.style.opacity = (0.89 + ((i * 17) % 8) / 100).toFixed(2);
        dots.appendChild(circle);
      }
    });
  },

  _decimalMarker(boundary) {
    const c = this._config;
    const x = 15 + boundary * (c.tube_width + c.tube_gap) - c.tube_gap / 2;
    return `<span class="decimal-marker-wrap" style="left:calc(${x}px * var(--s))" aria-hidden="true">
      <svg class="decimal-marker-svg" viewBox="0 0 26 34" preserveAspectRatio="xMidYMid meet">
        <ellipse class="marker-shadow" cx="13" cy="31" rx="7.8" ry="2.2"/>
        <polygon class="marker-left" points="13,1 4,11 7,25 13,33 13,8"/>
        <polygon class="marker-centre" points="13,1 13,8 13,33 19,24 22,11"/>
        <polygon class="marker-right" points="13,1 22,11 19,24 13,33 15,10"/>
        <polygon class="marker-lower" points="7,25 13,33 19,24 13,27"/>
        <path class="marker-highlight" d="M15 5 C17 9 17 17 15 24"/>
        <path class="marker-scratch" d="M9 10 L8 19 M18 13 L17 20"/>
      </svg>
    </span>`;
  },

  _markers(count) {
    const items = Array.isArray(this._config.marker_positions) ? this._config.marker_positions : [];
    return `<div class="markers">${items.map((position) => `<i style="left:${((this._int(position,1,count,1)-.5)/count)*100}%"></i>`).join("")}</div>`;
  },

  _screws() { return `<i class="screw tl"></i><i class="screw tr"></i><i class="screw bl"></i><i class="screw br"></i>`; }
};
