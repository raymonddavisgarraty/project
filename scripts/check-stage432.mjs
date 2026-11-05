import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import games from "../src/_data/games.js";
import casinos from "../src/_data/casinos.js";
import editorialDisplay432 from "../src/_data/editorialDisplay432.js";
import editorialFields433 from "../src/_data/editorialFields433.js";

function verifyBuild432({ dir = "_site" } = {}) {
  const errors = [];
  const out = resolve(dir);
  const get = path => {
    const file = resolve(out, "." + path);
    if (!file.startsWith(out) || !existsSync(file)) {
      errors.push("Missing generated file: " + path); return "";
    }
    return readFileSync(file, "utf8");
  };
  const home = get("/en/index.html");
  const gameIndex = get("/en/games/index.html");
  const casinoIndex = get("/en/casinos/index.html");

  for (const game of games) {
    const html = get("/en/games/" + game.slug + "/index.html");
    if (editorialDisplay432.game(game)) continue;
    if (!html.includes("Editorial verification pending.")) errors.push(game.slug + ": no review notice");
    if (!html.includes("<h1")) errors.push(game.slug + ": no H1");
    const rtp = game.globalFacts?.rtp;
    if (rtp != null && !editorialFields433.gameFieldVerified(game, "rtp") && html.includes(rtp.toFixed(2) + "%"))
      errors.push(game.slug + ": unapproved RTP leaked");
    const maxWin = game.globalFacts?.maxWinMultiplier;
    if (maxWin != null && !editorialFields433.gameFieldVerified(game, "maxWinMultiplier")) {
      const formatted = maxWin.toLocaleString("en-US");
      if ([formatted + "x", formatted + "×", String(maxWin) + "x", String(maxWin) + "×"]
          .some(value => html.includes(value))) {
        errors.push(game.slug + ": unapproved max win leaked");
      }
    }
    if (html.includes("Editorial rating") || html.includes("Rating breakdown")) {
      errors.push(game.slug + ": unsupported editorial rating leaked");
    }
    if (!gameIndex.includes("Facts and rating under editorial review")) {
      errors.push("Game catalogue is missing provisional-card notice");
    }
    if (gameIndex.includes('data-game-rating="' + game.rating?.overall + '"')) {
      errors.push(game.slug + ": unapproved rating leaked into card data");
    }
  }

  for (const casino of casinos) {
    const html = get("/en/casinos/" + casino.slug + "/index.html");
    if (editorialDisplay432.casino(casino)) continue;
    if (!html.includes("Editorial verification pending.")) errors.push(casino.slug + ": no review notice");
    for (const [field, claim] of [
      ["bonus",casino.bonus], ["license",casino.license],
      ["gamesCount",casino.gamesCount], ["paymentMethods",casino.paymentMethods]
    ]) {
      if (claim && !editorialFields433.casinoFieldVerified(casino, field) &&
          html.includes(String(claim))) {
        errors.push(casino.slug + ": unapproved " + field + " leaked");
      }
    }
    if (html.includes('aria-label="Rating ') || html.includes("Editorial rating")) {
      errors.push(casino.slug + ": unapproved rating leaked");
    }
    if (!casinoIndex.includes("editorial verification") && !casinoIndex.includes("editorial review")) {
      errors.push("Casino catalogue is missing provisional notice");
    }
    if (casinoIndex.includes('data-casino-rating="' + casino.rating + '"')) {
      errors.push(casino.slug + ": unapproved rating leaked into card data");
    }
  }
  // Catalogue/home protection must be dynamic: when a field is genuinely
  // verified in Stage 43, its reviewed value is allowed; other numerics are not.
  const listingHtml = [home, gameIndex, casinoIndex];
  for (const game of games) {
    if (editorialDisplay432.game(game)) continue;
    const source = game.globalFacts;
    const rtp = source?.rtp;
    if (rtp != null && !editorialFields433.gameFieldVerified(game, "rtp") &&
        listingHtml.some(html => html.includes(rtp.toFixed(2) + "%"))) {
      errors.push(game.slug + ": unapproved RTP leaked into a listing");
    }
    const maxWin = source?.maxWinMultiplier;
    if (maxWin != null && !editorialFields433.gameFieldVerified(game, "maxWinMultiplier")) {
      const variants = [maxWin.toLocaleString("en-US") + "×",
        maxWin.toLocaleString("en-US") + "x", String(maxWin) + "×", String(maxWin) + "x"];
      if (listingHtml.some(html => variants.some(value => html.includes(value)))) {
        errors.push(game.slug + ": unapproved max win leaked into a listing");
      }
    }
  }
  return { ok: errors.length === 0, pagesChecked: 3 + games.length + casinos.length, errors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = verifyBuild432();
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}
export { verifyBuild432 };
