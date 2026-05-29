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
