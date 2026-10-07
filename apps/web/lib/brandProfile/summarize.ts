/**
 * LLM summarize / merge for Brand profile structured fields + active_brief.
 * Fill gaps only; do not wipe user-edited non-empty fields.
 */

import OpenAI from "openai";

import {
  ACTIVE_BRIEF_MAX_CHARS,
  BRAND_SUMMARIZE_SAMPLE_CHARS,
  EMPTY_BRAND_PROFILE_STRUCTURED,
  normalizeBrandProfileStructured,
  type BrandProfileStructured,
} from "@/lib/brandProfile/types";
import { getOpenAIConfig } from "@/lib/openai";

export type SummarizeBrandInput = {
  profileName: string;
  currentStructured: BrandProfileStructured;
  currentBrief: string;
  /** Sampled chunk texts from ready / just-ingested assets (already capped). */
  sampleTexts: string[];
};

export type SummarizeBrandOutput = {
  structured: BrandProfileStructured;
  activeBrief: string;
};

/**
 * Builds a capped sample string from chunk texts for the summarize prompt.
 */
export function buildSummarizeSample(chunkTexts: string[]): string {
  const parts: string[] = [];
  let used = 0;
  for (const text of chunkTexts) {
    const trimmed: string = text.trim();
    if (trimmed.length === 0) {
      continue;
    }
    if (used >= BRAND_SUMMARIZE_SAMPLE_CHARS) {
      break;
    }
    const remaining: number = BRAND_SUMMARIZE_SAMPLE_CHARS - used;
    const slice: string =
      trimmed.length > remaining ? trimmed.slice(0, remaining) : trimmed;
    parts.push(slice);
    used += slice.length;
  }
  return parts.join("\n\n");
}

/**
 * Keeps existing non-empty structured fields; fills empty ones from suggestion.
 */
export function mergeStructuredFields(
  current: BrandProfileStructured,
  suggested: BrandProfileStructured,
): BrandProfileStructured {
  const keys = Object.keys(EMPTY_BRAND_PROFILE_STRUCTURED) as Array<
    keyof BrandProfileStructured
  >;
  const merged: BrandProfileStructured = { ...EMPTY_BRAND_PROFILE_STRUCTURED };
  for (const key of keys) {
    const existing: string = current[key].trim();
    if (existing.length > 0) {
      merged[key] = existing;
    } else {
      merged[key] = suggested[key].trim();
    }
  }
  return merged;
}

/**
 * Caps active_brief to ACTIVE_BRIEF_MAX_CHARS without mid-word hard cut when possible.
 */
export function capActiveBrief(brief: string): string {
  const trimmed: string = brief.trim();
  if (trimmed.length <= ACTIVE_BRIEF_MAX_CHARS) {
    return trimmed;
  }
  const sliced: string = trimmed.slice(0, ACTIVE_BRIEF_MAX_CHARS);
  const lastSpace: number = sliced.lastIndexOf(" ");
  if (lastSpace > ACTIVE_BRIEF_MAX_CHARS * 0.7) {
    return sliced.slice(0, lastSpace).trim();
  }
  return sliced.trim();
}

/**
 * Fallback brief from structured fields when the LLM is unavailable.
 */
export function briefFromStructured(
  structured: BrandProfileStructured,
): string {
  const lines: string[] = [];
  const add = (label: string, value: string): void => {
    if (value.trim().length === 0) {
      return;
    }
    lines.push(`${label}: ${value.trim()}`);
  };
  add("Business", structured.businessName);
  add("Offer", structured.whatTheySell);
  add("Audience", structured.whoTheyServe);
  add("Founder", structured.founderRoleFace);
  add("Stance", structured.stance);
  add("Proof", structured.proofCredentials);
  add("CTA", structured.offerCta);
  add("Tone", structured.toneNotes);
  add("Do not say", structured.doNotSay);
  return capActiveBrief(lines.join("\n"));
}

/**
 * Narrows LLM JSON into BrandProfileStructured + brief strings.
 */
function parseSummarizeJson(raw: string): {
  structured: BrandProfileStructured;
  activeBrief: string;
} | null {
  const start: number = raw.indexOf("{");
  const end: number = raw.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return null;
  }
  const record: Record<string, unknown> = Object.fromEntries(
    Object.entries(parsed),
  );
  const structuredRaw: unknown =
    "structured" in record ? record.structured : record;
  const structured = normalizeBrandProfileStructured(structuredRaw);
  const briefRaw: unknown =
    "activeBrief" in record
      ? record.activeBrief
      : "active_brief" in record
        ? record.active_brief
        : "";
  const activeBrief: string =
    typeof briefRaw === "string" ? capActiveBrief(briefRaw) : "";
  return { structured, activeBrief };
}

/**
 * Calls OpenAI to suggest structured fields + active_brief from document samples.
 * Merges carefully with current user-edited fields.
 */
export async function summarizeBrandProfile(
  input: SummarizeBrandInput,
): Promise<SummarizeBrandOutput> {
  const sample: string = buildSummarizeSample(input.sampleTexts);
  const { apiKey, model } = getOpenAIConfig();

  if (apiKey === null || sample.length === 0) {
    const structured = mergeStructuredFields(
      input.currentStructured,
      EMPTY_BRAND_PROFILE_STRUCTURED,
    );
    const activeBrief: string =
      input.currentBrief.trim().length > 0
        ? capActiveBrief(input.currentBrief)
        : briefFromStructured(structured);
    return { structured, activeBrief };
  }

  const client = new OpenAI({ apiKey });
  const systemPrompt = [
    "You summarize user-supplied brand materials into structured fields and a short active brief.",
    "This is NOT Jeff teaching doctrine. Only use the provided materials and existing fields.",
    "Return JSON only with keys: structured (object) and activeBrief (string).",
    "structured keys: businessName, whatTheySell, whoTheyServe, founderRoleFace, stance, proofCredentials, offerCta, toneNotes, doNotSay.",
    "All structured values must be strings. Use empty string when unknown.",
    `activeBrief must be at most ${ACTIVE_BRIEF_MAX_CHARS} characters.`,
    "Do not invent facts not supported by materials or existing fields.",
    "Do not use em dash or en dash punctuation in any string.",
  ].join(" ");

  const userPrompt = [
    `Profile display name: ${input.profileName}`,
    "Existing structured fields (JSON):",
    JSON.stringify(input.currentStructured),
    "Existing active brief:",
    input.currentBrief.trim().length > 0 ? input.currentBrief : "(empty)",
    "Document samples:",
    sample,
  ].join("\n\n");

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });
    const content: string = completion.choices[0]?.message?.content ?? "";
    const parsed = parseSummarizeJson(content);
    if (parsed === null) {
      const structured = mergeStructuredFields(
        input.currentStructured,
        EMPTY_BRAND_PROFILE_STRUCTURED,
      );
      return {
        structured,
        activeBrief:
          input.currentBrief.trim().length > 0
            ? capActiveBrief(input.currentBrief)
            : briefFromStructured(structured),
      };
    }

    const structured = mergeStructuredFields(
      input.currentStructured,
      parsed.structured,
    );
    const activeBrief: string =
      parsed.activeBrief.length > 0
        ? capActiveBrief(parsed.activeBrief)
        : briefFromStructured(structured);
    return { structured, activeBrief };
  } catch {
    const structured = mergeStructuredFields(
      input.currentStructured,
      EMPTY_BRAND_PROFILE_STRUCTURED,
    );
    return {
      structured,
      activeBrief:
        input.currentBrief.trim().length > 0
          ? capActiveBrief(input.currentBrief)
          : briefFromStructured(structured),
    };
  }
}
