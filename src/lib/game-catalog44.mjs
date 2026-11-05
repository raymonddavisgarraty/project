// Stage 44.1 — progressively enhance catalogue facets ONLY from source-reviewed
// claim display projections. This is UX state, not SEO landing-page generation.
export function buildGameCatalog44({ games = [], editorialFields = null } = {}) {
  if (!Array.isArray(games)) throw new Error("Game catalogue needs game array");
  const providers = new Map(), volatilities = new Map();
  for (const game of games) {
    const rows = editorialFields?.gameRows?.(game) || [];
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      if (row?.reviewStatus !== "claim-verified" || typeof row.value !== "string") continue;
      const value = row.value.trim();
      if (!value || value.length > 100) continue;
      const key = value.toLowerCase();
      if (row.field === "providerName") providers.set(key, value);
      if (row.field === "volatility" && ["low","medium","high","very high"].includes(key)) {
        volatilities.set(key, value);
      }
    }
  }
  const build = map => Object.freeze([...map].map(([value,label])=>
    Object.freeze({ value, label })).sort((a,b)=>a.label.localeCompare(b.label,"en")));
  return Object.freeze({ providers: build(providers), volatilities: build(volatilities) });
}
