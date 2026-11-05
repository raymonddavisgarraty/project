import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import copy from "../src/content/locales/en/games/sweet-bonanza.js";
import { auditCurrentRepository43 } from "./editorial43.mjs";
import { previewContentWorkflowV1 } from "../src/lib/content-workflow-v1.mjs";
import games from "../src/_data/games.js";
import casinos from "../src/_data/casinos.js";
import routes from "../src/_data/publishedRoutes.js";

const source=readFileSync("src/content/locales/en/games/sweet-bonanza.js","utf8");
const states=JSON.parse(readFileSync("src/content/publication-state.en.json","utf8"));
assert.equal(copy.slug,"sweet-bonanza");
assert.equal(states.items.find(x=>x.type==="game"&&x.id==="sweet-bonanza").status,"review");
const publicText=JSON.stringify({seo:copy.seo,hero:copy.hero,sections:copy.sections,faq:copy.faq});
for(const literal of ["96.48","96.51","21,100","21,175","high volatility","4.7 / 5"])
  assert(!publicText.toLowerCase().includes(literal.toLowerCase()),"Unapproved numeric/public claim: "+literal);
assert.equal(copy.editorialSourceLeads.length,2);
assert(copy.editorialSourceLeads.every(x=>x.startsWith("https://www.pragmaticplay.com/en/")));
assert.equal(source.includes('sourceStatus: "editorially-verified"'),false);
const audit=auditCurrentRepository43();
assert.equal(audit.productionReleaseAllowed,false);
const workflow=previewContentWorkflowV1({games,casinos,states:states.items,routes,audit,
  measuredRevisionHashes:{},globalInformationApproved:false});
assert.deepEqual(workflow.counts,{draft:3,review:1,published:0,archived:0});
assert.equal(workflow.entities.games.length,0);
assert.equal(workflow.publicExportApproved,false);
assert.equal(workflow.indexabilityApproved,false);
console.log("Sweet Bonanza editorial copy QA OK (original informational prose, no numeric approvals, no public release).");
