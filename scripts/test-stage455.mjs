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
