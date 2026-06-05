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
