import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { buildRoutes42 } from "../src/lib/routes42.js";
import { auditSeo42 } from "./seo42.mjs";

// Regression: the real homepage template must expose its own semantic H1.
// The built-page SEO audit separately checks the final rendered HTML.
const homepageTemplate = readFileSync("src/en/index.njk", "utf8");
assert.equal((homepageTemplate.match(/<h1\b/g) || []).length, 1, "Home must have exactly one explicit H1");
assert.match(homepageTemplate, /<h1\b[^>]*>Casino and Slot Game Reviews<\/h1>/);

// This legacy synthetic test deliberately passes routes as a fully
// indexed fixture. The real runtime supplies indexability42 only.
const routes = buildRoutes42({
  games: [{ id: "test-game", slug: "test-game", globalFacts: { sourceStatus: "legacy-unverified" } }],
});
assert.equal(routes.length, 4);
assert.throws(() => buildRoutes42({ games: [{ id: "a", slug: "x" }, { id: "b", slug: "x" }] }), /Duplicate public route/);
assert.throws(() => buildRoutes42({ games: [{ id: "a", slug: "bad\/slug" }] }), /Invalid/);
assert.throws(() => buildRoutes42({ games: [{ id: "a", slug: "x" }, { id: "a", slug: "y" }] }), /Duplicate published game ID/);

const root = mkdtempSync(join(tmpdir(), "stage42-"));
const domain = "https://reviews.example-site.org";
const put = (pathname, content) => {
  const file = join(root, pathname.slice(1));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};
const html = (pathname, links, robots = "index, follow") =>
  '<!doctype html><html lang="en"><head><title>Review ' + pathname +
  '</title><meta name="description" content="Sample page"><meta name="robots" content="' + robots +
  '"><link rel="canonical" href="' + domain + pathname +
  '"><meta property="og:url" content="' + domain + pathname +
  '"></head><body><h1>Test</h1>' +
  links.map(h => '<a href="' + h + '">Link</a>').join("") +
  (pathname === "/en/games/test-game/" ? '<h2 id="facts">Facts</h2>' : "") + '</body></html>';
const page = (path, links, robots) => put(path + "index.html", html(path, links, robots));
try {
  page("/en/", ["/en/games/", "/en/casinos/"]);
  page("/en/games/", ["/en/games/test-game/"]);
  page("/en/casinos/", ["/en/"]);
  page("/en/games/test-game/", ["/en/games/", "#facts"]);
  put("/404.html", html("/404.html", ["/en/"], "noindex, follow"));
  const rootRedirect = '<!doctype html><html lang="en"><head><title>Language entry</title>' +
    '<meta http-equiv="refresh" content="0; url=/en/">' +
    '<meta name="robots" content="noindex, follow">' +
    '<link rel="canonical" href="' + domain + '/en/">' +
    '</head><body><a href="/en/">English homepage</a></body></html>';
  put("/index.html", rootRedirect);

  const xmlStart = '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urls = routes.map(r => '<url><loc>' + domain + r.path + '</loc></url>').join("");
  put("/sitemap.xml", xmlStart + urls + "</urlset>");
  put("/robots.txt", "User-agent: *\nAllow: /\n\nSitemap: " + domain + "/sitemap.xml\n");
  const passed = auditSeo42({ outDir: root, siteUrl: domain, routes, indexableRoutes: routes, production: true });
  assert.equal(passed.ok, true, passed.errors.join("; "));
  assert.equal(passed.sitemapEntries, 4);
  put("/index.html", rootRedirect.replace('content="0; url=/en/"', 'content="0; url=/de/"'));
  const wrongRoot = auditSeo42({ outDir: root, siteUrl: domain, routes, indexableRoutes: routes, production: true });
  assert(wrongRoot.errors.some(e => e.includes("Root redirect must immediately target /en/")));
  put("/index.html", rootRedirect);
  assert(passed.warnings.some(w => w.includes("legacy-unverified")));

  const dev = auditSeo42({ outDir: root, siteUrl: domain, routes, indexableRoutes: routes, production: false });
  assert(dev.errors.some(e => e.includes("Development robots")));

  page("/en/games/", ["/en/games/missing/"]);
  const broken = auditSeo42({ outDir: root, siteUrl: domain, routes, indexableRoutes: routes, production: true });
  assert(broken.errors.some(e => e.includes("broken internal link")));
  assert(broken.errors.some(e => e.includes("orphan public page")));
  page("/en/games/", ["/en/games/test-game/"]);

  put("/sitemap.xml", xmlStart + urls +
    '<url><loc>' + domain + '/en/unpublished/</loc></url></urlset>');
  const leak = auditSeo42({ outDir: root, siteUrl: domain, routes, indexableRoutes: routes, production: true });
  assert(leak.errors.some(e => e.includes("Unexpected sitemap URL")));
  console.log("Stage 42 tests OK (routes, sitemap, robots, canonical, links, 404, orphan, leak).");
} finally {
  rmSync(root, { recursive: true, force: true });
}
