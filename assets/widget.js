// Reviews Widget v1.0.0
// https://reviews.marketinghero.net

// --- config.js ---
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

    var maxReviews = undefined;
    if (dataset.maxReviews) {
      var parsed = parseInt(dataset.maxReviews, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= MAX_REVIEWS_CAP) maxReviews = parsed;
    }

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
      mode: sanitizeEnum(dataset.mode, VALID_MODES),
      layout: sanitizeEnum(dataset.layout, VALID_LAYOUTS),
      theme: sanitizeEnum(dataset.theme, VALID_THEMES),
      position: sanitizeEnum(dataset.position, VALID_POSITIONS),
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
  // Rule: remote provides defaults, local data-* overrides win.
  window.ReviewsWidget.mergeConfig = function (remote, local) {
    if (!remote) {
      // No remote config — apply DEFAULTS where local left values undefined
      for (var dk in DEFAULTS) {
        if (local[dk] === undefined || local[dk] === null) local[dk] = DEFAULTS[dk];
      }
      return local;
    }

    var merged = {};

    // 1. Start with remote defaults (Admin dashboard settings)
    for (var rk in remote) {
      if (remote.hasOwnProperty(rk)) merged[rk] = remote[rk];
    }

    // 2. Override with local (data-*) values where explicitly provided
    for (var lk in local) {
      if (local.hasOwnProperty(lk) && local[lk] !== undefined && local[lk] !== null) {
        merged[lk] = local[lk];
      }
    }

    // 3. Apply hard-coded DEFAULTS for anything still undefined
    for (var dk in DEFAULTS) {
      if (merged[dk] === undefined || merged[dk] === null) merged[dk] = DEFAULTS[dk];
    }

    // 4. Deep merge for custom colors
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


// --- api-client.js ---
// src/widget/api-client.js
(function () {
  "use strict";

  window.ReviewsWidget = window.ReviewsWidget || {};

  // Derive the API base URL from the script's src attribute.
  // Handles CDN, custom domains, and local dev.
  window.ReviewsWidget.getApiBase = function (scriptEl) {
    var src = scriptEl.getAttribute("src") || "";
    try {
      var url = new URL(src);
      return url.origin;
    } catch (e) {
      // Fallback: if URL parsing fails, use current origin
      return window.location.origin;
    }
  };

  // Fetch cached review data from the Worker API.
  // Returns a promise that resolves to the review data or null.
  window.ReviewsWidget.fetchReviews = function (apiBase, placeId) {
    if (!placeId) return Promise.resolve(null);

    var url = apiBase + "/api/reviews?placeId=" + encodeURIComponent(placeId);

    return fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" }
    })
      .then(function (response) {
        if (!response.ok) return null;
        return response.json();
      })
      .then(function (json) {
        if (json && json.ok && json.data) return json.data;
        return null;
      })
      .catch(function () {
        return null;
      });
  };

  // Fire an analytics event to the tracking endpoint.
  // Uses sendBeacon for fire-and-forget delivery.
  window.ReviewsWidget.trackEvent = function (apiBase, placeId, eventName) {
    try {
      var payload = JSON.stringify({
        placeId: placeId || "",
        site: window.location.hostname || "",
        event: eventName
      });
      navigator.sendBeacon(apiBase + "/api/track", payload);
    } catch (e) {
      // Silently fail — analytics should never block the widget
    }
  };

  // Fetch remote widget config (design defaults) from the Worker API.
  // Returns a promise that resolves to the config or null.
  window.ReviewsWidget.fetchRemoteConfig = function (apiBase, placeId) {
    if (!placeId) return Promise.resolve(null);
    var url = apiBase + "/api/config?placeId=" + encodeURIComponent(placeId);
    return fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (json) {
        if (json && json.ok && json.data && json.data.config) return json.data.config;
        return null;
      })
      .catch(function () { return null; });
  };
})();


