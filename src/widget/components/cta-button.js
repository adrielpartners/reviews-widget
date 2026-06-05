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
