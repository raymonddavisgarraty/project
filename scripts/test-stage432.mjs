import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createEditorialDisplay432 } from "../src/lib/editorial-display432.mjs";
import { auditCurrentRepository43 } from "./editorial43.mjs";
import games from "../src/_data/games.js";
import casinos from "../src/_data/casinos.js";

const item = { type: "game", id: "example-game", releaseReady: true, blockers: [] };
const green = {
  schemaVersion: 1, productionReleaseAllowed: true,
  autoApprove: false, autoPublish: false, counts: { blockers: 0 }, items: [item],
};
assert.equal(createEditorialDisplay432(green).game({ id: "example-game" }), true);
assert.equal(createEditorialDisplay432(green).game({ id: "other-game" }), false);
assert.equal(createEditorialDisplay432(green).casino({ slug: "example-game" }), false);
for (const fail of [
  { ...green, productionReleaseAllowed: false },
  { ...green, counts: { blockers: 1 } },
  { ...green, autoApprove: true },
  { ...green, autoPublish: true },
  { ...green, schemaVersion: 999 },
  { ...green, items: [{ ...item, releaseReady: false }] },
  { ...green, items: [{ ...item, blockers: [{ code: "no-evidence" }] }] },
  { ...green, items: [] },
]) {
  assert.equal(createEditorialDisplay432(fail).game({ id: "example-game" }), false);
}

const audit = auditCurrentRepository43();
const policy = createEditorialDisplay432(audit);
assert.equal(policy.fullReleaseReady, audit.productionReleaseAllowed && audit.counts.blockers === 0);
for (const g of games) assert.equal(policy.game(g), audit.productionReleaseAllowed);
for (const c of casinos) assert.equal(policy.casino(c), audit.productionReleaseAllowed);
if (!audit.productionReleaseAllowed) {
  assert(games.every(g => !policy.game(g)));
  assert(casinos.every(c => !policy.casino(c)));
}
const checked = [
  ["src/en/games/game.njk", "editorialDisplay432.game(game)"],
  ["src/en/casinos/casino.njk", "editorialDisplay432.casino(casino)"],
  ["src/_includes/components/game-grid-card/game-grid-card.njk", "editorialDisplay432.game(game)"],
  ["src/_includes/components/casino-card/casino-card.njk", "editorialDisplay432.casino(casino)"],
  ["src/_includes/components/listing-card/listing-card.njk", "editorialDisplay432.casino(item)"],
  ["src/_includes/components/game-rail/game-rail.njk", "editorialDisplay432.game(game)"],
];
for (const [path, guard] of checked) {
  const source = readFileSync(path, "utf8");
  assert(source.includes(guard), path + " is missing the approved-content guard");
}
for (const path of ["src/en/games/game.njk", "src/en/casinos/casino.njk"]) {
  const source = readFileSync(path, "utf8");
  assert(source.includes("{% else %}") && source.includes("Editorial verification pending."),
    path + " is missing its safe editorial fallback");
}
const proposal = JSON.parse(readFileSync("research/correction-proposals/sweet-bonanza-original-432.json", "utf8"));
assert.equal(proposal.approvalGranted, false);
assert.equal(proposal.autoPublish, false);
assert.equal(proposal.correctionFileTouched, false);
assert.equal(proposal.publicationFileTouched, false);
assert.equal(proposal.decisions.find(d => d.field === "maxWinMultiplier").candidateValue, 21175);
assert.equal(proposal.decisions.find(d => d.field === "rtp").candidateValue, null);
assert.equal(proposal.sourceCandidates.every(s => s.snapshotHash === null), true);
console.log("Stage 43.2 tests OK (fail-closed display, page/card guards, research proposal without approval).");
