// Stage 43: read-only claim-level verification assessment.
// "verified" data needs matching evidence AND an explicit human review.
// This module never changes approval, publication, or source files.
const GAME_FIELDS = Object.freeze([
  "providerId", "providerName", "rtp", "volatility", "reels",
  "paylines", "paylineType", "releaseYear", "maxWinMultiplier", "hitFrequency",
]);
const CASINO_FIELDS = Object.freeze([
  "title", "rating", "ratingBreakdown", "license", "bonus",
  "bonusDetails.wager", "bonusDetails.minDeposit", "gamesCount",
  "paymentMethods", "payments", "gameTypes", "withdrawalSpeed",
  "trustItems", "type", "isNew",
]);
const AUTHOR_FIELDS = Object.freeze(["name", "role", "bio", "reviewsCount"]);

function fieldValue(object, field) {
  return field.split(".").reduce((value, key) => value == null ? undefined : value[key], object);
}
function isoTime(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value))
    return null;
  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) ? milliseconds : null;
}
function isReviewApproved(review, now) {
  const time = isoTime(review?.reviewedAt);
  return review?.status === "approved" && typeof review.reviewerId === "string" &&
    review.reviewerId.trim().length > 1 && time !== null && time <= now;
}
function validEvidence(e, now) {
  let url;
  try { url = new URL(e?.url); } catch { return false; }
  const time = isoTime(e?.observedAt);
  return url.protocol === "https:" && !url.username && !url.password &&
    time !== null && time <= now &&
    ["official", "secondary", "other"].includes(e.sourceType) &&
    Object.hasOwn(e, "value");
}
function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
function maxAgeDays(type, field) {
  if (type !== "casino") return null;
  if (field === "bonus" || field.startsWith("bonusDetails.") ||
      field === "withdrawalSpeed") return 30;
  if (field === "license") return 365;
  return null;
}
export function assessClaim43({ type, field, actual, entry, now = Date.now() }) {
  if (actual === undefined || actual === null) {
    return { field, status: "not-claimed", codes: [] };
  }
  if (!entry || entry.status === "unverified") {
    return { field, status: "unverified", codes: ["evidence-not-approved"] };
  }
  if (entry.status === "conflict") {
    return { field, status: "conflict", codes: ["unresolved-source-conflict"] };
  }
  if (entry.status !== "verified") {
    return { field, status: "invalid", codes: ["invalid-claim-status"] };
  }
  const codes = [];
  if (!isReviewApproved(entry.review, now)) codes.push("claim-review-missing");
  if (!Array.isArray(entry.evidence) || entry.evidence.length === 0) {
    codes.push("missing-source-evidence");
  } else {
    const entries = entry.evidence;
    const accepted = entries.filter(e => validEvidence(e, now));
    if (accepted.length !== entries.length) codes.push("invalid-evidence-record");
    const matching = accepted.filter(e => sameValue(actual, e.value));
    if (!matching.length) codes.push("source-value-mismatch");
    if (accepted.some(e => !sameValue(actual, e.value))) codes.push("source-conflict-needs-review");
    const days = maxAgeDays(type, field);
    if (days !== null && matching.length &&
        !matching.some(e => now - isoTime(e.observedAt) <= days * 86400000)) {
      codes.push("time-sensitive-evidence-expired");
    }
  }
  return { field, status: codes.length ? "invalid" : "verified", codes };
}
function assessEditorial43(review, now) {
  return isReviewApproved(review, now) ? [] : ["editorial-review-not-approved"];
}
function statusItem(type, id, values, provenance, fields, now, editorialReview) {
  const claims = fields.map(field => assessClaim43({
    type, field, actual: fieldValue(values, field),
    entry: provenance?.fields?.[field], now,
  }));
  const blockers = claims.filter(claim => claim.codes.length)
    .map(claim => ({ type, id, field: claim.field, codes: claim.codes }));
  for (const code of assessEditorial43(editorialReview, now)) {
    blockers.push({ type, id, field: "editorialReview", codes: [code] });
  }
  return { type, id, claims, blockers, releaseReady: blockers.length === 0 };
}
export function auditSnapshot43({
  games = [], casinos = [], authors = {}, gameProvenance = {},
  casinoProvenance = {}, authorProvenance = {},
  ratingMethodology = null, now = Date.now(),
} = {}) {
  if (!Number.isFinite(now)) throw new Error("Invalid audit time");
  const items = [], globalBlockers = [];
  const ratingAccepted = isReviewApproved(ratingMethodology?.review, now) &&
    ratingMethodology?.status === "approved" &&
    typeof ratingMethodology?.methodologyId === "string" &&
    ratingMethodology.methodologyId.trim().length > 1;

  for (const game of games) {
    const fact = game.globalFacts || game;
    const id = fact.id;
    if (typeof id !== "string" || !id) throw new Error("Game ID required for audit");
    const record = gameProvenance[id];
    const item = statusItem("game", id, fact, record, GAME_FIELDS, now, record?.editorialReview);
    if (!record || record.gameId !== id || record.schemaVersion !== 1) {
      item.blockers.push({ type: "game", id, field: "provenance", codes: ["missing-or-invalid-provenance"] });
    }
    if (fact.sourceStatus !== "editorially-verified") {
      item.blockers.push({ type: "game", id, field: "sourceStatus", codes: ["legacy-or-unverified-facts"] });
    }
    if (game.rating != null) {
      const rating = assessClaim43({
        type: "game", field: "rating", actual: game.rating,
        entry: record?.editorialClaims?.rating, now,
      });
      item.claims.push(rating);
      if (rating.codes.length) item.blockers.push({ type: "game", id, field: "rating", codes: rating.codes });
      if (!ratingAccepted) item.blockers.push({
        type: "game", id, field: "ratingMethodology", codes: ["rating-methodology-unapproved"],
      });
    }
    item.releaseReady = item.blockers.length === 0;
    items.push(item);
  }
  for (const casino of casinos) {
    const id = casino.slug;
    if (typeof id !== "string" || !id) throw new Error("Casino slug required for audit");
    const record = casinoProvenance[id];
    const item = statusItem("casino", id, casino, record, CASINO_FIELDS, now, record?.editorialReview);
    if (!record || record.casinoId !== id || record.schemaVersion !== 1) {
      item.blockers.push({ type: "casino", id, field: "provenance", codes: ["missing-or-invalid-provenance"] });
    }
    if (casino.rating != null && !ratingAccepted) item.blockers.push({
      type: "casino", id, field: "ratingMethodology", codes: ["rating-methodology-unapproved"],
    });
    item.releaseReady = item.blockers.length === 0;
    items.push(item);
  }

  // Only authors referenced by currently generated pages are checked.
  const usedAuthors = new Set([...games.map(g => g.author), ...casinos.map(c => c.author)].filter(Boolean));
  for (const id of usedAuthors) {
    if (!authors[id]) {
      items.push({ type: "author", id, claims: [], releaseReady: false,
        blockers: [{ type: "author", id, field: "identity", codes: ["author-record-missing"] }] });
      continue;
    }
    const record = authorProvenance[id];
    const item = statusItem("author", id, authors[id], record, AUTHOR_FIELDS, now, record?.editorialReview);
    if (!record || record.authorId !== id || record.schemaVersion !== 1) item.blockers.push({
      type: "author", id, field: "provenance", codes: ["missing-or-invalid-provenance"],
    });
    item.releaseReady = item.blockers.length === 0;
    items.push(item);
  }

  const blockers = items.flatMap(item => item.blockers);
  const claims = items.flatMap(item => item.claims);
  const counts = {
    games: games.length, casinos: casinos.length, authors: usedAuthors.size,
    claims: claims.filter(c => c.status !== "not-claimed").length,
    verified: claims.filter(c => c.status === "verified").length,
    unverified: claims.filter(c => c.status === "unverified").length,
    conflicts: claims.filter(c => c.status === "conflict").length,
    invalid: claims.filter(c => c.status === "invalid").length,
    blockers: blockers.length,
    releaseReady: items.filter(i => i.releaseReady).length,
  };
  return {
    schemaVersion: 1, auditedAt: new Date(now).toISOString(),
    autoApprove: false, autoPublish: false,
    productionReleaseAllowed: blockers.length === 0,
    counts, blockers, items,
    note: "Audit is read-only. Approval requires independent evidence and human editorial decisions.",
  };
}
