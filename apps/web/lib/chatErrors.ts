import type { MessageKey } from "@/lib/i18n/messages";

/**
 * Maps raw API / network failure text to a calm student-facing chrome message key.
 * Technical detail stays in the raw string for builders; UI shows the keyed copy.
 */
export function chatErrorMessageKey(rawError: string): MessageKey {
  const lower = rawError.toLowerCase();

  if (
    lower.includes("network") ||
    lower.includes("could not reach") ||
    lower.includes("failed to fetch")
  ) {
    return "errorNetwork";
  }

  if (
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("non-json") ||
    lower.includes("empty non-json")
  ) {
    return "errorTimeout";
  }

  return "errorGeneric";
}
