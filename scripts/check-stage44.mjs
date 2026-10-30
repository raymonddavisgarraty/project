import { existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import games from "../src/_data/games.js";
import navigation from "../src/_data/gameNavigation44.js";
import casinos from "../src/_data/casinos.js";
import catalogue from "../src/_data/gameCatalog44.js";


function inspectBreadcrumb(html, entityId, expectedTitle, errors) {
  const breadcrumb = html.match(/<nav\b[^>]*aria-label=["']Breadcrumb["'][^>]*>([\s\S]*?)<\/nav>/i);
  if (!breadcrumb) {
    errors.push(entityId + ": missing breadcrumb");
    return;
  }
  const current = breadcrumb[1].match(/<span\b[^>]*aria-current=["']page["'][^>]*>([\s\S]*?)<\/span>/i);
  if (!current) {
    errors.push(entityId + ": missing current-page breadcrumb");
    return;
  }
  const title = current[1].replace(/<[^>]*>/g, "").trim()
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&#x27;/gi, "'");
  if (title !== expectedTitle) {
    errors.push(entityId + ": breadcrumb mismatch (got " + title +
      ", expected " + expectedTitle + ")");
  }
}

export function verifyNavigation44({outDir="_site"}={}) {
  const out=resolve(outDir),errors=[];
  const read=(pathname)=>{
    const filename=join(out,pathname);
    if(!existsSync(filename)){errors.push("Missing output: "+filename);return "";}
    return readFileSync(filename,"utf8");
  };
  const catalogHtml=read("en/games/index.html");
  if(!catalogue.providers.length && !/<select\b[^>]*\bid="provider-filter"[^>]*\bdisabled\b[^>]*>/i.test(catalogHtml))
    errors.push("Empty provider facet should be disabled");
  if(!catalogue.volatilities.length && !/<select\b[^>]*\bid="volatility-filter"[^>]*\bdisabled\b[^>]*>/i.test(catalogHtml))
    errors.push("Empty volatility facet should be disabled");
  for(const game of games){
    const links=navigation.forGame(game);
    const html=read("en/games/"+game.slug+"/index.html");
    inspectBreadcrumb(html, game.id, game.title, errors);
    const hasLinks=links.curated.length+links.fromProvider.length>0;
    if(hasLinks && !html.includes("data-game-context"))
      errors.push(game.id+": missing contextual game navigation component");
    if(!hasLinks && html.includes("data-game-context"))
      errors.push(game.id+": unnecessary empty contextual navigation");
    if(links.curated.length && !html.includes('data-game-context-curated'))
      errors.push(game.id+": missing neutral navigation list");
    if(!links.fromProvider.length && html.includes("data-game-context-provider"))
      errors.push(game.id+": unverified provider relationship displayed");
    if(links.fromProvider.length && !html.includes("data-game-context-provider"))
      errors.push(game.id+": reviewed provider navigation missing");
    const targets=[...links.curated,...links.fromProvider];
    const seen=new Set();
    for(const target of targets){
      if(seen.has(target.id))errors.push(game.id+": duplicate link to "+target.id);
      seen.add(target.id);
      if(target.id===game.id)errors.push(game.id+": self-link");
      if(!html.includes('href="'+target.url+'"'))
        errors.push(game.id+": missing crawlable anchor to "+target.url);
      if(!/^\/en\/games\/[a-z0-9-]+\/$/.test(target.url))
        errors.push(game.id+": invalid canonical navigation route");
    }
    if(html.includes('href="/en/providers/'))
      errors.push(game.id+": link to unpublished provider profile");
  }
  for (const casino of casinos) {
    const html=read("en/casinos/"+casino.slug+"/index.html");
    inspectBreadcrumb(html, casino.slug, casino.title, errors);
  }
  return {ok:errors.length===0,gamesChecked:games.length,casinosChecked:casinos.length,errors};
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const result=verifyNavigation44();
  console.log(JSON.stringify(result,null,2));
  if(!result.ok)process.exitCode=1;
}
