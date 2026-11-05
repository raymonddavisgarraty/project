// Read-only status check of tracked sources currently loaded by Eleventy.
// Does NOT validate source authenticity, editorial approval or rights.
import games from "../src/_data/games.js";
import casinos from "../src/_data/casinos.js";
import { snapshotSourceRevisionG2, inspectSourceRevisionG2 } from "../src/lib/source-revision-g2.mjs";

const actual = [
  ...games.map(x=>({entityType:"game",entityId:x.id,slug:x.slug,authorId:x.author})),
  ...casinos.map(x=>({entityType:"casino",entityId:x.id,slug:x.slug,authorId:x.author})),
];
const records=[];
for(const e of actual) {
  const snapshot=snapshotSourceRevisionG2(e);
  const result=inspectSourceRevisionG2({manifest:snapshot});
  if(!result.ok || result.publicationApproved!==false || result.publicExportApproved!==false)
    throw new Error("Source revision bytes check failed for "+e.entityType+":"+e.entityId);
  records.push({type:e.entityType,id:e.entityId,sourceFilesChecked:result.checked,bytesMatch:true});
}
const output={schemaVersion:1,kind:"tracked-source-revision-check",ok:true,
  entitiesChecked:records.length,records,editorialApproved:false,
  publicationApproved:false,publicExportApproved:false,
  note:"Local tracked-file byte integrity ONLY; self-measured and not an independently approved release."};
console.log(JSON.stringify(output,null,2));
