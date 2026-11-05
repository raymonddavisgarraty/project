import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import games from "../src/_data/games.js";
import {auditCurrentRepository43} from "./editorial43.mjs";

const pilot=games.find(g=>g.id==="sweet-bonanza");
assert(pilot,"Missing pilot");
assert.equal(pilot.rating,null);
assert.equal(pilot.affiliateId,null);
assert.equal(pilot.monetization?.affiliateId,null);
assert.deepEqual(pilot.relatedGames,[]);
assert.equal(pilot.globalFacts.sourceStatus,"legacy-unverified");
assert.equal(pilot.globalFacts.rtp,96.48,"Historical baseline was not silently rewritten");
assert.equal(pilot.globalFacts.maxWinMultiplier,21100,"Historical baseline was not silently rewritten");
assert.equal(auditCurrentRepository43().productionReleaseAllowed,false);
const source=readFileSync("src/content/locales/en/games/sweet-bonanza.js","utf8");
assert(!source.includes("4.7"));
assert(!source.includes('"pragplay"'));
assert(!source.includes('relatedGames: ["the-big-dog-house"]'));
const gameTemplate=readFileSync("src/en/games/game.njk","utf8");
const hero=readFileSync("src/_includes/components/game-hero/game-hero.njk","utf8");
const card=readFileSync("src/_includes/components/game-grid-card/game-grid-card.njk","utf8");
const cta=readFileSync("src/_includes/components/cta-panel/cta-panel.njk","utf8");
for(const [name,markup] of [["page",gameTemplate],["hero",hero],["card",card]]){
 assert(markup.includes("game.rating and game.rating.overall is defined"),name+" missing nullable rating guard");
}
assert(cta.includes("rating is defined and rating != null"));
assert(gameTemplate.includes("editorialDisplay432.game(game)"),"Stage43 gate must remain");
assert(gameTemplate.includes("reviewPreview443.forGame(game)"),"Safe preview must remain");
assert(gameTemplate.includes('include "components/local-editorial-pilot/local-editorial-pilot.njk"'),
  "Local opt-in preview must remain");
console.log("Sweet Bonanza pilot cleanup OK (no unsupported score, affiliate or similar-game claim; default-deny maintained).");
