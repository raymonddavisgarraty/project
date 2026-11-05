/* Stage 45.2 — preserve manual navigation, respect motion preference/visibility. */
(() => {
  "use strict";
  const slider = document.querySelector("[data-banner-slider]");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll("[data-banner-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-banner-dot]"));
  const prevButton = slider.querySelector("[data-banner-prev]");
  const nextButton = slider.querySelector("[data-banner-next]");
  if (slides.length <= 1) return;

  const motion = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
  let currentIndex = 0;
  let timerId = null;
  let pointerInside = false;
  let focusInside = false;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== currentIndex;
    });
    dots.forEach((dot, i) => {
      const active = i === currentIndex;
      dot.classList.toggle("home-banners__dot--active", active);
      if (active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  function stopAutoplay() {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function synchronizeAutoplay() {
    const shouldPause = document.hidden || motion?.matches || pointerInside || focusInside;
    if (shouldPause) {
      stopAutoplay();
    } else if (timerId === null) {
      timerId = window.setInterval(() => showSlide(currentIndex + 1), 5000);
    }
  }

  // Manual controls must remain available even when automatic motion is off.
  prevButton?.addEventListener("click", () => showSlide(currentIndex - 1));
  nextButton?.addEventListener("click", () => showSlide(currentIndex + 1));
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });
  slider.addEventListener("mouseenter", () => { pointerInside = true; synchronizeAutoplay(); });
  slider.addEventListener("mouseleave", () => { pointerInside = false; synchronizeAutoplay(); });
  slider.addEventListener("focusin", () => { focusInside = true; synchronizeAutoplay(); });
  slider.addEventListener("focusout", event => {
    if (!event.relatedTarget || !slider.contains(event.relatedTarget)) {
      focusInside = false;
      synchronizeAutoplay();
    }
  });
  document.addEventListener("visibilitychange", synchronizeAutoplay);
  if (motion?.addEventListener) motion.addEventListener("change", synchronizeAutoplay);
  else if (motion?.addListener) motion.addListener(synchronizeAutoplay);
  synchronizeAutoplay();
})();
