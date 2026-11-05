// Internal identity audit only. No public route or data feed is written.
import {pathToFileURL} from "node:url";
import {resolve} from "node:path";
import games from "../src/_data/games.js";
import casinos from "../src/_data/casinos.js";
import routes from "../src/_data/publishedRoutes.js";
import audit from "../src/lib/editorial-audit433.js";
import {readFileSync} from "node:fs";
import {inspectEntityGraph423} from "../src/lib/entity-graph423.mjs";

export function checkEntities423(){
  const providers=JSON.parse(readFileSync("src/content/registries/providers.json","utf8"));
  const graph=inspectEntityGraph423({games,casinos,providers,generatedRoutes:routes});
  const errors=[...graph.errors];
  if(audit.productionReleaseAllowed!==false)
    errors.push("Stage 42.3 integration expects pending editorial publication by default");
  if(graph.publicExportApproved!==false || graph.publicationApproved!==false)
    errors.push("Internal identity audit cannot grant a public release");
  return {
    schemaVersion:1,ok:errors.length===0,
    gamesChecked:graph.counts.games,casinosChecked:graph.counts.casinos,
    providersChecked:graph.counts.providers,
    identityRelations:graph.counts.identityRelations,
    publicExportApproved:false,errors,notes:graph.notes,
  };
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const result=checkEntities423();
  console.log(JSON.stringify(result,null,2));
  if(!result.ok)process.exitCode=1;
}
