(() => {
  const slider = document.querySelector("[data-banner-slider]");

  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll("[data-banner-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-banner-dot]"));
  const prevButton = slider.querySelector("[data-banner-prev]");
  const nextButton = slider.querySelector("[data-banner-next]");

  if (slides.length <= 1) {
    return;
  }

  let currentIndex = 0;
  let timerId = null;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.hidden = slideIndex !== currentIndex;
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentIndex;
      dot.classList.toggle("home-banners__dot--active", isActive);

      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function startAutoplay() {
    stopAutoplay();
    timerId = window.setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  prevButton?.addEventListener("click", () => {
    showSlide(currentIndex - 1);
    startAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    nextSlide();
    startAutoplay();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.bannerDot));
      startAutoplay();
    });
  });

  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  slider.addEventListener("focusin", stopAutoplay);
  slider.addEventListener("focusout", startAutoplay);

  startAutoplay();
})();
