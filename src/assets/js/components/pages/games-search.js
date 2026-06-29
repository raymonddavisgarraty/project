(() => {
  const root = document.querySelector("[data-games-search]");

  if (!root) {
    return;
  }

  const input = root.querySelector("[data-games-search-input]");
  const cards = Array.from(root.querySelectorAll("[data-game-card]"));
  const count = root.querySelector("[data-games-count]");
  const empty = root.querySelector("[data-games-empty]");
  const randomButton = root.querySelector("[data-random-game]");

  function normalize(value) {
    return value.trim().toLowerCase();
  }

  function getVisibleCards() {
    return cards.filter((card) => !card.hidden);
  }

  function updateCount(visibleCount) {
    if (!count) {
      return;
    }

    count.textContent = `${visibleCount} game${visibleCount === 1 ? "" : "s"} found`;
  }

  function filterGames() {
    const query = normalize(input.value);
    let visibleCount = 0;

    cards.forEach((card) => {
      const title = card.dataset.gameTitle || "";
      const provider = card.dataset.gameProvider || "";
      const isVisible = title.includes(query) || provider.includes(query);

      card.hidden = !isVisible;

      if (isVisible) {
        visibleCount += 1;
      }

      card.classList.remove("is-random-highlight");
    });

    updateCount(visibleCount);

    if (empty) {
      empty.classList.toggle("is-visible", visibleCount === 0);
    }
  }

  function chooseRandomGame() {
    const visibleCards = getVisibleCards();

    if (!visibleCards.length) {
      return;
    }

    cards.forEach((card) => {
      card.classList.remove("is-random-highlight");
    });

    randomButton.disabled = true;

    let ticks = 0;
    const maxTicks = 16;

    const intervalId = window.setInterval(() => {
      const randomCard = visibleCards[Math.floor(Math.random() * visibleCards.length)];

      cards.forEach((card) => {
        card.classList.remove("is-random-highlight");
      });

      randomCard.classList.add("is-random-highlight");
      randomCard.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      ticks += 1;

      if (ticks >= maxTicks) {
        window.clearInterval(intervalId);

        const finalCard = visibleCards[Math.floor(Math.random() * visibleCards.length)];

        cards.forEach((card) => {
          card.classList.remove("is-random-highlight");
        });

        finalCard.classList.add("is-random-highlight");
        finalCard.focus();

        randomButton.disabled = false;
      }
    }, 90);
  }

  input.addEventListener("input", filterGames);
  randomButton?.addEventListener("click", chooseRandomGame);

  filterGames();
})();