#!/usr/bin/env node
/**
 * Copies jeff-wiki, jeff-graph, and schema/voice into apps/web/content/jeff
 * for Vercel serverless file tracing. Prefer reading content/jeff at runtime so
 * the deployment does not depend on fragile parent-directory filesystem access.
 *
 * Run via: npm run sync:jeff  (also hooked as prebuild)
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
 * Recursively copies a directory tree after validating the source exists.
 */
function copyTree(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Missing teaching source: ${src}`);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

fs.rmSync(destRoot, { recursive: true, force: true });
fs.mkdirSync(destRoot, { recursive: true });

for (const entry of REQUIRED) {
  copyTree(entry.src, entry.dest);
}

const nodesPath = path.join(destRoot, "jeff-graph", "nodes.json");
const wikiPath = path.join(destRoot, "jeff-wiki");
const soundProfilePath = path.join(destRoot, "voice", "sound-profile.md");
if (!fs.existsSync(nodesPath) || !fs.existsSync(wikiPath) || !fs.existsSync(soundProfilePath)) {
  throw new Error("sync-jeff-content failed: content/jeff is incomplete after copy.");
}

console.log(`Synced teaching assets → ${path.relative(appRoot, destRoot)}`);
