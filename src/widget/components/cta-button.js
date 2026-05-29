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
