// Read-only: inspect future consumer contract without writing or serving JSON.
import indexability from "../src/_data/indexability42.js";
import games from "../src/_data/games.js";
import casinos from "../src/_data/casinos.js";
import states from "../src/content/publication-state.en.json" with {type:"json"};
import {previewPublishedCatalogueV1} from "../src/lib/published-catalogue-v1-preview.mjs";
const result=previewPublishedCatalogueV1({
  indexability,games,casinos,states:states.items,generatedAt:new Date().toISOString().slice(0,19)+"Z",
});
const total=Object.values(result.entities).reduce((sum,items)=>sum+items.length,0);
const info={schemaVersion:1,contractVersion:result.contractVersion,kind:result.kind,
  ok:result.ok,previewOnly:result.previewOnly,approvedRoutes:indexability.approvedRouteCount,
  catalogueCandidates:total,publicExportApproved:result.publicExportApproved,
  publicationApproved:result.publicationApproved,errors:result.errors};
console.log(JSON.stringify(info,null,2));
if(!result.ok||total!==0||result.publicExportApproved!==false)process.exitCode=1;
