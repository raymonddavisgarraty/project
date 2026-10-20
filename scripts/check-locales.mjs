import assert from "node:assert/strict";
import locales from "../src/_data/locales.js";
import markets from "../src/_data/markets.js";
import site from "../src/_data/site.js";

assert.deepEqual(Object.keys(locales), ["en", "de", "es"]);
assert.deepEqual(site.languages, Object.keys(locales));
assert.equal(locales.en.status, "active");
for (const code of ["de", "es"]) assert.equal(locales[code].status, "planned");
for (const market of Object.values(markets)) {
  assert.ok(locales[market.locale]);
  assert.equal(market.publicationStatus, "pending-legal-review");
}
console.log("Locale configuration OK: en active; de/es planned; market approvals pending.");
