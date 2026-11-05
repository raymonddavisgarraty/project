// Stage 41.2 / v1.0 boundary regression, NOT a production release approval.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolveSiteUrl,resolveTelegramUrl} from "../src/lib/site-config.js";
import {resolveCommercialOffer,safeExternalUrl} from "../src/lib/commercial-policy.js";
import publication from "../src/_data/publication.js";
import partners from "../src/_data/partners.js";
import markets from "../src/_data/markets.js";

const errors=[];
function test(label,fn){try{fn()}catch(e){errors.push(label+": "+e.message)}}
test("Site origin fails closed",()=>{
  assert.throws(()=>resolveSiteUrl({NODE_ENV:"production"}),/SITE_URL/);
  for(const url of ["https://example.com","http://localhost:8080","http://reviews.public.com","https://example.invalid"]){
    assert.throws(()=>resolveSiteUrl({NODE_ENV:"production",SITE_URL:url}));
  }
  assert.equal(resolveSiteUrl({SITE_URL:"https://reviews.public-website.org"}),"https://reviews.public-website.org");
});
test("Social optional and validated",()=>{
  assert.equal(resolveTelegramUrl({}),null);
  assert.equal(resolveTelegramUrl({TELEGRAM_URL:"https://t.me/yourchannel"}),null);
  assert.equal(resolveTelegramUrl({TELEGRAM_URL:"https://t.me/valid_channel"}),"https://t.me/valid_channel");
});
test("Current default commercial policy must deny",()=>{
  assert.equal(publication.globalCommercialApproved,false);
  assert.equal(publication.globalDemoApproved,false);
  assert(Object.values(markets).length>0);
  assert(Object.values(markets).every(m=>m.publicationStatus==="pending-legal-review" &&
    m.commercialStatus==="pending-legal-review"));
  assert(partners.every(p=>p.status!=="approved"&&p.globalRightsApproved!==true));
});
test("Legacy affiliate identifier never becomes a CTA",()=>{
  assert.equal(resolveCommercialOffer({entity:{affiliateId:partners[0]?.id},partners,markets,policy:publication}),null);
  assert.equal(safeExternalUrl("https://example.com/bonus"),null);
  assert.equal(safeExternalUrl("javascript:alert(1)"),null);
});
test("All render surfaces use central gate",()=>{
  for(const [file,re] of [
    ["src/_includes/components/cta-panel/cta-panel.njk",/commercial\.for(?:Game|Casino)/],
    ["src/_includes/components/game-hero/game-hero.njk",/commercial\.forGame\(game\)/],
    ["src/_includes/components/casino-hero/casino-hero.njk",/commercial\.forCasino\(casino\)/],
    ["src/_includes/components/casino-card/casino-card.njk",/commercial\.forCasino\(casino\)/],
  ]) {
    const source=readFileSync(file,"utf8");
    assert.match(source,re,file);
    assert.doesNotMatch(source,/partner\.(url|bonusUrl|demoUrl)/,file);
  }
});
test("Publication safety pipeline remains present",()=>{
  assert.match(readFileSync("scripts/editorial43.mjs","utf8"),/assertProductionEditorial43/);
  assert.match(readFileSync("src/lib/editorial43.mjs","utf8"),/productionReleaseAllowed/);
  assert.match(readFileSync("scripts/importer/publish38.mjs","utf8"),/createHash|sha256/i);
});

const result={
 schemaVersion:1,kind:"v1-stage412-boundary-check",
 status:errors.length?"failed":"passed",
 productionReleaseApproved:false,
 checksPerformed:6,errors,
 note:"A passing boundary test does NOT authorize publishing, market permissions or Stage 46 implementation."
};
console.log(JSON.stringify(result,null,2));
if(errors.length)process.exitCode=1;