// --- render.js ---
// src/widget/render.js — Core rendering helpers.
(function () {
  "use strict";

  window.ReviewsWidget = window.ReviewsWidget || {};

  // Inject a <style> block with all CSS rules into the document head.
  // Uses CSS custom properties set on the root element for theming.
  var _stylesInjected = false;
  window.ReviewsWidget.injectStyles = function () {
    if (_stylesInjected) return;
    _stylesInjected = true;

    var css = [
      ".rw-root{all:initial;font-family:var(--rw-font-family);font-size:var(--rw-font-size-base);color:var(--rw-color-text);line-height:1.5;background:var(--rw-color-bg);box-sizing:border-box;}",
      ".rw-root *,.rw-root *::before,.rw-root *::after{box-sizing:border-box;}",
      ".rw-summary{display:flex;align-items:center;gap:var(--rw-space-2);margin-bottom:var(--rw-space-4);}",
      ".rw-summary-name{font-weight:700;font-size:var(--rw-font-size-lg);font-family:var(--rw-font-family-heading);}",
      ".rw-summary-rating{font-weight:600;color:var(--rw-color-star);white-space:nowrap;}",
      ".rw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--rw-space-4);}",
      ".rw-grid-item{display:flex;flex-direction:column;gap:var(--rw-space-2);}",
      ".rw-card{background:var(--rw-color-card-bg);border:1px solid var(--rw-color-border);border-radius:var(--rw-radius-lg);padding:var(--rw-space-4);box-shadow:var(--rw-shadow-sm);display:flex;flex-direction:column;gap:var(--rw-space-3);}",
      ".rw-stars{display:flex;gap:1px;font-size:var(--rw-font-size-base);line-height:1;}",
      ".rw-star--filled{color:var(--rw-color-star);}",
      ".rw-star--empty{color:var(--rw-color-star-empty);}",
      ".rw-card-text{font-size:var(--rw-font-size-sm);line-height:1.6;color:var(--rw-color-text);margin:0;}",
      ".rw-card-footer{display:flex;align-items:center;gap:var(--rw-space-2);font-size:var(--rw-font-size-xs);color:var(--rw-color-text-secondary);}",
      ".rw-card-author{font-weight:600;}",
      ".rw-read-more{align-self:flex-end;background:none;border:none;color:var(--rw-color-cta-bg);font-size:var(--rw-font-size-xs);font-weight:600;cursor:pointer;padding:var(--rw-space-1) 0;margin-top:auto;}",
      ".rw-read-more:hover{text-decoration:underline;}",
      ".rw-empty{padding:var(--rw-space-6) var(--rw-space-4);text-align:center;color:var(--rw-color-text-secondary);font-size:var(--rw-font-size-sm);}",
      ".rw-cta{display:inline-flex;align-items:center;gap:var(--rw-space-2);background:var(--rw-color-cta-bg);color:var(--rw-color-cta-text);border:none;border-radius:var(--rw-radius-md);padding:var(--rw-space-2) var(--rw-space-4);font-size:var(--rw-font-size-sm);font-weight:600;text-decoration:none;cursor:pointer;margin-top:var(--rw-space-4);transition:opacity var(--rw-transition-fast);}",
      ".rw-cta:hover{opacity:.85;}",
      ".rw-cta-icon{width:1em;height:1em;fill:currentColor;}",
      // Flyout mode
      ".rw-mode-flyout{position:fixed;z-index:var(--rw-z-flyout);max-width:360px;width:100%;box-shadow:var(--rw-shadow-lg);border-radius:var(--rw-radius-lg);transition:opacity var(--rw-transition-base);}",
      ".rw-mode-flyout.rw-flyout-animating{transition:transform 0.4s ease,opacity 0.4s ease;}",
      ".rw-flyout-summary{display:flex;align-items:center;gap:var(--rw-space-2);padding:var(--rw-space-3) var(--rw-space-4);cursor:pointer;user-select:none;}",
      ".rw-flyout-rating{font-weight:700;color:var(--rw-color-star);}",
      ".rw-flyout-count{font-size:var(--rw-font-size-xs);color:var(--rw-color-text-secondary);}",
      ".rw-flyout-panel{position:relative;padding:var(--rw-space-3) var(--rw-space-3) var(--rw-space-2);}",
      ".rw-flyout-collapse{position:absolute;top:10px;right:10px;z-index:2;background:var(--rw-color-card-bg);border:1px solid var(--rw-color-border);border-radius:50%;width:2.5rem;height:2.5rem;display:flex;align-items:center;justify-content:center;font-size:1.25rem;cursor:pointer;color:var(--rw-color-text-secondary);line-height:1;}",
      ".rw-flyout-collapse:hover{background:var(--rw-color-border);}",
      ".rw-flyout-review{margin-bottom:var(--rw-space-2);}",
      ".rw-flyout-dots{display:flex;gap:var(--rw-space-1);justify-content:center;margin-bottom:var(--rw-space-2);}",
      ".rw-mode-flyout.rw-position--bottom-right{bottom:var(--rw-space-4);right:var(--rw-space-4);}",
      ".rw-mode-flyout.rw-position--bottom-left{bottom:var(--rw-space-4);left:var(--rw-space-4);}",
      ".rw-mode-flyout.rw-position--bottom-center{bottom:var(--rw-space-4);left:50%;transform:translateX(-50%);}",
      // Modal
      // Animations
      "@keyframes rw-fade-in-up{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}",
      "@keyframes rw-fade-out-down{from{opacity:1;transform:translateY(0);}to{opacity:0;transform:translateY(30px);}}",
      "@keyframes rw-fade-in-right{from{opacity:0;transform:translateX(60px);}to{opacity:1;transform:translateX(0);}}",
      "@keyframes rw-fade-out-right{from{opacity:1;transform:translateX(0);}to{opacity:0;transform:translateX(60px);}}",
      "@keyframes rw-fade-in{from{opacity:0;}to{opacity:1;}}",
      "@keyframes rw-fade-out{from{opacity:1;}to{opacity:0;}}",
      ".rw-modal-overlay{position:fixed;inset:0;z-index:var(--rw-z-modal);background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:var(--rw-space-4);animation:rw-fade-in .3s ease forwards;}",
      ".rw-modal-overlay.rw-closing{animation:rw-fade-out .25s ease forwards;}",
      ".rw-modal{background:#ffffff;border-radius:1rem;max-width:500px;width:100%;max-height:80vh;overflow-y:auto;padding:2.5rem;position:relative;box-shadow:0 25px 60px rgba(0,0,0,0.2);border:1px solid #e5e7eb;animation:rw-fade-in-up .35s ease forwards;}",
      ".rw-modal-overlay.rw-closing .rw-modal{animation:rw-fade-out-down .25s ease forwards;}",
      ".rw-modal-close{position:absolute;top:1rem;right:1rem;background:#ffffff;border:1px solid #e5e7eb;border-radius:50%;width:3.5rem;height:3.5rem;display:flex;align-items:center;justify-content:center;font-size:3.375rem;cursor:pointer;color:#6b7280;z-index:1;line-height:1;}",
      ".rw-modal-close:hover{background:#f3f4f6;}",
      ".rw-modal-author{font-weight:700;font-size:2.25rem;margin-bottom:1.125rem;}",
      ".rw-modal-stars{display:flex;gap:3px;font-size:2.25rem;line-height:1;margin-bottom:1.5rem;}",
      ".rw-modal-stars .rw-star--filled{color:#f59e0b;}",
      ".rw-modal-stars .rw-star--empty{color:#d1d5db;}",
      ".rw-modal-text{font-size:1.96875rem;line-height:1.7;color:#1a1a2e;margin:0;}",
      ".rw-modal-time{font-size:1.6875rem;color:#6b7280;margin-top:1.5rem;}",
      // Carousel
      ".rw-carousel{position:relative;overflow:hidden;padding:0 2.5rem;}",
      ".rw-carousel-track{display:flex;transition:transform var(--rw-transition-base);}",
      ".rw-carousel-slide{flex:0 0 100%;}",
      ".rw-carousel-prev,.rw-carousel-next{position:absolute;top:50%;transform:translateY(-50%);background:var(--rw-color-card-bg);border:1px solid var(--rw-color-border);border-radius:var(--rw-radius-full);width:2.25rem;height:2.25rem;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--rw-shadow-sm);font-size:var(--rw-font-size-lg);z-index:10;}",
      ".rw-carousel-prev{left:0.25rem;}",
      ".rw-carousel-next{right:0.25rem;}",
    ].join("\n");

    var styleEl = document.createElement("style");
    styleEl.setAttribute("data-rw-widget", "");
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  };

  window.ReviewsWidget.applyTheme = function (rootEl, themeName, customColors, customFontSizes, customFontFamilies) {
    var tokens = window.ReviewsWidget.getThemeTokens(themeName);
    for (var k in tokens) {
      if (Object.prototype.hasOwnProperty.call(tokens, k)) {
        rootEl.style.setProperty(k, tokens[k]);
      }
    }
    // Apply custom color overrides on top of theme tokens
    if (customColors) {
      var CUSTOM_COLOR_MAP = {
        colorBg: "--rw-color-bg",
        colorText: "--rw-color-text",
        colorTextSecondary: "--rw-color-text-secondary",
        colorBorder: "--rw-color-border",
        colorStar: "--rw-color-star",
        colorStarEmpty: "--rw-color-star-empty",
        colorCtaBg: "--rw-color-cta-bg",
        colorCtaText: "--rw-color-cta-text",
        colorCardBg: "--rw-color-card-bg"
      };
      for (var ck in customColors) {
        if (Object.prototype.hasOwnProperty.call(customColors, ck) && CUSTOM_COLOR_MAP[ck]) {
          rootEl.style.setProperty(CUSTOM_COLOR_MAP[ck], customColors[ck]);
        }
      }
    }
    // Apply custom font size overrides
    if (customFontSizes) {
      var FONT_SIZE_MAP = {
        sizeHeadline: "--rw-font-size-lg",
        sizeTestimonial: "--rw-font-size-sm",
        sizeAuthor: "--rw-font-size-base",
        sizeReadMore: "--rw-font-size-xs"
      };
      for (var fsk in customFontSizes) {
        if (Object.prototype.hasOwnProperty.call(customFontSizes, fsk) && FONT_SIZE_MAP[fsk]) {
          rootEl.style.setProperty(FONT_SIZE_MAP[fsk], customFontSizes[fsk]);
        }
      }
    }
    // Apply custom font family overrides
    if (customFontFamilies) {
      if (customFontFamilies.fontFamilyHeadline) {
        rootEl.style.setProperty("--rw-font-family-heading", customFontFamilies.fontFamilyHeadline);
      }
      if (customFontFamilies.fontFamilyBody) {
        rootEl.style.setProperty("--rw-font-family", customFontFamilies.fontFamilyBody);
      }
    }
  };

  window.ReviewsWidget.createRoot = function (config) {
    var root = document.createElement("div");
    var cls = ["rw-root", "rw-theme--" + (config.theme || "default")];
    if (config.mode === "flyout") {
      cls.push("rw-mode-flyout");
      cls.push("rw-position--" + (config.position || "bottom-right"));
    }
    if (config.customClass) {
      cls.push(config.customClass);
    }
    root.className = cls.join(" ");

    // Inject global CSS styles (idempotent — only runs once)
    window.ReviewsWidget.injectStyles();

    window.ReviewsWidget.applyTheme(root, config.theme || "default", config.customColors, config.customFontSizes, config.customFontFamilies);

    // Mount: use custom selector, or default to script insertion point
    if (config.mount) {
      var mountEl = document.querySelector(config.mount);
      if (mountEl) {
        mountEl.appendChild(root);
        return root;
      }
      console.warn("[reviews-widget] Mount selector not found:", config.mount);
    }

    var scriptEl = document.currentScript;
    if (scriptEl && scriptEl.parentNode) {
      scriptEl.parentNode.insertBefore(root, scriptEl);
    } else {
      document.body.appendChild(root);
    }

    return root;
  };

  window.ReviewsWidget.renderEmpty = function (rootEl) {
    rootEl.innerHTML = "";
    var msg = document.createElement("div");
    msg.className = "rw-empty";
    msg.textContent = "No reviews available yet.";
    rootEl.appendChild(msg);
  };
})();


