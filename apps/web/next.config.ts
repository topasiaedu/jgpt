import type { NextConfig } from "next";
import path from "path";

/**
 * Jeff IP test app under apps/web. Teaching assets live in content/jeff
 * (synced at prebuild and committed for self-contained Vercel deploys).
 * Never watch or trace raw/ (tens of GB under the monorepo).
 *
 * Prefer `npm run dev` (webpack). Never use Turbopack / `dev:turbo` as default.
 *
 * CRITICAL: do NOT exclude node_modules from outputFileTracingExcludes.
 * That strips next/react from the serverless function and yields MODULE_NOT_FOUND
 * HTML 500s on /api/chat (x-matched-path: /500).
 */
const IGNORED_WATCH_GLOBS: string[] = [
  "**/node_modules/**",
  "**/.git/**",
  "**/.next/**",
  "**/raw/**",
  "**/dev-wiki/**",
  "**/dev-graph/**",
];

/** Bulk monorepo trees only. Never list node_modules here. */
const TRACING_EXCLUDES: string[] = [
  "raw/**",
  "**/raw/**",
  ".git/**",
  "dev-wiki/**",
  "**/dev-wiki/**",
  "dev-graph/**",
  "**/dev-graph/**",
];

/** Globs relative to apps/web (this next.config). Route keys match App Router paths. */
const TEACHING_INCLUDES: string[] = ["./content/jeff/**/*"];

const nextConfig: NextConfig = {
  // Pin tracing to this app so serverless paths stay under apps/web on Vercel.
  outputFileTracingRoot: path.join(__dirname),
  outputFileTracingIncludes: {
    "/api/chat": TEACHING_INCLUDES,
  },
  outputFileTracingExcludes: {
    "/api/chat": TRACING_EXCLUDES,
    "/*": TRACING_EXCLUDES,
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
