import type { NextConfig } from "next";

/**
 * Jeff IP test app under apps/web. Teaching assets are copied into content/jeff
 * at prebuild for Vercel serverless, so tracing stays inside this app directory.
 * Never watch or trace raw/ (tens of GB under the monorepo).
 *
 * Prefer `npm run dev` (webpack). Never use Turbopack / `dev:turbo` as default.
 */
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

/** Globs relative to apps/web (this next.config). Route keys match App Router paths. */
const TEACHING_INCLUDES: string[] = ["./content/jeff/**/*"];

const nextConfig: NextConfig = {
  // Default tracing root = apps/web so serverless cwd + content/jeff line up on Vercel.
  // prebuild sync makes monorepo parent paths unnecessary at runtime.
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
