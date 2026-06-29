(() => {
  const rail = document.querySelector("[data-game-rail]");
  const prevButton = document.querySelector("[data-game-rail-prev]");
  const nextButton = document.querySelector("[data-game-rail-next]");

  if (!rail || !prevButton || !nextButton) {
    return;
  }

  function getScrollAmount() {
    return Math.max(rail.clientWidth * 0.8, 240);
  }

  function updateButtons() {
    const maxScrollLeft = rail.scrollWidth - rail.clientWidth - 2;

    prevButton.disabled = rail.scrollLeft <= 2;
    nextButton.disabled = rail.scrollLeft >= maxScrollLeft;
  }

  prevButton.addEventListener("click", () => {
    rail.scrollBy({
      left: -getScrollAmount(),
      behavior: "smooth",
    });
  });

  nextButton.addEventListener("click", () => {
    rail.scrollBy({
      left: getScrollAmount(),
      behavior: "smooth",
    });
  });

  rail.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);

  updateButtons();
})();
