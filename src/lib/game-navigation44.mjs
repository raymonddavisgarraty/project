// Stage 44.1 — deterministic, publication-aware game navigation.
//
// Links are to REAL generated EN pages only, not inferred provider profiles,
// unpublished locale shells, imported drafts or external commercial offers.
// Editorial cross-references are navigation, never a claim of game similarity.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX = 6;
function approvedProviderIds(audit) {
  if (audit?.schemaVersion !== 1 || audit.autoApprove !== false ||
      audit.autoPublish !== false || !Array.isArray(audit.items)) return new Set();
  const seen = new Set(), repeated = new Set(), approved = new Set();
  for (const item of audit.items) {
    if (item?.type !== "game" || !SLUG.test(item.id || "")) continue;
    if (seen.has(item.id)) repeated.add(item.id);
    seen.add(item.id);
    if (!Array.isArray(item.claims)) continue;
    const claims = item.claims.filter(c => c?.field === "providerId");
    if (claims.length === 1 && claims[0].status === "verified" &&
        Array.isArray(claims[0].codes) && claims[0].codes.length === 0) {
      approved.add(item.id);
    }
  }
  for (const id of repeated) approved.delete(id);
  return approved;
}
function safePage(source, url, reviewed) {
  return Object.freeze({
    id: source.id, title: source.title, url,
    reviewStatus: reviewed ? "full-review-approved" : "editorial-verification-pending",
  });
}
export function buildGameNavigation44({
  games = [], publishedRoutes = [], audit = null, fullReviewPolicy = null,
} = {}) {
  if (!Array.isArray(games) || !Array.isArray(publishedRoutes)) {
    throw new Error("Stage 44 requires games and route manifest arrays");
  }
  const byId = new Map(), bySlug = new Map(), routes = new Map(), ambiguous = new Set();
  for (const game of games) {
    if (!SLUG.test(game?.id || "") || !SLUG.test(game?.slug || "") ||
        typeof game?.title !== "string" || !game.title.trim() ||
        game?.globalFacts?.id !== game.id || game?.globalFacts?.slug !== game.slug) {
      throw new Error("Invalid game source identity for navigation");
    }
    if (byId.has(game.id) || bySlug.has(game.slug)) {
      throw new Error("Duplicate game ID or slug in navigation");
    }
    byId.set(game.id, game);
    bySlug.set(game.slug, game);
  }
  // Ambiguous legacy references are never resolved by guessing.
  for (const [id, game] of byId) {
    const other = bySlug.get(id);
    if (other && other.id !== game.id) ambiguous.add(id);
  }
  for (const [slug, game] of bySlug) {
    const other = byId.get(slug);
    if (other && other.id !== game.id) ambiguous.add(slug);
  }
  for (const route of publishedRoutes) {
    if (route?.type !== "game" || !SLUG.test(route.entityId || "") ||
        typeof route.path !== "string") continue;
    const game = byId.get(route.entityId);
    if (!game || route.path !== "/en/games/" + game.slug + "/") continue;
    if (routes.has(game.id)) throw new Error("Ambiguous built game route: " + game.id);
    routes.set(game.id, route.path);
  }
  const sourceReviewed = approvedProviderIds(audit);
  const providerReviewed = game => sourceReviewed.has(game?.id) &&
    SLUG.test(game?.globalFacts?.providerId || "");
  const eligible = game => game && routes.has(game.id);
  const verifiedFullReview = game => fullReviewPolicy?.game?.(game) === true;
  const items = id => {
    const source = byId.get(id);
    if (!eligible(source)) return Object.freeze({ curated: [], fromProvider: [] });
    const used = new Set([id]), curated = [];
    const refs = Array.isArray(source.relatedGames) ? source.relatedGames : [];
    for (const ref of refs) {
      if (typeof ref !== "string" || !SLUG.test(ref) || ambiguous.has(ref)) continue;
      const target = byId.get(ref) || bySlug.get(ref);
      if (!eligible(target) || used.has(target.id)) continue;
      used.add(target.id);
      curated.push(safePage(target, routes.get(target.id), verifiedFullReview(target)));
      if (curated.length >= MAX) break;
    }
    const fromProvider = [];
    if (providerReviewed(source)) {
      for (const target of games) {
        if (used.has(target.id) || !eligible(target) || !providerReviewed(target) ||
            target.globalFacts.providerId !== source.globalFacts.providerId) continue;
        used.add(target.id);
        fromProvider.push(safePage(target, routes.get(target.id), verifiedFullReview(target)));
        if (fromProvider.length >= MAX) break;
      }
    }
    return Object.freeze({
      curated: Object.freeze(curated),
      fromProvider: Object.freeze(fromProvider),
    });
  };
  const projection = new Map();
  for (const game of games) if (eligible(game)) projection.set(game.id, items(game.id));
  return Object.freeze({
    forGame(game) {
      const id = game?.id;
      // Resolve from stable IDs, not object identity; Eleventy pagination can
      // clone template data. Only the indexed source record supplies link URLs.
      const source = byId.get(id);
      if (!source || !eligible(source) || source.slug !== game?.slug ||
          game?.globalFacts?.id !== source.id ||
          game?.globalFacts?.slug !== source.slug) {
        return { curated: [], fromProvider: [] };
      }
      return projection.get(id) || { curated: [], fromProvider: [] };
    },
    routeCount: routes.size,
  });
}
