// Stage 43.2: fail-closed presentation of public review claims.
//
// All approved facts, editorial copy and rating methods must pass the existing
// Stage 43 global release gate. A page generated in local Eleventy is NOT proof
// that its claims have been checked. Never use incoming "verified" UI flags.
export function createEditorialDisplay432(audit) {
  const globallyApproved = audit?.schemaVersion === 1 &&
    audit.productionReleaseAllowed === true &&
    audit.autoApprove === false && audit.autoPublish === false &&
    Array.isArray(audit.items) &&
    audit.items.length > 0 &&
    Number(audit.counts?.blockers) === 0;

  const readyItems = new Set();
  if (globallyApproved) for (const item of audit.items) {
    if (item?.releaseReady === true && Array.isArray(item.blockers) &&
        item.blockers.length === 0 && ["game","casino","author"].includes(item.type) &&
        typeof item.id === "string") {
      readyItems.add(item.type + ":" + item.id);
    }
  }
  const permitted = (type, id) => globallyApproved &&
    typeof id === "string" && readyItems.has(type + ":" + id);

  return Object.freeze({
    fullReleaseReady: globallyApproved,
    game(game) {
      return permitted("game", game?.id || game?.globalFacts?.id);
    },
    casino(casino) {
      return permitted("casino", casino?.slug);
    },
    author(id) {
      return permitted("author", id);
    },
    // Never return raw claims or original source data from this policy.
  });
}
