import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import casinos from "../src/_data/casinos.js";
import games from "../src/_data/games.js";
import routes from "../src/_data/publishedRoutes.js";
import audit from "../src/lib/editorial-audit433.js";
import editorialFields from "../src/_data/editorialFields433.js";
import { buildCasinoCatalog442 } from "../src/lib/casino-catalog442.mjs";
import { buildProviderBlueprint442 } from "../src/lib/provider-blueprint442.mjs";

const catalog = buildCasinoCatalog442({casinos,editorialFields});
assert.deepEqual(catalog.types,[]);
assert.equal(catalog.withdrawalAvailable,false);
assert.equal(catalog.ratingSortAvailable,false);
const reviewed = buildCasinoCatalog442({
  casinos:[{slug:"one",type:"slots"},{slug:"two",type:"crypto"},
    {slug:"three",type:"made-up"}],
  editorialFields:{casinoRows:c=>c.slug==="one"
    ?[{field:"type",value:"slots",reviewStatus:"claim-verified"}]
    :c.slug==="two"?[{field:"type",value:"crypto",reviewStatus:"claim-verified"}]
    :[{field:"type",value:"made-up",reviewStatus:"claim-verified"}]},
});
assert.deepEqual(reviewed.types.map(x=>x.value),["crypto","slots"]);
assert.deepEqual(buildCasinoCatalog442({
  casinos:[{slug:"one",type:"slots"}],
  editorialFields:{casinoRows:()=>[{field:"type",value:"Slots",reviewStatus:"unverified"}]},
}).types,[]);
assert.throws(()=>buildCasinoCatalog442({casinos:{}}),/array/);

const providers = JSON.parse(readFileSync("src/content/registries/providers.json","utf8"));
const design = buildProviderBlueprint442({providers,games,publishedRoutes:routes,audit});
assert.equal(design.kind,"provider-design-inventory");
assert.equal(design.generatedRoutes.length,0);
assert.equal(design.autoPublish,false);
assert.equal(design.profiles.length,providers.length);
assert(design.profiles.every(p=>p.route===null && p.previewOnly===true &&
  p.localizedEditorialApproved===false && p.jurisdictionApproved===false &&
  p.productionReleaseAllowed===false && p.reviewedGameLinks.length===0));
const approvedAudit={
  schemaVersion:1,autoApprove:false,autoPublish:false,
  items:[{type:"game",id:"a",claims:[{field:"providerId",status:"verified",codes:[]}]}],
};
const sampleGame={id:"a",slug:"a",title:"Example Game",globalFacts:{id:"a",slug:"a",providerId:"example"}};
const sampleProvider={id:"example",name:"Example Studios",verified:true};
const sourceApproved=buildProviderBlueprint442({
  providers:[sampleProvider],games:[sampleGame],audit:approvedAudit,
  publishedRoutes:[{type:"game",entityId:"a",path:"/en/games/a/"}]
});
assert.equal(sourceApproved.profiles[0].reviewedGameLinks.length,1);
assert.equal(sourceApproved.profiles[0].reviewedGameLinks[0].url,"/en/games/a/");
assert.equal(sourceApproved.profiles[0].route,null);
assert.equal(sourceApproved.generatedRoutes.length,0);
assert.equal(buildProviderBlueprint442({providers:[sampleProvider],
  games:[sampleGame],audit:{...approvedAudit,autoPublish:true},
  publishedRoutes:[{type:"game",entityId:"a",path:"/en/games/a/"}]
}).profiles[0].reviewedGameLinks.length,0);
assert.equal(buildProviderBlueprint442({providers:[sampleProvider],
  games:[sampleGame],audit:approvedAudit,
  publishedRoutes:[{type:"game",entityId:"a",path:"/de/games/a/"}]
}).profiles[0].reviewedGameLinks.length,0);
assert.throws(()=>buildProviderBlueprint442({providers:[sampleProvider,sampleProvider]}),/duplicated/);
const prototype=readFileSync("prototypes/provider-profile-stage442.html","utf8");
assert(prototype.includes("DESIGN PROTOTYPE"));
assert(prototype.includes('name="robots" content="noindex,nofollow"'));
assert(!prototype.includes('href="/en/providers/'));
assert(!prototype.includes('rating="'));
assert(!prototype.includes("Get bonus"));

