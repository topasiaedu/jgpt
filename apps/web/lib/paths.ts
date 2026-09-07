import fs from "fs";
import path from "path";

/**
 * Resolves the teaching root that holds jeff-wiki / jeff-graph.
 * Prefer apps/web/content/jeff (copied at build for Vercel serverless).
 * Fall back to the monorepo root for local probe/dev before sync.
 *
 * On Vercel, process.cwd() may be the lambda root (/var/task) while NFT
 * files live under apps/web/content/jeff when outputFileTracingRoot is the
 * monorepo. Search both layouts plus several __dirname depths for bundled routes.
 */
export function getTeachingRoot(): string {
  const cwd: string = process.cwd();
  const candidates: string[] = [
    path.join(cwd, "content", "jeff"),
    path.resolve(cwd, "content", "jeff"),
    path.join(cwd, "apps", "web", "content", "jeff"),
    path.resolve(__dirname, "../content/jeff"),
    path.resolve(__dirname, "../../content/jeff"),
    path.resolve(__dirname, "../../../content/jeff"),
    path.resolve(__dirname, "../../../../content/jeff"),
    path.resolve(__dirname, "../../../../../content/jeff"),
    path.resolve(__dirname, "../../../../../../content/jeff"),
    cwd,
    path.resolve(cwd, "../.."),
    path.resolve(cwd, ".."),
    path.resolve(__dirname, "../../.."),
  ];

  for (const candidate of candidates) {
    const graphPath: string = path.join(candidate, "jeff-graph", "nodes.json");
    const wikiPath: string = path.join(candidate, "jeff-wiki");
    if (fs.existsSync(graphPath) && fs.existsSync(wikiPath)) {
      return path.resolve(candidate);
    }
  }

  throw new Error(
    "Could not locate teaching root (expected jeff-graph/nodes.json and jeff-wiki/). Run npm run sync:jeff from apps/web.",
  );
}

/**
 * Absolute path under the teaching root (content/jeff or monorepo).
 */
export function monorepoPath(...segments: string[]): string {
  return path.join(getTeachingRoot(), ...segments);
}

/**
 * Resolves a schema/voice markdown file for the system prompt.
 * Prefer content/jeff/voice (copied at prebuild). Fall back to monorepo
 * schema/voice for local dev before sync.
 */
export function resolveVoiceFile(fileName: string): string | null {
  if (typeof fileName !== "string" || fileName.trim().length === 0) {
    return null;
  }

  const safeName: string = fileName.trim().replace(/\\/g, "/");
  if (safeName.includes("..") || safeName.includes("/")) {
    return null;
  }
  if (!safeName.endsWith(".md")) {
    return null;
  }

  const cwd: string = process.cwd();
  const candidates: string[] = [
    path.join(cwd, "content", "jeff", "voice", safeName),
    path.join(cwd, "apps", "web", "content", "jeff", "voice", safeName),
    path.resolve(__dirname, "../content/jeff/voice", safeName),
    path.resolve(__dirname, "../../content/jeff/voice", safeName),
    path.resolve(__dirname, "../../../content/jeff/voice", safeName),
    path.resolve(__dirname, "../../../../content/jeff/voice", safeName),
    path.resolve(__dirname, "../../../../../content/jeff/voice", safeName),
    path.resolve(cwd, "../../schema/voice", safeName),
    path.resolve(cwd, "../schema/voice", safeName),
    path.resolve(cwd, "schema/voice", safeName),
    path.resolve(__dirname, "../../../schema/voice", safeName),
  ];

  try {
    const teachingRoot: string = getTeachingRoot();
    candidates.unshift(path.join(teachingRoot, "voice", safeName));
  } catch {
    // Teaching root may be missing in odd test shells; still try schema fallbacks.
  }

  for (const candidate of candidates) {
    const resolved: string = path.resolve(candidate);
    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
      return resolved;
    }
  }

  return null;
}

/**
 * True when a relative or absolute path is forbidden for teaching doctrine.
 * Blocks Dev wiki/graph and public scrape captures.
 */
export function isForbiddenDoctrinePath(relativeOrAbsolute: string): boolean {
  const normalized: string = relativeOrAbsolute.replace(/\\/g, "/").toLowerCase();
  return (
    normalized.includes("dev-wiki/") ||
    normalized.includes("/dev-wiki") ||
    normalized.endsWith("dev-wiki") ||
    normalized.includes("dev-graph/") ||
    normalized.includes("/dev-graph") ||
    normalized.endsWith("dev-graph") ||
    normalized.includes("raw/jeff/public")
  );
}

/**
 * Allow only jeff-wiki markdown paths for evidence page loads.
 * Returns a resolved absolute path, or null if unsafe / missing.
 */
export function resolveJeffWikiFile(wikiRelativePath: string): string | null {
  if (typeof wikiRelativePath !== "string" || wikiRelativePath.trim().length === 0) {
    return null;
  }

  const trimmed: string = wikiRelativePath.trim().replace(/\\/g, "/");
  if (isForbiddenDoctrinePath(trimmed)) {
    return null;
  }
  if (!trimmed.startsWith("jeff-wiki/")) {
    return null;
  }
  if (trimmed.includes("..")) {
    return null;
  }

  const absolute: string = monorepoPath(...trimmed.split("/"));
  const wikiRoot: string = monorepoPath("jeff-wiki");
  const resolved: string = path.resolve(absolute);
  const wikiRootResolved: string = path.resolve(wikiRoot);
  if (!resolved.startsWith(wikiRootResolved + path.sep) && resolved !== wikiRootResolved) {
    return null;
  }
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    return null;
  }
  return resolved;
}
