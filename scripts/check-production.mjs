import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { resolveSiteUrl, resolveTelegramUrl } from "../src/lib/site-config.js";
import publication from "../src/_data/publication.js";

function getHtmlFiles(dir) {
  if (!existsSync(dir)) throw new Error("Missing build output: " + dir + ". Run npm run build first.");
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? getHtmlFiles(path) : path.endsWith(".html") ? [path] : [];
  });
}

export function checkProduction({ outDir = "_site", env = process.env } = {}) {
  const errors = [];
  let siteUrl;
  try { siteUrl = resolveSiteUrl({ ...env, NODE_ENV: "production" }); }
  catch (error) { errors.push(error.message); }
  if (env.TELEGRAM_URL && !resolveTelegramUrl(env)) errors.push("Invalid TELEGRAM_URL; use https://t.me/<channel>");
  const out = resolve(outDir);
  let files = [];
  try { files = getHtmlFiles(out); }
  catch (error) { errors.push(error.message); }
  if (files.length === 0) errors.push("No generated HTML pages found");
  for (const file of files) {
    const html = readFileSync(file, "utf8");
    const label = file.slice(out.length + 1);
    if (/https?:\/\/(?:www\.)?example\.(?:com|org|net)|t\.me\/yourchannel/i.test(html)) {
      errors.push(label + ": placeholder URL in output");
    }
    if (siteUrl && !html.includes('rel="canonical" href="' + siteUrl + '/')) {
      errors.push(label + ": canonical does not match SITE_URL " + siteUrl);
    }
    if (publication.globalCommercialApproved !== true && /rel="[^"]*\bsponsored\b/i.test(html)) {
      errors.push(label + ": unapproved sponsored link");
    }
    for (const match of html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)) {
      const href = match[1];
      if (!href.startsWith("/en/")) continue;
      const pathname = href.split(/[?#]/)[0];
      let candidate;
      try { candidate = decodeURIComponent(pathname); }
      catch { errors.push(label + ": invalid encoded href " + href); continue; }
      if (candidate.includes("..") || candidate.includes("\\")) {
        errors.push(label + ": unsafe internal href " + href); continue;
      }
      const outputFile = resolve(out, "." + candidate, "index.html");
      if (!outputFile.startsWith(out + "/") || !existsSync(outputFile)) {
        errors.push(label + ": broken internal link " + href);
      }
    }
  }
  return { ok: errors.length === 0, pages: files.length, errors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = checkProduction();
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}
