// Stage 45.4: build a single stylesheet without changing CSS authoring modules.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve("src/assets/css");
const entry = path.join(root, "main.css");
const imports = /^[ \t]*@import\s+url\(["'](\.[^"']+\.css)["']\)\s*;[ \t]*\r?\n?/gm;

export function renderStylesheet454(file = entry) {
  const active = new Set();
  const collected = [];
  function include(input) {
    const full = path.resolve(input);
    if (!full.startsWith(root + path.sep)) {
      throw new Error("Stage 45.4: CSS import escapes src/assets/css: " + full);
    }
    if (active.has(full)) {
      throw new Error("Stage 45.4: circular CSS import: " + full);
    }
    active.add(full);
    const css = readFileSync(full, "utf8");
    let cursor = 0;
    let flattened = "";
    for (const match of css.matchAll(imports)) {
      flattened += css.slice(cursor, match.index);
      flattened += include(path.resolve(path.dirname(full), match[1]));
      cursor = match.index + match[0].length;
    }
    flattened += css.slice(cursor);
    if (/@import\b/.test(flattened)) {
      throw new Error("Stage 45.4: unsupported @import statement in " + full);
    }
    if (/url\(\s*["']?\.(?:\.?\/)/.test(flattened)) {
      throw new Error("Stage 45.4: relative CSS url() needs rebasing in " + full);
    }
    collected.push(path.relative(root, full).replaceAll(path.sep, "/"));
    active.delete(full);
    return flattened;
  }
  const stylesheet = "/* Auto-generated. Edit src/assets/css modules; not the bundle. */\n" + include(file);
  return { stylesheet, sourcePaths: collected };
}

export function writeStylesheet454(outputDir = "_site") {
  const { stylesheet, sourcePaths } = renderStylesheet454();
  const output = path.join(outputDir, "assets/css/site-bundle.css");
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, stylesheet, "utf8");
  return { output, sourcePaths, bytes: Buffer.byteLength(stylesheet) };
}
