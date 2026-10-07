import {
  LOCALE_COOKIE_KEY,
  LOCALE_COOKIE_MAX_AGE_SECONDS,
  LOCALE_STORAGE_KEY,
  parseLocale,
  type Locale,
} from "@/lib/i18n/messages";

/**
 * Reads an explicit locale choice from cookie, then localStorage.
 * Returns null when the visitor has never chosen a locale.
 */
export function readPersistedLocale(): Locale | null {
  if (typeof window === "undefined") {
    return null;
  }
  const fromCookie = readLocaleCookie();
  if (fromCookie !== null) {
    return fromCookie;
  }
  return parseLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
}

/**
 * Persists an explicit locale choice to localStorage and a non-HttpOnly cookie.
 * The cookie is what SSR reads so a full reload does not flash the zh default.
 */
export function persistLocaleChoice(locale: Locale): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  document.cookie = [
    `${LOCALE_COOKIE_KEY}=${locale}`,
    "Path=/",
    `Max-Age=${String(LOCALE_COOKIE_MAX_AGE_SECONDS)}`,
    "SameSite=Lax",
  ].join("; ");
}

/**
 * Parses `document.cookie` for the locale cookie. No decode beyond parseLocale.
 */
function readLocaleCookie(): Locale | null {
  const raw = document.cookie;
  if (raw.length === 0) {
    return null;
  }
  const parts: string[] = raw.split(";");
  for (const part of parts) {
    const trimmed: string = part.trim();
    const separator: number = trimmed.indexOf("=");
    if (separator <= 0) {
      continue;
    }
    const name: string = trimmed.slice(0, separator);
    if (name !== LOCALE_COOKIE_KEY) {
      continue;
    }
    return parseLocale(trimmed.slice(separator + 1));
  }
  return null;
}
