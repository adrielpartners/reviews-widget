// src/widget/themes/tokens.js — CSS custom properties for all themes.
(function () {
  "use strict";

  var BASE = {};
  BASE["--rw-color-bg"] = "#ffffff";
  BASE["--rw-color-text"] = "#1a1a2e";
  BASE["--rw-color-text-secondary"] = "#6b7280";
  BASE["--rw-color-border"] = "#e5e7eb";
  BASE["--rw-color-star"] = "#f59e0b";
  BASE["--rw-color-star-empty"] = "#d1d5db";
  BASE["--rw-color-cta-bg"] = "#2563eb";
  BASE["--rw-color-cta-text"] = "#ffffff";
  BASE["--rw-color-card-bg"] = "#ffffff";
  BASE["--rw-color-overlay"] = "rgba(0,0,0,0.5)";
  BASE["--rw-color-modal-bg"] = "#ffffff";
  BASE["--rw-font-family"] = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
  BASE["--rw-font-size-xs"] = "0.75rem";
  BASE["--rw-font-size-sm"] = "0.875rem";
  BASE["--rw-font-size-base"] = "1rem";
  BASE["--rw-font-size-lg"] = "1.125rem";
  BASE["--rw-font-size-xl"] = "1.25rem";
  BASE["--rw-space-1"] = "0.25rem";
  BASE["--rw-space-2"] = "0.5rem";
  BASE["--rw-space-3"] = "0.75rem";
  BASE["--rw-space-4"] = "1rem";
  BASE["--rw-space-6"] = "1.5rem";
  BASE["--rw-space-8"] = "2rem";
  BASE["--rw-radius-sm"] = "0.375rem";
  BASE["--rw-radius-md"] = "0.5rem";
  BASE["--rw-radius-lg"] = "0.75rem";
  BASE["--rw-radius-full"] = "9999px";
  BASE["--rw-shadow-sm"] = "0 1px 2px rgba(0,0,0,0.05)";
  BASE["--rw-shadow-md"] = "0 4px 6px rgba(0,0,0,0.07)";
  BASE["--rw-shadow-lg"] = "0 10px 25px rgba(0,0,0,0.1)";
  BASE["--rw-shadow-xl"] = "0 20px 50px rgba(0,0,0,0.15)";
  BASE["--rw-transition-fast"] = "150ms ease";
  BASE["--rw-transition-base"] = "300ms ease";
  BASE["--rw-z-base"] = "1";
  BASE["--rw-z-flyout"] = "9999";
  BASE["--rw-z-modal"] = "10000";

  var THEMES = {};
  THEMES["default"] = {};

  THEMES["modern"] = {};
  THEMES["modern"]["--rw-color-bg"] = "#0f172a";
  THEMES["modern"]["--rw-color-text"] = "#f1f5f9";
  THEMES["modern"]["--rw-color-text-secondary"] = "#94a3b8";
  THEMES["modern"]["--rw-color-border"] = "#1e293b";
  THEMES["modern"]["--rw-color-star"] = "#fbbf24";
  THEMES["modern"]["--rw-color-star-empty"] = "#334155";
  THEMES["modern"]["--rw-color-cta-bg"] = "#3b82f6";
  THEMES["modern"]["--rw-color-cta-text"] = "#ffffff";
  THEMES["modern"]["--rw-color-card-bg"] = "#1e293b";
  THEMES["modern"]["--rw-shadow-md"] = "0 4px 12px rgba(0,0,0,0.3)";
  THEMES["modern"]["--rw-shadow-lg"] = "0 10px 30px rgba(0,0,0,0.4)";

  THEMES["professional"] = {};
  THEMES["professional"]["--rw-color-bg"] = "#fafafa";
  THEMES["professional"]["--rw-color-text"] = "#2d3748";
  THEMES["professional"]["--rw-color-text-secondary"] = "#718096";
  THEMES["professional"]["--rw-color-border"] = "#cbd5e0";
  THEMES["professional"]["--rw-color-star"] = "#d69e2e";
  THEMES["professional"]["--rw-color-star-empty"] = "#e2e8f0";
  THEMES["professional"]["--rw-color-cta-bg"] = "#2b6cb0";
  THEMES["professional"]["--rw-color-cta-text"] = "#ffffff";
  THEMES["professional"]["--rw-color-card-bg"] = "#ffffff";
  THEMES["professional"]["--rw-radius-sm"] = "0.25rem";
  THEMES["professional"]["--rw-radius-md"] = "0.375rem";
  THEMES["professional"]["--rw-radius-lg"] = "0.5rem";

  THEMES["pastel"] = {};
  THEMES["pastel"]["--rw-color-bg"] = "#fef7f0";
  THEMES["pastel"]["--rw-color-text"] = "#4a3728";
  THEMES["pastel"]["--rw-color-text-secondary"] = "#8b7355";
  THEMES["pastel"]["--rw-color-border"] = "#e8ddd0";
  THEMES["pastel"]["--rw-color-star"] = "#f6ad55";
  THEMES["pastel"]["--rw-color-star-empty"] = "#ddd0c0";
  THEMES["pastel"]["--rw-color-cta-bg"] = "#ed8936";
  THEMES["pastel"]["--rw-color-cta-text"] = "#ffffff";
  THEMES["pastel"]["--rw-color-card-bg"] = "#ffffff";

  window.ReviewsWidget = window.ReviewsWidget || {};

  window.ReviewsWidget.getThemeTokens = function (themeName) {
    var tokens = {};
    var k;
    for (k in BASE) {
      if (Object.prototype.hasOwnProperty.call(BASE, k)) tokens[k] = BASE[k];
    }
    var overrides = THEMES[themeName] || THEMES["default"];
    for (k in overrides) {
      if (Object.prototype.hasOwnProperty.call(overrides, k)) tokens[k] = overrides[k];
    }
    return tokens;
  };

  window.ReviewsWidget.getAllThemeNames = function () {
    return Object.keys(THEMES);
  };
})();
