/**
 * I-don't-know option engine stub for Quality Runtime.
 * When the user blanks a critical slot, offer concrete choices or micro-examples
 * that do not invent the user's niche facts. Pack-specific lists land in Q1+.
 */

import type { QualitySlot } from "@/lib/modules/qualityRuntime/types";

/** Shared student-facing phrasing (no dash punctuation). */
const IDK_SHARED_STUB_EN: string = [
  "They said they do not know or left a critical answer blank.",
  "Do not invent their niche facts (medical details, client names, private proof).",
  "Offer 2 to 4 concrete choices or micro-examples shaped as scaffolding, then ask them to pick or correct.",
  "Label examples as practice structure for THEIR work, not Jeff workshop cases.",
  "Still ask at most 1 to 2 clarifying questions this turn (bullets if two).",
].join(" ");

/**
 * Detects I-don't-know / blank / avoid patterns on the latest user message.
 */
export function looksLikeIdkOrBlank(userText: string): boolean {
  const trimmed: string = userText.trim();
  if (trimmed.length === 0) {
    return true;
  }

  const lower: string = trimmed.toLowerCase();
  const patterns: RegExp[] = [
    /\bi\s*don'?t\s*know\b/i,
    /\bidk\b/i,
    /\bnot\s*sure\b/i,
    /\bno\s*idea\b/i,
    /\bunsure\b/i,
    /不知道/,
    /不清楚/,
    /没想好/,
    /沒想好/,
    /不确定/,
    /不確定/,
    /随便/,
    /隨便/,
    /你定/,
    /你帮我想/,
    /你幫我想/,
  ];

  return patterns.some((pattern) => pattern.test(lower) || pattern.test(trimmed));
}

/**
 * Builds option lines for a slot: pack options first, else generic scaffolds.
 * Never invents niche facts; scaffolds are labeled as examples.
 */
export function buildIdkOptionLines(slot: QualitySlot): string[] {
  if (slot.idkOptions !== undefined && slot.idkOptions.length > 0) {
    return slot.idkOptions.map((option) => option.trim()).filter((option) => option.length > 0);
  }

  const label: string = slot.label.trim().length > 0 ? slot.label.trim() : slot.id;
  return [
    `Pick a rough shape for "${label}" (example structure only; they own the facts).`,
    "Or share one concrete detail in their own words (who, what stuck, what they stand for).",
    "Or say which part is fuzzy so you can offer 2 tighter choices next.",
  ];
}

/**
 * Prompt block injected when IDK is detected on a qualityRuntime turn.
 * Pack-specific option lists come from QualitySlot.idkOptions (Q1+).
 */
export function buildIdkOptionEngineStub(options: {
  missingCriticalSlots: QualitySlot[];
  latestUserLooksLikeIdk: boolean;
}): string {
  if (!options.latestUserLooksLikeIdk) {
    return "";
  }

  const focusSlots: QualitySlot[] =
    options.missingCriticalSlots.length > 0
      ? options.missingCriticalSlots.slice(0, 2)
      : [];

  const lines: string[] = [
    "## I-don't-know option engine (hard; qualityRuntime stub)",
    IDK_SHARED_STUB_EN,
  ];

  if (focusSlots.length === 0) {
    lines.push(
      "No critical gap ids were detected by the Q0 heuristic; still offer choices for the gap you just named, without inventing niche facts.",
    );
    return lines.join("\n");
  }

  lines.push("Focus options on these critical gaps:");
  for (const slot of focusSlots) {
    lines.push(`### Slot: ${slot.label} (${slot.id})`);
    for (const option of buildIdkOptionLines(slot)) {
      lines.push(`- ${option}`);
    }
  }

  return lines.join("\n");
}
