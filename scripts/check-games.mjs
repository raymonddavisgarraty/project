import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname ?? new URL(".", import.meta.url).pathname, "../src/content");
const ids = new Set();
for (const file of readdirSync(resolve(root, "games")).filter(x => x.endsWith(".json"))) {
  const game = JSON.parse(readFileSync(resolve(root, "games", file), "utf8"));
  if (ids.has(game.id) || game.slug + ".json" !== file) throw new Error(`Duplicate/mismatched game: ${file}`);
  ids.add(game.id);
  for (const field of ["rtp", "maxWinMultiplier", "reels", "paylines"]) {
    if (game[field] !== null && game[field] !== undefined && (typeof game[field] !== "number" || !Number.isFinite(game[field]))) throw new Error(`${file}: invalid ${field}`);
  }
  if (game.rtp != null && (game.rtp < 0 || game.rtp > 100)) throw new Error(`${file}: invalid RTP`);
  if (game.reels != null && (!Number.isInteger(game.reels) || game.reels < 1)) throw new Error(`${file}: invalid reels`);
  console.log(`OK ${game.id} (${game.sourceStatus})`);
}
console.log(`Validated ${ids.size} global game records`);