const core = readFileSync("src/assets/js/pages/catalog-search442.js","utf8");
const gameWrapper = readFileSync("src/assets/js/pages/games-search.js","utf8");
const casinoWrapper = readFileSync("src/assets/js/pages/casinos-search.js","utf8");
function createElement({dataset={},value="",disabled=false,options=[]}={}) {
  const events={};
  const classes=new Set();
  return {
    dataset,value,disabled,options,hidden:false,
    classList:{
      add:x=>classes.add(x),remove:x=>classes.delete(x),
      toggle:(x,b)=>b?classes.add(x):classes.delete(x),
      contains:x=>classes.has(x),
    },
    addEventListener:(name,fn)=>{events[name]=fn;},
    dispatch:(name,extras={})=>{assert(events[name],"Missing handler "+name);events[name](extras);},
    focus(){this.focused=true;},
    scrollIntoView(){this.scrolled=true;},
  };
}
function createFixture(kind,{search="",approvedType=false}={}){
  const isGame=kind==="game";
  const prefix=isGame?"games":"casinos";
  const random=isGame?createElement():null;
  const input=createElement();
  const sort=createElement({value:"title-asc",options:[{value:"title-asc"}]});
  const firstSelect=createElement({value:"",disabled:!approvedType,
    options:[{value:""},{value:isGame?"pragmatic play":"slots"}]});
  const secondSelect=createElement({value:"",disabled:true,options:[{value:""}]});
  const reset=createElement(),count=createElement(),empty=createElement();
  const cards=isGame?[
    createElement({dataset:{gameTitle:"Sweet Bonanza",gameProvider:"",gameVolatility:"",gameRating:"",gameRtp:""}}),
    createElement({dataset:{gameTitle:"The Big Dog House",gameProvider:"",gameVolatility:"",gameRating:"",gameRtp:""}}),
  ]:[
    createElement({dataset:{casinoTitle:"RoyalSpin Casino",casinoType:approvedType?"slots":"",casinoRating:""}}),
    createElement({dataset:{casinoTitle:"LuckyNova Casino",casinoType:"",casinoRating:""}}),
  ];
  const grid={ordered:[],appendChild(node){this.ordered.push(node);}};
  const controls=isGame?{
    "[data-games-search-input]":input,"[data-games-grid]":grid,
    "[data-games-count]":count,"[data-games-empty]":empty,
    "[data-reset-filters]":reset,"[data-sort-filter]":sort,
    "[data-random-game]":random,"[data-provider-filter]":firstSelect,
    "[data-volatility-filter]":secondSelect,
  }:{
    "[data-casinos-search-input]":input,"[data-casinos-grid]":grid,
    "[data-casinos-count]":count,"[data-casinos-empty]":empty,
    "[data-reset-casino-filters]":reset,"[data-casino-sort-filter]":sort,
    "[data-casino-type-filter]":firstSelect,"[data-casino-withdrawal-filter]":secondSelect,
  };
  const root={
    querySelector:selector=>controls[selector]||null,
    querySelectorAll:selector=>selector==="[data-"+(isGame?"game":"casino")+"-card]"?cards:[],
  };
  const browser={
    location:{pathname:"/en/"+prefix+"/",search},
    history:{replaceState(_state,_unused,next){this.last=next;browser.location.search=next.includes("?")?next.slice(next.indexOf("?")):"";}},
    matchMedia:()=>({matches:true}),
  };
  const sandbox={window:browser,document:{querySelector:s=>s==="[data-"+prefix+"-search]"?root:null},
    URLSearchParams,Math};
  runInNewContext(core,sandbox,{filename:"catalog-search442.js"});
  runInNewContext(isGame?gameWrapper:casinoWrapper,sandbox,{filename:prefix+"-search.js"});
  return {browser,input,sort,firstSelect,secondSelect,reset,count,empty,cards,random};
}
const c=createFixture("casino",{search:"?sort=rating-desc&type=slots&q=nova"});
assert.equal(c.sort.value,"title-asc","Unapproved rating sort must be ignored");
assert.equal(c.firstSelect.value,"","Disabled casino type must be ignored");
assert.equal(c.count.textContent,"1 casino found");
assert.equal(c.cards[0].hidden,true);
assert.equal(c.cards[1].hidden,false);
c.input.value="";
c.input.dispatch("input");
assert.equal(c.count.textContent,"2 casinos found");
assert.equal(c.browser.history.last,"/en/casinos/");
c.input.value="nonexistent";
c.input.dispatch("input");
assert.equal(c.count.textContent,"0 casinos found");
assert(c.empty.classList.contains("is-visible"));
c.reset.dispatch("click");
assert.equal(c.count.textContent,"2 casinos found");
assert.equal(c.input.value,"");
const cd=createFixture("casino",{approvedType:true});
cd.firstSelect.value="slots";cd.firstSelect.dispatch("change");
assert.equal(cd.count.textContent,"1 casino found");
assert(cd.browser.history.last.includes("type=slots"));
const g=createFixture("game",{search:"?sort=rtp-desc&q=sweet"});
assert.equal(g.count.textContent,"1 game found");
assert.equal(g.sort.value,"title-asc","Unapproved RTP sort must be ignored");
g.input.value="unknown";g.input.dispatch("input");
assert.equal(g.random.disabled,true,"Random option must not activate on empty search");
g.reset.dispatch("click");
assert.equal(g.count.textContent,"2 games found");
assert.equal(g.random.disabled,false);
g.random.dispatch("click");
assert.equal(g.cards.filter(x=>x.focused).length,1);

const gameCss=readFileSync("src/assets/css/pages/games-search.css","utf8");
const casinoCss=readFileSync("src/assets/css/pages/casinos-search.css","utf8");
for(const [prefix,css] of [["games",gameCss],["casinos",casinoCss]]){
  assert.match(css,new RegExp("\\."+prefix+"-search__actions\\s*\\{[\\s\\S]*?align-items:\\s*center;"));
  assert(!/align-items:\s*end\s*;/.test(css));
  assert(css.includes("min-width: 900px"));
  assert(css.includes("grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 1fr))"));
  assert(css.includes("[data-"+(prefix==="games"?"game":"casino")+"-card][hidden]"));
}
const casinoTemplate=readFileSync("src/en/casinos/index.njk","utf8");
assert(casinoTemplate.includes("casinoCatalog442.types"));
assert(casinoTemplate.includes("disabled aria-describedby="));
assert(casinoTemplate.includes('role="status" aria-live="polite"'));
assert(casinoTemplate.includes('data-casinos-count>{{ casinos.length }}'));
assert(casinoTemplate.includes('catalog-search442.js'));
const gameTemplate=readFileSync("src/en/games/index.njk","utf8");
assert(gameTemplate.includes('catalog-search442.js'));
console.log("Stage 44.2 tests OK (casino layout, shared search, safe query state, reviewed filters, offline provider blueprint).");
