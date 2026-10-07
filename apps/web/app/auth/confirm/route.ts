import { NextResponse, type NextRequest } from "next/server";

import { parseEmailOtpType } from "@/lib/supabase/emailOtpType";
import { readSupabasePublicEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/supabase/safeNextPath";

/**
 * Token-hash exchange for custom Supabase email templates
 * (e.g. {{ .SiteURL }}/auth/confirm?token_hash=...&type=recovery&next=/auth/reset).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url: URL = new URL(request.url);
  const tokenHash: string | null = url.searchParams.get("token_hash");
  const otpType = parseEmailOtpType(url.searchParams.get("type"));
  const nextPath: string = safeNextPath(url.searchParams.get("next"));
  const origin: string = resolveRequestOrigin(request);

  if (readSupabasePublicEnv() === null) {
    return NextResponse.redirect(`${origin}/auth?error=env`);
  }

  if (tokenHash !== null && tokenHash.length > 0 && otpType !== null) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    });
    if (error === null) {
      return NextResponse.redirect(`${origin}${nextPath}`);
    }
  }

  const failPath: string =
    otpType === "recovery" ? "/auth?mode=forgot&error=link" : "/auth?error=link";
  return NextResponse.redirect(`${origin}${failPath}`);
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
