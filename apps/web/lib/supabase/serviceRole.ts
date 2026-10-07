/**
 * Server-only Supabase client using the service role key.
 * Bypasses RLS; callers must verify ownership before use.
 * Never import from client components.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseServiceRoleEnv } from "@/lib/supabase/env";

/**
 * Creates a privileged Supabase client for Brand asset ingest jobs.
 */
export function createServiceRoleSupabaseClient(): SupabaseClient {
  const { url, serviceRoleKey } = requireSupabaseServiceRoleEnv();
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
