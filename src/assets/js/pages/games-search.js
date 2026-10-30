// Shared, SSR-first catalogue controller loaded before this file.
(() => {
  "use strict";
  window.ReviewCatalog442?.init({
    rootSelector: "[data-games-search]",
    inputSelector: "[data-games-search-input]",
    gridSelector: "[data-games-grid]",
    countSelector: "[data-games-count]",
    emptySelector: "[data-games-empty]",
    resetSelector: "[data-reset-filters]",
    sortSelector: "[data-sort-filter]",
    randomSelector: "[data-random-game]",
    cardSelector: "[data-game-card]",
    titleAttribute: "gameTitle",
    searchProvider: true, // only source-reviewed provider dataset values
    singular: "game",
    filters: [
      {selector:"[data-provider-filter]",queryKey:"provider",attribute:"gameProvider"},
      {selector:"[data-volatility-filter]",queryKey:"volatility",attribute:"gameVolatility"},
    ],
  });
})();
