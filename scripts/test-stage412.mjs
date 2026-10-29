import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveSiteUrl, resolveTelegramUrl } from "../src/lib/site-config.js";
import { resolveCommercialOffer, safeExternalUrl } from "../src/lib/commercial-policy.js";
import commercial from "../src/_data/commercial.js";
import { checkProduction } from "./check-production.mjs";

assert.equal(resolveSiteUrl({}), "http://localhost:8080");
assert.equal(resolveSiteUrl({ SITE_URL: "https://reviews.example-site.org" }), "https://reviews.example-site.org");
assert.throws(() => resolveSiteUrl({ NODE_ENV: "production" }), /SITE_URL/);
assert.throws(() => resolveSiteUrl({ SITE_URL: "https://example.com", NODE_ENV: "production" }), /placeholder/);
assert.throws(() => resolveSiteUrl({ SITE_URL: "http://reviews.example-site.org", NODE_ENV: "production" }), /HTTPS/);
assert.throws(() => resolveSiteUrl({ SITE_URL: "https://reviews.example-site.org/subpath" }), /origin/);
assert.equal(resolveTelegramUrl({ TELEGRAM_URL: "https://t.me/real_channel" }), "https://t.me/real_channel");
assert.equal(resolveTelegramUrl({ TELEGRAM_URL: "https://t.me/yourchannel" }), null);
assert.equal(resolveTelegramUrl({ TELEGRAM_URL: "https://evil.example/t.me/real_channel" }), null);
assert.equal(safeExternalUrl("https://example.com/go/offer"), null);
assert.equal(safeExternalUrl("javascript:alert(1)"), null);

const markets = { GB: { publicationStatus: "approved", commercialStatus: "approved" } };
const entity = {
  affiliateId: "partner-1",
  commercialApproval: { status: "approved", scope: "global", rightsChecked: true, marketCodes: ["GB"] },
  demoApproval: { status: "approved", rightsChecked: true },
};
const partners = [{
  id: "partner-1", status: "approved", globalRightsApproved: true, marketCodes: ["GB"],
  url: "https://valid-operator.org/play", bonusUrl: "https://valid-operator.org/bonus",
  demoUrl: "https://valid-operator.org/demo",
}];
const policy = { globalCommercialApproved: true, globalDemoApproved: false };
const check = overrides => resolveCommercialOffer({ entity, partners, markets, policy, ...overrides });
assert.equal(check({ policy: {} }), null);
assert.equal(check({ entity: { ...entity, commercialApproval: null } }), null);
assert.equal(check({ markets: { GB: { publicationStatus: "approved", commercialStatus: "pending-legal-review" } } }), null);
assert.equal(check({ partners: [{ ...partners[0], url: "https://example.com/go/offer", bonusUrl: null }] }), null);
assert.equal(check({ partners: [{ ...partners[0], globalRightsApproved: false }] }), null);
assert.equal(check({ entity: { ...entity, commercialApproval: { ...entity.commercialApproval, scope: "GB" } } }), null);
const offer = check();
assert.equal(offer.playUrl, "https://valid-operator.org/play");
assert.equal(offer.bonusUrl, "https://valid-operator.org/bonus");
assert.equal(offer.demoUrl, null);
assert.equal(check({ policy: { ...policy, globalDemoApproved: true } }).demoUrl, "https://valid-operator.org/demo");
assert.equal(commercial.forGame({ affiliateId: "pragplay" }), null);
assert.equal(commercial.forCasino({ affiliateId: "royalspin" }), null);

const components = [
  "src/_includes/components/cta-panel/cta-panel.njk",
  "src/_includes/components/game-hero/game-hero.njk",
  "src/_includes/components/casino-hero/casino-hero.njk",
  "src/_includes/components/casino-card/casino-card.njk",
];
for (const component of components) {
  const template = readFileSync(component, "utf8");
  assert.match(template, /commercial\.for(?:Game|Casino)/, component);
  assert.doesNotMatch(template, /partners|partner\.url|partner\.bonusUrl|partner\.demoUrl/, component);
}
for (const path of ["src/_includes/components/site-header/site-header.njk", "src/_includes/components/site-footer/site-footer.njk", "src/en/index.njk"]) {
  assert.doesNotMatch(readFileSync(path, "utf8"), /href="\/en\/(?:providers|articles|bonuses|authors|about|contact)\//, path);
}
const result = checkProduction({ outDir: "__stage412_nonexistent_output__", env: {} });
assert.equal(result.ok, false);
assert(result.errors.some(issue => /SITE_URL/.test(issue)));
assert(result.errors.some(issue => /Missing build output/.test(issue)));
console.log("Stage 41.2 tests OK (site config, global commercial gate, demo rights, templates, negative production check).");