// --- themes/tokens.js ---
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
  BASE["--rw-color-overlay"] = "rgba(0,0,0,0.6)";
  BASE["--rw-color-modal-bg"] = "#ffffff";
  BASE["--rw-font-family"] = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
  BASE["--rw-font-family-heading"] = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
  BASE["--rw-font-size-xs"] = "0.875rem";
  BASE["--rw-font-size-sm"] = "1.3125rem";
  BASE["--rw-font-size-base"] = "1.5rem";
  BASE["--rw-font-size-lg"] = "1.6875rem";
  BASE["--rw-font-size-xl"] = "1.875rem";
  BASE["--rw-space-1"] = "0.375rem";
  BASE["--rw-space-2"] = "0.75rem";
  BASE["--rw-space-3"] = "1.125rem";
  BASE["--rw-space-4"] = "1.5rem";
  BASE["--rw-space-6"] = "2.25rem";
  BASE["--rw-space-8"] = "3rem";
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


// --- components/review-card.js ---
// src/widget/components/review-card.js
(function () {
  "use strict";

  window.ReviewsWidget = window.ReviewsWidget || {};

  // Render a single review card into the given container.
  // data: { authorName, rating, text, relativeTimeDescription, authorPhotoUrl, profileUrl }
  // opts: { maxCharacters: number }
  window.ReviewsWidget.renderReviewCard = function (container, data, opts) {
    opts = opts || {};
    var maxChars = opts.maxCharacters || 200;

    var card = document.createElement("div");
    card.className = "rw-card";

    // Star rating
    var starsEl = renderStars(data.rating);
    card.appendChild(starsEl);

    // Review text (truncated)
    var textEl = document.createElement("p");
    textEl.className = "rw-card-text";
    var text = data.text || "";
    if (text.length > maxChars) {
      text = text.slice(0, maxChars) + "...";
    }
    textEl.textContent = text;
    card.appendChild(textEl);

    // Author + time footer
    var footer = document.createElement("div");
    footer.className = "rw-card-footer";

    var authorEl = document.createElement("span");
    authorEl.className = "rw-card-author";
    authorEl.textContent = data.authorName || "Anonymous";
    footer.appendChild(authorEl);

    if (data.relativeTimeDescription) {
      var timeEl = document.createElement("span");
      timeEl.className = "rw-card-time";
      timeEl.textContent = data.relativeTimeDescription;
      footer.appendChild(timeEl);
    }

    card.appendChild(footer);

    container.appendChild(card);
  };

  // Render star rating visual. Returns an element.
  function renderStars(rating) {
    var wrap = document.createElement("div");
    wrap.className = "rw-stars";
    wrap.setAttribute("aria-label", "Rating: " + (rating || 0) + " out of 5");

    var r = Math.round(rating || 0);
    for (var i = 1; i <= 5; i++) {
      var star = document.createElement("span");
      star.className = "rw-star";
      if (i <= r) {
        star.classList.add("rw-star--filled");
        star.textContent = "\u2605";
      } else {
        star.classList.add("rw-star--empty");
        star.textContent = "\u2606";
      }
      wrap.appendChild(star);
    }

    return wrap;
  }
})();


