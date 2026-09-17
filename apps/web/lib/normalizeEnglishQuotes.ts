/**
 * Normalizes CJK / fullwidth quotation marks to ASCII for English replies.
 * Chinese corner quotes and fullwidth marks break English layout in the UI.
 */

/** Opening/closing CJK and fullwidth double-quote lookalikes → ASCII `"`. */
const DOUBLE_QUOTE_CHARS: RegExp = /[「」『』“”„‟＂]/gu;

/** Opening/closing curly / fullwidth single-quote lookalikes → ASCII `'`. */
const SINGLE_QUOTE_CHARS: RegExp = /[‘’‚‛＇]/gu;

/**
 * Replaces CJK corner quotes, curly doubles, and fullwidth quotes with ASCII.
 * Safe to run on any English assistant reply; no-ops when already ASCII.
 * @param text - Raw assistant reply text
 * @returns Text with ASCII `"` and `'` only for quote-like characters
 */
export function normalizeEnglishQuotes(text: string): string {
  if (typeof text !== "string" || text.length === 0) {
    return text;
  }

  let out: string = text;
  out = out.replace(DOUBLE_QUOTE_CHARS, "\"");
  out = out.replace(SINGLE_QUOTE_CHARS, "'");
  return out;
}
