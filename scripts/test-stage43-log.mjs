import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { recordAuditEvent43 } from "./editorial43-log.mjs";

const folder = mkdtempSync(join(tmpdir(), "stage43-audit-log-"));
const base = {
  directory: folder,
  entityType: "game",
  entityId: "sweet-bonanza",
  reviewerId: "test-editor",
  action: "source-researched",
  note: "Reviewed a source candidate; no approval granted.",
  sourceUrls: ["https://provider.example.org/reference"],
  eventId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  recordedAt: "2026-10-29T12:00:00Z",
};
try {
  const result = recordAuditEvent43(base);
  const stored = JSON.parse(readFileSync(result.file, "utf8"));
  assert.equal(stored.approvalGranted, false);
  assert.equal(stored.publicationApproved, false);
  assert.equal(stored.entityId, "sweet-bonanza");
  assert.equal(result.sha256.length, 64);
  assert.throws(() => recordAuditEvent43(base), /EEXIST/);
  assert.throws(() => recordAuditEvent43({ ...base, reviewerId: "../escape" }), /Invalid/);
  assert.throws(() => recordAuditEvent43({ ...base, sourceUrls: ["http://unsafe.example.org"] }), /HTTPS/);
  console.log("Stage 43 log tests OK (explicit note, exclusive create, no approval changes).");
} finally {
  rmSync(folder, { recursive: true, force: true });
}
