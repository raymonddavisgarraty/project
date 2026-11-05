import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { auditCurrentRepository43 } from "./editorial43.mjs";
import { buildRemediationQueue431, renderQueueMarkdown431 } from "../src/lib/editorial431.mjs";

const DEFAULT_OUTPUT_ROOT = "data/editorial/reports/stage431";
const PILOT_FILE = new URL("../research/evidence-leads/sweet-bonanza-original.json", import.meta.url);

export function createQueue431({
  audit = auditCurrentRepository43(),
  pilot = JSON.parse(readFileSync(PILOT_FILE, "utf8")),
  entity = null,
} = {}) {
  return buildRemediationQueue431(audit, { pilot, entity });
}

// Only explicit user invocation writes a report. Never overwrite a prior export.
export function writeQueue431({ queue, filename, format = "json", outputRoot = DEFAULT_OUTPUT_ROOT } = {}) {
  if (!queue?.tasks || !["json","markdown"].includes(format)) throw new Error("Invalid queue or export format");
  const extension = format === "json" ? ".json" : ".md";
  if (typeof filename !== "string" || filename !== basename(filename) ||
      !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,100}\.(json|md)$/.test(filename) || !filename.endsWith(extension)) {
    throw new Error("Use a simple output filename with the selected extension; path traversal is forbidden");
  }
  const root = resolve(outputRoot);
  mkdirSync(root, { recursive: true });
  const path = join(root, filename);
  const body = format === "json" ? JSON.stringify(queue, null, 2) + "\n" : renderQueueMarkdown431(queue);
  writeFileSync(path, body, { flag: "wx" });
  return { path, format, taskCount: queue.tasks.length, approvalGranted: false, autoPublish: false };
}
export function parseArgs431(args) {
  const result = { entity: null, format: "summary", filename: null };
  for (const arg of args) {
    if (arg === "--json") result.format = "json";
    else if (arg === "--markdown") result.format = "markdown";
    else if (arg.startsWith("--entity=")) result.entity = arg.slice(9);
    else if (arg.startsWith("--write=")) result.filename = arg.slice(8);
    else if (arg === "--help") result.help = true;
    else throw new Error("Unknown argument: " + arg);
  }
  return result;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const options = parseArgs431(process.argv.slice(2));
  if (options.help) {
    console.log("Usage: node scripts/run-stage431.mjs [--entity=game:sweet-bonanza] [--json|--markdown] [--write=filename.json|filename.md]");
  } else {
    const queue = createQueue431({ entity: options.entity });
    if (options.filename) {
      const format = options.format === "markdown" ? "markdown" : "json";
      console.log(JSON.stringify(writeQueue431({ queue, filename: options.filename, format }), null, 2));
    } else if (options.format === "json") {
      console.log(JSON.stringify(queue, null, 2));
    } else if (options.format === "markdown") {
      console.log(renderQueueMarkdown431(queue));
    } else {
      console.log(JSON.stringify({
        scope: queue.scope, ...queue.counts,
        productionReleaseAllowed: false,
        nextTasks: queue.tasks.slice(0, 15).map(({ taskId, priority, workstream, recommendedAction, researchLead }) =>
          ({ taskId, priority, workstream, recommendedAction, researchLead })),
        remainingTasks: Math.max(0, queue.tasks.length - 15),
        caveat: queue.caveat,
      }, null, 2));
    }
  }
}
