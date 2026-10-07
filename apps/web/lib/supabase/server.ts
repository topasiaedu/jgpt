import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { requireSupabasePublicEnv } from "@/lib/supabase/env";

type CookieToSet = {
  name: string;
  value: string;
  options: {
    path?: string;
    domain?: string;
    maxAge?: number;
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: boolean | "lax" | "strict" | "none";
  };
};

/**
 * Server Components, Server Actions, and Route Handlers Supabase client.
 * Cookie writes may no-op in pure Server Components; middleware refreshes the session.
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  const { url, anonKey } = requireSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[], _headers: Record<string, string>) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component where cookies are read-only.
          // Middleware updateSession keeps the auth cookie fresh.
        }
      },
    },
  });
}
