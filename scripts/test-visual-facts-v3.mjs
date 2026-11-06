import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import gameEntries from "../src/_data/games.js";
import registry from "../src/content/publication-state.en.json" with {type:"json"};
import {buildLocalGameDraftPreviewV1} from "../src/lib/local-game-draft-preview-v1.mjs";
import * as visualFacts from "../src/_data/visualFactsV3.js";
import fields from "../src/_data/editorialFields433.js";
import display from "../src/_data/editorialDisplay432.js";
const text=p=>readFileSync(p,"utf8");

// Field-level approved rows only; no new ratings or unreviewed values.
const verified=[
  {field:"providerName",value:"Pragmatic Play",reviewStatus:"claim-verified"},
  {field:"reels",value:"6",reviewStatus:"claim-verified"},
  {field:"rtp",value:"96.48%",reviewStatus:"pending"},
  {field:"maxWinMultiplier",value:"21,100×",reviewStatus:"unverified"},
  {field:"affiliateId",value:"hidden",reviewStatus:"claim-verified"},
];
assert.deepEqual(visualFacts.game(verified).map(x=>x.label),["Game provider","Reels"]);
assert.equal(visualFacts.game(verified).length,2);
assert.equal(visualFacts.casino([{field:"license",value:"Example licence",reviewStatus:"claim-verified"}]).length,1);
assert.deepEqual(visualFacts.game([{field:"rtp",value:"<script>",reviewStatus:"claim-verified"}]),[]);
assert.deepEqual(visualFacts.game([{field:"unknown",value:"x",reviewStatus:"claim-verified"}]),[]);
const sb=gameEntries.find(e=>e.id==="sweet-bonanza");
assert(sb);
assert.deepEqual(fields.gameRows(sb),[],"Legacy source facts must remain withheld");
assert.equal(display.game(sb),false,"Full game review gate must not be weakened");
const pilot=buildLocalGameDraftPreviewV1({game:sb,registry,enabled:true,production:false});
assert(pilot,"Opt-in editorial pilot must be available for review");
assert.equal(pilot.glance.length,6,"Six prototype fact cards required");
assert(pilot.tags.length>=4,"Topic chips required");
assert(pilot.featureCards.length>=3,"Icon-led feature cards required");
assert(pilot.glance.every(x=>x.label&&x.value&&x.symbol));
assert(pilot.featureCards.every(x=>x.symbol&&x.title&&x.description));
assert(!JSON.stringify(pilot.glance).includes("96.48"));
assert(!JSON.stringify(pilot.featureCards).includes("Sweet Loot"));
assert.equal(pilot.publicationApproved,false);
assert.equal(pilot.publicExportApproved,false);
assert.equal(pilot.indexabilityApproved,false);
assert.equal(buildLocalGameDraftPreviewV1({game:sb,registry,enabled:false,production:false}),null);
assert.equal(buildLocalGameDraftPreviewV1({game:sb,registry,enabled:true,production:true}),null);
const malformed={...sb,featureTags:[{label:"<script>",symbol:"✨"}]};
assert.equal(buildLocalGameDraftPreviewV1({game:malformed,registry,enabled:true,production:false}),null);
const polluted={...sb,previewFacts:[...sb.previewFacts,{symbol:"💰",label:"Bonus",value:"$100",note:"unapproved",affiliateUrl:"https://bad.test"}]};
assert.equal(buildLocalGameDraftPreviewV1({game:polluted,registry,enabled:true,production:false}),null);
const card=text("src/_includes/components/quick-facts/quick-facts.njk");
assert(card.includes('class="quick-facts__note"'));
assert(card.includes('class="quick-facts__symbol"'));
assert(card.includes("{{ item.value }}"));
const style=text("src/assets/css/components/quick-facts.css");
assert(style.includes("repeat(6,minmax(0,1fr))"));
const pill=text("src/_includes/components/pill-list/pill-list.njk");
assert(pill.includes("item.label"));
assert(pill.includes("item.symbol"));
const feature=text("src/_includes/components/feature-cards/feature-cards.njk");
assert(feature.includes("{{ feature.description }}"));
const local=text("src/_includes/components/local-editorial-pilot/local-editorial-pilot.njk");
assert(local.includes('include "components/quick-facts/quick-facts.njk"'));
assert(local.includes('include "components/feature-cards/feature-cards.njk"'));
assert(local.includes('include "components/pill-list/pill-list.njk"'));
const full=text("src/en/games/game.njk");
assert(full.includes("visualFactsV3.game(editorialFields433.gameRows(game))"));
const casinos=text("src/en/casinos/casino.njk");
assert(casinos.includes("visualFactsV3.casino(editorialFields433.casinoRows(casino))"));
assert(!casinos.includes('label: "Rating", value: casino.rating + " / 5", icon: "star"'));
console.log("Visual Facts v3 tests OK (six fact cards, thematic tags, mechanisms, guarded game and casino facts).");
