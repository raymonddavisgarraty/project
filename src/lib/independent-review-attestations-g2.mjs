// G2.4 — verify two independent offline attestations over one exact review subject.
// Detached Ed25519 verification is NOT publication, legal rights or source authenticity.
import { createPublicKey, verify } from "node:crypto";
import { canonicalJsonG2 } from "./pending-review-integrity-g2.mjs";

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA = /^[a-f0-9]{64}$/;
const UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const SIGNATURE = /^[A-Za-z0-9_-]{86}$/;
const ROLES = ["editorial", "rights"];
const SUBJECT_KEYS = ["contractVersion", "kind", "requestId", "entityType", "entityId",
  "locale", "canonicalPath", "contentRevisionSha256", "sourceRevisionSha256", "scope"];
const STATEMENT_KEYS = ["contractVersion", "kind", "subject", "role", "reviewerId",
  "keyId", "decision", "reviewedAt"];
const KEY_KEYS = ["keyId", "reviewerId", "role", "publicKeyPem", "active",
  "notBefore", "notAfter"];
const DENY = Object.freeze({
  editorialApproved: false, rightsApproved: false, indexabilityApproved: false,
  publicationApproved: false, publicExportApproved: false, autoPublish: false,
});
const record = v => v !== null && typeof v === "object" && !Array.isArray(v);
const exact = (v, keys) => record(v) && Object.keys(v).length === keys.length &&
  keys.every(k => Object.hasOwn(v, k));
const validTime = v => typeof v === "string" && UTC.test(v) &&
  Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 19) === v.slice(0, 19);
const fail = (errors, count = 0) => Object.freeze({
  schemaVersion: 1, kind: "offline-independent-attestation-check", ok: false,
  verifiedSignatures: count, errors: Object.freeze(errors), ...DENY,
});

function subjectValid(s) {
  if (!exact(s, SUBJECT_KEYS) || s.contractVersion !== 1 ||
      s.kind !== "seo-platform-release-review-subject" || !ID.test(s.requestId || "") ||
      !["game", "casino"].includes(s.entityType) || !ID.test(s.entityId || "") ||
      s.locale !== "en" || s.scope !== "public-information-review-only" ||
      !SHA.test(s.contentRevisionSha256 || "") || !SHA.test(s.sourceRevisionSha256 || "")) return false;
  const prefix = s.entityType === "game" ? "games" : "casinos";
  return typeof s.canonicalPath === "string" &&
    new RegExp("^/en/" + prefix + "/[a-z0-9]+(?:-[a-z0-9]+)*/$").test(s.canonicalPath);
}

// Signature input includes a distinct purpose prefix: a signature produced for
// any other product/protocol cannot silently become an editorial attestation.
export function reviewStatementBytesG2(statement) {
  if (!exact(statement, STATEMENT_KEYS) || !subjectValid(statement.subject) ||
      statement.contractVersion !== 1 || statement.kind !== "seo-platform-g2-review-attestation" ||
      !ROLES.includes(statement.role) || !ID.test(statement.reviewerId || "") ||
      !ID.test(statement.keyId || "") || statement.decision !== "approved-for-offline-review" ||
      !validTime(statement.reviewedAt))
    throw new Error("Invalid G2.4 signed review statement");
  return Buffer.from("SEO-PLATFORM:G2.4:REVIEW-ATTESTATION:V1\n" +
    canonicalJsonG2(statement), "utf8");
}

export function inspectIndependentReviewG2({
  subject, attestations = [], trustedKeys = [], revokedKeyIds = [], now = Date.now(),
} = {}) {
  const errors = [], usedReviewers = new Set(), usedKeys = new Set(), seenRoles = new Set();
  let verifiedSignatures = 0;
  if (!Number.isFinite(now) || !subjectValid(subject))
    return fail(["Invalid review subject or comparison time"]);
  if (!Array.isArray(attestations) || attestations.length !== 2 ||
      !Array.isArray(trustedKeys) || !Array.isArray(revokedKeyIds) ||
      revokedKeyIds.some(k => !ID.test(k || "")) ||
      new Set(revokedKeyIds).size !== revokedKeyIds.length)
    return fail(["Expected two attestations, external trust keys and valid revocations"]);
  const trust = new Map();
  for (const k of trustedKeys) {
    if (!exact(k, KEY_KEYS) || !ID.test(k.keyId || "") ||
        !ID.test(k.reviewerId || "") || !ROLES.includes(k.role) ||
        typeof k.publicKeyPem !== "string" || k.publicKeyPem.length > 2000 ||
        k.active !== true || !validTime(k.notBefore) || !validTime(k.notAfter) ||
        Date.parse(k.notBefore) > Date.parse(k.notAfter) || trust.has(k.keyId)) {
      errors.push("Untrusted, disabled or duplicate verifier key");
    } else trust.set(k.keyId, k);
  }
  const revoked = new Set(revokedKeyIds);
  for (const a of attestations) {
    if (!exact(a, ["statement", "signature"]) || !exact(a.statement, STATEMENT_KEYS)) {
      errors.push("Malformed attestation envelope"); continue;
    }
    const s = a.statement;
    if (!ROLES.includes(s.role) || seenRoles.has(s.role))
      errors.push("Missing or duplicate independent review role");
    seenRoles.add(s.role);
    if (!ID.test(s.reviewerId || "") || usedReviewers.has(s.reviewerId))
      errors.push("Both reviews must come from distinct trusted people");
    usedReviewers.add(s.reviewerId);
    if (!ID.test(s.keyId || "") || usedKeys.has(s.keyId))
      errors.push("Both reviews must use distinct keys");
    usedKeys.add(s.keyId);
    let bytes;
    try {
      bytes = reviewStatementBytesG2(s);
      if (canonicalJsonG2(s.subject) !== canonicalJsonG2(subject))
        errors.push("Signed subject differs from requested exact revision");
    } catch (e) { errors.push("Invalid signed statement: " + e.message); continue; }
    if (Date.parse(s.reviewedAt) > now) errors.push("Review timestamp is in the future");
    const key = trust.get(s.keyId);
    if (!key || key.reviewerId !== s.reviewerId || key.role !== s.role ||
        revoked.has(s.keyId) ||
        Date.parse(s.reviewedAt) < Date.parse(key?.notBefore) ||
        now > Date.parse(key?.notAfter)) {
      errors.push("Reviewer/key authorization absent, revoked or expired"); continue;
    }
    if (typeof a.signature !== "string" || !SIGNATURE.test(a.signature)) {
      errors.push("Invalid detached signature encoding"); continue;
    }
    try {
      const sig = Buffer.from(a.signature, "base64url");
      const pub = createPublicKey(key.publicKeyPem);
      if (pub.asymmetricKeyType !== "ed25519" || sig.length !== 64 ||
          !verify(null, bytes, pub, sig)) {
        errors.push("Ed25519 signature check failed"); continue;
      }
      verifiedSignatures++;
    } catch { errors.push("Invalid trusted public key or signature"); }
  }
  if (seenRoles.size !== 2 || !ROLES.every(x => seenRoles.has(x)))
    errors.push("Editorial and rights attestations are both required");
  if (verifiedSignatures !== 2) errors.push("Two valid independent signatures required");
  return Object.freeze({
    schemaVersion: 1, kind: "offline-independent-attestation-check",
    ok: errors.length === 0, verifiedSignatures, errors: Object.freeze(errors),
    ...DENY,
    note: "Cryptographic identity checks alone cannot approve a release, verify source authenticity, legal rights or market permissions.",
  });
}
