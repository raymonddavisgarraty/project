// Stage 45.2 — SSR/no-JS catalogue fallback and reduced-motion behavior.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";

const read = path => readFileSync(path, "utf8");
const base = read("src/_includes/layouts/base.njk");
const fallback = read("src/assets/css/components/no-js-catalogs.css");
const games = read("src/en/games/index.njk");
const casinos = read("src/en/casinos/index.njk");
const rail = read("src/assets/js/components/game-rail.js");

assert.match(base, /<noscript><link[^>]*no-js-header\.css[^>]*><\/noscript>/);
assert.match(base, /<noscript><link[^>]*no-js-catalogs\.css[^>]*><\/noscript>/);
assert.match(fallback, /\.games-search__panel/);
assert.match(fallback, /\.casinos-search__panel/);
assert.doesNotMatch(fallback, /\[data-(game|casino)-card\]/, "Never hide SSR cards");
for (const [name, html] of [["games",games],["casinos",casinos]]) {
  assert.match(html, /<noscript>[\s\S]*require JavaScript[\s\S]*<\/noscript>/, `${name} needs a usable fallback`);
  assert.match(html, /<div class="(?:games|casinos)-search__grid"/, `${name} cards must remain server-rendered`);
}
assert.match(games, /Highlight a random game/);
assert.match(rail, /prefers-reduced-motion: reduce/);
assert.match(rail, /behavior: getScrollBehavior\(\)/);

function emitter(props = {}) {
  const handlers = new Map();
  return Object.assign({
    handlers,
    addEventListener(name, fn) { handlers.set(name, fn); },
    dispatch(name, event = {}) { handlers.get(name)?.(event); },
  }, props);
}
function createEnvironment(reduceMotion = true) {
  const slides = Array.from({ length: 3 }, () => ({ hidden: false }));
  const dots = Array.from({ length: 3 }, () => emitter({
    attrs: {},
    classList: { toggle(){} },
    setAttribute(name, value) { this.attrs[name] = value; },
    removeAttribute(name) { delete this.attrs[name]; },
  }));
  const prev = emitter();
  const next = emitter();
  const slider = emitter({
    querySelectorAll(selector) {
      return selector === "[data-banner-slide]" ? slides : dots;
    },
    querySelector(selector) {
      return selector === "[data-banner-prev]" ? prev : next;
    },
    contains(target) { return target === prev || target === next; },
  });
  const media = emitter({matches: reduceMotion});
  const document = emitter({
    hidden: false,
    querySelector(selector) { return selector === "[data-banner-slider]" ? slider : null; },
  });
  const timers = new Map();
  let nextId = 1;
  const window = {
    matchMedia: query => { assert.equal(query, "(prefers-reduced-motion: reduce)"); return media; },
    setInterval(callback, duration) { assert.equal(duration, 5000);const id = nextId++;timers.set(id, callback);return id; },
    clearInterval(id) { timers.delete(id); },
  };
  vm.runInNewContext(read("src/assets/js/components/home-banners.js"), { window, document }, {timeout: 1000});
  return {slides,dots,prev,next,slider,media,document,timers};
}
const e = createEnvironment(true);
assert.equal(e.timers.size, 0, "Reduced-motion preference must prevent autoplay");
e.next.dispatch("click");
assert.equal(e.slides[0].hidden, true, "Manual next must work with reduced motion");
assert.equal(e.slides[1].hidden, false);
assert.equal(e.dots[1].attrs["aria-current"], "true");
e.media.matches = false;
e.media.dispatch("change");
assert.equal(e.timers.size, 1, "Autoplay may run when motion is allowed");
e.slider.dispatch("mouseenter");
assert.equal(e.timers.size, 0, "Pointer hover pauses autoplay");
e.slider.dispatch("mouseleave");
assert.equal(e.timers.size, 1);
e.slider.dispatch("focusin");
assert.equal(e.timers.size, 0, "Keyboard focus pauses autoplay");
e.slider.dispatch("focusout", {relatedTarget:e.next});
assert.equal(e.timers.size, 0, "Moving focus within banner must keep it paused");
e.slider.dispatch("focusout", {relatedTarget:null});
assert.equal(e.timers.size, 1);
e.document.hidden = true;
e.document.dispatch("visibilitychange");
assert.equal(e.timers.size, 0, "Hidden tab must pause autoplay");
e.document.hidden = false;
e.document.dispatch("visibilitychange");
assert.equal(e.timers.size, 1);
[...e.timers.values()][0]();
assert.equal(e.slides[2].hidden, false, "Timer advances banner when allowed");
e.media.matches = true;
e.media.dispatch("change");
assert.equal(e.timers.size, 0, "Changing to reduced motion must stop existing timer");
e.prev.dispatch("click");
assert.equal(e.slides[1].hidden,false, "Manual previous must work after autoplay stops");

if (existsSync("_site/en/games/index.html")) {
  const output = read("_site/en/games/index.html");
  const casinoOutput = read("_site/en/casinos/index.html");
  assert.match(output,/no-js-catalogs\.css/);
  assert.match(output,/Search and filters require JavaScript/);
  assert.match(casinoOutput,/Search and filters require JavaScript/);
  assert.match(output, /name="robots" content="noindex, follow"/);
  assert.match(casinoOutput, /name="robots" content="noindex, follow"/);
}
console.log("Stage 45.2 tests OK (server-rendered catalogue fallback, manual banner controls, reduced motion, focus/visibility pauses, noindex).");
