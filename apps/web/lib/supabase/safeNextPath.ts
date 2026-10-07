import type { Locale } from "@/lib/i18n/messages";

/**
 * Same-origin relative path guard for auth redirects (`next` query param).
 * Empty or unsafe values go home. `/auth` itself is a dead-end
 * (would loop the sign-in page), so that case goes home too.
 *
 * Auth form sign-in always navigates to `/` and ignores `next` (see AuthPageClient).
 * Email link routes use `postAuthSuccessPath` so tool deep links do not win over home,
 * while password-reset continuations under `/auth/*` still honor `next`.
 */
export function safeNextPath(raw: string | null | undefined): string {
  const fallback: string = "/";
  if (raw === null || raw === undefined || raw.length === 0) {
    return fallback;
  }
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return fallback;
  }

  let parsed: URL;
  try {
    parsed = new URL(raw, "http://localhost");
  } catch {
    return fallback;
  }

  if (parsed.username.length > 0 || parsed.password.length > 0) {
    return fallback;
  }

  const pathname: string = stripTrailingSlash(parsed.pathname);
  if (pathname === "/auth") {
    return "/";
  }

  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

/**
 * Destination after PKCE / OTP email links (`/auth/callback`, `/auth/confirm`).
 * Keeps `next` only for auth continuations such as `/auth/reset`.
 * Tool chats and other app paths resolve to home so login success matches the form.
 */
export function postAuthSuccessPath(raw: string | null | undefined): string {
  const safe: string = safeNextPath(raw);
  let parsed: URL;
  try {
    parsed = new URL(safe, "http://localhost");
  } catch {
    return "/";
  }
  const pathname: string = stripTrailingSlash(parsed.pathname);
  if (pathname.startsWith("/auth/")) {
    return safe;
  }
  return "/";
}

/**
 * Appends an explicit UI locale onto an already-safe next path.
 * `locale` is only "zh" | "en", so this cannot open a new origin.
 */
export function withLocaleQuery(path: string, locale: Locale): string {
  const safe: string = safeNextPath(path);
  let parsed: URL;
  try {
    parsed = new URL(safe, "http://localhost");
  } catch {
    return safe;
  }
  parsed.searchParams.set("locale", locale);
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

/**
 * Normalizes `/auth/` to `/auth` without turning `/` into empty.
 */
function stripTrailingSlash(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}
