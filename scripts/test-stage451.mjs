// Stage 45.1 — explicit regression for primary navigation and truthful homepage copy.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (f) => readFileSync(f, "utf8");
const header = read("src/_includes/components/site-header/site-header.njk");
const base = read("src/_includes/layouts/base.njk");
const nojs = read("src/assets/css/components/no-js-header.css");
const menu = read("src/assets/js/components/site-header.js");
const home = read("src/en/index.njk");

for (const [name, path] of [["Home", "/en/"], ["Games", "/en/games/"], ["Casinos", "/en/casinos/"]]) {
  assert.match(header, new RegExp(`<a class="site-header__link" href="${path}">${name}<\/a>`), `${name} must be a native, crawlable link`);
}
assert.doesNotMatch(header, /data-dropdown-toggle|site-header__dropdown/, "No JS-only primary navigation");
assert.doesNotMatch(header, /<button[^>]*site-header__language/, "Unimplemented locale choice must not be a button");
assert.match(header, /Current language: English/);
assert.match(base, /<noscript><link rel="stylesheet" href="\/assets\/css\/components\/no-js-header\.css"><\/noscript>/);
assert.match(nojs, /\.site-header__nav\s*\{[^}]*display:\s*grid/s);
assert.match(nojs, /\.site-header__toggle,[\s\S]*display:\s*none\s*!important/);
assert.match(nojs, /\.home-banners__controls/);
assert.match(nojs, /\.game-rail__arrow/);
assert.match(menu, /event\.key === "Escape"/);
assert.match(menu, /toggle\.focus\(\)/);
assert.doesNotMatch(home, /Best Online Casinos|provider rankings|bonus comparisons/);
assert.match(home, /Casino listings/);
assert.match(home, /we withhold the claim/);

if (existsSync("_site/en/index.html")) {
  const built = read("_site/en/index.html");
  for (const route of ["/en/", "/en/games/", "/en/casinos/"])
    assert(built.includes(`href="${route}"`), `Built homepage missing ${route}`);
  assert(built.includes('href="/assets/css/components/no-js-header.css"'), "No-JS stylesheet absent in built page");
  assert.doesNotMatch(built, /Best Online Casinos|provider rankings/);
  assert.match(built, /Current language: English/);
  assert(built.includes('name="robots" content="noindex, follow"'), "Pending development pages must remain noindex");
}
console.log("Stage 45.1 tests OK (native links, no-JS navigation, keyboard close, safe homepage copy, noindex).");
