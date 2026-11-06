import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildLocalGameDraftPreviewV1} from "../src/lib/local-game-draft-preview-v1.mjs";
import games from "../src/_data/games.js";
import casino from "../src/_data/casinos.js";

const registry=JSON.parse(readFileSync("src/content/publication-state.en.json","utf8"));
const game=games.find(g=>g.id==="sweet-bonanza");
assert(game,"Sweet Bonanza missing");
const draft=buildLocalGameDraftPreviewV1({game,registry,enabled:true,production:false});
assert(draft,"Expected opt-in local draft");
assert.equal(draft.unverified,true);
assert.equal(draft.heading,game.seo.h1);
assert(draft.sections.length>=3,"Review sections missing");
assert.equal(draft.glance.length,6);
assert(draft.specifications.length>draft.glance.length);
assert(draft.specifications.every(r=>r.label&&r.value&&r.note));
assert(draft.questions.length>=3,"FAQ missing");
assert(draft.researchLinks.length>=1);
for(const k of ["publicationApproved","indexabilityApproved","publicExportApproved"])
  assert.equal(draft[k],false,k);
for(const forbidden of ["affiliateId","monetization","bonusUrl","rating","globalFacts","96.48","21100",
    "legacy-unverified","review-team"]){
  assert(!JSON.stringify(draft).includes(forbidden),"Unapproved internal field leaked: "+forbidden);
}
const args={game,registry,enabled:true,production:false};
assert.equal(buildLocalGameDraftPreviewV1({...args,enabled:false}),null);
assert.equal(buildLocalGameDraftPreviewV1({...args,production:true}),null);
assert.equal(buildLocalGameDraftPreviewV1({...args,registry:{...registry,locale:"de"}}),null);
assert.equal(buildLocalGameDraftPreviewV1({...args,registry:{...registry,items:registry.items.map(x=>x.id==="sweet-bonanza"?{...x,status:"published"}:x)}}),null);
assert.equal(buildLocalGameDraftPreviewV1({...args,registry:{...registry,items:registry.items.filter(x=>x.id!=="sweet-bonanza")}}),null);
assert.equal(buildLocalGameDraftPreviewV1({...args,registry:{...registry,items:[...registry.items,registry.items[0]]}}),null);
assert.equal(buildLocalGameDraftPreviewV1({...args,game:{...game,id:"other-game"}}),null);
assert.equal(buildLocalGameDraftPreviewV1({...args,game:{...game,faq:[{question:"<script>",answer:"test"}]}}),null);
assert.equal(buildLocalGameDraftPreviewV1({...args,game:{...game,editorialSourceLeads:["javascript:alert(1)"]}}),null);
assert.equal(buildLocalGameDraftPreviewV1({...args,game:casino[0]}),null);
const source=readFileSync("src/en/games/game.njk","utf8");
const marker='include "components/local-editorial-pilot/local-editorial-pilot.njk"';
assert(source.includes(marker),"Missing opt-in draft include");
const fallbackPos=source.indexOf('{# Page-specific identity is safe;');
const markerPos=source.indexOf(marker);
const navigationPos=source.indexOf('{# Shared contextual navigation');
assert(fallbackPos>=0 && markerPos>fallbackPos && navigationPos>markerPos,
  "Draft must stay inside the blocked review-preview branch");
assert(source.includes('{% if pilotDraft %}'),"Explicit local preview conditional is missing");
assert(source.includes('include "components/review-preview/review-preview.njk"'),
  "Normal safe review-preview fallback must remain");
const markup=readFileSync("src/_includes/components/local-editorial-pilot/local-editorial-pilot.njk","utf8");
assert(markup.includes("UNVERIFIED DRAFT"));
assert(markup.includes("data-local-editorial-draft"));
assert(!markup.includes("game.rating"));
assert(!markup.includes("game.monetization"));
const adapter=readFileSync("src/_data/localEditorialPilot.js","utf8");
assert(adapter.includes('process.env.EDITORIAL_PREVIEW==="1"'));
assert(adapter.includes('production:buildMode.production'));
console.log("Local editorial draft preview QA OK (explicit opt-in, review-only, no publication or private fields).");
