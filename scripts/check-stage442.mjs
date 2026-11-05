import {existsSync,readFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {pathToFileURL} from "node:url";
import games from "../src/_data/games.js";
import casinos from "../src/_data/casinos.js";
import casinoCatalog442 from "../src/_data/casinoCatalog442.js";
import {buildProviderBlueprint442} from "../src/lib/provider-blueprint442.mjs";
import routes from "../src/_data/publishedRoutes.js";
import audit from "../src/lib/editorial-audit433.js";

export function verifyStage442({outDir="_site"}={}) {
  const out=resolve(outDir),errors=[];
  const page=path=>{
    const file=join(out,path);
    if(!existsSync(file)){errors.push("Missing build output: "+path);return "";}
    return readFileSync(file,"utf8");
  };
  for(const [category,items] of [["games",games],["casinos",casinos]]) {
    const html=page("en/"+category+"/index.html");
    const expected=items.length+" "+(items.length===1?category.slice(0,-1):category)+" found";
    const countMatch=html.match(new RegExp('<p[^>]*data-'+category+'-count[^>]*>([\\s\\S]*?)<\\/p>','i'));
    if(!countMatch || countMatch[1].trim()!==expected)
      errors.push(category+": missing/wrong SSR result count");
    if(!countMatch || !/role="status"/.test(countMatch[0]) ||
       !/aria-live="polite"/.test(countMatch[0]))
      errors.push(category+": count must be a polite live status");
    const shared=html.indexOf('src="/assets/js/pages/catalog-search442.js"');
    const wrapper=html.indexOf('src="/assets/js/pages/'+category+'-search.js"');
    if(shared<0 || wrapper<shared)
      errors.push(category+": shared controller must load before its wrapper");
    if(!html.includes('id="'+category+'-results"'))
      errors.push(category+": catalogue results need a stable accessible ID");
  }
  const casinoHtml=page("en/casinos/index.html");
  const select=(id)=>casinoHtml.match(new RegExp('<select\\b[^>]*\\bid="'+id+'"[^>]*>','i'))?.[0]||"";
  if(!casinoCatalog442.types.length && !/\bdisabled\b/.test(select("casino-type-filter")))
    errors.push("Unverified casino type filter must be disabled");
  if(!/\bdisabled\b/.test(select("casino-withdrawal-filter")))
    errors.push("Unverified withdrawal filtering must be disabled");
  if(/data-casino-rating=["'][1-5](?:\.\d+)?["']/i.test(casinoHtml) && !audit.productionReleaseAllowed)
    errors.push("Numerical casino rating leaked into provisional catalogue");
  const providerNames=JSON.parse(readFileSync("src/content/registries/providers.json","utf8"));
  const blueprint=buildProviderBlueprint442({
    providers:providerNames,games,publishedRoutes:routes,audit,
  });
  if(blueprint.generatedRoutes.length||blueprint.profiles.some(p=>p.route!==null||
    p.productionReleaseAllowed))
    errors.push("Provider blueprint created a release-ready route");
  if(existsSync(join(out,"en/providers/index.html")))
    errors.push("Unapproved provider directory was generated");
  return {ok:errors.length===0,checkedCatalogues:2,providersPlanned:blueprint.profiles.length,errors};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  const report=verifyStage442();
  console.log(JSON.stringify(report,null,2));
  if(!report.ok)process.exitCode=1;
}
