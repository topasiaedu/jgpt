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
 * Builds a Hook Formula chat deep link from a Studio card (silent intent hint).
 */
export function buildToolHrefFromStudio(
  moduleId: string,
  hookText: string,
): string {
  const base: string = `/tools/${moduleId}`;
  const capped: string = capHomeIntentQ(hookText);
  if (capped.length === 0) {
    return base;
  }

  const params: URLSearchParams = new URLSearchParams();
  params.set("from", "studio");
  params.set("q", capped);
  return `${base}?${params.toString()}`;
}

/**
 * Hook Studio batch page (top nav).
 */
export function buildHookStudioHref(_moduleId?: string): string {
  void _moduleId;
  return "/studio";
}

/**
 * Reads optional home or studio handoff from Next.js searchParams (string or string[]).
 * `from=home` and `from=studio` both carry a length-capped silent intent `q`.
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
  const fromStudio: boolean = fromValue === "studio";
  if (!fromHome && !fromStudio) {
    return { fromHome: false, intentQ: undefined };
  }

  const capped: string = capHomeIntentQ(qValue);
  return {
    fromHome: fromHome || fromStudio,
    intentQ: capped.length > 0 ? capped : undefined,
  };
}

/**
 * Builds the visible first assistant turn from the pack opener only.
 * Home intent (if any) stays silent via `?q=` / formatHomeIntentHint, not a visible prefix.
 * Signature keeps optional homeIntent/locale for call-site compatibility; they are not shown.
 */
export function buildToolChatOpener(
  packOpener: string,
  homeIntent?: string | undefined,
  locale: Locale = "en",
): string {
  void homeIntent;
  void locale;
  return packOpener;
}
