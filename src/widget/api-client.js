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
})();
