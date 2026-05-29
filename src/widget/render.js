// src/widget/render.js — Core rendering helpers.
(function () {
  "use strict";

  window.ReviewsWidget = window.ReviewsWidget || {};

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
