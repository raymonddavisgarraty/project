import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import games from "../src/_data/games.js";
import casinos from "../src/_data/casinos.js";
import authors from "../src/_data/authors.js";
import { auditSnapshot43 } from "../src/lib/editorial43.mjs";

function readJsonIfPresent(file) {
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8"));
}
function loadIndexedRecords(base, keys, kind, cwd) {
  const result = {};
  for (const id of keys) {
    if (typeof id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))
      throw new Error("Invalid " + kind + " ID for audit");
    result[id] = readJsonIfPresent(resolve(cwd, base, id + ".json"));
  }
  return result;
}

export function auditCurrentRepository43({ cwd = process.cwd(), now = Date.now() } = {}) {
  const authorIds = [...new Set([...games.map(x => x.author), ...casinos.map(x => x.author)]
    .filter(x => typeof x === "string" && x.trim()))];

  return auditSnapshot43({
    games, casinos, authors, now,
    gameProvenance: loadIndexedRecords("src/content/provenance/games", games.map(x => x.id), "game", cwd),
    casinoProvenance: loadIndexedRecords("src/content/provenance/casinos", casinos.map(x => x.slug), "casino", cwd),
    authorProvenance: loadIndexedRecords("src/content/provenance/authors", authorIds, "author", cwd),
    ratingMethodology: readJsonIfPresent(resolve(cwd, "src/content/policies/rating-methodology.json")),
  });
}

export function assertProductionEditorial43({ env = process.env } = {}) {
  if (env.NODE_ENV !== "production" && env.SITE_ENV !== "production") return;
  const report = auditCurrentRepository43();
  if (!report.productionReleaseAllowed) {
    throw new Error(
      "Stage 43: production build blocked (" + report.counts.blockers +
      " evidence/editorial blockers). Run npm run check:editorial for details. " +
      "Never bypass this gate by faking approvals."
    );
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = new Set(process.argv.slice(2));
  const report = auditCurrentRepository43();
  if (args.has("--json")) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(JSON.stringify({
      schemaVersion: report.schemaVersion,
      auditedAt: report.auditedAt,
      productionReleaseAllowed: report.productionReleaseAllowed,
      counts: report.counts,
      firstBlockers: report.blockers.slice(0, 18),
      remainingBlockers: Math.max(0, report.blockers.length - 18),
      note: report.note,
    }, null, 2));
  }
  if (args.has("--strict") && !report.productionReleaseAllowed) process.exitCode = 1;
}
