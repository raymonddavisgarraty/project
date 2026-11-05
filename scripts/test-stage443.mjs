import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createReviewPreview443 } from "../src/lib/review-preview443.mjs";
import { auditCurrentRepository43 } from "./editorial43.mjs";
import games from "../src/_data/games.js";
import casinos from "../src/_data/casinos.js";
import { verifyReviewPreview443 } from "./check-stage443.mjs";

const verified = field => ({field,status:"verified",codes:[]});
const pending = field => ({field,status:"unverified",codes:["evidence-not-approved"]});
const fakeAudit = {
  schemaVersion:1,autoApprove:false,autoPublish:false,productionReleaseAllowed:false,
  items:[
    {type:"game",id:"example-game",claims:[
      verified("providerId"),verified("providerName"),pending("releaseYear"),
      verified("reels"),pending("paylineType"),pending("rtp"),
      pending("maxWinMultiplier"),verified("rating"),
      {field:"paylines",status:"not-claimed",codes:[]},
    ]},
    {type:"casino",id:"example-casino",claims:[
      verified("title"),pending("license"),pending("bonus"),
      pending("bonusDetails.wager"),verified("gamesCount"),
      pending("withdrawalSpeed"),pending("rating"),
    ]},
  ],
};
const game = {
  id:"example-game",slug:"example-game",title:"Original Example",
  globalFacts:{id:"example-game",slug:"example-game",
    providerName:"Do Not Display Provider Name",
    rtp:96.48,maxWinMultiplier:21100},
  rating:4.9,
};
const casino={slug:"example-casino",title:"Example Casino",
  rating:4.8,bonus:"Do Not Display Welcome Offer",license:"Do Not Display Licence"};
const policy=createReviewPreview443(fakeAudit);
const gp=policy.forGame(game);
assert.equal(gp.type,"game");
assert.equal(gp.publicationApproved,false);
assert.equal(gp.editorialStatus,"verification-pending");
assert.equal(gp.checkedClaims,4);
assert.equal(gp.claimCount,8);
assert.equal(gp.sections.length,4);
assert.deepEqual(gp.sections.map(s=>s.key),["identity","mechanics","mathematics","evaluation"]);
assert.deepEqual(gp.sections.map(s=>s.checkedCount),[2,1,0,1]);
assert.equal(gp.sections[0].state,"checks-pending");
assert.equal(gp.sections[3].state,"claims-checked");
const cp=policy.forCasino(casino);
assert.equal(cp.type,"casino");
assert.equal(cp.publicationApproved,false);
assert.equal(cp.checkedClaims,2);
assert.equal(cp.claimCount,7);
assert.equal(cp.sections.length,5);
assert.deepEqual(cp.sections.map(s=>s.key),
  ["identity","offers","game-catalogue","payments","evaluation"]);
for(const snapshot of [gp,cp]) {
  const text=JSON.stringify(snapshot);
  for(const forbidden of [
    "96.48","21100","4.9","4.8","Do Not Display",
    "Example Casino","Original Example", "https://", "playUrl", "affiliateId"
  ]) assert(!text.includes(forbidden),"Review presentation leaked: "+forbidden);
}
assert.equal(policy.forGame({...game,globalFacts:{...game.globalFacts,id:"other"}}).checkedClaims,0);
assert.equal(policy.forCasino({slug:"nonexistent"}).checkedClaims,0);
for(const bad of [
  null,{}, {...fakeAudit,schemaVersion:2},
  {...fakeAudit,autoApprove:true}, {...fakeAudit,autoPublish:true},
  {...fakeAudit,items:[...fakeAudit.items,fakeAudit.items[0]]}
]) {
  const guarded=createReviewPreview443(bad);
  assert.equal(guarded.forGame(game).checkedClaims,0);
  assert.equal(guarded.forCasino(casino).checkedClaims,bad?.items?.filter(x=>x.id==="example-casino").length===1 &&
    bad.autoApprove===false && bad.autoPublish===false && bad.schemaVersion===1 ? 2 : 0);
}
// Duplicate claims cannot appear as source checked; renderer fail-closes.
const duplicate={
  ...fakeAudit,items:[{type:"game",id:"example-game",
    claims:[verified("providerId"),verified("providerId")]}],
};
assert.equal(createReviewPreview443(duplicate).forGame(game).checkedClaims,0);
const missingClaims={...fakeAudit,items:[{type:"game",id:"example-game",claims:[]}]};
assert.equal(createReviewPreview443(missingClaims).forGame(game).claimCount,0);
assert(createReviewPreview443(missingClaims).forGame(game).sections.every(s=>s.state==="checks-pending"));

// Actual current Stage 43 data: no source claims are verified yet.
const liveAudit=auditCurrentRepository43();
assert.equal(liveAudit.productionReleaseAllowed,false);
const livePolicy=createReviewPreview443(liveAudit);
for(const entity of games) {
  const snapshot=livePolicy.forGame(entity);
  assert.equal(snapshot.checkedClaims,0);
  assert(snapshot.claimCount>0);
  assert.equal(snapshot.publicationApproved,false);
}
for(const entity of casinos) {
  const snapshot=livePolicy.forCasino(entity);
  assert.equal(snapshot.checkedClaims,0);
  assert(snapshot.claimCount>0);
  assert.equal(snapshot.publicationApproved,false);
}

// The full legacy review stays behind the Stage 43.2 full-page guard.
const gamePage=readFileSync("src/en/games/game.njk","utf8");
const casinoPage=readFileSync("src/en/casinos/casino.njk","utf8");
const component=readFileSync("src/_includes/components/review-preview/review-preview.njk","utf8");
const styles=readFileSync("src/assets/css/main.css","utf8");
for(const [page,entity] of [[gamePage,"game"],[casinoPage,"casino"]]){
  assert(page.includes("{% if editorialDisplay432."+entity+"("+entity+") %}"));
  assert(page.includes("editorialFields433."+entity+"Rows("+entity+")"));
  assert(page.includes("reviewPreview443.for"+(entity==="game"?"Game":"Casino")+"("+entity+")"));
  assert(page.includes('include "components/review-preview/review-preview.njk"'));
  assert(page.includes('Editorial verification pending.'));
  assert(page.indexOf('{% if editorialDisplay432.')<page.indexOf('{% else %}'));
}
assert(gamePage.includes('include "components/game-context/game-context.njk"'));
assert(gamePage.indexOf('include "components/game-context/game-context.njk"') > gamePage.lastIndexOf("{% endif %}"));
for(const marker of ["data-review-preview","data-review-status","data-review-facts",
  "data-review-checklist","data-review-process",'id="verified-details"',
  'id="review-checklist"','id="editorial-process"',
  'href="#verified-details"','href="#review-checklist"','href="#editorial-process"']) {
  assert(component.includes(marker),"Missing review UI marker: "+marker);
}
assert(!component.includes("game.globalFacts"));
assert(!component.includes("casino.rating"));
assert(!component.includes("casino.bonus"));
assert(!component.includes("game.facts."));
assert(!component.includes("commercial."));
assert(styles.includes('components/review-preview.css'));
const css=readFileSync("src/assets/css/components/review-preview.css","utf8");
assert(css.includes("@media (min-width: 960px)"));
assert(css.includes("@media (min-width: 600px)"));
assert(css.includes("minmax(0, 1fr)"));
assert(css.includes(":focus-visible"));
assert(css.includes("prefers-reduced-motion"));
assert(!/<script/i.test(component));
assert.equal(typeof verifyReviewPreview443,"function");
console.log("Stage 44.3 tests OK (claim status projections, safe preview components, layout and existing release gate).");
