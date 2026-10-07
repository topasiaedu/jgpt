/**
 * Maps Brand profile structured fields onto module Collect slots.
 * Filled profile facts count as known so Collect asks only for remaining gaps.
 */

import type { BrandProfileStructured } from "@/lib/brandProfile/types";
import type { QualitySlot } from "@/lib/modules/qualityRuntime/types";

type StructuredFactKey = keyof BrandProfileStructured;

/**
 * Slot ids that may be treated as already known when the mapped field is non-empty.
 * Tool-specific beats (lesson, script, comment) stay unfilled until the user answers.
 */
const SLOT_ID_TO_FACTS: Record<string, StructuredFactKey[]> = {
  audience: ["whoTheyServe"],
  whoIHelp: ["whoTheyServe"],
  whoHelps: ["whoTheyServe"],
  whoYouServe: ["whoTheyServe"],
  sellTo: ["whoTheyServe"],
  whoFor: ["whoTheyServe"],
  audienceNeed: ["whoTheyServe"],
  audienceFeeling: ["whoTheyServe"],
  audienceWarmth: ["whoTheyServe"],
  niche: ["whatTheySell"],
  industry: ["whatTheySell"],
  customerIndustry: ["whatTheySell"],
  sellWhat: ["whatTheySell"],
  whatYouSell: ["whatTheySell"],
  whatISolve: ["whatTheySell"],
  sell: ["whatTheySell", "offerCta"],
  offer: ["offerCta", "whatTheySell"],
  offerPlain: ["offerCta", "whatTheySell"],
  nextStep: ["offerCta"],
  proof: ["proofCredentials"],
  ownedProof: ["proofCredentials"],
  proofAvailable: ["proofCredentials"],
  whyChoose: ["proofCredentials"],
  standpoint: ["stance"],
  stance: ["stance"],
  standFor: ["stance"],
  viewpoint: ["stance"],
  claim: ["stance"],
  belief: ["stance"],
  insist: ["stance"],
  whoAmI: ["founderRoleFace", "businessName"],
  whoYouAre: ["founderRoleFace", "businessName"],
  role: ["founderRoleFace"],
  renshe: ["founderRoleFace"],
  avoid: ["doNotSay"],
  notThis: ["doNotSay"],
  boundaries: ["doNotSay"],
};

/**
 * Returns the first non-empty mapped structured value for a slot id, or null.
 */
export function brandFactForSlotId(
  slotId: string,
  structured: BrandProfileStructured,
): string | null {
  const keys: StructuredFactKey[] | undefined = SLOT_ID_TO_FACTS[slotId];
  if (keys === undefined) {
    return null;
  }
  for (const key of keys) {
    const value: string = structured[key].trim();
    if (value.length > 0) {
      return value;
    }
  }
  return null;
}

/**
 * True when the Brand profile already supplies this Collect slot.
 */
export function slotFilledByBrandProfile(
  slotId: string,
  structured: BrandProfileStructured,
): boolean {
  return brandFactForSlotId(slotId, structured) !== null;
}

/**
 * Prompt checklist note: slots already known from the Brand profile.
 */
export function formatKnownBrandSlotsBlock(
  slots: QualitySlot[],
  structured: BrandProfileStructured,
): string {
  const knownLines: string[] = [];
  for (const slot of slots) {
    const fact: string | null = brandFactForSlotId(slot.id, structured);
    if (fact === null) {
      continue;
    }
    const clipped: string =
      fact.length > 160 ? fact.slice(0, 160).trimEnd() : fact;
    knownLines.push(`- ${slot.label} (${slot.id}): ${clipped}`);
  }

  if (knownLines.length === 0) {
    return [
      "## Brand profile Collect skip",
      "No structured Brand fields currently fill this tool's slots. Ask only what this job still needs.",
    ].join("\n");
  }

  return [
    "## Brand profile Collect skip (hard)",
    "The active Brand profile already supplies these slots. Treat them as known. Do not re-ask them.",
    "Ask only for remaining gaps this tool still needs (story beat, this-video lesson, comment text, language, etc.).",
    "These are user brand facts, not Jeff doctrine.",
    ...knownLines,
  ].join("\n");
}
