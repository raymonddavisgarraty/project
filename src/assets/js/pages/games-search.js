(() => {
  const root = document.querySelector("[data-games-search]");

  if (!root) {
    return;
  }

  const input = root.querySelector("[data-games-search-input]");
  const providerFilter = root.querySelector("[data-provider-filter]");
  const volatilityFilter = root.querySelector("[data-volatility-filter]");
  const sortFilter = root.querySelector("[data-sort-filter]");
  const resetButton = root.querySelector("[data-reset-filters]");
  const grid = root.querySelector("[data-games-grid]");
  const cards = Array.from(root.querySelectorAll("[data-game-card]"));
  const count = root.querySelector("[data-games-count]");
  const empty = root.querySelector("[data-games-empty]");
  const randomButton = root.querySelector("[data-random-game]");

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function parseRtp(value) {
    return Number(String(value || "").replace("%", "")) || 0;
  }

  function parseRating(value) {
    return Number(value) || 0;
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

  function sortCards() {
    const sortValue = sortFilter?.value || "title-asc";

    const sortedCards = [...cards].sort((a, b) => {
      if (sortValue === "rating-desc") {
        return (
          parseRating(b.dataset.gameRating) - parseRating(a.dataset.gameRating)
        );
      }

      if (sortValue === "rtp-desc") {
        return parseRtp(b.dataset.gameRtp) - parseRtp(a.dataset.gameRtp);
      }

      return normalize(a.dataset.gameTitle).localeCompare(
        normalize(b.dataset.gameTitle),
      );
    });

    sortedCards.forEach((card) => {
      grid.appendChild(card);
    });
  }

  function filterGames({ updateUrl = true } = {}) {
    const query = normalize(input?.value);
    const provider = normalize(providerFilter?.value);
    const volatility = normalize(volatilityFilter?.value);

    let visibleCount = 0;

    cards.forEach((card) => {
      const title = normalize(card.dataset.gameTitle);
      const cardProvider = normalize(card.dataset.gameProvider);
      const cardVolatility = normalize(card.dataset.gameVolatility);

      const matchesSearch =
        !query || title.includes(query) || cardProvider.includes(query);
      const matchesProvider = !provider || cardProvider === provider;
      const matchesVolatility = !volatility || cardVolatility === volatility;

      const isVisible = matchesSearch && matchesProvider && matchesVolatility;

      card.hidden = !isVisible;

      if (isVisible) {
        visibleCount += 1;
      }

      card.classList.remove("is-random-highlight");
    });

    sortCards();
    updateCount(visibleCount);

    if (empty) {
      empty.classList.toggle("is-visible", visibleCount === 0);
    }

    if (updateUrl) {
      syncUrlParams();
    }
  }

  function syncUrlParams() {
    const params = new URLSearchParams();

    if (input?.value.trim()) {
      params.set("q", input.value.trim());
    }

    if (providerFilter?.value) {
      params.set("provider", providerFilter.value);
    }

    if (volatilityFilter?.value) {
      params.set("volatility", volatilityFilter.value);
    }

    if (sortFilter?.value && sortFilter.value !== "title-asc") {
      params.set("sort", sortFilter.value);
    }

    const queryString = params.toString();
    const nextUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState({}, "", nextUrl);
  }

  function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);

    const query = params.get("q");
    const provider = params.get("provider");
    const volatility = params.get("volatility");
    const sort = params.get("sort");

    if (input && query) {
      input.value = query;
    }

    if (providerFilter && provider) {
      providerFilter.value = normalize(provider);
    }

    if (volatilityFilter && volatility) {
      volatilityFilter.value = normalize(volatility);
    }

    if (sortFilter && sort) {
      sortFilter.value = sort;
    }

    filterGames({ updateUrl: false });
  }

  function resetFilters() {
    if (input) {
      input.value = "";
    }

    if (providerFilter) {
      providerFilter.value = "";
    }

    if (volatilityFilter) {
      volatilityFilter.value = "";
    }

    if (sortFilter) {
      sortFilter.value = "title-asc";
    }

    filterGames();
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
      const randomCard =
        visibleCards[Math.floor(Math.random() * visibleCards.length)];

      cards.forEach((card) => {
        card.classList.remove("is-random-highlight");
      });

      randomCard.classList.add("is-random-highlight");
      randomCard.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      ticks += 1;

      if (ticks >= maxTicks) {
        window.clearInterval(intervalId);

        const finalCard =
          visibleCards[Math.floor(Math.random() * visibleCards.length)];

        cards.forEach((card) => {
          card.classList.remove("is-random-highlight");
        });

        finalCard.classList.add("is-random-highlight");
        finalCard.focus();

        randomButton.disabled = false;
      }
    }, 90);
  }

  input?.addEventListener("input", filterGames);
  providerFilter?.addEventListener("change", filterGames);
  volatilityFilter?.addEventListener("change", filterGames);
  sortFilter?.addEventListener("change", filterGames);
  resetButton?.addEventListener("click", resetFilters);
  randomButton?.addEventListener("click", chooseRandomGame);

  applyUrlParams();
})();
