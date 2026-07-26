import { configMethods } from "./compet-vfd-config.js?v=0.2.0";
import { renderMethods } from "./compet-vfd-render.js?v=0.2.0";
import { updateMethods } from "./compet-vfd-update.js?v=0.2.0";
import { utilityMethods } from "./compet-vfd-utils.js?v=0.2.0";

export class CompetVfdDisplayCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._last = [];
    this._observer = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => this._fit())
      : null;
  }

  static getStubConfig() {
    return {
      type: "custom:compet-vfd-display-card",
      entity: "sensor.example_value",
      integer_digits: 8,
      decimals: 1,
      label: "COMPET DISPLAY",
      unit: "",
      screws: true
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    if (!this._stage) this._render();
    else this._update();
  }

  connectedCallback() { requestAnimationFrame(() => this._fit()); }
  disconnectedCallback() { this._observer?.disconnect(); }
  getCardSize() { return 2; }
}

Object.assign(CompetVfdDisplayCard.prototype, configMethods, renderMethods, updateMethods, utilityMethods);