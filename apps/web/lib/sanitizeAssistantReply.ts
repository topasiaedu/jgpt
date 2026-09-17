/**
 * Post-processes assistant replies before they reach the client.
 * Always strips banned dash punctuation. For English locale, also forces ASCII quotes.
 */

import type { Locale } from "@/lib/i18n/messages";
import { normalizeEnglishQuotes } from "@/lib/normalizeEnglishQuotes";
import { stripDashPunctuation } from "@/lib/stripDashPunctuation";

/**
 * Sanitizes assistant reply prose for the active UI locale.
 * @param text - Raw model reply
 * @param locale - Chosen UI locale (sole language authority)
 * @returns Student-safe reply text
 */
export function sanitizeAssistantReply(text: string, locale: Locale): string {
  if (typeof text !== "string" || text.length === 0) {
    return text;
  }

  let out: string = stripDashPunctuation(text);

  if (locale === "en") {
    out = normalizeEnglishQuotes(out);
  }

  return out;
}
