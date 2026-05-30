// src/widget/components/modal.js
(function () {
  "use strict";

  window.ReviewsWidget = window.ReviewsWidget || {};

  // Show a modal overlay with the full review text.
  // Returns a function to close the modal.
  window.ReviewsWidget.showModal = function (data) {
    // Hide flyout if open so it doesn't overlap the modal
    var flyoutEl = document.querySelector(".rw-mode-flyout");
    var flyoutWasVisible = false;
    var flyoutPanel = null;
    if (flyoutEl) {
      flyoutPanel = flyoutEl.querySelector(".rw-flyout-panel");
      flyoutWasVisible = flyoutPanel && flyoutPanel.style.display !== "none";
      flyoutEl.style.display = "none";
    }

    var root = document.createElement("div");
    root.className = "rw-modal-overlay";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");

    var modal = document.createElement("div");
    modal.className = "rw-modal";

    // Close button
    var closeBtn = document.createElement("button");
    closeBtn.className = "rw-modal-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.textContent = "\u00D7";
    closeBtn.addEventListener("click", close);
    modal.appendChild(closeBtn);

    // Author
    var authorEl = document.createElement("div");
    authorEl.className = "rw-modal-author";
    authorEl.textContent = data.authorName || "Anonymous";
    modal.appendChild(authorEl);

    // Stars
    var starsContainer = document.createElement("div");
    starsContainer.className = "rw-modal-stars";
    var r = Math.round(data.rating || 0);
    for (var i = 1; i <= 5; i++) {
      var star = document.createElement("span");
      star.className = "rw-star" + (i <= r ? " rw-star--filled" : " rw-star--empty");
      star.textContent = i <= r ? "\u2605" : "\u2606";
      starsContainer.appendChild(star);
    }
    modal.appendChild(starsContainer);

    // Full text
    var textEl = document.createElement("p");
    textEl.className = "rw-modal-text";
    textEl.textContent = data.text || "";
    modal.appendChild(textEl);

    // Time
    if (data.relativeTimeDescription) {
      var timeEl = document.createElement("div");
      timeEl.className = "rw-modal-time";
      timeEl.textContent = data.relativeTimeDescription;
      modal.appendChild(timeEl);
    }

    root.appendChild(modal);
    document.body.appendChild(root);

    // Close on overlay click
    root.addEventListener("click", function (e) {
      if (e.target === root) close();
    });

    // Close on Escape
    var keyHandler = function (e) {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", keyHandler);

    function close() {
      document.removeEventListener("keydown", keyHandler);
      if (root.parentNode) root.parentNode.removeChild(root);
      // Restore flyout if it was visible before the modal opened
      if (flyoutEl && flyoutWasVisible) {
        flyoutEl.style.display = "";
      }
    }

    return close;
  };
})();
