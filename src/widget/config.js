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

    // Parse custom color overrides from data-color-* attributes
    var customColors = {};
    var COLOR_PROPS = [
      "colorBg", "colorText", "colorTextSecondary", "colorBorder",
      "colorStar", "colorStarEmpty", "colorCtaBg", "colorCtaText", "colorCardBg"
    ];
    for (var ci = 0; ci < COLOR_PROPS.length; ci++) {
      var prop = COLOR_PROPS[ci];
      var val = dataset[prop];
      if (val && /^#[0-9a-fA-F]{3,8}$|^rgba?\(/.test(val.trim())) {
        customColors[prop] = val.trim();
      }
    }

    // Parse custom font size overrides from data-font-size-* attributes
    var customFontSizes = {};
    var FONT_SIZE_PROPS = ["sizeHeadline", "sizeTestimonial", "sizeAuthor", "sizeReadMore"];
    for (var fi = 0; fi < FONT_SIZE_PROPS.length; fi++) {
      var fprop = FONT_SIZE_PROPS[fi];
      var fval = dataset[fprop];
      if (fval && /^\\d+(\\.\\d+)?(px|rem|em)$/.test(fval.trim())) {
        customFontSizes[fprop] = fval.trim();
      }
    }

    // Parse custom font family overrides from data-font-family-* attributes
    var customFontFamilies = {};
    if (dataset.fontFamilyHeadline) customFontFamilies.fontFamilyHeadline = dataset.fontFamilyHeadline.trim();
    if (dataset.fontFamilyBody) customFontFamilies.fontFamilyBody = dataset.fontFamilyBody.trim();

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
      customClass: sanitizeClassName(dataset.customClass),
      customColors: customColors,
      customFontSizes: customFontSizes,
      customFontFamilies: customFontFamilies
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

  // Merge remote widget defaults with local data-* overrides.
  // Remote config: the defaults set by the admin dashboard.
  // Local config: parsed from the embed script tag's data-* attributes.
  // Rule: local (data-*) value always wins over remote default.
  window.ReviewsWidget.mergeConfig = function (remote, local) {
    if (!remote) return local;

    var merged = {};
    // Start with all local values
    for (var k in local) {
      if (local.hasOwnProperty(k)) merged[k] = local[k];
    }

    // Fill in remote defaults where local didn't provide a value
    var REMOTE_KEYS = [
      "mode", "layout", "theme", "position", "maxReviews",
      "ctaText", "ctaUrl", "mount", "customClass"
    ];
    for (var ri = 0; ri < REMOTE_KEYS.length; ri++) {
      var key = REMOTE_KEYS[ri];
      if (merged[key] === undefined && remote[key] !== undefined && remote[key] !== null) {
        merged[key] = remote[key];
      }
    }

    // Deep merge for custom colors
    merged.customColors = {};
    if (remote.customColors) {
      for (var ck in remote.customColors) {
        if (remote.customColors.hasOwnProperty(ck)) merged.customColors[ck] = remote.customColors[ck];
      }
    }
    if (local.customColors) {
      for (var lck in local.customColors) {
        if (local.customColors.hasOwnProperty(lck)) merged.customColors[lck] = local.customColors[lck];
      }
    }

    // Deep merge for font sizes
    merged.customFontSizes = {};
    if (remote.customFontSizes) {
      for (var fk in remote.customFontSizes) {
        if (remote.customFontSizes.hasOwnProperty(fk)) merged.customFontSizes[fk] = remote.customFontSizes[fk];
      }
    }
    if (local.customFontSizes) {
      for (var lfk in local.customFontSizes) {
        if (local.customFontSizes.hasOwnProperty(lfk)) merged.customFontSizes[lfk] = local.customFontSizes[lfk];
      }
    }

    // Deep merge for font families
    merged.customFontFamilies = {};
    if (remote.customFontFamilies) {
      for (var ffk in remote.customFontFamilies) {
        if (remote.customFontFamilies.hasOwnProperty(ffk)) merged.customFontFamilies[ffk] = remote.customFontFamilies[ffk];
      }
    }
    if (local.customFontFamilies) {
      for (var lffk in local.customFontFamilies) {
        if (local.customFontFamilies.hasOwnProperty(lffk)) merged.customFontFamilies[lffk] = local.customFontFamilies[lffk];
      }
    }

    return merged;
  };
})();
