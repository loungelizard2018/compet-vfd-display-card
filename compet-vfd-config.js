export const configMethods = {
  setConfig(config) {
    if (!config || (!config.entity && config.value === undefined)) {
      throw new Error("COMPET VFD Display Card: configure 'entity' or 'value'.");
    }
    this._config = {
      entity: null,
      attribute: null,
      value: undefined,
      integer_digits: 8,
      decimals: 0,
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
      inactive_color: "rgba(32,245,107,.035)",
      show_mesh: true,
      tube_width: 58,
      tube_height: 112,
      tube_gap: 8,
      decimal_marker: true,
      decimal_marker_color: "#e33b32",
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
      screw_size: this._num(config.screw_size, 12, 56, 28),
      tube_width: this._num(config.tube_width, 38, 90, 58),
      tube_height: this._num(config.tube_height, 78, 170, 112),
      tube_gap: this._num(config.tube_gap, 1, 24, 8),
      scale: this._num(config.scale, .35, 2.5, 1),
      max_fit_scale: this._num(config.max_fit_scale, .25, 2.5, 1)
    };
    this._render();
  }
};