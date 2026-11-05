import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createEditorialFields433} from "../src/lib/editorial-fields433.mjs";
import games from "../src/_data/games.js";
import display from "../src/_data/editorialDisplay432.js";

const hero=readFileSync("src/_includes/components/game-hero/game-hero.njk","utf8");
const page=readFileSync("src/en/games/game.njk","utf8");
const card=readFileSync("src/_includes/components/game-grid-card/game-grid-card.njk","utf8");
const rail=readFileSync("src/_includes/components/game-rail/game-rail.njk","utf8");
for(const [name,text] of [["hero",hero],["page",page]]){
 assert(text.includes("editorialFields433.gameRows(game)"),name+" must only read reviewed display rows");
 assert(!/game\.facts\.(provider|rtp|volatility|reels|paylines|maxWin|hitFrequency|releaseYear)/.test(text),
  name+" must not display raw unapproved game facts");
}
assert(hero.includes("{% if approvedFacts.length %}"));
assert(page.includes("{% if rows.length %}"));
assert(card.includes("editorialFields433.gameFieldVerified(game, 'rtp')"));
assert(card.includes("editorialFields433.gameFieldVerified(game, 'volatility')"));
assert(card.includes("editorialFields433.gameFieldVerified(game, 'providerName')"));
assert(rail.includes("editorialFields433.gameFieldVerified(game, 'providerName')"));
assert(page.includes('editorialDisplay432.game(game)'),"Never remove full review gate");
assert(page.includes('reviewPreview443.forGame(game)'),"Keep safe fallback");
const v=f=>({field:f,status:"verified",codes:[]});
const bad=f=>({field:f,status:"unverified",codes:["evidence-not-approved"]});
const audit={schemaVersion:1,autoApprove:false,autoPublish:false,
 items:[{type:"game",id:"sample",claims:[
  v("providerName"),v("reels"),bad("rtp"),bad("maxWinMultiplier"),bad("volatility"),
 ]}]};
const source={id:"sample",globalFacts:{id:"sample",providerName:"Example Official",
 reels:6,rtp:96.48,maxWinMultiplier:21100,volatility:"high",hitFrequency:"medium"}};
const rows=createEditorialFields433(audit).gameRows(source);
assert.deepEqual(rows.map(x=>x.field),["providerName","reels"]);
assert(!JSON.stringify(rows).includes("96.48"));
assert(!JSON.stringify(rows).includes("21,100"));
assert(!JSON.stringify(rows).includes("medium"));
const none=createEditorialFields433({...audit,items:[]}).gameRows(source);
assert.deepEqual(none,[]);
const real=games.find(g=>g.id==="sweet-bonanza");
assert.equal(real.rating,null);
assert.equal(display.game(real),false);
console.log("Game detail verified facts QA OK (reviewed-only rows, unknown fields omitted; full-page release still denied).");
