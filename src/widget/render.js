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
      ".rw-summary-name{font-weight:700;font-size:var(--rw-font-size-lg);}",
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
      ".rw-mode-flyout{position:fixed;z-index:var(--rw-z-flyout);max-width:360px;width:100%;box-shadow:var(--rw-shadow-lg);border-radius:var(--rw-radius-lg);transition:transform var(--rw-transition-base),opacity var(--rw-transition-base);}",
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
      ".rw-modal-overlay{position:fixed;inset:0;z-index:var(--rw-z-modal);background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:var(--rw-space-4);}",
      ".rw-modal{background:#ffffff;border-radius:1rem;max-width:500px;width:100%;max-height:80vh;overflow-y:auto;padding:2.5rem;position:relative;box-shadow:0 25px 60px rgba(0,0,0,0.2);border:1px solid #e5e7eb;}",
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

  window.ReviewsWidget.applyTheme = function (rootEl, themeName) {
    var tokens = window.ReviewsWidget.getThemeTokens(themeName);
    for (var k in tokens) {
      if (Object.prototype.hasOwnProperty.call(tokens, k)) {
        rootEl.style.setProperty(k, tokens[k]);
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

    window.ReviewsWidget.applyTheme(root, config.theme || "default");

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
