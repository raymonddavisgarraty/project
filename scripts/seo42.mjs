import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, relative, sep, isAbsolute } from "node:path";

const read = p => readFileSync(p, "utf8");
const tags = (html, name) => [...html.matchAll(new RegExp("<" + name + "\\b[^>]*>", "gi"))].map(m => m[0]);
const attr = (tag, key) => {
  const m = tag.match(new RegExp("\\b" + key + "\\s*=\\s*(['\"])(.*?)\\1", "i"));
  return m ? m[2] : null;
};
const findTag = (html, type, key, value) =>
  tags(html, type).find(t => attr(t, key) === value) || "";
function htmlFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap(name => {
    const f = join(dir, name);
    return statSync(f).isDirectory() ? htmlFiles(f) : name.endsWith(".html") ? [f] : [];
  });
}
function outputPath(root, pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  if (!decoded.startsWith("/") || decoded.includes("\\") || decoded.split("/").includes("..")) return null;
  const full = decoded.endsWith("/") ? join(root, decoded.slice(1), "index.html") : join(root, decoded.slice(1));
  const rel = relative(root, full);
  return rel === ".." || rel.startsWith(".." + sep) || isAbsolute(rel) ? null : full;
}
function anchorFound(html, hash) {
  let id;
  try { id = decodeURIComponent(hash.slice(1)); } catch { return false; }
  return !id || [...html.matchAll(/\bid\s*=\s*(['"])(.*?)\1/gi)].some(m => m[2] === id);
}

export function auditSeo42({ outDir = "_site", siteUrl, routes = [], production = false } = {}) {
  const errors = [], warnings = [];
  let origin;
  try {
    origin = new URL(siteUrl);
    if (!["http:", "https:"].includes(origin.protocol) || origin.pathname !== "/" || origin.search || origin.hash)
      throw new Error("origin");
  } catch { return { ok: false, pages: 0, errors: ["Invalid site URL"], warnings }; }
  if (production && origin.protocol !== "https:") errors.push("Production URLs require HTTPS");
  const out = resolve(outDir);
  const generated = htmlFiles(out);
  if (!generated.length) errors.push("Build output missing or contains no HTML");

  const paths = new Set();
  for (const route of routes) {
    if (typeof route?.path !== "string" || !/^\/en\/(?:[a-z0-9-]+\/)*$/.test(route.path)) {
      errors.push("Invalid route"); continue;
    }
    if (paths.has(route.path)) errors.push("Duplicate route: " + route.path);
    paths.add(route.path);
    if (route.auditStatus && route.auditStatus !== "editorially-verified")
      warnings.push(route.path + ": editorial verification outstanding (" + route.auditStatus + ")");
  }
  const expected = new Set([...paths].map(p => new URL(p, origin).href));
  const sitemapFile = join(out, "sitemap.xml");
  if (!existsSync(sitemapFile)) errors.push("Missing sitemap.xml");
  else {
    const xml = read(sitemapFile);
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    if (!xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'))
      errors.push("Invalid sitemap root");
    if (urls.length !== new Set(urls).size) errors.push("Duplicate sitemap URL");
    for (const url of urls) if (!expected.has(url)) errors.push("Unexpected sitemap URL " + url);
    for (const url of expected) if (!urls.includes(url)) errors.push("Missing sitemap URL " + url);
  }
  const robotsFile = join(out, "robots.txt");
  if (!existsSync(robotsFile)) errors.push("Missing robots.txt");
  else {
    const robots = read(robotsFile);
    if (!/^User-agent:\s*\*\s*$/mi.test(robots)) errors.push("Missing robots user-agent");
    if (production) {
      if (!/^Allow:\s*\/\s*$/mi.test(robots) ||
          !robots.includes("Sitemap: " + new URL("/sitemap.xml", origin).href) ||
          /^Disallow:\s*\/\s*$/mi.test(robots)) errors.push("Invalid production robots");
    } else if (!/^Disallow:\s*\/\s*$/mi.test(robots)) errors.push("Development robots must disallow");
  }

  // The root is a non-indexable language entrypoint, NOT another canonical
  // content page. It must exist for the Eleventy dev server and must never
  // appear in sitemap.xml.
  const all = new Set([...paths, "/", "/404.html"]), pages = new Map();
  const redirectFile = join(out, "index.html");
  if (!existsSync(redirectFile)) {
    errors.push("Missing root language redirect index.html");
  } else {
    const html = read(redirectFile);
    pages.set("/", html);
    const refresh = tags(html, "meta").find(t =>
      (attr(t, "http-equiv") || "").toLowerCase() === "refresh") || "";
    const content = (attr(refresh, "content") || "").trim();
    if (!/^0\s*;\s*url\s*=\s*\/en\/\s*$/i.test(content)) {
      errors.push("Root redirect must immediately target /en/");
    }
    const canonical = attr(tags(html, "link").find(t =>
      (attr(t, "rel") || "").split(/\s+/).includes("canonical")) || "", "href");
    if (canonical !== new URL("/en/", origin).href) {
      errors.push("Root redirect must canonicalize to /en/");
    }
    const robots = attr(findTag(html, "meta", "name", "robots"), "content") || "";
    if (!/\bnoindex\b/i.test(robots)) errors.push("Root redirect must be noindex");
    if (!tags(html, "a").some(t => attr(t, "href") === "/en/")) {
      errors.push("Root redirect requires a working fallback link to /en/");
    }
  }
  for (const path of all) {
    // Root is a redirect entrypoint, not a content page. Validated above.
    if (path === "/") continue;
    const file = outputPath(out, path);
    if (!file || !existsSync(file)) { errors.push("Missing page " + path); continue; }
    const html = read(file);
    pages.set(path, html);
    const canonical = attr(tags(html, "link").find(t => (attr(t, "rel") || "").split(/\s+/).includes("canonical")) || "", "href");
    const expectedCanonical = new URL(path, origin).href;
    if (canonical !== expectedCanonical) errors.push(path + ": wrong canonical");
    if (attr(findTag(html, "meta", "property", "og:url"), "content") !== expectedCanonical)
      errors.push(path + ": wrong og:url");
    if (!/<title>\s*[^<\s][^<]*<\/title>/i.test(html)) errors.push(path + ": missing title");
    if (!attr(findTag(html, "meta", "name", "description"), "content")?.trim())
      errors.push(path + ": missing description");
    if (!/<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(html)) errors.push(path + ": missing h1");
    const robots = attr(findTag(html, "meta", "name", "robots"), "content") || "";
    if (path === "/404.html" && !/\bnoindex\b/i.test(robots)) errors.push("404 must be noindex");
    if (path !== "/404.html" && /\bnoindex\b/i.test(robots)) errors.push(path + ": sitemap includes noindex");
    for (const alt of tags(html, "link").filter(t => attr(t, "rel") === "alternate" && attr(t, "hreflang"))) {
      if (!expected.has(attr(alt, "href"))) errors.push(path + ": missing hreflang target");
    }
  }
  for (const file of generated) {
    const rel = relative(out, file).replace(/\\/g, "/");
    const path = rel === "404.html" ? "/404.html" :
      rel.endsWith("index.html") ? "/" + rel.slice(0, -"index.html".length) : "/" + rel;
    if (!all.has(path)) errors.push("Unexpected HTML file: " + path);
  }
  const inbound = new Map([...paths].map(p => [p, 0]));
  for (const [path, html] of pages) for (const tag of tags(html, "a")) {
    const href = attr(tag, "href");
    if (!href) continue;
    let url;
    try { url = new URL(href, new URL(path, origin)); } catch { errors.push(path + ": malformed href"); continue; }
    if (url.origin !== origin.origin || !["http:", "https:"].includes(url.protocol)) continue;
    const target = outputPath(out, url.pathname);
    if (!target || !existsSync(target)) { errors.push(path + ": broken internal link " + href); continue; }
    if (url.hash && !anchorFound(read(target), url.hash)) errors.push(path + ": broken fragment " + href);
    if (path !== url.pathname && inbound.has(url.pathname))
      inbound.set(url.pathname, inbound.get(url.pathname) + 1);
  }
  for (const [path, count] of inbound) {
    if (path !== "/en/" && !count) errors.push(path + ": orphan public page");
  }
  return { ok: errors.length === 0, pages: generated.length, sitemapEntries: expected.size, errors, warnings };
}
