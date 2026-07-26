export const updateMethods = {
  _update(initial = false) {
    const formatted = this._format(this._raw());
    const chars = formatted.characters;
    if (chars.length !== this._last.length) { this._render(); return; }
    chars.forEach((character, index) => {
      const tube = this.shadowRoot.querySelector(`.tube[data-index="${index}"]`);
      if (!tube || character === this._last[index]) return;
      tube.outerHTML = this._tube(index, character);
      const replacement = this.shadowRoot.querySelector(`.tube[data-index="${index}"]`);
      if (replacement && !initial && this._config.animation !== false) {
        replacement.classList.add("switching");
        setTimeout(() => replacement.classList.remove("switching"), this._config.animation_duration + 30);
      }
    });
    this._last = chars;
  },

  _raw() {
    if (this._config.value !== undefined) return this._config.value;
    const state = this._hass?.states?.[this._config.entity];
    return this._config.attribute ? state?.attributes?.[this._config.attribute] : state?.state;
  },

  _format(raw) {
    let value = Number(raw);
    if (!Number.isFinite(value)) value = 0;
    const negative = value < 0;
    let [whole, fraction = ""] = Math.abs(value).toFixed(this._config.decimals).split(".");
    whole = whole.slice(-this._config.integer_digits);
    whole = whole.padStart(this._config.integer_digits, this._config.leading_zeroes ? "0" : " ");
    const characters = [];
    if (negative || this._config.reserve_sign_slot) characters.push(negative ? "-" : " ");
    characters.push(...whole);
    const decimalBoundary = characters.length;
    if (this._config.decimals > 0) characters.push(...fraction);
    return { characters, decimalBoundary };
  },

  _fit() {
    if (!this._host || !this._assembly || !this._stage) return;
    const width = this._assembly.offsetWidth;
    const height = this._assembly.offsetHeight;
    const available = this._host.clientWidth;
    if (!width || !available) return;
    let fit = this._config.fit_to_card === false ? 1 : available / width;
    if (!this._config.allow_upscale) fit = Math.min(1, fit);
    fit = Math.max(.05, Math.min(fit, this._config.max_fit_scale));
    this._stage.style.setProperty("--fit", fit);
    this._stage.style.width = `${width * fit}px`;
    this._stage.style.height = `${height * fit}px`;
  },

  _moreInfo() {
    if (this._config.tap_action === "none" || !this._config.entity) return;
    const event = new Event("hass-more-info", { bubbles: true, composed: true });
    event.detail = { entityId: this._config.entity };
    this.dispatchEvent(event);
  }
};