// Explicitly invoked, private HTML export. Does NOT affect Eleventy or the live site.
import {mkdirSync,writeFileSync} from "node:fs";
import {join,resolve,basename} from "node:path";
import {pathToFileURL} from "node:url";
import {auditCurrentRepository43} from "./editorial43.mjs";
import {createQueue431} from "./run-stage431.mjs";
import {renderEditorialWorkbench444} from "../src/lib/editorial-workbench444.mjs";

const PRIVATE_ROOT = resolve("data/editorial/reports/stage431"); // already gitignored
export function generateEditorialWorkbench444({audit=auditCurrentRepository43(),queue=createQueue431({audit})}={}) {
  return renderEditorialWorkbench444({audit,queue});
}
export function writeEditorialWorkbench444({html,filename,root=PRIVATE_ROOT}={}) {
  if(typeof html!=="string" || !html.startsWith("<!doctype html>"))throw new Error("Invalid report HTML");
  if(typeof filename!=="string" || basename(filename)!==filename ||
      !/^editorial-workbench-[0-9]{8}-[0-9]{6}\.html$/.test(filename))
    throw new Error("Invalid report filename");
  const dest=resolve(root);
  if(root===PRIVATE_ROOT && dest!==PRIVATE_ROOT)throw new Error("Invalid private report directory");
  mkdirSync(dest,{recursive:true});
  const file=join(dest,filename);
  writeFileSync(file,html,{encoding:"utf8",flag:"wx"}); // refuse overwrite
  return file;
}
export function defaultReportFilename444(date=new Date()){
  if(!(date instanceof Date)||!Number.isFinite(date.getTime())) throw new Error("Invalid date");
  const iso=date.toISOString();
  return "editorial-workbench-"+iso.slice(0,10).replace(/-/g,"")+"-"+iso.slice(11,19).replace(/:/g,"")+".html";
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  if(process.argv.length>2){console.error("Usage: node scripts/editorial-workbench444.mjs");process.exitCode=2;}
  else {
    try {
      const audit=auditCurrentRepository43(),queue=createQueue431({audit});
      const file=writeEditorialWorkbench444({html:generateEditorialWorkbench444({audit,queue}),filename:defaultReportFilename444()});
      console.log(JSON.stringify({ok:true,report:file,entities:audit.items.length,tasks:queue.tasks.length,
        productionReleaseAllowed:audit.productionReleaseAllowed,autoApprove:false,autoPublish:false},null,2));
    }catch(err){console.error("Offline editorial report not created:",err.message);process.exitCode=1;}
  }
}
