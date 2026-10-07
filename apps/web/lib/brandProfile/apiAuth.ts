/**
 * Session helpers for Brand profile API routes (RLS + auth.uid()).
 */

import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { readSupabasePublicEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ApiErrorBody = {
  error: string;
};

export type AuthedApiContext = {
  supabase: SupabaseClient;
  user: User;
};

/**
 * JSON error helper with a consistent { error } body.
 */
export function jsonError(
  status: number,
  error: string,
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error }, { status });
}

/**
 * Requires configured Supabase env + a signed-in user.
 * Surfaces clear 503 / 401 messages for missing env or session.
 */
export async function requireAuthedApi(): Promise<
  | { ok: true; ctx: AuthedApiContext }
  | { ok: false; response: NextResponse<ApiErrorBody> }
> {
  if (readSupabasePublicEnv() === null) {
    return {
      ok: false,
      response: jsonError(
        503,
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/web/.env.local.",
      ),
    };
  }

  let supabase: SupabaseClient;
  try {
    supabase = await createServerSupabaseClient();
  } catch (error) {
    const message: string =
      error instanceof Error
        ? error.message
        : "Could not create Supabase server client.";
    return { ok: false, response: jsonError(503, message) };
  }

  const { data, error } = await supabase.auth.getUser();
  if (error !== null || data.user === null) {
    return {
      ok: false,
      response: jsonError(401, "Sign in required. Open /auth to continue."),
    };
  }

  return { ok: true, ctx: { supabase, user: data.user } };
}
