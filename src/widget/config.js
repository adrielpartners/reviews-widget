// src/widget/config.js
(function () {
  "use strict";

  var DEFAULTS = {
    mode: "inline",
    layout: "grid",
    theme: "default",
    position: "bottom-right",
    maxReviews: 3
  };

  var VALID_MODES = ["inline", "flyout"];
  var VALID_LAYOUTS = ["grid", "carousel"];
  var VALID_THEMES = ["default", "modern", "professional", "pastel"];
  var VALID_POSITIONS = ["bottom-right", "bottom-center", "bottom-left"];
  var MAX_REVIEWS_CAP = 50;

  window.ReviewsWidget = window.ReviewsWidget || {};

  window.ReviewsWidget.parseConfig = function parseConfig(scriptEl) {
    var dataset = scriptEl.dataset;
    var placeId = (dataset.placeId || "").trim();

    if (!placeId) {
      console.warn("[reviews-widget] Missing data-place-id");
      return null;
    }

    var maxReviews = parseInt(dataset.maxReviews || String(DEFAULTS.maxReviews), 10);
    if (isNaN(maxReviews) || maxReviews < 1) maxReviews = DEFAULTS.maxReviews;
    if (maxReviews > MAX_REVIEWS_CAP) maxReviews = MAX_REVIEWS_CAP;

    return {
      placeId: placeId,
      mode: sanitizeEnum(dataset.mode, VALID_MODES, DEFAULTS.mode),
      layout: sanitizeEnum(dataset.layout, VALID_LAYOUTS, DEFAULTS.layout),
      theme: sanitizeEnum(dataset.theme, VALID_THEMES, DEFAULTS.theme),
      position: sanitizeEnum(dataset.position, VALID_POSITIONS, DEFAULTS.position),
      maxReviews: maxReviews,
      ctaText: sanitizeText(dataset.ctaText),
      ctaUrl: sanitizeUrl(dataset.ctaUrl),
      mount: sanitizeMountSelector(dataset.mount),
      customClass: sanitizeClassName(dataset.customClass)
    };
  };

  function sanitizeEnum(value, valid, fallback) {
    if (value && valid.indexOf(value) !== -1) return value;
    return fallback;
  }

  function sanitizeText(value) {
    if (!value) return undefined;
    var t = value.trim().slice(0, 200);
    return t || undefined;
  }

  function sanitizeUrl(value) {
    if (!value) return undefined;
    var trimmed = value.trim();
    try {
      var url = new URL(trimmed);
      if (url.protocol === "http:" || url.protocol === "https:") return trimmed;
    } catch (e) {}
    return undefined;
  }

  function sanitizeMountSelector(value) {
    if (!value) return undefined;
    var t = value.trim();
    if (t.length === 0 || t.length > 200) return undefined;
    if (/^[#.][a-zA-Z0-9_ \-]+$/.test(t)) return t;
    return undefined;
  }

  function sanitizeClassName(value) {
    if (!value) return undefined;
    var t = value.trim();
    if (t.length === 0 || t.length > 100) return undefined;
    if (/^[a-zA-Z0-9_ \-]+$/.test(t)) return t;
    return undefined;
  }
})();
