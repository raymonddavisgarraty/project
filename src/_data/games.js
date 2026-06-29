import { readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const gamesDir = resolve(currentDir, "../content/en/games");

const files = readdirSync(gamesDir).filter((file) => file.endsWith(".js"));

const games = await Promise.all(
  files.map(async (file) => {
    const module = await import(pathToFileURL(resolve(gamesDir, file)).href);
    return module.default;
  })
);

export default games
  .map((game) => ({
    ...game,
    title: game.hero.title,
    metaTitle: game.seo.metaTitle,
    metaDescription: game.seo.metaDescription,
    description: game.hero.description,
    provider: game.facts.provider,
    rating: game.rating.overall,
    rtp: game.facts.rtp,
    volatility: game.facts.volatility,
    reels: game.facts.reels,
    paylines: game.facts.paylines,
    affiliateId: game.monetization.affiliateId,
    cover: game.media.cover
  }))
  .sort((a, b) => a.title.localeCompare(b.title));