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

  // Parse config from data-* attributes
  var config;
  try {
    config = window.ReviewsWidget.parseConfig(scriptEl);
  } catch (e) {
    console.error("[reviews-widget] Config parse error:", e);
    return;
  }
  if (!config) return;

  // Determine API base URL
  var apiBase = window.ReviewsWidget.getApiBase(scriptEl);

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
  window.ReviewsWidget.fetchReviews(apiBase, config.placeId).then(function (data) {
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
})();
