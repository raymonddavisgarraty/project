import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { auditSeo42 } from "./seo42.mjs";
import site from "../src/_data/site.js";
import routes from "../src/_data/publishedRoutes.js";
import indexability42 from "../src/_data/indexability42.js";
import buildMode from "../src/_data/buildMode.js";

export function run() {
  return auditSeo42({
    outDir: "_site", siteUrl: site.url, routes,
    indexableRoutes: indexability42.routes, production: buildMode.production,
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = run();
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}
