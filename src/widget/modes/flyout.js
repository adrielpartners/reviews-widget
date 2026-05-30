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

    // Toggle panel on summary click
    summary.addEventListener("click", function () {
      isOpen = !isOpen;
      panel.style.display = isOpen ? "block" : "none";
      if (isOpen) {
        showReview(0);
        startAuto();
      } else {
        stopAuto();
      }
    });

    // Personalization cookie: remember if user has seen flyout
    var COOKIE_NAME = "rw_flyout_seen";
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
        setCookie(COOKIE_NAME, "1", 30);
      }, 1000);
    } else {
      // Returning visitor: auto-open immediately
      isOpen = true;
      panel.style.display = "block";
      showReview(0);
      startAuto();
    }

    function showReview(idx) {
      currentIndex = idx;
      reviewArea.innerHTML = "";

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

      // Update active dot
      for (var j = 0; j < dots.length; j++) {
        dots[j].classList.toggle("rw-carousel-dot--active", j === idx);
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
