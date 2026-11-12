/* Accessible mobile navigation: keep every destination available without a clipped swipe row. */
(function () {
  "use strict";
  var nav = document.querySelector('header nav[aria-label="Main navigation"]');
  if (!nav || nav.dataset.mobileToggleReady === "true") return;
  var shell = nav.parentElement;
  if (!shell) return;
  nav.id = nav.id || "primary-site-navigation";
  nav.dataset.mobileToggleReady = "true";
  var button = document.createElement("button");
  button.type = "button";
  button.className = "mobile-nav-toggle";
  button.setAttribute("aria-controls", nav.id);
  button.setAttribute("aria-expanded", "false");
  button.textContent = "Menu";
  button.addEventListener("click", function () {
    var open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    button.textContent = open ? "Close menu" : "Menu";
  });
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      nav.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      button.textContent = "Menu";
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      button.textContent = "Menu";
      button.focus();
    }
  });
  shell.insertBefore(button, nav);
})();
