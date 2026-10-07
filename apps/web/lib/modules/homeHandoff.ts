/**
 * Home → tool handoff helpers.
 * Optional `?from=home&q=` carries prior intent without an intake form.
 * Optional `?profile=<uuid>` carries a chosen Brand profile. Omitted means continue without.
 */

import { isUuid } from "@/lib/brandProfile/db";
import type { Locale } from "@/lib/i18n/messages";

/** Max characters kept from home intent when building tool URLs / hints. */
export const HOME_INTENT_Q_MAX_CHARS: number = 200;

/** Query key for the active Brand profile on tool deep links. */
export const TOOL_PROFILE_QUERY_KEY = "profile";

/** Query key for the open tool conversation (`?c=<uuid>`). */
export const TOOL_CONVERSATION_QUERY_KEY = "c";

/** Query key for home gate banners after a blocked tool open. */
export const HOME_GATE_QUERY_KEY = "bp";

/** Reasons the tool workspace cannot start: unsigned users go to /auth; others go home. */
export type HomeGateReason = "need_sign_in" | "need_profile" | "invalid_profile";

/** Home banner reasons after a blocked tool open (signed-in users). */
export type HomeGateBannerReason = Exclude<HomeGateReason, "need_sign_in">;

/**
 * Reads the first string from a Next.js searchParams value.
 */
export function firstSearchParamValue(
  raw: string | string[] | undefined,
): string {
  if (typeof raw === "string") {
    return raw;
  }
  if (Array.isArray(raw) && typeof raw[0] === "string") {
    return raw[0];
  }
  return "";
}

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
 * Builds a tool deep link.
 * When intent is present, appends `from=home&q=…`.
 * When a Brand profile id is present, appends `profile=<uuid>`.
 */
export function buildToolHrefFromHome(
  moduleId: string,
  intentQ: string | undefined,
  profileId?: string,
): string {
  const base: string = `/tools/${moduleId}`;
  const params: URLSearchParams = new URLSearchParams();

  if (intentQ !== undefined) {
    const capped: string = capHomeIntentQ(intentQ);
    if (capped.length > 0) {
      params.set("from", "home");
      params.set("q", capped);
    }
  }

  if (typeof profileId === "string" && isUuid(profileId)) {
    params.set(TOOL_PROFILE_QUERY_KEY, profileId.trim());
  }

  const query: string = params.toString();
  if (query.length === 0) {
    return base;
  }
  return `${base}?${query}`;
}

/**
 * Builds a resume URL for an existing conversation (`?c=` plus optional profile).
 */
export function buildToolConversationHref(
  moduleId: string,
  conversationId: string,
  brandProfileId: string | null,
): string {
  const params: URLSearchParams = new URLSearchParams();
  params.set(TOOL_CONVERSATION_QUERY_KEY, conversationId);
  if (brandProfileId !== null && isUuid(brandProfileId)) {
    params.set(TOOL_PROFILE_QUERY_KEY, brandProfileId);
  }
  return `/tools/${moduleId}?${params.toString()}`;
}

/**
 * Tool workspace path for a catalog module id (`/tools/{id}`), or null.
 */
export function parseToolModuleIdFromPath(pathname: string): string | null {
  const match: RegExpExecArray | null = /^\/tools\/([^/]+)\/?$/.exec(pathname);
  if (match === null) {
    return null;
  }
  const moduleId: string | undefined = match[1];
  if (moduleId === undefined || moduleId.trim().length === 0) {
    return null;
  }
  return moduleId.trim();
}

/**
 * Reads optional home handoff from Next.js searchParams (string or string[]).
 * Legacy `from=studio` is treated like home so old deep links still seed intent.
 */
export function parseHomeHandoffSearchParams(searchParams: {
  from?: string | string[];
  q?: string | string[];
}): { fromHome: boolean; intentQ: string | undefined } {
  const fromValue: string = firstSearchParamValue(searchParams.from);
  const qValue: string = firstSearchParamValue(searchParams.q);

  const fromHome: boolean = fromValue === "home" || fromValue === "studio";
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
 * Reads `profile=<uuid>` from tool searchParams. Undefined when missing or not a UUID.
 */
export function parseProfileSearchParam(searchParams: {
  profile?: string | string[];
}): string | undefined {
  const raw: string = firstSearchParamValue(searchParams.profile).trim();
  if (!isUuid(raw)) {
    return undefined;
  }
  return raw;
}

/**
 * Reads `c=<uuid>` from tool searchParams. Undefined when missing or not a UUID.
 */
export function parseConversationSearchParam(searchParams: {
  c?: string | string[];
}): string | undefined {
  const raw: string = firstSearchParamValue(searchParams.c).trim();
  if (!isUuid(raw)) {
    return undefined;
  }
  return raw;
}

/**
 * Sets `?c=` with replaceState so resume does not remount the App Router page.
 */
export function replaceToolConversationQuery(conversationId: string): void {
  const url: URL = new URL(window.location.href);
  url.searchParams.set(TOOL_CONVERSATION_QUERY_KEY, conversationId);
  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

/**
 * True when `profile` is present in searchParams but is not a usable UUID.
 * Distinguishes a bad explicit id from a missing id (which may fall back to last-active).
 */
export function hasInvalidProfileQueryParam(searchParams: {
  profile?: string | string[];
}): boolean {
  const raw: string = firstSearchParamValue(searchParams.profile).trim();
  if (raw.length === 0) {
    return false;
  }
  return !isUuid(raw);
}

/**
 * Parses `?bp=` home gate banners after a tool redirect.
 * Legacy `need_sign_in` is ignored: unsigned users now go to /auth.
 */
export function parseHomeGateReason(
  raw: string | string[] | undefined,
): HomeGateBannerReason | undefined {
  const value: string = firstSearchParamValue(raw);
  if (value === "need_profile" || value === "invalid_profile") {
    return value;
  }
  return undefined;
}

/**
 * Home URL that shows a Brand profile gate message after a blocked tool open.
 */
export function buildHomeGateHref(reason: HomeGateBannerReason): string {
  const params: URLSearchParams = new URLSearchParams();
  params.set(HOME_GATE_QUERY_KEY, reason);
  return `/?${params.toString()}`;
}

/**
 * Auth page URL that returns to `nextPath` after sign-in.
 * `nextPath` must be a same-origin relative path (see AuthPageClient).
 */
export function buildAuthHref(nextPath: string): string {
  return `/auth?next=${encodeURIComponent(nextPath)}`;
}

/**
 * Reconstructs a tool path (plus useful query) so /auth can send the user back.
 */
export function buildToolReturnPath(
  moduleId: string,
  searchParams: {
    from?: string | string[];
    q?: string | string[];
    profile?: string | string[];
    c?: string | string[];
  },
): string {
  const params: URLSearchParams = new URLSearchParams();
  const fromValue: string = firstSearchParamValue(searchParams.from);
  const qValue: string = firstSearchParamValue(searchParams.q);
  const profileValue: string = firstSearchParamValue(searchParams.profile);
  const conversationValue: string = firstSearchParamValue(searchParams.c);
  if (fromValue.length > 0) {
    params.set("from", fromValue);
  }
  if (qValue.length > 0) {
    params.set("q", qValue);
  }
  if (profileValue.length > 0) {
    params.set(TOOL_PROFILE_QUERY_KEY, profileValue);
  }
  if (conversationValue.length > 0) {
    params.set(TOOL_CONVERSATION_QUERY_KEY, conversationValue);
  }
  const query: string = params.toString();
  if (query.length === 0) {
    return `/tools/${moduleId}`;
  }
  return `/tools/${moduleId}?${query}`;
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
