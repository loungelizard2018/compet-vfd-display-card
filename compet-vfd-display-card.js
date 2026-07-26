/**
 * COMPET VFD Display Card for Home Assistant
 * Inspired by the segmented glass-cylinder display of the 1969 SHARP COMPET 18.
 * Version: 0.1.0
 */

const COMPET_VFD_VERSION = "0.1.0";
const SEGMENT_PATHS = {
  a: "M23 17 C34 12 52 12 63 17",
  b: "M65 22 C68 33 67 45 63 56",
  c: "M62 73 C65 84 63 99 58 109",
  d: "M54 113 C43 117 27 117 16 112",
  e: "M14 106 C10 94 11 80 15 69",
  f: "M18 57 C14 45 15 31 20 21",
  g: "M19 64 C31 60 49 60 61 64",
};
const DIGITS = {
  "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd",
  "4": "fgbc", "5": "afgcd", "6": "afgecd", "7": "abc",
  "8": "abcdefg", "9": "abcdfg", "-": "g", " ": "",
};

class CompetVfdDisplayCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._last = [];
    this._observer = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => this._fit()) : null;
  }

  static getStubConfig() {
    return {
      type: "custom:compet-vfd-display-card",
      entity: "sensor.example_value",
      integer_digits: 8,
      decimals: 1,
      label: "COMPET DISPLAY",
      unit: "",
      screws: true,
    };
  }

  setConfig(config) {
    if (!config || (!config.entity && config.value === undefined)) {
      throw new Error("COMPET VFD Display Card: configure 'entity' or 'value'.");
    }
    const separator = String(config.decimal_separator ?? ".");
    if (![".", ","].includes(separator)) {
      throw new Error("decimal_separator must be '.' or ','.");
    }
    this._config = {
      entity: null,
      attribute: null,
      value: undefined,
      integer_digits: 8,
      decimals: 0,
      decimal_separator: ".",
      leading_zeroes: false,
      reserve_sign_slot: false,
      label: "COMPET DISPLAY",
      unit: "",
      show_label: true,
      show_unit: true,
      frame: "gauge_black",
      screws: true,
      screw_size: 28,
      transparent_card: true,
      glow_color: "#20f56b",
      inactive_color: "rgba(32,245,107,.055)",
      show_mesh: true,
      tube_width: 58,
      tube_height: 112,
      tube_gap: 8,
      show_red_markers: false,
      marker_positions: [],
      animation: true,
      animation_duration: 190,
      fit_to_card: true,
      allow_upscale: false,
      max_fit_scale: 1,
      scale: 1,
      tap_action: "more-info",
      ...config,
      integer_digits: this._int(config.integer_digits, 1, 24, 8),
      decimals: this._int(config.decimals, 0, 8, 0),
      decimal_separator: separator,
      screw_size: this._num(config.screw_size, 12, 56, 28),
      tube_width: this._num(config.tube_width, 38, 90, 58),
      tube_height: this._num(config.tube_height, 78, 170, 112),
      tube_gap: this._num(config.tube_gap, 1, 24, 8),
      scale: this._num(config.scale, .35, 2.5, 1),
      max_fit_scale: this._num(config.max_fit_scale, .25, 2.5, 1),
    };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    if (!this._stage) this._render(); else this._update();
  }

  connectedCallback() {
    requestAnimationFrame(() => this._fit());
  }

  disconnectedCallback() {
    this._observer?.disconnect();
  }

  getCardSize() { return 2; }

  _render() {
    if (!this._config) return;
    const c = this._config;
    const chars = this._format(this._raw());
    const frameless = ["none", "frameless", "transparent"].includes(String(c.frame).toLowerCase());
    this._observer?.disconnect();
    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      <ha-card class="${c.transparent_card ? "transparent" : ""}">
        <div class="host" role="button" tabindex="0" aria-label="${this._esc(c.label || c.entity || "COMPET display")}">
          <div class="stage">
            <div class="assembly ${frameless ? "frameless" : "black"}"
              style="--s:${c.scale};--tw:${c.tube_width}px;--th:${c.tube_height}px;--gap:${c.tube_gap}px;--screw:${c.screw_size}px;--glow:${this._color(c.glow_color,"#20f56b")};--off:${this._color(c.inactive_color,"rgba(32,245,107,.055)")};--duration:${this._int(c.animation_duration,0,1500,190)}ms">
              ${c.screws && !frameless ? this._screws() : ""}
              <div class="window">
                <div class="row">${chars.map((x, i) => this._tube(i, x)).join("")}</div>
                ${c.show_red_markers ? this._markers(chars.length) : ""}
                <div class="glass"></div><div class="glare"></div>
              </div>
              ${(c.show_label && c.label) || (c.show_unit && c.unit) ? `<div class="meta">${c.show_label && c.label ? `<span>${this._esc(c.label)}</span>` : ""}${c.show_unit && c.unit ? `<small>${this._esc(c.unit)}</small>` : ""}</div>` : ""}
            </div>
          </div>
        </div>
      </ha-card>`;
    this._host = this.shadowRoot.querySelector(".host");
    this._stage = this.shadowRoot.querySelector(".stage");
    this._assembly = this.shadowRoot.querySelector(".assembly");
    this._host?.addEventListener("click", () => this._moreInfo());
    this._host?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this._moreInfo(); }
    });
    this._observer?.observe(this._host);
    this._last = chars;
    this._update(true);
    requestAnimationFrame(() => this._fit());
  }

  _tube(index, character) {
    const id = `cvfd-${index}`;
    const segments = Object.entries(SEGMENT_PATHS).map(([name, d]) => `
      <g class="seg seg-${name}"><path class="off" d="${d}"/><path class="on" d="${d}" filter="url(#${id}-glow)"/><path class="dots" d="${d}"/></g>`).join("");
    return `<div class="tube" data-index="${index}">
      <i class="cap top"></i>
      <svg viewBox="0 0 80 132" aria-hidden="true">
        <defs>
          <filter id="${id}-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <pattern id="${id}-mesh" width="9" height="7.8" patternUnits="userSpaceOnUse"><path d="M2.25 0L6.75 0L9 3.9L6.75 7.8L2.25 7.8L0 3.9Z" fill="none" stroke="rgba(165,218,181,.13)" stroke-width=".55"/></pattern>
          <linearGradient id="${id}-shade"><stop stop-color="rgba(255,255,255,.18)"/><stop offset=".15" stop-color="rgba(255,255,255,.02)"/><stop offset=".85" stop-color="rgba(0,0,0,.03)"/><stop offset="1" stop-color="rgba(255,255,255,.13)"/></linearGradient>
        </defs>
        <rect x="7" y="3" width="66" height="126" rx="13" fill="rgba(0,5,2,.28)" stroke="rgba(188,219,197,.20)" stroke-width="1.1"/>
        <path d="M20 5V13M30 4V12M50 4V12M60 5V13M21 120V129M31 120V130M49 120V130M59 120V129" stroke="#9c8c65" stroke-width="1.2" opacity=".42"/>
        ${this._config.show_mesh ? `<rect x="9" y="10" width="62" height="112" rx="9" fill="url(#${id}-mesh)"/>` : ""}
        ${segments}
        <g class="punct"><circle class="poff" cx="59" cy="111" r="4.6"/><circle class="pon" cx="59" cy="111" r="4.2" filter="url(#${id}-glow)"/><path class="comma" d="M60 114C62 120 60 125 56 129" fill="none" stroke="var(--glow)" stroke-width="3.7" stroke-linecap="round" filter="url(#${id}-glow)"/></g>
        <rect x="7" y="3" width="66" height="126" rx="13" fill="url(#${id}-shade)" opacity=".48"/>
        <path d="M17 11C29 7 39 7 49 9" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.4" stroke-linecap="round"/>
      </svg><b class="reflection"></b><i class="cap bottom"></i>
    </div>`;
  }

  _update(initial = false) {
    const chars = this._format(this._raw());
    if (chars.length !== this._last.length) { this._render(); return; }
    chars.forEach((ch, i) => {
      const tube = this.shadowRoot.querySelector(`.tube[data-index="${i}"]`);
      if (!tube) return;
      const active = DIGITS[ch] || "";
      Object.keys(SEGMENT_PATHS).forEach((s) => tube.querySelector(`.seg-${s}`)?.classList.toggle("lit", active.includes(s)));
      const punct = tube.querySelector(".punct");
      punct?.classList.toggle("lit", ch === "." || ch === ",");
      punct?.classList.toggle("comma-mode", ch === ",");
      if (!initial && ch !== this._last[i] && this._config.animation !== false) {
        tube.classList.remove("switching"); void tube.offsetWidth; tube.classList.add("switching");
        setTimeout(() => tube.classList.remove("switching"), this._config.animation_duration + 30);
      }
    });
    this._last = chars;
  }

  _raw() {
    if (this._config.value !== undefined) return this._config.value;
    const state = this._hass?.states?.[this._config.entity];
    return this._config.attribute ? state?.attributes?.[this._config.attribute] : state?.state;
  }

  _format(raw) {
    let value = Number(raw); if (!Number.isFinite(value)) value = 0;
    const neg = value < 0;
    let [whole, fraction = ""] = Math.abs(value).toFixed(this._config.decimals).split(".");
    whole = whole.slice(-this._config.integer_digits);
    whole = whole.padStart(this._config.integer_digits, this._config.leading_zeroes ? "0" : " ");
    const out = [];
    if (neg || this._config.reserve_sign_slot) out.push(neg ? "-" : " ");
    out.push(...whole);
    if (this._config.decimals > 0) out.push(this._config.decimal_separator, ...fraction);
    return out;
  }

  _markers(count) {
    const items = Array.isArray(this._config.marker_positions) ? this._config.marker_positions : [];
    return `<div class="markers">${items.map((p) => `<i style="left:${((this._int(p,1,count,1)-.5)/count)*100}%"></i>`).join("")}</div>`;
  }

  _screws() { return `<i class="screw tl"></i><i class="screw tr"></i><i class="screw bl"></i><i class="screw br"></i>`; }

  _fit() {
    if (!this._host || !this._assembly || !this._stage) return;
    const w = this._assembly.offsetWidth, h = this._assembly.offsetHeight, available = this._host.clientWidth;
    if (!w || !available) return;
    let f = this._config.fit_to_card === false ? 1 : available / w;
    if (!this._config.allow_upscale) f = Math.min(1, f);
    f = Math.max(.05, Math.min(f, this._config.max_fit_scale));
    this._stage.style.setProperty("--fit", f);
    this._stage.style.width = `${w*f}px`; this._stage.style.height = `${h*f}px`;
  }

  _moreInfo() {
    if (this._config.tap_action === "none" || !this._config.entity) return;
    const e = new Event("hass-more-info", { bubbles: true, composed: true });
    e.detail = { entityId: this._config.entity }; this.dispatchEvent(e);
  }

  _int(v,min,max,d){const n=parseInt(v,10);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):d}
  _num(v,min,max,d){const n=Number(v);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):d}
  _esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
  _color(v,d){const s=String(v??"").trim();return /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]{3,24}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%deg]+\)|var\(--[-\w]+\))$/.test(s)?s:d}

  _styles() { return String.raw`
    :host{display:block;width:100%;max-width:100%;min-width:0;overflow:hidden}*{box-sizing:border-box}ha-card{width:100%;max-width:100%;padding:14px;overflow:hidden}ha-card.transparent{background:transparent;border:0;box-shadow:none}.host{width:100%;overflow:hidden;cursor:pointer}.stage{width:max-content;transform:scale(var(--fit,1));transform-origin:top left}.assembly{position:relative;width:max-content;padding:calc(24px*var(--s)) calc(48px*var(--s)) calc(22px*var(--s));border-radius:calc(10px*var(--s));filter:drop-shadow(0 calc(8px*var(--s)) calc(14px*var(--s)) rgba(0,0,0,.52))}.black{border:calc(1px*var(--s)) solid #000;background:repeating-linear-gradient(0deg,rgba(255,255,255,.018) 0 1px,rgba(0,0,0,.025) 1px 3px),linear-gradient(180deg,#282a2c,#101112 45%,#070708);box-shadow:inset 0 0 0 calc(1px*var(--s)) rgba(255,255,255,.1),inset 0 0 0 calc(3px*var(--s)) #050505,inset 0 0 0 calc(4px*var(--s)) rgba(172,172,172,.72),inset 0 0 0 calc(6px*var(--s)) #080808}.black:before{content:"";position:absolute;inset:calc(7px*var(--s));border:calc(1px*var(--s)) solid rgba(194,194,194,.48);border-radius:calc(6px*var(--s));pointer-events:none}.frameless{padding:0;filter:none}.window{position:relative;padding:calc(13px*var(--s)) calc(15px*var(--s)) calc(23px*var(--s));overflow:hidden;border-radius:calc(5px*var(--s));border:calc(2px*var(--s)) solid #020303;background:radial-gradient(ellipse at 50% 28%,rgba(10,38,20,.24),transparent 56%),linear-gradient(180deg,#010302,#031008 46%,#010402);box-shadow:0 0 0 calc(1px*var(--s)) rgba(169,176,171,.53),0 0 0 calc(3px*var(--s)) #040505,0 0 0 calc(5px*var(--s)) #1d1f1e,inset 0 calc(10px*var(--s)) calc(16px*var(--s)) #000}.row{display:flex;gap:calc(var(--gap)*var(--s));height:calc((var(--th) + 4px)*var(--s))}.tube{position:relative;flex:0 0 calc(var(--tw)*var(--s));width:calc(var(--tw)*var(--s));height:calc(var(--th)*var(--s));border-radius:calc(13px*var(--s));background:radial-gradient(ellipse at 50% 46%,rgba(12,48,25,.26),rgba(0,8,3,.84) 64%,#000),linear-gradient(90deg,rgba(255,255,255,.12),transparent 14% 84%,rgba(255,255,255,.09));box-shadow:inset calc(4px*var(--s)) 0 calc(8px*var(--s)) rgba(255,255,255,.045),inset calc(-4px*var(--s)) 0 calc(9px*var(--s)) rgba(0,0,0,.86),0 calc(2px*var(--s)) calc(3px*var(--s)) rgba(0,0,0,.88)}.tube svg{position:absolute;z-index:2;inset:0;width:100%;height:100%;overflow:visible}.cap{position:absolute;left:14%;width:72%;height:calc(6px*var(--s));border-radius:50%;background:linear-gradient(180deg,rgba(190,209,196,.2),rgba(15,25,18,.05) 35%,rgba(0,0,0,.84))}.top{top:calc(-1px*var(--s))}.bottom{bottom:calc(-1px*var(--s));transform:rotate(180deg)}.reflection{position:absolute;z-index:4;top:6%;left:12%;width:14%;height:80%;border-radius:50%;background:linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,.015) 52%,rgba(255,255,255,.09));filter:blur(calc(.55px*var(--s)));opacity:.45}.off{fill:none;stroke:var(--off);stroke-width:7.2;stroke-linecap:round}.on{fill:none;stroke:var(--glow);stroke-width:5.35;stroke-linecap:round;opacity:0}.dots{fill:none;stroke:#e2ffe8;stroke-width:2.1;stroke-linecap:round;stroke-dasharray:.1 3.05;opacity:0}.seg.lit .on{opacity:.9}.seg.lit .dots{opacity:.94}.poff{fill:var(--off)}.pon{fill:var(--glow);opacity:0}.comma{opacity:0}.punct.lit .pon{opacity:1}.punct.comma-mode .comma{opacity:1}.tube.switching .on,.tube.switching .dots,.tube.switching .pon,.tube.switching .comma{animation:sw var(--duration)}@keyframes sw{0%{opacity:1}35%{opacity:0}60%{opacity:1}80%{opacity:.6}100%{opacity:1}}.glass{position:absolute;z-index:7;inset:0;background:linear-gradient(112deg,rgba(255,255,255,.095),rgba(255,255,255,.012) 24%,transparent 49%,rgba(255,255,255,.075));pointer-events:none}.glare{position:absolute;z-index:8;top:-43%;left:-7%;width:72%;height:64%;border-radius:50%;transform:rotate(-4deg);background:linear-gradient(180deg,rgba(255,255,255,.13),rgba(255,255,255,.015) 58%,transparent);filter:blur(calc(2px*var(--s)))}.markers{position:absolute;z-index:6;left:calc(15px*var(--s));right:calc(15px*var(--s));bottom:calc(5px*var(--s));height:calc(12px*var(--s))}.markers i{position:absolute;width:calc(10px*var(--s));height:calc(12px*var(--s));transform:translateX(-50%);clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%);background:linear-gradient(90deg,#7f0c09,#ff493f 48%,#7c0705)}.meta{display:flex;justify-content:center;align-items:baseline;gap:calc(10px*var(--s));margin-top:calc(13px*var(--s));color:#dedede;font:calc(18px*var(--s))/1 "Helvetica Neue",Arial,sans-serif;text-shadow:0 1px 2px #000}.meta small{font-size:calc(16px*var(--s));opacity:.92}.screw{position:absolute;z-index:10;width:calc(var(--screw)*var(--s));height:calc(var(--screw)*var(--s));border-radius:50%;background:radial-gradient(circle at 32% 30%,rgba(255,255,255,.34),transparent 34%),radial-gradient(circle,#4c4d50,#2e3033 24%,#121314 58%,#020202 78%,#5a5c60);box-shadow:inset 0 1px 1px rgba(255,255,255,.14),inset 0 -2px 4px #000}.screw:before,.screw:after{content:"";position:absolute;left:50%;top:50%;width:62%;height:14%;border-radius:999px;background:linear-gradient(180deg,#050505,#393b3f 45%,#090909);transform:translate(-50%,-50%) rotate(var(--rot))}.screw:after{transform:translate(-50%,-50%) rotate(calc(var(--rot) + 90deg))}.tl{top:calc(9px*var(--s));left:calc(9px*var(--s));--rot:-18deg}.tr{top:calc(9px*var(--s));right:calc(9px*var(--s));--rot:12deg}.bl{bottom:calc(9px*var(--s));left:calc(9px*var(--s));--rot:8deg}.br{bottom:calc(9px*var(--s));right:calc(9px*var(--s));--rot:-12deg}@media(max-width:600px){ha-card{padding:8px}}`;
  }
}

if (!customElements.get("compet-vfd-display-card")) customElements.define("compet-vfd-display-card", CompetVfdDisplayCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "compet-vfd-display-card")) window.customCards.push({type:"compet-vfd-display-card",name:"COMPET VFD Display",description:"Photorealistic COMPET 18 inspired glass-cylinder display.",preview:true,documentationURL:"https://github.com/loungelizard2018/compet-vfd-display-card"});
console.info(`%c COMPET-VFD-DISPLAY-CARD %c v${COMPET_VFD_VERSION} `,"color:white;background:#123b21;font-weight:700;","color:#07150c;background:#45f47e;");
