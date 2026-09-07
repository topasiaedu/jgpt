#!/usr/bin/env node
/**
 * Copies jeff-wiki, jeff-graph, and schema/voice into apps/web/content/jeff
 * for Vercel serverless file tracing. Prefer reading content/jeff at runtime so
 * the deployment does not depend on fragile parent-directory filesystem access.
 *
 * Run via: npm run sync:jeff  (also hooked as prebuild)
 *
 * If monorepo parents are missing (Root Directory = apps/web without outside
 * includes) but a complete committed content/jeff already exists, keep it and
 * succeed so Vercel stays self-contained.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, "..");
const monorepoRoot = path.resolve(appRoot, "../..");
const destRoot = path.join(appRoot, "content", "jeff");

const REQUIRED = [
  { src: path.join(monorepoRoot, "jeff-wiki"), dest: path.join(destRoot, "jeff-wiki") },
  { src: path.join(monorepoRoot, "jeff-graph"), dest: path.join(destRoot, "jeff-graph") },
  { src: path.join(monorepoRoot, "schema", "voice"), dest: path.join(destRoot, "voice") },
];

/**
 * True when content/jeff already has the files runtime needs.
 */
function isDestComplete() {
  const nodesPath = path.join(destRoot, "jeff-graph", "nodes.json");
  const wikiPath = path.join(destRoot, "jeff-wiki");
  const soundProfilePath = path.join(destRoot, "voice", "sound-profile.md");
  return fs.existsSync(nodesPath) && fs.existsSync(wikiPath) && fs.existsSync(soundProfilePath);
}

/**
 * Recursively copies a directory tree after validating the source exists.
 */
function copyTree(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Missing teaching source: ${src}`);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

const missingSources = REQUIRED.filter((entry) => !fs.existsSync(entry.src));
if (missingSources.length > 0) {
  if (isDestComplete()) {
    console.log(
      `sync-jeff-content: monorepo sources missing; using committed ${path.relative(appRoot, destRoot)}`,
    );
    process.exit(0);
  }
  const missingList = missingSources.map((entry) => entry.src).join(", ");
  throw new Error(
    `Missing teaching source(s): ${missingList}. Commit apps/web/content/jeff or enable Include files outside Root Directory.`,
  );
}

fs.rmSync(destRoot, { recursive: true, force: true });
fs.mkdirSync(destRoot, { recursive: true });

for (const entry of REQUIRED) {
  copyTree(entry.src, entry.dest);
}

if (!isDestComplete()) {
  throw new Error("sync-jeff-content failed: content/jeff is incomplete after copy.");
}

console.log(`Synced teaching assets → ${path.relative(appRoot, destRoot)}`);
