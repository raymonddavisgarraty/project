// G2.3 — read-only bytes-to-review binding for repository source files.
// A matching checksum NEVER authenticates a source, approves rights or publishes.
import { createHash } from "node:crypto";
import { readFileSync, realpathSync, lstatSync } from "node:fs";
import { isAbsolute, resolve, relative } from "node:path";

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HASH = /^[a-f0-9]{64}$/;
const FLAGS = Object.freeze({
  sourceAuthenticityVerified: false, rightsApproved: false,
  editorialApproved: false, indexabilityApproved: false,
  publicationApproved: false, publicExportApproved: false, autoPublish: false,
});
const object = x => x !== null && typeof x === "object" && !Array.isArray(x);
const exactly = (x, keys) => object(x) && Object.keys(x).length === keys.length &&
  keys.every(k => Object.hasOwn(x, k));
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const fail = errors => Object.freeze({
  schemaVersion: 1, kind: "source-revision-integrity-only", ok: false,
  errors: Object.freeze(errors), ...FLAGS,
});

export function requiredSourcePathsG2({ entityType, entityId, slug, authorId }) {
  if (!["game", "casino"].includes(entityType) || !ID.test(entityId || "") ||
      !ID.test(slug || "") || !ID.test(authorId || ""))
    throw new Error("Unsupported G2.3 entity, ID, slug or author identity");
  if (entityType === "casino" && entityId !== slug)
    throw new Error("Casino ID/slug provenance migration is not yet reviewed");
  const shared = [
    "src/_data/authors.js",
    "src/content/provenance/authors/" + authorId + ".json",
    "src/content/policies/rating-methodology.json",
  ];
  const specific = entityType === "game" ? [
    "src/content/games/" + entityId + ".json",
    "src/content/locales/en/games/" + slug + ".js",
    "src/content/provenance/games/" + entityId + ".json",
    "src/content/registries/providers.json",
    "src/content/registries/features.json",
    "src/content/registries/themes.json",
  ] : [
    "src/_data/casinos.js",
    "src/content/provenance/casinos/" + entityId + ".json",
    "src/_data/markets.js",
    "src/_data/publication.js",
  ];
  return Object.freeze([...specific, ...shared].sort());
}

function safeRead(root, relativePath) {
  const file = resolve(root, relativePath);
  const diff = relative(root, file);
  if (!diff || diff === ".." || diff.startsWith("..\\") ||
      diff.startsWith("../") || isAbsolute(diff))
    throw new Error("Source outside the selected repository");
  const st = lstatSync(file);
  if (!st.isFile() || st.isSymbolicLink() || st.size > 1024 * 1024)
    throw new Error("Source must be a regular non-symlink file <= 1 MiB");
  const actual = realpathSync(file);
  const relativeActual = relative(root, actual);
  if (!relativeActual || relativeActual === ".." || relativeActual.startsWith("..\\") ||
      relativeActual.startsWith("../") || isAbsolute(relativeActual))
    throw new Error("Resolved source escapes repository");
  const bytes = readFileSync(file);
  if (bytes.length !== st.size) throw new Error("Source changed during read");
  return { path: relativePath, byteLength: bytes.length, sha256: digest(bytes) };
}

export function snapshotSourceRevisionG2({ root = process.cwd(), entityType, entityId, slug, authorId } = {}) {
  const paths = requiredSourcePathsG2({entityType, entityId, slug, authorId});
  const base = realpathSync(resolve(root));
  const files = paths.map(path => safeRead(base, path));
  const fingerprint = digest(Buffer.from(JSON.stringify({
    entityType, entityId, slug, authorId, files,
  }), "utf8"));
  return Object.freeze({
    schemaVersion: 1, kind: "pending-local-source-revision",
    entityType, entityId, slug, authorId, locale: "en",
    status: "pending-independent-review",
    files: Object.freeze(files.map(x => Object.freeze(x))),
    fingerprint, ...FLAGS,
  });
}

export function inspectSourceRevisionG2({ root = process.cwd(), manifest } = {}) {
  const errors = [];
  if (!exactly(manifest, ["schemaVersion","kind","entityType","entityId","slug","authorId",
    "locale","status","files","fingerprint",...Object.keys(FLAGS)]))
    return fail(["Invalid pending source revision manifest fields"]);
  if (manifest.schemaVersion !== 1 || manifest.kind !== "pending-local-source-revision" ||
      manifest.locale !== "en" || manifest.status !== "pending-independent-review")
    errors.push("Wrong contract, locale or pending state");
  for(const flag of Object.keys(FLAGS))
    if(manifest[flag] !== false) errors.push("Attempted approval injection: " + flag);
  let observation;
  try {
    observation = snapshotSourceRevisionG2({root,
      entityType: manifest.entityType, entityId: manifest.entityId,
      slug: manifest.slug, authorId: manifest.authorId});
  } catch(e) {
    errors.push("Cannot verify source files: " + e.message);
    return fail(errors);
  }
  if (!Array.isArray(manifest.files) || manifest.files.length !== observation.files.length)
    errors.push("Missing or additional source files");
  else for(let i = 0; i < observation.files.length; i++) {
    const claimed = manifest.files[i], actual = observation.files[i];
    if (!exactly(claimed, ["path","byteLength","sha256"]) ||
        claimed.path !== actual.path || claimed.byteLength !== actual.byteLength ||
        !HASH.test(claimed.sha256 || "") || claimed.sha256 !== actual.sha256)
      errors.push("Source bytes or manifest changed: " + actual.path);
  }
  if (!HASH.test(manifest.fingerprint || "") || manifest.fingerprint !== observation.fingerprint)
    errors.push("Overall source revision fingerprint mismatch");
  return Object.freeze({
    schemaVersion: 1, kind: "source-revision-integrity-only",
    ok: errors.length === 0, checked: observation.files.length,
    errors: Object.freeze(errors), ...FLAGS,
    note: "Verified ONLY local source bytes against a previously supplied manifest; no independent source/reviewer/rights approval.",
  });
}
