/**
 * Post-processes assistant reply prose so dash punctuation never reaches the client.
 * Replaces em dash, en dash, and spaced hyphen-as-dash with ". ".
 * Leaves in-word hyphens alone (e.g. jeff-wiki, well-known, --flag).
 */

/**
 * Replaces dash punctuation characters with sentence breaks.
 * @param text - Raw assistant reply text
 * @returns Sanitized reply without em/en dash or spaced hyphen punctuation
 */
export function stripDashPunctuation(text: string): string {
  if (typeof text !== "string" || text.length === 0) {
    return text;
  }

  let out: string = text;

  // Em dash (U+2014) and en dash (U+2013), with optional surrounding spaces.
  out = out.replace(/\s*[—–]\s*/gu, ". ");

  // Spaced hyphen used as a punctuation dash ("foo - bar"), not in-word hyphens.
  out = out.replace(/(\S) - (\S)/g, "$1. $2");

  // Clean up accidental double periods from adjacent punctuation.
  out = out.replace(/([.!?…])\s*\./g, "$1");
  out = out.replace(/\.{2,}/g, ".");

  // Collapse runs of spaces introduced by replacements (preserve newlines).
  out = out.replace(/ {2,}/g, " ");

  return out;
}
