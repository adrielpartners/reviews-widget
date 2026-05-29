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
