// Stage 43.3: conservative claim-level rendering of source-reviewed facts.
//
// A verified claim means Stage 43 evaluated *this exact source value* with
// matching approved evidence and a human reviewer. It does NOT approve the
// whole page, author, market, rating, bonus or publication. Never accept flags
// from external Studio exports as a shortcut.
const GAME_DISPLAY = Object.freeze([
  ["providerName", "Provider"],
  ["releaseYear", "Release year"],
  ["reels", "Reels"],
  ["paylineType", "Pay mechanism"],
  ["volatility", "Volatility"],
  ["rtp", "Theoretical RTP"],
  ["maxWinMultiplier", "Maximum win"],
  ["paylines", "Paylines"],
]);
const CASINO_DISPLAY = Object.freeze([
  ["license", "Licence claim"],
  ["gamesCount", "Game count"],
  ["type", "Casino type"],
]);
// Excluded by design: editorial scores, bonuses, withdrawal promises, claims
// that require market clearance, hit frequency without a stated methodology,
// and all editorial prose.
function safeValue(type, field, value) {
  if (value == null) return null;
  const text = value => typeof value === "string" && value.trim() &&
    value.length <= 300 ? value.trim() : null;
  if (type === "game") {
    switch (field) {
      case "providerName": return text(value);
      case "releaseYear":
        return Number.isInteger(value) && value >= 1900 && value <= 2100 ? String(value) : null;
      case "reels": return Number.isInteger(value) && value >= 1 && value <= 20 ? String(value) : null;
      case "paylineType":
        return ({ "pays-anywhere": "Pays anywhere", "fixed": "Fixed paylines",
          "ways": "Ways to win", "cluster-pays": "Cluster pays" })[value] || null;
      case "volatility":
        return ({ low:"Low", medium:"Medium", high:"High", "very-high":"Very high" })[value] || null;
      case "rtp":
        return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100
          ? value.toFixed(2) + "%" : null;
      case "maxWinMultiplier":
        return typeof value === "number" && Number.isFinite(value) && value >= 0
          ? value.toLocaleString("en-US", { maximumFractionDigits: 2 }) + "×" : null;
      case "paylines": return Number.isInteger(value) && value >= 0 ? String(value) : null;
    }
  } else if (type === "casino") {
    if (field === "license" || field === "type") return text(value);
    if (field === "gamesCount") return Number.isInteger(value) && value >= 0 ? String(value) :
      typeof value === "string" && /^\d[\d, ]*\+?$/.test(value) && value.length <= 24 ? value.trim() : null;
  }
  return null;
}
export function createEditorialFields433(audit) {
  const valid = audit?.schemaVersion === 1 && audit.autoApprove === false &&
    audit.autoPublish === false && Array.isArray(audit.items);
  const indexed = new Map(), duplicates = new Set();
  if (valid) for (const item of audit.items) {
    if (!["game","casino"].includes(item?.type) ||
        typeof item.id !== "string" || !Array.isArray(item.claims)) continue;
    const key = item.type + ":" + item.id;
    if (indexed.has(key)) duplicates.add(key);
    else indexed.set(key, item);
  }
  function getRows(type, id, data, fields) {
    if (!valid || typeof id !== "string" || !data || typeof data !== "object") return [];
    const key = type + ":" + id;
    const item = indexed.get(key);
    if (!item || duplicates.has(key)) return [];
    const claims = new Map();
    const repeated = new Set();
    for (const claim of item.claims) {
      if (typeof claim?.field !== "string") continue;
      if (claims.has(claim.field)) repeated.add(claim.field);
      claims.set(claim.field, claim);
    }
    return fields.flatMap(([field, label]) => {
      if (repeated.has(field)) return [];
      const claim = claims.get(field);
      if (claim?.status !== "verified" || !Array.isArray(claim.codes) || claim.codes.length) return [];
      const displayValue = safeValue(type, field, data[field]);
      return displayValue === null ? [] : [{
        field, label, value: displayValue,
        reviewStatus: "claim-verified", // not a page approval
      }];
    });
  }
  return Object.freeze({
    gameRows(game) {
      if (!game || typeof game.id !== "string" ||
          game.globalFacts?.id !== game.id) return [];
      return getRows("game", game.id, game.globalFacts, GAME_DISPLAY);
    },
    casinoRows(casino) {
      if (!casino || typeof casino.slug !== "string") return [];
      return getRows("casino", casino.slug, casino, CASINO_DISPLAY);
    },
    gameFieldVerified(game, field) {
      return this.gameRows(game).some(row => row.field === field);
    },
    casinoFieldVerified(casino, field) {
      return this.casinoRows(casino).some(row => row.field === field);
    },
  });
}
