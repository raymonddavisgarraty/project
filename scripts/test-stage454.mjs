import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync } from "node:fs";
import { renderStylesheet454 } from "../src/lib/css-bundle454.mjs";

const rendered = renderStylesheet454();
const output = "_site/assets/css/site-bundle.css";
assert(existsSync(output), "Run npm run build first");
const built = readFileSync(output, "utf8");
assert.equal(built, rendered.stylesheet, "Built CSS must match source modules in order");
assert.equal(rendered.sourcePaths.length, 44, "Review CSS import graph when module count changes");
assert.equal(new Set(rendered.sourcePaths).size, rendered.sourcePaths.length, "Duplicate CSS imports are forbidden");
assert.equal(rendered.sourcePaths.at(-1), "main.css");
assert(!/@import\b/.test(built), "CSS bundle must not contain @import statements");
const html = readFileSync("_site/en/index.html", "utf8");
assert(html.includes('href="/assets/css/site-bundle.css"'));
assert(!html.includes('href="/assets/css/main.css"'));
assert.equal((html.match(/rel="stylesheet"/g) || []).length, 3,
  "One normal stylesheet plus two noscript fallback stylesheets expected");
assert.equal((html.match(/href="\/assets\/css\/site-bundle\.css"/g) || []).length, 1);
assert.match(html, /name="robots" content="noindex, follow"/);
assert(statSync(output).size < 120000, "CSS raw bundle budget exceeded");
console.log("Stage 45.4 tests OK (44 ordered source files, one browser-facing CSS bundle, existing noscript/noindex safeguards). " + statSync(output).size + " bytes uncompressed.");
