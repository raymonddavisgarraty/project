import assert from "node:assert/strict";
import { auditSnapshot43, assessClaim43 } from "../src/lib/editorial43.mjs";
import { auditCurrentRepository43, assertProductionEditorial43 } from "./editorial43.mjs";

const now = Date.parse("2026-10-29T12:00:00Z");
const reviewed = { status: "approved", reviewerId: "fixture-editor", reviewedAt: "2026-10-28T12:00:00Z" };
const evidence = value => [{
  url: "https://manufacturer.example.org/official-facts",
  observedAt: "2026-10-28T08:00:00Z",
  sourceType: "official",
  value,
}];
const verified = value => ({ status: "verified", evidence: evidence(value), review: reviewed });
const params = { type: "game", field: "rtp", actual: 96.48, now };

assert.equal(assessClaim43({ ...params, entry: undefined }).status, "unverified");
assert.equal(assessClaim43({ ...params, entry: { status: "conflict", evidence: [] } }).status, "conflict");
assert.equal(assessClaim43({ ...params, entry: verified(96.48) }).status, "verified");
assert(assessClaim43({ ...params, entry: verified(96.5) }).codes.includes("source-value-mismatch"));
assert(assessClaim43({ ...params, entry: { status: "verified", evidence: evidence(96.48) } })
  .codes.includes("claim-review-missing"));
assert(assessClaim43({ ...params, entry: {
  ...verified(96.48),
  evidence: [{ ...evidence(96.48)[0], url: "http://unsafe.example.org" }],
} }).codes.includes("invalid-evidence-record"));

const expired = assessClaim43({
  type: "casino", field: "bonus", actual: "100 free spins", now,
  entry: { status: "verified", review: reviewed, evidence: [{
    url: "https://operator.example.org/terms",
    sourceType: "official", observedAt: "2026-08-01T00:00:00Z", value: "100 free spins",
  }] },
});
assert(expired.codes.includes("time-sensitive-evidence-expired"));

const game = {
  id: "verified-game",
  globalFacts: { id: "verified-game", providerId: "verified-provider", sourceStatus: "editorially-verified" },
  rating: null,
};
const prov = { schemaVersion: 1, gameId: "verified-game", fields: {
  providerId: verified("verified-provider"),
}, editorialReview: reviewed };
const ready = auditSnapshot43({
  games: [game], gameProvenance: { "verified-game": prov }, now,
});
assert.equal(ready.productionReleaseAllowed, true);
assert.equal(ready.counts.blockers, 0);

const lacking = auditSnapshot43({
  games: [{ ...game, rating: { overall: 4.5 } }],
  gameProvenance: { "verified-game": prov }, now,
});
assert.equal(lacking.productionReleaseAllowed, false);
assert(lacking.blockers.some(b => b.field === "ratingMethodology"));
assert(lacking.blockers.some(b => b.field === "rating"));

const fake = auditSnapshot43({
  games: [{ ...game, globalFacts: { ...game.globalFacts, sourceStatus: "legacy-unverified" } }],
  gameProvenance: { "verified-game": prov }, now,
});
assert(fake.blockers.some(b => b.field === "sourceStatus"));

const casino = { slug: "sample-casino", title: "Sample casino" };
const casinoApproved = {
  schemaVersion: 1, casinoId: "sample-casino",
  fields: { title: verified("Sample casino") }, editorialReview: reviewed,
};
assert(auditSnapshot43({
  casinos: [casino], casinoProvenance: { "sample-casino": casinoApproved }, now,
}).productionReleaseAllowed);
assert(!auditSnapshot43({ casinos: [casino], now }).productionReleaseAllowed);

const current = auditCurrentRepository43({ now });
assert.equal(current.productionReleaseAllowed, false);
assert.equal(current.counts.games, 2);
assert.equal(current.counts.casinos, 2);
assert.equal(current.counts.authors, 1);
assert(current.counts.unverified > 0);
assert(current.blockers.some(b => b.field === "ratingMethodology"));
assert.equal(current.autoPublish, false);
assert.equal(current.autoApprove, false);
assert.doesNotThrow(() => assertProductionEditorial43({ env: {} }));
assert.throws(() => assertProductionEditorial43({ env: { NODE_ENV: "production" } }),
  /production build blocked/);

console.log("Stage 43 tests OK (evidence, value matching, reviewer approval, freshness, release gate, read-only current data).");
