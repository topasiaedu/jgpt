/**
 * Home → tool handoff helpers.
 * Optional `?from=home&q=` carries prior intent without an intake form.
 */

import type { Locale } from "@/lib/i18n/messages";

/** Max characters kept from home intent when building tool URLs / hints. */
export const HOME_INTENT_Q_MAX_CHARS: number = 200;

/**
 * Trims and length-caps a home intent string for URL / silent system hint use.
 */
export function capHomeIntentQ(raw: string): string {
  const trimmed: string = raw.trim().replace(/\s+/g, " ");
  if (trimmed.length === 0) {
    return "";
  }
  if (trimmed.length <= HOME_INTENT_Q_MAX_CHARS) {
    return trimmed;
  }
  return trimmed.slice(0, HOME_INTENT_Q_MAX_CHARS);
}

/**
 * Builds a tool deep link. When intent is present, appends `?from=home&q=…`.
 */
export function buildToolHrefFromHome(
  moduleId: string,
  intentQ: string | undefined,
): string {
  const base: string = `/tools/${moduleId}`;
  if (intentQ === undefined) {
    return base;
  }

  const capped: string = capHomeIntentQ(intentQ);
  if (capped.length === 0) {
    return base;
  }

  const params: URLSearchParams = new URLSearchParams();
  params.set("from", "home");
  params.set("q", capped);
  return `${base}?${params.toString()}`;
}

/**
 * Reads optional home handoff from Next.js searchParams (string or string[]).
 */
export function parseHomeHandoffSearchParams(searchParams: {
  from?: string | string[];
  q?: string | string[];
}): { fromHome: boolean; intentQ: string | undefined } {
  const fromRaw: string | string[] | undefined = searchParams.from;
  const fromValue: string =
    typeof fromRaw === "string"
      ? fromRaw
      : Array.isArray(fromRaw) && typeof fromRaw[0] === "string"
        ? fromRaw[0]
        : "";

  const qRaw: string | string[] | undefined = searchParams.q;
  const qValue: string =
    typeof qRaw === "string"
      ? qRaw
      : Array.isArray(qRaw) && typeof qRaw[0] === "string"
        ? qRaw[0]
        : "";

  const fromHome: boolean = fromValue === "home";
  if (!fromHome) {
    return { fromHome: false, intentQ: undefined };
  }

  const capped: string = capHomeIntentQ(qValue);
  return {
    fromHome: true,
    intentQ: capped.length > 0 ? capped : undefined,
  };
}

/**
 * Builds the visible first assistant turn. Pack opener stays primary;
 * home intent (if any) is acknowledged in one short line above it.
 * Locale controls the handoff prefix only; home `q` text is kept as the user wrote it.
 */
export function buildToolChatOpener(
  packOpener: string,
  homeIntent: string | undefined,
  locale: Locale = "en",
): string {
  if (homeIntent === undefined || homeIntent.length === 0) {
    return packOpener;
  }

  const prefix =
    locale === "zh"
      ? `你在首页提到：${homeIntent}`
      : `You mentioned on home: ${homeIntent}`;

  return `${prefix}\n\n${packOpener}`;
}
