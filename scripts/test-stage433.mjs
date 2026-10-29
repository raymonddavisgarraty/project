import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createEditorialFields433 } from "../src/lib/editorial-fields433.mjs";
import { auditCurrentRepository43 } from "./editorial43.mjs";
import games from "../src/_data/games.js";
import casinos from "../src/_data/casinos.js";

const record = {
  id: "test-game",
  globalFacts: {
    id: "test-game", providerName: "Example Provider", reels: 6, rtp: 96.48,
    maxWinMultiplier: 21100, volatility: "high", hitFrequency: "medium",
  },
};
const casino = {
  slug: "test-casino", licence: "fake", license: "Example licence",
  gamesCount: "2,000+", bonus: "500 free spins", rating: 4.7, type: "crypto",
};
const verified = field => ({ field, status: "verified", codes: [] });
const unverified = field => ({ field, status: "unverified", codes: ["evidence-not-approved"] });
const claimAudit = {
  schemaVersion: 1,
  autoApprove: false,
  autoPublish: false,
  productionReleaseAllowed: false,
  counts: { blockers: 10 },
  items: [
    { type: "game", id: "test-game", releaseReady: false,
      blockers: [{ field: "editorialReview" }],
      claims: [
        verified("providerName"), verified("reels"), verified("maxWinMultiplier"),
        unverified("rtp"), verified("volatility"), verified("hitFrequency"),
        verified("rating"),
      ],
    },
    { type: "casino", id: "test-casino", releaseReady: false,
      blockers: [{ field: "editorialReview" }],
      claims: [
        verified("gamesCount"), verified("license"), verified("bonus"),
        verified("rating"), unverified("type"),
      ],
    },
  ],
};
const policy = createEditorialFields433(claimAudit);
const gameRows = policy.gameRows(record);
assert.deepEqual(gameRows.map(r => r.field),
  ["providerName", "reels", "volatility", "maxWinMultiplier"]);
assert(gameRows.some(r => r.field === "maxWinMultiplier" && r.value === "21,100×"));
assert(!gameRows.some(r => r.field === "rtp" || r.field === "rating" || r.field === "hitFrequency"));
assert(gameRows.every(r => r.reviewStatus === "claim-verified"));
assert.equal(policy.gameFieldVerified(record, "reels"), true);
assert.equal(policy.gameFieldVerified(record, "rtp"), false);
assert.deepEqual(policy.gameRows({ ...record, globalFacts: { ...record.globalFacts, id: "other" } }), []);

const casinoRows = policy.casinoRows(casino);
assert.deepEqual(casinoRows.map(r => r.field), ["license", "gamesCount"]);
assert(casinoRows.some(r => r.field === "gamesCount" && r.value === "2,000+"));
assert(!casinoRows.some(r => ["bonus","rating","type"].includes(r.field)));
assert.equal(policy.casinoFieldVerified(casino,"license"), true);
assert.equal(policy.casinoFieldVerified(casino,"bonus"), false);

const deny = a => createEditorialFields433(a).gameRows(record);
for (const invalid of [
  null, {},
  { ...claimAudit, schemaVersion: 2 },
  { ...claimAudit, autoApprove: true },
  { ...claimAudit, autoPublish: true },
  { ...claimAudit, items: [] },
  { ...claimAudit, items: [...claimAudit.items, claimAudit.items[0]] },
]) assert.equal(deny(invalid).length, 0);

const missingReview = {
  ...claimAudit,
  items: [{
    type:"game", id:"test-game",
    claims:[{ field:"reels", status:"verified", codes:["claim-review-missing"] }],
  }],
};
assert.deepEqual(deny(missingReview), []);
const duplicateClaims = {
  ...claimAudit,
  items:[{ type:"game", id:"test-game", claims:[verified("reels"),verified("reels")] }],
};
assert.deepEqual(deny(duplicateClaims), []);
const invalidValue = {
  ...record,
  globalFacts:{...record.globalFacts, reels: -1, maxWinMultiplier: Number.NaN},
};
assert(!policy.gameRows(invalidValue).some(r => ["reels","maxWinMultiplier"].includes(r.field)));

const original = auditCurrentRepository43();
const live = createEditorialFields433(original);
assert.equal(original.productionReleaseAllowed, false);
assert(games.every(game => live.gameRows(game).length === 0));
assert(casinos.every(entry => live.casinoRows(entry).length === 0));

const rootTemplate = readFileSync("src/index.njk", "utf8");
assert.match(rootTemplate, /permalink:\s*\/\s*\n/);
assert(rootTemplate.includes('content="0; url=/en/"'));
assert(rootTemplate.includes('href="/en/"'));
assert(rootTemplate.includes('content="noindex, follow"'));
const sitemap = readFileSync("src/sitemap.njk", "utf8");
assert(!sitemap.includes("<loc>/</loc>"));
const gameTemplate = readFileSync("src/en/games/game.njk","utf8");
const casinoTemplate = readFileSync("src/en/casinos/casino.njk","utf8");
assert(gameTemplate.includes("editorialFields433.gameRows(game)"));
assert(casinoTemplate.includes("editorialFields433.casinoRows(casino)"));
assert(gameTemplate.includes("editorialDisplay432.game(game)"));
assert(casinoTemplate.includes("editorialDisplay432.casino(casino)"));
assert(gameTemplate.includes("Individually source-reviewed facts"));
assert(casinoTemplate.includes("Individually source-reviewed information"));
console.log("Stage 43.3 tests OK (root entrypoint, claim-by-claim display, strict exclusions, rating/offer denials, existing audit).");
