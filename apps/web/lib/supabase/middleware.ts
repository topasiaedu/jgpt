import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { readSupabasePublicEnv } from "@/lib/supabase/env";

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
 * Refreshes the Supabase Auth session cookie on each matched request.
 * When public Supabase env is unset, passes the request through unchanged
 * so existing routes keep working before Brand profiles env is configured.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const env = readSupabasePublicEnv();
  if (env === null) {
    return NextResponse.next({ request });
  }

  let supabaseResponse: NextResponse = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[], headers: Record<string, string>) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers)) {
          supabaseResponse.headers.set(key, value);
        }
      },
    },
  });

  // Validates / refreshes the JWT before Server Components read the session.
  // Do not insert logic between createServerClient and getClaims.
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const signedIn: boolean = isSignedInFromClaims(claimsData, claimsError);

  const pathname: string = request.nextUrl.pathname;
  // Gate only: AuthPageClient ignores `next` and always leaves to `/`.
  if (!signedIn && isUnsignedAuthRedirectPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("next", pathname);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    for (const { name, value } of supabaseResponse.cookies.getAll()) {
      redirectResponse.cookies.set(name, value);
    }
    return redirectResponse;
  }

  return supabaseResponse;
}

/**
 * Home and All Tools stay behind /auth for unsigned visitors.
 * /auth itself is excluded so sign-in cannot loop.
 */
function isUnsignedAuthRedirectPath(pathname: string): boolean {
  return pathname === "/" || pathname === "/tools";
}

/**
 * True when getClaims returned a JWT payload and no auth error.
 */
function isSignedInFromClaims(
  claimsData: { claims: object } | null,
  claimsError: { message: string } | null,
): boolean {
  if (claimsError !== null) {
    return false;
  }
  return claimsData !== null;
}
