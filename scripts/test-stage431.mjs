import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildRemediationQueue431, renderQueueMarkdown431 } from "../src/lib/editorial431.mjs";
import { createQueue431, writeQueue431, parseArgs431 } from "./run-stage431.mjs";

const research = JSON.parse(readFileSync(new URL("../research/evidence-leads/sweet-bonanza-original.json", import.meta.url), "utf8"));
assert.equal(research.status, "research-leads-only");
assert.equal(research.approvalGranted, false);
assert.equal(research.autoPublish, false);
assert(research.sources.every(s => s.reviewStatus === "candidate-needs-human-check"));
assert(research.sources.every(s => new URL(s.url).hostname === "www.pragmaticplay.com"));
const conflict = research.claims.find(c => c.field === "maxWinMultiplier");
assert.equal(conflict.projectValue, 21100);
assert.equal(conflict.candidateValue, 21175);
assert.equal(conflict.assessment, "potential-conflict");
assert.equal(research.claims.find(c => c.field === "rtp").candidateValue, null);

const audit = {
  schemaVersion: 1, auditedAt: "2026-10-29T12:00:00.000Z",
  counts: { blockers: 8 },
  blockers: [
    { type: "game", id: "sweet-bonanza", field: "maxWinMultiplier", codes: ["evidence-not-approved"] },
    { type: "game", id: "sweet-bonanza", field: "rtp", codes: ["evidence-not-approved"] },
    { type: "game", id: "sweet-bonanza", field: "editorialReview", codes: ["editorial-review-not-approved"] },
    { type: "game", id: "sweet-bonanza", field: "sourceStatus", codes: ["legacy-or-unverified-facts"] },
    { type: "casino", id: "casino-a", field: "license", codes: ["evidence-not-approved"] },
    { type: "casino", id: "casino-a", field: "bonus", codes: ["time-sensitive-evidence-expired"] },
    { type: "game", id: "other-game", field: "ratingMethodology", codes: ["rating-methodology-unapproved"] },
    { type: "author", id: "review-team", field: "reviewsCount", codes: ["evidence-not-approved"] },
  ],
};
const original = JSON.stringify(audit);
const queue = createQueue431({ audit, pilot: research });
assert.equal(queue.counts.sourceBlockers, 8);
assert.equal(queue.tasks.length, 8);
assert.equal(queue.counts.scopedTasks, 8);
assert.equal(queue.counts.byPriority.P0, 8);
assert.equal(queue.autoApprove, false);
assert.equal(queue.autoPublish, false);
assert.equal(queue.releaseAllowed, false);
assert(queue.tasks.every(t => t.status === "needs-human-review" && t.autoApprove === false));
assert.equal(JSON.stringify(audit), original, "Queue must never mutate the Stage 43 audit");
const win = queue.tasks.find(t => t.taskId === "game:sweet-bonanza:maxWinMultiplier");
assert.equal(win.researchLead?.assessment, "potential-conflict");
assert.equal(win.researchLead?.candidateValue, 21175);
assert.equal(queue.tasks.find(t => t.taskId === "game:sweet-bonanza:rtp").researchLead.candidateValue, null);
assert.equal(queue.tasks.find(t => t.taskId === "casino:casino-a:license").researchLead, null);
assert.equal(queue.tasks[0].priority, "P0");
const scoped = buildRemediationQueue431(audit, { pilot: research, entity: "game:sweet-bonanza" });
assert.equal(scoped.tasks.length, 4);
assert(scoped.tasks.every(t => t.entityType === "game" && t.entityId === "sweet-bonanza"));
assert.throws(() => buildRemediationQueue431(audit, { pilot: research, entity: "game:unknown" }), /No pending blockers/);
assert.throws(() => buildRemediationQueue431(audit, { pilot: research, entity: "../src" }), /Entity filter/);
assert.throws(() => buildRemediationQueue431({ ...audit, blockers: [audit.blockers[0], audit.blockers[0]] }), /Duplicate blocker/);
const md = renderQueueMarkdown431(queue);
assert(md.startsWith("# Stage 43.1"));
assert(md.includes("8 / 8 audit blockers"));
assert(md.includes("maxWinMultiplier"));
assert(!md.includes("approved for publication"));
assert.deepEqual(parseArgs431(["--json", "--entity=game:sweet-bonanza"]),
  { format: "json", entity: "game:sweet-bonanza", filename: null });
assert.throws(() => parseArgs431(["--approve"]), /Unknown argument/);

const out = mkdtempSync(join(tmpdir(), "stage431-"));
try {
  const exported = writeQueue431({ queue, outputRoot: out, filename: "workqueue.json" });
  assert(existsSync(exported.path));
  assert.equal(JSON.parse(readFileSync(exported.path, "utf8")).tasks.length, 8);
  assert.throws(() => writeQueue431({ queue, outputRoot: out, filename: "workqueue.json" }), /EEXIST/);
  assert.throws(() => writeQueue431({ queue, outputRoot: out, filename: "..\\out.json" }), /forbidden/);
  assert.throws(() => writeQueue431({ queue, outputRoot: out, filename: "../out.json" }), /forbidden/);
  assert.throws(() => writeQueue431({ queue, outputRoot: out, filename: "out.md", format: "json" }), /extension/);
  const exportedMd = writeQueue431({ queue: scoped, outputRoot: out, filename: "pilot.md", format: "markdown" });
  assert(readFileSync(exportedMd.path, "utf8").includes("4 / 8 audit blockers"));
} finally { rmSync(out, { recursive: true, force: true }); }

const currentQueue = createQueue431();
assert.equal(currentQueue.counts.scopedTasks, currentQueue.counts.sourceBlockers);
assert.equal(currentQueue.tasks.length, new Set(currentQueue.tasks.map(t => t.taskId)).size);
assert.equal(currentQueue.releaseAllowed, false);
assert(currentQueue.tasks.every(t => t.autoApprove === false && t.autoPublish === false));
console.log("Stage 43.1 tests OK (priority, evidence leads, current audit coverage, scoped queue, create-only exports).");
