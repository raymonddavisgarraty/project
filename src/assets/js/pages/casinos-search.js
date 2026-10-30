// Shared, SSR-first catalogue controller loaded before this file.
(() => {
  "use strict";
  window.ReviewCatalog442?.init({
    rootSelector: "[data-casinos-search]",
    inputSelector: "[data-casinos-search-input]",
    gridSelector: "[data-casinos-grid]",
    countSelector: "[data-casinos-count]",
    emptySelector: "[data-casinos-empty]",
    resetSelector: "[data-reset-casino-filters]",
    sortSelector: "[data-casino-sort-filter]",
    cardSelector: "[data-casino-card]",
    titleAttribute: "casinoTitle",
    searchProvider: false,
    singular: "casino",
    filters: [
      {selector:"[data-casino-type-filter]",queryKey:"type",attribute:"casinoType"},
      {selector:"[data-casino-withdrawal-filter]",queryKey:"withdrawal",attribute:"casinoWithdrawal"},
    ],
  });
})();