// --- components/modal.js ---
// src/widget/components/modal.js
(function () {
  "use strict";

  window.ReviewsWidget = window.ReviewsWidget || {};

  // Show a modal overlay with the full review text.
  // Returns a function to close the modal.
  window.ReviewsWidget.showModal = function (data) {
    // Fire analytics event for panel open
    var scriptEl = document.currentScript || document.querySelector('script[src*="widget.js"]');
    if (scriptEl) {
      var apiBase = window.ReviewsWidget.getApiBase(scriptEl);
      var localConfig = window.ReviewsWidget._lastConfig;
      window.ReviewsWidget.trackEvent(apiBase, localConfig && localConfig.placeId, "panel_open");
    }
    // Fade out flyout if open so it doesn't overlap the modal
    var flyoutEl = document.querySelector(".rw-mode-flyout");
    var flyoutWasVisible = false;
    var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (flyoutEl) {
      var flyoutPanel = flyoutEl.querySelector(".rw-flyout-panel");
      flyoutWasVisible = flyoutPanel && flyoutPanel.style.display !== "none";
      if (!prefersReducedMotion && flyoutWasVisible) {
        flyoutEl.classList.add("rw-flyout-hiding");
        flyoutEl.style.transition = "transform 0.3s ease, opacity 0.3s ease";
        flyoutEl.style.transform = "translateX(60px)";
        flyoutEl.style.opacity = "0";
        setTimeout(function () {
          flyoutEl.style.display = "none";
          flyoutEl.classList.remove("rw-flyout-hiding");
          flyoutEl.style.transform = "";
          flyoutEl.style.opacity = "";
        }, 300);
      } else {
        flyoutEl.style.display = "none";
      }
    }

    var root = document.createElement("div");
    root.className = "rw-modal-overlay";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");

    var modal = document.createElement("div");
    modal.className = "rw-modal";

    // Close button
    var closeBtn = document.createElement("button");
    closeBtn.className = "rw-modal-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.textContent = "\u00D7";
    closeBtn.addEventListener("click", close);
    modal.appendChild(closeBtn);

    // Author
    var authorEl = document.createElement("div");
    authorEl.className = "rw-modal-author";
    authorEl.textContent = data.authorName || "Anonymous";
    modal.appendChild(authorEl);

    // Stars
    var starsContainer = document.createElement("div");
    starsContainer.className = "rw-modal-stars";
    var r = Math.round(data.rating || 0);
    for (var i = 1; i <= 5; i++) {
      var star = document.createElement("span");
      star.className = "rw-star" + (i <= r ? " rw-star--filled" : " rw-star--empty");
      star.textContent = i <= r ? "\u2605" : "\u2606";
      starsContainer.appendChild(star);
    }
    modal.appendChild(starsContainer);

    // Full text
    var textEl = document.createElement("p");
    textEl.className = "rw-modal-text";
    textEl.textContent = data.text || "";
    modal.appendChild(textEl);

    // Time
    if (data.relativeTimeDescription) {
      var timeEl = document.createElement("div");
      timeEl.className = "rw-modal-time";
      timeEl.textContent = data.relativeTimeDescription;
      modal.appendChild(timeEl);
    }

    root.appendChild(modal);
    document.body.appendChild(root);

    // Close on overlay click
    root.addEventListener("click", function (e) {
      if (e.target === root) close();
    });

    // Close on Escape
    var keyHandler = function (e) {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", keyHandler);

    function close() {
      document.removeEventListener("keydown", keyHandler);
      // Animate modal + overlay out
      root.classList.add("rw-closing");
      // Restore flyout with animation if it was visible
      if (flyoutEl && flyoutWasVisible) {
        flyoutEl.style.display = "";
        flyoutEl.style.opacity = "0";
        flyoutEl.style.transform = "translateX(60px)";
        flyoutEl.style.transition = "none";
        // Force reflow then animate in
        flyoutEl.offsetHeight; // eslint-disable-line
        flyoutEl.style.transition = "transform 0.35s ease, opacity 0.35s ease";
        flyoutEl.style.transform = "translateX(0)";
        flyoutEl.style.opacity = "1";
      }
      setTimeout(function () {
        if (root.parentNode) root.parentNode.removeChild(root);
      }, 280);
    }

    return close;
  };
})();


// --- components/cta-button.js ---
// src/widget/components/cta-button.js
(function () {
  "use strict";

  window.ReviewsWidget = window.ReviewsWidget || {};

  // Render a CTA button. Returns the element or null if no config.
  window.ReviewsWidget.renderCtaButton = function (container, ctaText, ctaUrl) {
    if (!ctaText) return null;

    var btn = document.createElement("a");
    btn.className = "rw-cta";
    btn.textContent = ctaText;

    // Fire CTA click event
    btn.addEventListener("click", function () {
      var scriptEl = document.currentScript || document.querySelector('script[src*="widget.js"]');
      if (scriptEl) {
        var apiBase = window.ReviewsWidget.getApiBase(scriptEl);
        if (typeof window.ReviewsWidget._lastConfig !== "undefined" && window.ReviewsWidget._lastConfig) {
          window.ReviewsWidget.trackEvent(apiBase, window.ReviewsWidget._lastConfig.placeId, "cta_click");
        }
      }
    });
    if (ctaUrl) {
      btn.href = ctaUrl;
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";
    } else {
      btn.href = "#";
      btn.setAttribute("role", "button");
    }

    container.appendChild(btn);
    return btn;
  };
})();


// --- modes/inline-grid.js ---
// src/widget/modes/inline-grid.js
(function () {
  "use strict";

  window.ReviewsWidget = window.ReviewsWidget || {};

  window.ReviewsWidget.renderInlineGrid = function (rootEl, data, config) {
    rootEl.innerHTML = "";
    rootEl.className = rootEl.className + " rw-layout-grid";

    var reviews = data.reviews || [];
    var max = Math.min(reviews.length, config.maxReviews || 3);

    if (max === 0) {
      window.ReviewsWidget.renderEmpty(rootEl);
      return;
    }

    var grid = document.createElement("div");
    grid.className = "rw-grid";

    for (var i = 0; i < max; i++) {
      var cardWrapper = document.createElement("div");
      cardWrapper.className = "rw-grid-item";
      window.ReviewsWidget.renderReviewCard(cardWrapper, reviews[i], { maxCharacters: 150 });

      // Add "Read More" link if text was truncated
      if (reviews[i].text && reviews[i].text.length > 150) {
        var moreLink = document.createElement("button");
        moreLink.className = "rw-read-more";
        moreLink.textContent = "Read more";
        moreLink.addEventListener("click", (function (review) {
          return function () {
            window.ReviewsWidget.showModal(review);
          };
        })(reviews[i]));
        cardWrapper.appendChild(moreLink);
      }

      grid.appendChild(cardWrapper);
    }

    rootEl.appendChild(grid);

    // Summary header
    if (data.rating && data.reviewCount) {
      var header = document.createElement("div");
      header.className = "rw-summary";

      var nameEl = document.createElement("span");
      nameEl.className = "rw-summary-name";
      nameEl.textContent = data.businessName || "";
      header.appendChild(nameEl);

      var ratingEl = document.createElement("span");
      ratingEl.className = "rw-summary-rating";
      ratingEl.textContent = "\u2605 " + data.rating.toFixed(1) + " (" + data.reviewCount + " reviews)";
      header.appendChild(ratingEl);

      rootEl.insertBefore(header, grid);
    }

    // CTA
    if (config.ctaText) {
      var ctaContainer = document.createElement("div");
      ctaContainer.className = "rw-cta-wrap";
      window.ReviewsWidget.renderCtaButton(ctaContainer, config.ctaText, config.ctaUrl);
      rootEl.appendChild(ctaContainer);
    }
  };
})();


// --- modes/inline-carousel.js ---
// src/widget/modes/inline-carousel.js
(function () {
  "use strict";

  window.ReviewsWidget = window.ReviewsWidget || {};

  window.ReviewsWidget.renderInlineCarousel = function (rootEl, data, config) {
    rootEl.innerHTML = "";
    rootEl.className = rootEl.className + " rw-layout-carousel";

    var reviews = data.reviews || [];
    var max = Math.min(reviews.length, config.maxReviews || 3);

    if (max === 0) {
      window.ReviewsWidget.renderEmpty(rootEl);
      return;
    }

    // Summary header
    if (data.rating && data.reviewCount) {
      var header = document.createElement("div");
      header.className = "rw-summary";

      var nameEl = document.createElement("span");
      nameEl.className = "rw-summary-name";
      nameEl.textContent = data.businessName || "";
      header.appendChild(nameEl);

      var ratingEl = document.createElement("span");
      ratingEl.className = "rw-summary-rating";
      ratingEl.textContent = "\u2605 " + data.rating.toFixed(1) + " (" + data.reviewCount + " reviews)";
      header.appendChild(ratingEl);

      rootEl.appendChild(header);
    }

    // Carousel container
    var carouselWrap = document.createElement("div");
    carouselWrap.className = "rw-carousel";

    var track = document.createElement("div");
    track.className = "rw-carousel-track";

    var currentIndex = 0;
    var autoTimer = null;
    var autoInterval = 5000;
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Build slides
    for (var i = 0; i < max; i++) {
      var slide = document.createElement("div");
      slide.className = "rw-carousel-slide";
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", (i + 1) + " of " + max);

      window.ReviewsWidget.renderReviewCard(slide, reviews[i], { maxCharacters: 200 });

      if (reviews[i].text && reviews[i].text.length > 200) {
        var moreLink = document.createElement("button");
        moreLink.className = "rw-read-more";
        moreLink.textContent = "Read more";
        moreLink.addEventListener("click", (function (review) {
          return function () {
            window.ReviewsWidget.showModal(review);
          };
        })(reviews[i]));
        slide.appendChild(moreLink);
      }

      track.appendChild(slide);
    }

    carouselWrap.appendChild(track);

    // Navigation arrows
    var prevBtn = document.createElement("button");
    prevBtn.className = "rw-carousel-prev";
    prevBtn.setAttribute("aria-label", "Previous review");
    prevBtn.innerHTML = "&#8249;";
    prevBtn.addEventListener("click", function () { goTo(currentIndex - 1); });

    var nextBtn = document.createElement("button");
    nextBtn.className = "rw-carousel-next";
    nextBtn.setAttribute("label", "Next review");
    nextBtn.innerHTML = "&#8250;";
    nextBtn.addEventListener("click", function () { goTo(currentIndex + 1); });

    carouselWrap.appendChild(prevBtn);
    carouselWrap.appendChild(nextBtn);

    // Dot indicators
    var dotsWrap = document.createElement("div");
    dotsWrap.className = "rw-carousel-dots";
    dotsWrap.setAttribute("role", "tablist");
    dotsWrap.setAttribute("aria-label", "Review navigation");

    var dots = [];
    for (var d = 0; d < max; d++) {
      var dot = document.createElement("button");
      dot.className = "rw-carousel-dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Go to review " + (d + 1));
      dot.setAttribute("aria-selected", d === 0 ? "true" : "false");
      if (d === 0) dot.classList.add("rw-carousel-dot--active");

      dot.addEventListener("click", (function (idx) {
        return function () { goTo(idx); };
      })(d));

      dotsWrap.appendChild(dot);
      dots.push(dot);
    }

    carouselWrap.appendChild(dotsWrap);
    rootEl.appendChild(carouselWrap);

    // CTA
    if (config.ctaText) {
      var ctaContainer = document.createElement("div");
      ctaContainer.className = "rw-cta-wrap";
      window.ReviewsWidget.renderCtaButton(ctaContainer, config.ctaText, config.ctaUrl);
      rootEl.appendChild(ctaContainer);
    }

    // Navigation logic
    function goTo(idx) {
      if (idx < 0) idx = max - 1;
      if (idx >= max) idx = 0;
      currentIndex = idx;
      track.style.transform = "translateX(-" + (idx * 100) + "%)";

      // Update dots
      for (var j = 0; j < dots.length; j++) {
        dots[j].classList.toggle("rw-carousel-dot--active", j === idx);
        dots[j].setAttribute("aria-selected", j === idx ? "true" : "false");
      }

      resetAuto();
    }

    function resetAuto() {
      if (autoTimer) clearInterval(autoTimer);
      if (!reducedMotion) {
        autoTimer = setInterval(function () { goTo(currentIndex + 1); }, autoInterval);
      }
    }

    // Pause on hover
    carouselWrap.addEventListener("mouseenter", function () {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    });
    carouselWrap.addEventListener("mouseleave", resetAuto);

    // Pause when tab hidden
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
      } else {
        resetAuto();
      }
    });

    // Keyboard nav
    carouselWrap.setAttribute("tabindex", "0");
    carouselWrap.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(currentIndex - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(currentIndex + 1); }
    });

    // Initial slide position
    goTo(0);
  };
})();


