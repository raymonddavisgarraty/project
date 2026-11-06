/* Search all indexed game names with lazy fetching. Real SSR HTML pagination
 * remains the crawlable/no-JS base. DOM textContent prevents HTML injection. */
(() => {
  "use strict";
  const root = document.querySelector("[data-games-search]");
  if (!root || typeof fetch !== "function") return;
  const input = root.querySelector("[data-games-search-input]");
  const listing = root.querySelector("[data-games-grid]");
  const panel = root.querySelector("[data-global-game-results]");
  const results = root.querySelector("[data-global-game-list]");
  const more = root.querySelector("[data-global-game-more]");
  const count = root.querySelector("[data-games-count]");
  const pagination = root.querySelector("[data-catalogue-pagination]");
  const random = root.querySelector("[data-random-game]");
  const provider = root.querySelector("[data-provider-filter]");
  const volatility = root.querySelector("[data-volatility-filter]");
  if (!input || !listing || !panel || !results || !more || !count) return;
  let request, matches = [], shown = 0, active = false, sequence = 0;
  const PAGE_SIZE = 24;
  const valid = entry => entry && typeof entry.title === "string" &&
    entry.title.length > 0 && entry.title.length <= 160 &&
    typeof entry.url === "string" && /^\/en\/games\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(entry.url) &&
    typeof entry.provider === "string" && typeof entry.volatility === "string";
  function fetchIndex() {
    if (!request) request = fetch("/en/games/search-index.json", {credentials:"same-origin"})
      .then(response => { if (!response.ok) throw Error("Search unavailable");return response.json(); })
      .then(data => {
        if (data?.kind !== "reviewhub-game-title-search-v3" || !Array.isArray(data.items))
          throw Error("Invalid title index");
        return data.items.filter(valid);
      }).catch(err=>{request=null;throw err;});
    return request;
  }
  function reveal() {
    const batch = matches.slice(shown, shown + PAGE_SIZE);
    for (const entry of batch) {
      const link = document.createElement("a");
      link.className = "rh-global-game-card";
      link.href = entry.url;
      link.textContent = entry.title;
      results.appendChild(link);
    }
    shown += batch.length;
    more.hidden = shown >= matches.length;
  }
  function restore() {
    sequence++;
    active = false;
    panel.hidden = true;
    listing.hidden = false;
    if (pagination) pagination.hidden = false;
    if (random) random.disabled = !Array.from(listing.querySelectorAll("[data-game-card]")).some(e=>!e.hidden);
    const local = Array.from(listing.querySelectorAll("[data-game-card]")).filter(e=>!e.hidden).length;
    count.textContent = local + " game" + (local===1?"":"s") + " found on this page";
  }
  async function run() {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { restore(); return; }
    const ticket = ++sequence;
    active = true;
    panel.hidden = false;
    listing.hidden = true;
    if (pagination) pagination.hidden = true;
    if (random) random.disabled = true;
    results.replaceChildren();
    count.textContent = "Searching all game titles…";
    more.hidden = true;
    try {
      const list = await fetchIndex();
      if (ticket !== sequence || input.value.trim().toLowerCase() !== q) return;
      const selectedProvider = provider && !provider.disabled ? provider.value.trim().toLowerCase() : "";
      const selectedVolatility = volatility && !volatility.disabled ? volatility.value.trim().toLowerCase() : "";
      matches = list.filter(item =>
        (item.title.toLowerCase().includes(q) || item.provider.toLowerCase().includes(q)) &&
        (!selectedProvider || item.provider.toLowerCase() === selectedProvider) &&
        (!selectedVolatility || item.volatility.toLowerCase() === selectedVolatility));
      shown = 0;
      count.textContent = matches.length + " game" + (matches.length===1?"":"s") + " found across the catalogue";
      if (!matches.length) {
        const p = document.createElement("p");
        p.textContent = "No matching games in the catalogue.";
        results.appendChild(p);
      } else reveal();
    } catch {
      if (ticket !== sequence) return;
      restore(); // Fall back to the existing current-page search without JS errors.
    }
  }
  input.addEventListener("input",run);
  provider?.addEventListener("change",()=>{if(active)run();});
  volatility?.addEventListener("change",()=>{if(active)run();});
  root.querySelector("[data-reset-filters]")?.addEventListener("click",restore);
  more.addEventListener("click",reveal);
  if (input.value.trim().length >= 2) run();
})();
