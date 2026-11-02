// Stage 43.4: read-only source reconciliation; no publication writes.
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {assessEvidencePilot434} from "../src/lib/evidence-pilot434.mjs";

export function checkEvidencePilot434({
 dossier=JSON.parse(readFileSync("research/evidence-pilots/sweet-bonanza-original-434.json","utf8")),
 facts=JSON.parse(readFileSync("src/content/games/sweet-bonanza.json","utf8")),
 provenance=JSON.parse(readFileSync("src/content/provenance/games/sweet-bonanza.json","utf8")),
 now=new Date().toISOString().slice(0,10),
}={}){
  return assessEvidencePilot434({dossier,facts,provenance,now});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const result=checkEvidencePilot434();
  console.log(JSON.stringify(result,null,2));
  if(!result.ok)process.exitCode=1;
}
