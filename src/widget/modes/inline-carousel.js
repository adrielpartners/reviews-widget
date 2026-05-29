// src/widget/modes/inline-carousel.js
(function () {
  "use strict";

  window.ReviewsWidget = window.ReviewsWidget || {};

  window.ReviewsWidget.renderInlineCarousel = function (rootEl, data, config) {
    rootEl.innerHTML = "";
    rootEl.className = rootEl.className + " rw-layout-carousel";

    var reviews = data.reviews || [];
    var max = Math.min(reviews.length, config.maxReviews || 3);

    if (max === 0) {
      window.ReviewsWidget.renderEmpty(rootEl);
      return;
    }

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

      rootEl.appendChild(header);
    }

    // Carousel container
    var carouselWrap = document.createElement("div");
    carouselWrap.className = "rw-carousel";

    var track = document.createElement("div");
    track.className = "rw-carousel-track";

    var currentIndex = 0;
    var autoTimer = null;
    var autoInterval = 5000;
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Build slides
    for (var i = 0; i < max; i++) {
      var slide = document.createElement("div");
      slide.className = "rw-carousel-slide";
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", (i + 1) + " of " + max);

      window.ReviewsWidget.renderReviewCard(slide, reviews[i], { maxCharacters: 200 });

      if (reviews[i].text && reviews[i].text.length > 200) {
        var moreLink = document.createElement("button");
        moreLink.className = "rw-read-more";
        moreLink.textContent = "Read more";
        moreLink.addEventListener("click", (function (review) {
          return function () {
            window.ReviewsWidget.showModal(review);
          };
        })(reviews[i]));
        slide.appendChild(moreLink);
      }

      track.appendChild(slide);
    }

    carouselWrap.appendChild(track);

    // Navigation arrows
    var prevBtn = document.createElement("button");
    prevBtn.className = "rw-carousel-prev";
    prevBtn.setAttribute("aria-label", "Previous review");
    prevBtn.innerHTML = "&#8249;";
    prevBtn.addEventListener("click", function () { goTo(currentIndex - 1); });

    var nextBtn = document.createElement("button");
    nextBtn.className = "rw-carousel-next";
    nextBtn.setAttribute("label", "Next review");
    nextBtn.innerHTML = "&#8250;";
    nextBtn.addEventListener("click", function () { goTo(currentIndex + 1); });

    carouselWrap.appendChild(prevBtn);
    carouselWrap.appendChild(nextBtn);

    // Dot indicators
    var dotsWrap = document.createElement("div");
    dotsWrap.className = "rw-carousel-dots";
    dotsWrap.setAttribute("role", "tablist");
    dotsWrap.setAttribute("aria-label", "Review navigation");

    var dots = [];
    for (var d = 0; d < max; d++) {
      var dot = document.createElement("button");
      dot.className = "rw-carousel-dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Go to review " + (d + 1));
      dot.setAttribute("aria-selected", d === 0 ? "true" : "false");
      if (d === 0) dot.classList.add("rw-carousel-dot--active");

      dot.addEventListener("click", (function (idx) {
        return function () { goTo(idx); };
      })(d));

      dotsWrap.appendChild(dot);
      dots.push(dot);
    }

    carouselWrap.appendChild(dotsWrap);
    rootEl.appendChild(carouselWrap);

    // CTA
    if (config.ctaText) {
      var ctaContainer = document.createElement("div");
      ctaContainer.className = "rw-cta-wrap";
      window.ReviewsWidget.renderCtaButton(ctaContainer, config.ctaText, config.ctaUrl);
      rootEl.appendChild(ctaContainer);
    }

    // Navigation logic
    function goTo(idx) {
      if (idx < 0) idx = max - 1;
      if (idx >= max) idx = 0;
      currentIndex = idx;
      track.style.transform = "translateX(-" + (idx * 100) + "%)";

      // Update dots
      for (var j = 0; j < dots.length; j++) {
        dots[j].classList.toggle("rw-carousel-dot--active", j === idx);
        dots[j].setAttribute("aria-selected", j === idx ? "true" : "false");
      }

      resetAuto();
    }

    function resetAuto() {
      if (autoTimer) clearInterval(autoTimer);
      if (!reducedMotion) {
        autoTimer = setInterval(function () { goTo(currentIndex + 1); }, autoInterval);
      }
    }

    // Pause on hover
    carouselWrap.addEventListener("mouseenter", function () {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    });
    carouselWrap.addEventListener("mouseleave", resetAuto);

    // Pause when tab hidden
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
      } else {
        resetAuto();
      }
    });

    // Keyboard nav
    carouselWrap.setAttribute("tabindex", "0");
    carouselWrap.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(currentIndex - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(currentIndex + 1); }
    });

    // Initial slide position
    goTo(0);
  };
})();
