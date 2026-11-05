import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACTIONS = new Set(["source-researched", "conflict-identified", "editorial-note", "correction-proposed"]);

export function recordAuditEvent43({
  directory = "data/editorial/review-log43",
  entityType, entityId, reviewerId, action, note,
  sourceUrls = [], eventId = randomUUID(), recordedAt = new Date().toISOString(),
} = {}) {
  if (!["game", "casino", "author", "methodology"].includes(entityType) ||
      !ID.test(entityId || "") || !ID.test(reviewerId || "")) {
    throw new Error("Invalid entity identity or reviewer ID");
  }
  if (!ACTIONS.has(action)) throw new Error("Unsupported audit-log action");
  if (typeof note !== "string" || note.trim().length < 5 || note.length > 4000) {
    throw new Error("Audit note must have 5–4000 characters");
  }
  if (!UUID.test(eventId) || Number.isNaN(Date.parse(recordedAt))) throw new Error("Invalid event ID or timestamp");
  if (!Array.isArray(sourceUrls)) throw new Error("sourceUrls must be an array");
  for (const value of sourceUrls) {
    let url;
    try { url = new URL(value); } catch { throw new Error("Invalid source URL"); }
    if (url.protocol !== "https:") throw new Error("Source URLs must use HTTPS");
  }
  const event = {
    schemaVersion: 1, eventId, recordedAt, entityType, entityId,
    reviewerId, action, note: note.trim(), sourceUrls,
    approvalGranted: false, publicationApproved: false,
    noteOnAuthority: "This event is an audit note, never an approval or publication decision.",
  };
  const bytes = JSON.stringify(event, null, 2) + "\n";
  const digest = createHash("sha256").update(bytes).digest("hex");
  const out = resolve(directory);
  mkdirSync(out, { recursive: true });
  const file = join(out, eventId + ".json");
  // Explicit write only, exclusive create. Never overwrite an existing audit event.
  writeFileSync(file, bytes, { flag: "wx" });
  return { file, sha256: digest, eventId, approvalGranted: false, publicationApproved: false };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [command, ...args] = process.argv.slice(2);
  if (command !== "record") throw new Error("Usage: record --entity-type=... --entity-id=... --reviewer-id=... --action=... --note=...");
  const options = Object.fromEntries(args.map(arg => {
    const match = arg.match(/^--([a-z-]+)=(.*)$/s);
    if (!match) throw new Error("Invalid argument: " + arg);
    return [match[1], match[2]];
  }));
  const result = recordAuditEvent43({
    entityType: options["entity-type"], entityId: options["entity-id"],
    reviewerId: options["reviewer-id"], action: options.action, note: options.note,
    sourceUrls: options["source-url"] ? [options["source-url"]] : [],
  });
  console.log(JSON.stringify(result, null, 2));
}
