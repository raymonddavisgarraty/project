import { existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import games from "../src/_data/games.js";
import casinos from "../src/_data/casinos.js";
import display from "../src/_data/editorialDisplay432.js";
import reviewed from "../src/_data/editorialFields433.js";
import previews from "../src/_data/reviewPreview443.js";

// Verify actual generated HTML, including links, landmarks and counts.
// Stage 43.2's separate check:display still audits any leaked raw claims.
export function verifyReviewPreview443({outDir="_site"}={}) {
  const root=resolve(outDir);
  const errors=[];
  let previewPages=0;
  for(const [type,records] of [["game",games],["casino",casinos]]){
    for(const record of records){
      const id=record.slug;
      const htmlFile=join(root,"en",type==="game"?"games":"casinos",id,"index.html");
      if(!existsSync(htmlFile)){errors.push("Missing "+type+" page: "+id);continue;}
      const html=readFileSync(htmlFile,"utf8");
      const fullApproved=type==="game"?display.game(record):display.casino(record);
      const preview=type==="game"?previews.forGame(record):previews.forCasino(record);
      const rows=type==="game"?reviewed.gameRows(record):reviewed.casinoRows(record);
      if(fullApproved){
        if(html.includes('data-review-preview="'+type+'"'))
          errors.push(id+": full-approved page incorrectly rendered preview");
        continue;
      }
      previewPages++;
      if(!html.includes('data-review-preview="'+type+'"'))
        errors.push(id+": review preview component not rendered");
      const headings=[...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
      if(headings.length!==1)errors.push(id+": expected exactly one H1");
      const label=type==="game"?record.hero.title:record.title;
      const renderedTitle=headings.length?headings[0][1].replace(/<[^>]*>/g,"").trim()
        .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
        .replace(/&quot;/g,'"').replace(/&#39;|&#x27;/gi,"'"):"";
      if(!headings.length||renderedTitle!==label)
        errors.push(id+": incorrect H1 for paginated record");
      for(const anchor of ["verified-details","review-checklist","editorial-process"]){
        if(!html.includes('id="'+anchor+'"'))errors.push(id+": missing section "+anchor);
        if(!html.includes('href="#'+anchor+'"'))errors.push(id+": missing section link "+anchor);
      }
      for(const piece of ['data-review-status','data-review-facts','data-review-checklist',
        'data-review-process','Verification in progress','Editorial verification pending.']){
        if(!html.includes(piece))errors.push(id+": missing preview element "+piece);
      }
      const summary = preview.checkedClaims+" / "+preview.claimCount;
      if(!html.includes("<dd>"+summary+"</dd>"))
        errors.push(id+": review status count mismatch");
      const cards = (html.match(/class="review-preview__check-card"/g)||[]).length;
      if(cards!==preview.sections.length)errors.push(id+": checklist category count mismatch");
      if(!rows.length && !html.includes("data-review-facts-empty"))
        errors.push(id+": missing empty source-checked facts state");
      if(rows.length && html.includes("data-review-facts-empty"))
        errors.push(id+": approved individual facts were replaced by empty state");
      const catalogue=type==="game"?"/en/games/":"/en/casinos/";
      if(!html.includes('href="'+catalogue+'"'))
        errors.push(id+": missing real catalogue link");
      if(html.includes('href="/en/providers/'))
        errors.push(id+": unpublished provider profile link");
      if(html.includes('href="#nonexistent"'))
        errors.push(id+": broken UI anchor");
    }
  }
  return {ok:errors.length===0,previewPages,checkedEntities:games.length+casinos.length,errors};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const result=verifyReviewPreview443();
  console.log(JSON.stringify(result,null,2));
  if(!result.ok)process.exitCode=1;
}
