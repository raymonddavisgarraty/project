import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const baseDir = resolve(dirname(fileURLToPath(import.meta.url)), "../content");
const factsDir = resolve(baseDir, "games");
const editorialDir = resolve(baseDir, "locales/en/games");
const factsFiles = readdirSync(factsDir).filter((file) => file.endsWith(".json"));

function formatFacts(record) {
  const percent = record.rtp == null ? null : `${record.rtp.toFixed(2)}%`;
  const maxWin = record.maxWinMultiplier == null ? null : `${record.maxWinMultiplier.toLocaleString("en-US")}x`;
  return {
    provider: record.providerName,
    rtp: percent,
    volatility: record.volatility ? record.volatility[0].toUpperCase() + record.volatility.slice(1) : null,
    reels: record.reels == null ? null : String(record.reels),
    paylines: record.paylineType === "pays-anywhere" ? "Pays anywhere" : record.paylines == null ? null : String(record.paylines),
    releaseYear: record.releaseYear == null ? null : String(record.releaseYear),
    maxWin,
    hitFrequency: record.hitFrequency ? record.hitFrequency[0].toUpperCase() + record.hitFrequency.slice(1) : null,
  };
}

const games = await Promise.all(factsFiles.map(async (file) => {
  const record = JSON.parse(readFileSync(resolve(factsDir, file), "utf8"));
  if (!record.id || !record.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) {
    throw new Error(`Invalid game identity: ${file}`);
  }
  const module = await import(pathToFileURL(resolve(editorialDir, `${record.slug}.js`)).href);
  const editorial = module.default;
  if (editorial.slug !== record.slug) throw new Error(`Game slug mismatch: ${file}`);
  const facts = formatFacts(record);
  return {
    ...editorial,
    id: record.id,
    globalFacts: record,
    facts,
    title: editorial.hero.title,
    metaTitle: editorial.seo.metaTitle,
    metaDescription: editorial.seo.metaDescription,
    description: editorial.hero.description,
    provider: facts.provider,
    rating: editorial.rating,
    rtp: facts.rtp,
    volatility: facts.volatility,
    reels: facts.reels,
    paylines: facts.paylines,
    affiliateId: editorial.monetization?.affiliateId,
    cover: editorial.media?.cover,
  };
}));

export default games.sort((a, b) => a.title.localeCompare(b.title));
