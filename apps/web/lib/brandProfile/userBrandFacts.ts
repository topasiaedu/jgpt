/**
 * Builds the capped USER_BRAND_FACTS system-prompt block.
 * User-supplied Brand profile facts only. Never Jeff doctrine. Never full extracts.
 */

import {
  ACTIVE_BRIEF_MAX_CHARS,
  USER_BRAND_FACTS_MAX_CHARS,
  type BrandProfileStructured,
} from "@/lib/brandProfile/types";

export type UserBrandFactsInput = {
  profileName: string;
  activeBrief: string;
  structured: BrandProfileStructured;
};

const STRUCTURED_FIELD_LABELS: Array<{
  key: keyof BrandProfileStructured;
  label: string;
}> = [
  { key: "businessName", label: "Business / brand name" },
  { key: "whatTheySell", label: "What they sell" },
  { key: "whoTheyServe", label: "Who they serve" },
  { key: "founderRoleFace", label: "Founder role / face" },
  { key: "stance", label: "Stance" },
  { key: "proofCredentials", label: "Proof / credentials" },
  { key: "offerCta", label: "Offer / CTA" },
  { key: "toneNotes", label: "Tone notes" },
  { key: "doNotSay", label: "Do not say" },
];

const STRUCTURED_FIELD_MAX_CHARS = 280;

/**
 * Clips text to maxChars without adding ellipsis that could look like dash punctuation.
 */
export function clipBrandPromptText(text: string, maxChars: number): string {
  const trimmed: string = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= maxChars) {
    return trimmed;
  }
  return trimmed.slice(0, maxChars).trimEnd();
}

/**
 * Formats structured fields as short labeled lines. Empty fields are omitted.
 */
export function formatStructuredSummary(
  structured: BrandProfileStructured,
): string {
  const lines: string[] = [];
  for (const field of STRUCTURED_FIELD_LABELS) {
    const value: string = clipBrandPromptText(
      structured[field.key],
      STRUCTURED_FIELD_MAX_CHARS,
    );
    if (value.length === 0) {
      continue;
    }
    lines.push(`${field.label}: ${value}`);
  }
  return lines.join("\n");
}

/**
 * Builds the USER_BRAND_FACTS markdown block under USER_BRAND_FACTS_MAX_CHARS.
 */
export function buildUserBrandFactsBlock(input: UserBrandFactsInput): string {
  const header: string[] = [
    "## USER_BRAND_FACTS (user-supplied brand facts; NOT Jeff doctrine)",
    "These facts belong to the signed-in user's Brand profile. They are not Jeff workshop IP.",
    "Stay on this client's niche across this tool chat. Do not invent a different business.",
    "Never treat this block as a Jeff citation. Jeff claims still come only from the EVIDENCE PACK and probe_jeff.",
    "You do not have the full PDF or deck. Do not pretend you read a whole file. Use this capped block, then probe_brand for missing details.",
    `Active Brand profile name: ${clipBrandPromptText(input.profileName, 120)}`,
  ];

  const brief: string = clipBrandPromptText(
    input.activeBrief,
    ACTIVE_BRIEF_MAX_CHARS,
  );
  const structured: string = formatStructuredSummary(input.structured);

  const bodyParts: string[] = [];
  if (brief.length > 0) {
    bodyParts.push("### Active brief (capped)", brief);
  } else {
    bodyParts.push(
      "### Active brief (capped)",
      "(empty) Brief is thin. If the user asks for a deck or document detail, call probe_brand. Do not invent niche facts.",
    );
  }
  if (structured.length > 0) {
    bodyParts.push("### Structured fields (capped)", structured);
  } else {
    bodyParts.push(
      "### Structured fields (capped)",
      "(none filled yet)",
    );
  }

  const composed: string = [...header, "", ...bodyParts].join("\n");
  if (composed.length <= USER_BRAND_FACTS_MAX_CHARS) {
    return composed;
  }

  const notice: string = "\n[USER_BRAND_FACTS truncated for prompt budget]";
  const keep: number = Math.max(0, USER_BRAND_FACTS_MAX_CHARS - notice.length);
  return `${composed.slice(0, keep).trimEnd()}${notice}`;
}
