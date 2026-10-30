// Stage 42.2 — indexability requires a separate human release decision.
// Generated development routes do not prove public publication.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA = /^[a-f0-9]{64}$/;
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const PAGE_TYPES = new Set(["home", "games-index", "casinos-index", "game", "casino"]);
const isObj = x => x !== null && typeof x === "object" && !Array.isArray(x);
const validTime = (value, now) =>
  typeof value === "string" && DATE.test(value) &&
  Number.isFinite(Date.parse(value)) && Date.parse(value) <= now;

function validRoute(route) {
  if (!isObj(route) || !PAGE_TYPES.has(route.type) ||
      typeof route.path !== "string" ||
      !/^\/en\/(?:[a-z0-9-]+\/)*$/.test(route.path)) return false;
  const expected = {
    home: "/en/",
    "games-index": "/en/games/",
    "casinos-index": "/en/casinos/",
  };
  if (expected[route.type]) return route.path === expected[route.type];
  return typeof route.entityId === "string" && SLUG.test(route.entityId) &&
    route.path.startsWith("/en/" + (route.type === "game" ? "games/" : "casinos/")) &&
    route.path.split("/").filter(Boolean).length === 3;
}

function auditIsGloballyReady(audit) {
  return audit?.schemaVersion === 1 &&
    audit.productionReleaseAllowed === true &&
    audit.autoApprove === false && audit.autoPublish === false &&
    Number.isInteger(audit.counts?.blockers) && audit.counts.blockers === 0 &&
    Array.isArray(audit.items) && audit.items.length > 0;
}

function individuallyReady(audit, route) {
  if (route.type !== "game" && route.type !== "casino") return true;
  const items = audit.items.filter(item => item?.type === route.type && item.id === route.entityId);
  return items.length === 1 && items[0].releaseReady === true &&
    Array.isArray(items[0].blockers) && items[0].blockers.length === 0;
}

/**
 * Explicit allowlist used for BOTH robots metadata and sitemap.
 * approvals must be independent human release records, not Studio candidates.
 * revisionHashes must be independently measured from approved source revisions.
 * informationApproved is a separate global public-information/market gate.
 * The production adapter for these decisions is not implemented in Stage 42.2.
 */
export function createIndexability42({
  routes = [], audit = null, approvals = [], revisionHashes = {},
  informationApproved = false, now = Date.now(),
} = {}) {
  if (!Array.isArray(routes) || !Array.isArray(approvals) ||
      !isObj(revisionHashes) || !Number.isFinite(now)) {
    throw new Error("Stage 42.2 requires route/release arrays, revision map and valid time");
  }
  const knownRoutes = new Map();
  for (const route of routes) {
    if (!validRoute(route)) throw new Error("Invalid generated route identity");
    if (knownRoutes.has(route.path)) throw new Error("Duplicate generated route: " + route.path);
    knownRoutes.set(route.path, route);
  }
  const decisions = new Map();
  for (const approval of approvals) {
    if (!isObj(approval) || typeof approval.path !== "string" ||
        !knownRoutes.has(approval.path)) {
      throw new Error("Release decision points to an unknown generated route");
    }
    if (decisions.has(approval.path)) {
      throw new Error("Duplicate release decision: " + approval.path);
    }
    decisions.set(approval.path, approval);
  }
  const globalReady = auditIsGloballyReady(audit) && informationApproved === true;
  const permitted = [];
  for (const route of routes) {
    const decision = decisions.get(route.path);
    if (!globalReady || !decision) continue;
    if (decision.status !== "approved-for-indexing" ||
        decision.locale !== "en" || decision.type !== route.type ||
        decision.path !== route.path ||
        (route.entityId || null) !== (decision.entityId || null) ||
        decision.globalInformationRights !== true ||
        !isObj(decision.review) ||
        decision.review.status !== "approved" ||
        !SLUG.test(decision.review.reviewerId || "") ||
        !validTime(decision.review.reviewedAt, now) ||
        typeof decision.contentSha256 !== "string" ||
        !SHA.test(decision.contentSha256) ||
        revisionHashes[route.path] !== decision.contentSha256 ||
        !individuallyReady(audit, route)) continue;
    permitted.push(Object.freeze({
      path: route.path, type: route.type,
      ...(route.entityId ? { entityId: route.entityId } : {}),
    }));
  }
  const safeRoutes = Object.freeze(permitted);
  const pathSet = new Set(safeRoutes.map(route => route.path));
  return Object.freeze({
    routes: safeRoutes,
    approvedRouteCount: safeRoutes.length,
    generatedRouteCount: routes.length,
    allows(path) {
      return typeof path === "string" && pathSet.has(path);
    },
  });
}
