(() => {
  const root = document.querySelector("[data-casinos-search]");

  if (!root) {
    return;
  }

  const input = root.querySelector("[data-casinos-search-input]");
  const typeFilter = root.querySelector("[data-casino-type-filter]");
  const withdrawalFilter = root.querySelector("[data-casino-withdrawal-filter]");
  const sortFilter = root.querySelector("[data-casino-sort-filter]");
  const resetButton = root.querySelector("[data-reset-casino-filters]");
  const grid = root.querySelector("[data-casinos-grid]");
  const cards = Array.from(root.querySelectorAll("[data-casino-card]"));
  const count = root.querySelector("[data-casinos-count]");
  const empty = root.querySelector("[data-casinos-empty]");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function parseRating(value) {
    return Number(value) || 0;
  }

  function updateCount(visibleCount) {
    if (!count) {
      return;
    }

    count.textContent = `${visibleCount} casino${visibleCount === 1 ? "" : "s"} found`;
  }

  function sortCards() {
    const sortValue = sortFilter?.value || "rating-desc";

    const sortedCards = [...cards].sort((a, b) => {
      if (sortValue === "new-desc") {
        return String(b.dataset.casinoNew) === "true" ? 1 : -1;
      }

      if (sortValue === "title-asc") {
        return normalize(a.dataset.casinoTitle).localeCompare(normalize(b.dataset.casinoTitle));
      }

      return parseRating(b.dataset.casinoRating) - parseRating(a.dataset.casinoRating);
    });

    sortedCards.forEach((card) => {
      grid.appendChild(card);
    });
  }

  function syncUrlParams() {
    const params = new URLSearchParams();

    if (input?.value.trim()) {
      params.set("q", input.value.trim());
    }

    if (typeFilter?.value) {
      params.set("type", typeFilter.value);
    }

    if (withdrawalFilter?.value) {
      params.set("withdrawal", withdrawalFilter.value);
    }

    if (sortFilter?.value && sortFilter.value !== "rating-desc") {
      params.set("sort", sortFilter.value);
    }

    const queryString = params.toString();
    const nextUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;

    window.history.replaceState({}, "", nextUrl);
  }

  function filterCasinos({ updateUrl = true } = {}) {
    const query = normalize(input?.value);
    const type = normalize(typeFilter?.value);
    const withdrawal = normalize(withdrawalFilter?.value);

    let visibleCount = 0;

    cards.forEach((card) => {
      const title = normalize(card.dataset.casinoTitle);
      const cardType = normalize(card.dataset.casinoType);
      const cardWithdrawal = normalize(card.dataset.casinoWithdrawal);

      const matchesSearch = !query || title.includes(query);
      const matchesType = !type || cardType === type;
      const matchesWithdrawal = !withdrawal || cardWithdrawal === withdrawal;

      const isVisible = matchesSearch && matchesType && matchesWithdrawal;

      card.hidden = !isVisible;

      if (isVisible) {
        visibleCount += 1;
      }
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

  function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    if (typeFilter && params.get("type")) {
      typeFilter.value = normalize(params.get("type"));
    }

    if (withdrawalFilter && params.get("withdrawal")) {
      withdrawalFilter.value = normalize(params.get("withdrawal"));
    }

    if (sortFilter && params.get("sort")) {
      sortFilter.value = params.get("sort");
    }

    filterCasinos({ updateUrl: false });
  }

  function resetFilters() {
    if (input) input.value = "";
    if (typeFilter) typeFilter.value = "";
    if (withdrawalFilter) withdrawalFilter.value = "";
    if (sortFilter) sortFilter.value = "rating-desc";

    filterCasinos();
  }

  input?.addEventListener("input", filterCasinos);
  typeFilter?.addEventListener("change", filterCasinos);
  withdrawalFilter?.addEventListener("change", filterCasinos);
  sortFilter?.addEventListener("change", filterCasinos);
  resetButton?.addEventListener("click", resetFilters);

  applyUrlParams();
})();