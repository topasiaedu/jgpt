import { NextResponse, type NextRequest } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/supabase/safeNextPath";
import { readSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * PKCE code exchange for Supabase email links (recovery, confirm, magic link).
 * redirectTo should point here, e.g. /auth/callback?next=/auth/reset
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url: URL = new URL(request.url);
  const code: string | null = url.searchParams.get("code");
  const nextPath: string = safeNextPath(url.searchParams.get("next"));
  const origin: string = resolveRequestOrigin(request);

  if (readSupabasePublicEnv() === null) {
    return NextResponse.redirect(`${origin}/auth?error=env`);
  }

  if (code !== null && code.length > 0) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error === null) {
      return NextResponse.redirect(`${origin}${nextPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?mode=forgot&error=link`);
}

/**
 * Prefer the public origin behind a proxy; fall back to the request URL origin.
 */
function resolveRequestOrigin(request: NextRequest): string {
  const forwardedHost: string | null = request.headers.get("x-forwarded-host");
  const forwardedProto: string | null = request.headers.get("x-forwarded-proto");
  if (
    process.env.NODE_ENV !== "development" &&
    forwardedHost !== null &&
    forwardedHost.length > 0
  ) {
    const proto: string =
      forwardedProto !== null && forwardedProto.length > 0 ? forwardedProto : "https";
    return `${proto}://${forwardedHost}`;
  }
  return new URL(request.url).origin;
}
