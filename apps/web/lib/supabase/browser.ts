import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Browser / Client Component Supabase client (cookie session via @supabase/ssr).
 * Safe to call repeatedly; createBrowserClient uses a singleton under the hood.
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  const { url, anonKey } = requireSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
}
