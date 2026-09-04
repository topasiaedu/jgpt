import type { NextConfig } from "next";
import path from "path";

/**
 * Jeff IP test app under apps/web. Monorepo root is two levels up and holds
 * jeff-wiki / jeff-graph / schema. Never watch or trace raw/ (tens of GB).
 *
 * Teaching assets are copied into content/jeff at prebuild for Vercel serverless.
 * Prefer `npm run dev` (webpack). Never use Turbopack / `dev:turbo` as default.
 */
const monorepoRoot: string = path.join(__dirname, "../..");

const IGNORED_WATCH_GLOBS: string[] = [
  "**/node_modules/**",
  "**/.git/**",
  "**/.next/**",
  "**/raw/**",
  "**/dev-wiki/**",
  "**/dev-graph/**",
];

const TRACING_EXCLUDES: string[] = [
  "raw/**",
  "**/raw/**",
  "node_modules/**",
  ".git/**",
  "dev-wiki/**",
  "**/dev-wiki/**",
  "dev-graph/**",
  "**/dev-graph/**",
];

const TEACHING_INCLUDES: string[] = [
  "./content/jeff/**/*",
  "content/jeff/**/*",
];

const nextConfig: NextConfig = {
  // Keep tracing root at monorepo so parent assets remain reachable if needed,
  // but runtime prefers content/jeff (copied at prebuild). Exclude raw/.
  outputFileTracingRoot: monorepoRoot,
  outputFileTracingIncludes: {
    "/api/**": TEACHING_INCLUDES,
    "/*": TEACHING_INCLUDES,
  },
  outputFileTracingExcludes: {
    "*": TRACING_EXCLUDES,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Next may supply empty strings in watchOptions.ignored; webpack rejects them.
      config.watchOptions = {
        ...config.watchOptions,
        ignored: IGNORED_WATCH_GLOBS,
      };
    }
    return config;
  },
};

export default nextConfig;
