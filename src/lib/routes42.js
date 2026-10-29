// A route allowlist for pages already rendered by Eleventy; imported candidates
// and unsigned Studio suggestions are never read here.
const validSlug = s => typeof s === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
export function buildRoutes42({ games = [], casinos = [] } = {}) {
  const routes = [], seen = new Set(), ids = new Set();
  const add = (path, type, extra = {}) => {
    if (seen.has(path)) throw new Error("Duplicate public route: " + path);
    seen.add(path); routes.push({ path, type, ...extra });
  };
  add("/en/", "home");
  add("/en/games/", "games-index");
  add("/en/casinos/", "casinos-index");
  for (const game of games) {
    if (!validSlug(game.slug) || typeof game.id !== "string" || !game.id.trim())
      throw new Error("Invalid published game identity");
    if (ids.has(game.id)) throw new Error("Duplicate published game ID: " + game.id);
    ids.add(game.id);
    add("/en/games/" + game.slug + "/", "game", {
      entityId: game.id, auditStatus: game.globalFacts?.sourceStatus ?? "unknown",
    });
  }
  for (const casino of casinos) {
    if (!validSlug(casino.slug)) throw new Error("Invalid published casino slug");
    add("/en/casinos/" + casino.slug + "/", "casino", {
      entityId: casino.id || casino.slug, auditStatus: "claims-awaiting-audit",
    });
  }
  return routes;
}
