/**
 * Shared Supabase public env resolution for browser, server, and middleware clients.
 * Never put SUPABASE_SERVICE_ROLE_KEY behind NEXT_PUBLIC_*.
 */

export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

export type SupabaseServiceRoleEnv = {
  url: string;
  serviceRoleKey: string;
};

/**
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Returns null when either value is missing so callers can soft-skip (middleware).
 */
export function readSupabasePublicEnv(): SupabasePublicEnv | null {
  const urlRaw: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKeyRaw: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (typeof urlRaw !== "string" || typeof anonKeyRaw !== "string") {
    return null;
  }

  const url: string = urlRaw.trim();
  const anonKey: string = anonKeyRaw.trim();
  if (url.length === 0 || anonKey.length === 0) {
    return null;
  }

  return { url, anonKey };
}

/**
 * Same as readSupabasePublicEnv, but throws when env is incomplete.
 * Use from browser/server helpers that require a configured project.
 */
export function requireSupabasePublicEnv(): SupabasePublicEnv {
  const env: SupabasePublicEnv | null = readSupabasePublicEnv();
  if (env === null) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy apps/web/.env.example to .env.local.",
    );
  }
  return env;
}

/**
 * Server-only service role credentials for Brand asset ingest jobs.
 * Returns null when unset so routes can fall back to the user session client.
 */
export function readSupabaseServiceRoleEnv(): SupabaseServiceRoleEnv | null {
  const publicEnv: SupabasePublicEnv | null = readSupabasePublicEnv();
  const keyRaw: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (publicEnv === null || typeof keyRaw !== "string") {
    return null;
  }
  const serviceRoleKey: string = keyRaw.trim();
  if (serviceRoleKey.length === 0) {
    return null;
  }
  return { url: publicEnv.url, serviceRoleKey };
}

/**
 * Requires SUPABASE_SERVICE_ROLE_KEY for privileged ingest writes.
 */
export function requireSupabaseServiceRoleEnv(): SupabaseServiceRoleEnv {
  const env: SupabaseServiceRoleEnv | null = readSupabaseServiceRoleEnv();
  if (env === null) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Set it in apps/web/.env.local for Brand document ingest (server-only).",
    );
  }
  return env;
}
