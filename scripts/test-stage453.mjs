// Stage 45.3: verify actual build image delivery and the source files, not just markup.
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import homeBanners from "../src/_data/homeBanners.js";

const outputFile = "_site/en/index.html";
assert(existsSync(outputFile), "Build first: npm run build");
const html = readFileSync(outputFile, "utf8");
const allImages = [...homeBanners.slides, ...homeBanners.widgets];
assert.equal(homeBanners.slides.length, 2, "Recheck first visible banner assumptions when slides change");
assert.equal(allImages.length, 4, "Recheck delivery tests when banner/widget set changes");
let webpTotal = 0;
let avifTotal = 0;
for (const item of allImages) {
  assert.match(item.image, /^\/assets\/images\/banners\/[a-z0-9-]+\.webp$/);
  assert.match(item.imageAvif, /^\/assets\/images\/banners\/[a-z0-9-]+\.avif$/);
  const webp = "src" + item.image;
  const avif = "src" + item.imageAvif;
  assert(existsSync(webp) && existsSync(avif), "Both source image formats must exist");
  assert(existsSync("_site" + item.image) && existsSync("_site" + item.imageAvif), "Built assets must exist");
  const w = statSync(webp).size;
  const a = statSync(avif).size;
  assert(a > 0 && a < w, "AVIF must improve payload relative to WebP");
  webpTotal += w;
  avifTotal += a;
  assert(html.includes('srcset="' + item.imageAvif + '" type="image/avif"'), "AVIF source missing from built HTML");
  assert(html.includes('src="' + item.image + '"'), "WebP fallback missing from built HTML");
}
const slides = [...html.matchAll(/<a\s+class="home-banners__slide"[\s\S]*?<\/a>/g)].map(x => x[0]);
assert.equal(slides.length, homeBanners.slides.length);
assert.match(slides[0], /<picture>/);
assert.match(slides[0], /loading="eager" fetchpriority="high"/);
assert.doesNotMatch(slides[1], /fetchpriority="high"/);
assert.match(slides[1], /loading="lazy" decoding="async"/);
assert.match(slides[1], /\shidden(?:\s|>)/);
assert.equal((html.match(/<picture>/g) || []).length, 4);
assert.match(html, /name="robots" content="noindex, follow"/);
console.log("Stage 45.3 tests OK (AVIF with WebP fallback, first-slide priority, offscreen lazy loading). " +
  "Representative 4 image references: WebP " + webpTotal + " bytes vs AVIF " + avifTotal +
  " bytes; actual traffic depends on caching and browser.");
