// Stage 45.5 — Lighthouse follow-up: brand link accessible name.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const markup = readFileSync("src/_includes/components/site-header/site-header.njk", "utf8");
assert.match(markup, /<a class="site-header__logo" href="\/en\/">/, "Logo must be a native link without an overriding aria-label");
assert.match(markup, /<span class="site-header__logo-mark" aria-hidden="true">R<\/span>/, "Decorative monogram should be hidden from assistive technologies");
assert.match(markup, /<span>\{\{ site\.name \}\}<\/span>/, "Visible brand text must provide the accessible name");

const built = "_site/en/games/index.html";
assert(existsSync(built), "Run npm run build before this test");
const html = readFileSync(built, "utf8");
const logo = html.match(/<a class="site-header__logo" href="\/en\/">[\s\S]*?<\/a>/)?.[0];
assert(logo, "Built games page must expose native home link");
assert.doesNotMatch(logo, /aria-label=/, "Visible brand must not be overridden by a mismatched label");
assert.match(logo, /aria-hidden="true">R<\/span>/);
assert.match(logo, /ReviewHub/, "Brand text must remain visible and available to screen readers");
assert.match(html, /name="robots" content="noindex, follow"/, "Editorial indexability guard must remain");
console.log("Stage 45.5 tests OK (native logo link, accessible visible name, decorative monogram, noindex preserved).");


// Homepage Lighthouse Desktop reported 9px banner dot targets; fix the hit areas
// without changing the small visual indicator or the no-JS behavior.
const bannerCss = readFileSync("src/assets/css/components/home-banners.css", "utf8");
assert.match(bannerCss, /\.home-banners__dot\s*\{[^}]*width:\s*30px;[^}]*height:\s*30px;/s,
  "Interactive banner dot controls must be at least 24px square");
assert.match(bannerCss, /\.home-banners__dot::before\s*\{[^}]*width:\s*9px;[^}]*height:\s*9px;/s,
  "Keep visual indicators compact inside the larger hit area");
assert.match(bannerCss, /\.home-banners__dot--active::before\s*\{[^}]*width:\s*20px;/s);
assert.match(bannerCss, /\.home-banners__dot:focus-visible/, "Keyboard focus should be visible");
const homepage = readFileSync("_site/en/index.html", "utf8");
assert.match(homepage, /data-banner-dot="0"/);
assert.match(homepage, /data-banner-dot="1"/);
const bundled = readFileSync("_site/assets/css/site-bundle.css", "utf8");
assert(bundled.includes(".home-banners__dot::before"), "Hit-area CSS must appear in the public bundle");
assert.match(homepage, /name="robots" content="noindex, follow"/);
console.log("Stage 45.5 homepage tests OK (larger dot hit targets, visual indicators and keyboard focus preserved).");
