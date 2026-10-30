/* Stage 44.2 — shared progressive enhancement for EN game/casino catalogues.
 * Vanilla JS, no runtime dependencies, no unapproved numerical sorting.
 * Server-rendered cards/search counts remain useful if JS never runs. */
((global) => {
  "use strict";
  const normalize = value => String(value == null ? "" : value).trim().toLowerCase();

  function allowedValue(select, candidate) {
    if (!select || select.disabled) return "";
    const desired = normalize(candidate);
    if (!desired) return "";
    const options = Array.from(select.options || []);
    const match = options.find(option => !option.disabled && normalize(option.value) === desired);
    return match ? match.value : "";
  }

  function matchesItem(item, state) {
    const title = normalize(item.title);
    const provider = normalize(item.provider);
    if (state.query && !title.includes(state.query) && !(state.searchProvider && provider.includes(state.query)))
      return false;
    for (const filter of state.filters) {
      if (filter.value && normalize(item[filter.attribute]) !== normalize(filter.value)) return false;
    }
    return true;
  }

  function init(config) {
    const root = document.querySelector(config.rootSelector);
    if (!root) return null;
    const input = root.querySelector(config.inputSelector);
    const grid = root.querySelector(config.gridSelector);
    const count = root.querySelector(config.countSelector);
    const empty = root.querySelector(config.emptySelector);
    const reset = root.querySelector(config.resetSelector);
    const sort = root.querySelector(config.sortSelector);
    const random = config.randomSelector ? root.querySelector(config.randomSelector) : null;
    if (!input || !grid || !count || !empty || !reset || !sort) return null;
    const cards = Array.from(root.querySelectorAll(config.cardSelector)).map((element,index) => ({
      element,index,
      title: element.dataset[config.titleAttribute] || "",
      provider: element.dataset.gameProvider || "",
      gameProvider: element.dataset.gameProvider || "",
      gameVolatility: element.dataset.gameVolatility || "",
      casinoType: element.dataset.casinoType || "",
      casinoWithdrawal: element.dataset.casinoWithdrawal || "",
    }));
    const filters = (config.filters || []).map(filter => ({
      ...filter, control: root.querySelector(filter.selector),
    }));
    function selectedState() {
      return {
        query: normalize(input.value),
        searchProvider: Boolean(config.searchProvider),
        filters: filters.map(filter => ({
          attribute: filter.attribute,
          value: allowedValue(filter.control,filter.control?.value),
        })),
      };
    }
    function updateUrl() {
      const params = new URLSearchParams();
      const query = input.value.trim();
      if (query) params.set("q",query.slice(0,200));
      for (const filter of filters) {
        const value = allowedValue(filter.control,filter.control?.value);
        if (value) params.set(filter.queryKey,value);
      }
      // A-Z is the only approved sort. Unsupported rating/RTP sorts from
      // legacy query strings are intentionally never used.
      const queryString = params.toString();
      const next = global.location.pathname + (queryString ? "?" + queryString : "");
      global.history.replaceState({},"",next);
    }
    function render({updateHistory = true} = {}) {
      const state = selectedState();
      const sorted = cards.slice().sort((a,b) => normalize(a.title).localeCompare(normalize(b.title),"en") || a.index - b.index);
      let visible = 0;
      for (const card of sorted) {
        const show = matchesItem(card,state);
        card.element.hidden = !show;
        card.element.classList.remove("is-random-highlight");
        if (show) visible++;
        grid.appendChild(card.element);
      }
      count.textContent = visible + " " + config.singular + (visible === 1 ? "" : "s") + " found";
      empty.classList.toggle("is-visible",visible === 0);
      if (random) random.disabled = visible === 0;
      if (updateHistory) updateUrl();
      return visible;
    }
    function restoreUrl() {
      const params = new URLSearchParams(global.location.search);
      const query = params.get("q") || "";
      input.value = query.slice(0,200);
      for (const filter of filters) {
        if (filter.control) {
          filter.control.value = allowedValue(filter.control,params.get(filter.queryKey));
        }
      }
      // Legacy sort query parameters never activate an unapproved rank.
      sort.value = "title-asc";
      render({updateHistory:false});
    }
    function resetAll() {
      input.value = "";
      for (const filter of filters) if (filter.control) filter.control.value = "";
      sort.value = "title-asc";
      render();
    }
    input.addEventListener("input",() => render());
    input.addEventListener("keydown",event => {
      if (event.key === "Escape" && input.value) {
        input.value = "";
        render();
        event.preventDefault();
      }
    });
    for (const filter of filters) filter.control?.addEventListener("change",() => render());
    sort.addEventListener("change",() => {
      sort.value = "title-asc";
      render();
    });
    reset.addEventListener("click",resetAll);
    random?.addEventListener("click",() => {
      const visible = cards.filter(c=>!c.element.hidden);
      if (!visible.length) return;
      for (const card of cards) card.element.classList.remove("is-random-highlight");
      const selected = visible[Math.floor(Math.random()*visible.length)].element;
      selected.classList.add("is-random-highlight");
      selected.focus();
      const reduced = typeof global.matchMedia === "function" &&
        global.matchMedia("(prefers-reduced-motion: reduce)").matches;
      selected.scrollIntoView?.({behavior:reduced?"auto":"smooth",block:"nearest"});
    });
    restoreUrl();
    return Object.freeze({render,resetAll});
  }

  global.ReviewCatalog442 = Object.freeze({init,allowedValue,matchesItem,normalize});
})(window);