// --- modes/flyout.js ---
// src/widget/modes/flyout.js
(function () {
  "use strict";

  window.ReviewsWidget = window.ReviewsWidget || {};

  window.ReviewsWidget.renderFlyout = function (rootEl, data, config) {
    var reviews = data.reviews || [];
    var max = Math.min(reviews.length, config.maxReviews || 10);

    if (max === 0) {
      window.ReviewsWidget.renderEmpty(rootEl);
      return;
    }

    rootEl.className = rootEl.className + " rw-flyout";

    // Summary bar (collapsed state)
    var summary = document.createElement("div");
    summary.className = "rw-flyout-summary";

    var ratingText = document.createElement("span");
    ratingText.className = "rw-flyout-rating";
    ratingText.textContent = "\u2605 " + (data.rating ? data.rating.toFixed(1) : "0");
    summary.appendChild(ratingText);

    var countText = document.createElement("span");
    countText.className = "rw-flyout-count";
    countText.textContent = "(" + (data.reviewCount || 0) + " reviews)";
    summary.appendChild(countText);

    rootEl.appendChild(summary);

    // Expanded review panel
    var panel = document.createElement("div");
    panel.className = "rw-flyout-panel";
    panel.style.display = "none";

    var currentIndex = 0;
    var autoTimer = null;
    var autoInterval = 5000;
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var isOpen = false;

    // Review display area
    var reviewArea = document.createElement("div");
    reviewArea.className = "rw-flyout-review";
    panel.appendChild(reviewArea);

    // Nav dots
    var dotsWrap = document.createElement("div");
    dotsWrap.className = "rw-flyout-dots";
    var dots = [];
    for (var d = 0; d < max; d++) {
      var dot = document.createElement("button");
      dot.className = "rw-carousel-dot";
      if (d === 0) dot.classList.add("rw-carousel-dot--active");
      dot.setAttribute("aria-label", "Review " + (d + 1) + " of " + max);
      dot.addEventListener("click", (function (idx) {
        return function () { showReview(idx); };
      })(d));
      dotsWrap.appendChild(dot);
      dots.push(dot);
    }
    panel.appendChild(dotsWrap);

    // CTA
    if (config.ctaText) {
      var ctaContainer = document.createElement("div");
      ctaContainer.className = "rw-cta-wrap";
      window.ReviewsWidget.renderCtaButton(ctaContainer, config.ctaText, config.ctaUrl);
      panel.appendChild(ctaContainer);
    }

    rootEl.appendChild(panel);

    // Minus button (collapse) — top-right of the outer wrapper
    var collapseBtn = document.createElement("button");
    collapseBtn.className = "rw-flyout-collapse";
    collapseBtn.setAttribute("aria-label", "Minimize reviews");
    collapseBtn.textContent = "\u2212";
    collapseBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      isOpen = false;
      panel.style.display = "none";
      stopAuto();
    });
    rootEl.insertBefore(collapseBtn, rootEl.firstChild);

    // Flyout entrance animation — fade in from right
    if (!reducedMotion) {
      rootEl.style.opacity = "0";
      rootEl.style.transform = "translateX(60px)";
      rootEl.style.transition = "none";
      rootEl.offsetHeight; // force reflow
      rootEl.style.transition = "transform 0.4s ease, opacity 0.4s ease";
      rootEl.style.transform = "translateX(0)";
      rootEl.style.opacity = "1";
      setTimeout(function () {
        rootEl.style.transition = "";
        rootEl.style.transform = "";
        rootEl.style.opacity = "";
      }, 450);
    }

    // Toggle panel on summary click
    summary.addEventListener("click", function () {
      isOpen = !isOpen;
      panel.style.display = isOpen ? "block" : "none";
      if (isOpen) {
        showReview(0);
        startAuto();
        trackPanelOpen();
      } else {
        stopAuto();
      }
    });

    // Personalization cookie: remember if user has seen flyout
    var COOKIE_NAME = "rw_flyout_seen";

    // Helper to fire panel_open analytics when the flyout panel becomes visible
    function trackPanelOpen() {
      var scriptEl = document.currentScript || document.querySelector('script[src*="widget.js"]');
      if (scriptEl) {
        var apiBase = window.ReviewsWidget.getApiBase(scriptEl);
        var cfg = window.ReviewsWidget._lastConfig;
        window.ReviewsWidget.trackEvent(apiBase, cfg && cfg.placeId, "panel_open");
      }
    }

    function getCookie(name) {
      var match = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
      return match ? match[1] : null;
    }
    function setCookie(name, value, days) {
      var d = new Date();
      d.setTime(d.getTime() + days * 86400000);
      document.cookie = name + "=" + value + ";expires=" + d.toUTCString() + ";path=/;SameSite=Lax";
    }

    // Auto-open panel on first visit (after short delay)
    if (!getCookie(COOKIE_NAME)) {
      setTimeout(function () {
        isOpen = true;
        panel.style.display = "block";
        showReview(0);
        startAuto();
        trackPanelOpen();
        setCookie(COOKIE_NAME, "1", 30);
      }, 1000);
    } else {
      // Returning visitor: auto-open immediately
      isOpen = true;
      panel.style.display = "block";
      showReview(0);
      startAuto();
      trackPanelOpen();
    }

    function showReview(idx) {
      currentIndex = idx;

      // Crossfade: fade out old content, fade in new
      if (!reducedMotion && reviewArea.children.length > 0) {
        reviewArea.style.transition = "opacity 0.2s ease";
        reviewArea.style.opacity = "0";
        setTimeout(function () {
          renderReviewContent(idx);
          reviewArea.style.opacity = "0";
          reviewArea.style.transition = "none";
          reviewArea.offsetHeight; // force reflow
          reviewArea.style.transition = "opacity 0.3s ease";
          reviewArea.style.opacity = "1";
        }, 220);
      } else {
        renderReviewContent(idx);
      }

      // Update active dot
      for (var j = 0; j < dots.length; j++) {
        dots[j].classList.toggle("rw-carousel-dot--active", j === idx);
      }
    }

    function renderReviewContent(idx) {
      reviewArea.innerHTML = "";
      reviewArea.style.opacity = "1";
      reviewArea.style.transition = "";

      window.ReviewsWidget.renderReviewCard(reviewArea, reviews[idx], { maxCharacters: 300 });

      if (reviews[idx].text && reviews[idx].text.length > 300) {
        var moreLink = document.createElement("button");
        moreLink.className = "rw-read-more";
        moreLink.textContent = "Read more";
        moreLink.addEventListener("click", (function (review) {
          return function () {
            window.ReviewsWidget.showModal(review);
          };
        })(reviews[idx]));
        reviewArea.appendChild(moreLink);
      }
    }

    function nextReview() {
      showReview((currentIndex + 1) % max);
    }

    function startAuto() {
      if (autoTimer) clearInterval(autoTimer);
      if (!reducedMotion) {
        autoTimer = setInterval(nextReview, autoInterval);
      }
    }

    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    // Pause on hover
    rootEl.addEventListener("mouseenter", stopAuto);
    rootEl.addEventListener("mouseleave", function () {
      if (isOpen) startAuto();
    });

    // Pause when tab hidden
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { stopAuto(); }
      else if (isOpen) { startAuto(); }
    });

    // Keyboard: advance reviews with arrow keys when flyout is open
    rootEl.setAttribute("tabindex", "0");
    rootEl.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); nextReview(); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); showReview((currentIndex - 1 + max) % max); }
      if (e.key === "Escape") { isOpen = false; panel.style.display = "none"; stopAuto(); }
    });
  };
})();


