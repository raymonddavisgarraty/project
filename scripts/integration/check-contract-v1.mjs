// Read-only package inspection. No imported data is written to src or data.
import {readFileSync,statSync} from "node:fs";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {validateStudioCandidateV1,toStage33PreviewV1} from "./contract-v1.mjs";
import {qualityReport} from "../importer/quality33.mjs";
import {loadRegistries,propose36} from "../importer/registry36.mjs";

export async function inspectCandidateV1({file="tests/fixtures/integration/studio-game-candidate.pending.v1.json"}={}) {
  const path=resolve(file);
  if(statSync(path).size>262144)throw new Error("Package exceeds 256 KB limit");
  const pkg=JSON.parse(readFileSync(path,"utf8"));
  const review=validateStudioCandidateV1(pkg);
  if(!review.valid)return {schemaVersion:1,ok:false,errors:review.errors,autoPublish:false};
  const draft=toStage33PreviewV1(pkg);
  const quality=qualityReport(draft);
  const normalization=propose36(draft,await loadRegistries());
  return {
    schemaVersion:1,ok:true,contractVersion:pkg.contractVersion,packageId:pkg.packageId,
    entityId:pkg.entityId,locale:pkg.locale,sampleOnly:pkg.sampleOnly,
    status:"validated-proposal-only",
    qualityStatus:quality.status,qualityIssues:quality.issues,
    providerResolution:normalization.provider.status,
    normalizationIssues:normalization.issues,
    sourceSnapshotCount:pkg.sourceSnapshots.length,
    claimCount:pkg.claims.length,relatedCandidateCount:pkg.relatedEntityCandidates.length,
    stage34DirectImportCompatible:false,
    stage38PublishingInvoked:false,
    editorApproved:false,publicationApproved:false,autoPublish:false,
    nextAction:"Design independent Stage 34 source adapter and human-review mapping; do not publish",
  };
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try {
    const path=process.argv[2]??"tests/fixtures/integration/studio-game-candidate.pending.v1.json";
    const result=await inspectCandidateV1({file:path});
    console.log(JSON.stringify(result,null,2));
    if(!result.ok)process.exitCode=1;
  }catch(error){
    console.error("Offline contract validation:",error.message);
    process.exitCode=1;
  }
}