// --- index.js ---
// src/widget/index.js — Main widget bootstrap.
(function () {
  "use strict";

  // Prevent double-initialization
  if (window.ReviewsWidget && window.ReviewsWidget._initialized) return;
  window.ReviewsWidget = window.ReviewsWidget || {};
  window.ReviewsWidget._initialized = true;

  // Find the current script element
  var scriptEl = document.currentScript;
  if (!scriptEl) {
    console.warn("[reviews-widget] Cannot find script element");
    return;
  }

  // Determine API base URL
  var apiBase = window.ReviewsWidget.getApiBase(scriptEl);

  // Parse local config from data-* attributes (needed early for placeId)
  var localConfig;
  try {
    localConfig = window.ReviewsWidget.parseConfig(scriptEl);
  } catch (e) {
    console.error("[reviews-widget] Config parse error:", e);
    return;
  }
  if (!localConfig) return;

  var placeId = localConfig.placeId;

  // Fetch remote config, then merge with local data-* overrides
  window.ReviewsWidget.fetchRemoteConfig(apiBase, placeId).then(function (remoteConfig) {
    var config;
    try {
      config = window.ReviewsWidget.mergeConfig(remoteConfig, localConfig);
    } catch (e) {
      config = localConfig;
    }

    // Store the final merged config for other components (modal, cta) to read
    window.ReviewsWidget._lastConfig = config;

    // Create the widget root element
    var rootEl;
    try {
      rootEl = window.ReviewsWidget.createRoot(config);
    } catch (e) {
      console.error("[reviews-widget] Root creation error:", e);
      return;
    }

    // Set ARIA role on root
    rootEl.setAttribute("role", "region");
    rootEl.setAttribute("aria-label", "Customer reviews");

    // Fetch review data
    window.ReviewsWidget.fetchReviews(apiBase, placeId).then(function (data) {
      if (!data) {
        window.ReviewsWidget.renderEmpty(rootEl);
        return;
      }

      try {
        // Route to the correct display mode
        if (config.mode === "flyout") {
          window.ReviewsWidget.renderFlyout(rootEl, data, config);
        } else if (config.layout === "carousel") {
          window.ReviewsWidget.renderInlineCarousel(rootEl, data, config);
        } else {
          // Default: inline grid
          window.ReviewsWidget.renderInlineGrid(rootEl, data, config);
        }
      } catch (e) {
        console.error("[reviews-widget] Render error:", e);
        window.ReviewsWidget.renderEmpty(rootEl);
      }
    }).catch(function () {
      window.ReviewsWidget.renderEmpty(rootEl);
    });

    // Fire impression event after render is queued (sendBeacon is async)
    window.ReviewsWidget.trackEvent(apiBase, placeId, "widget_impression");
  });
})();
