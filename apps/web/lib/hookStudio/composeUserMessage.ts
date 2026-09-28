import type {
  HookStudioMode,
  HookStudioProfile,
  HookStudioValidationIssue,
} from "@/lib/hookStudio/types";

/**
 * Stable batch markers so the chat route can detect Studio turns without guessing.
 * Do not rename lightly: overlay contracts key off these prefixes.
 */
export const HOOK_STUDIO_MARKER_FROM_IDEA = "[Hook Studio · from-idea]";
export const HOOK_STUDIO_MARKER_REWRITE = "[Hook Studio · rewrite]";
export const HOOK_STUDIO_MARKER_COMPETITOR = "[Hook Studio · competitor]";
export const HOOK_STUDIO_MARKER_REPEAT = "[Hook Studio · repeat]";

/** Competitor mode: paste 3 to 10 sample hooks, one per line. */
export const HOOK_STUDIO_COMPETITOR_MIN_LINES = 3;
export const HOOK_STUDIO_COMPETITOR_MAX_LINES = 10;

/** Repeat mode: paste 1 to 5 of the user's own strong hooks, one per line. */
export const HOOK_STUDIO_REPEAT_MIN_LINES = 1;
export const HOOK_STUDIO_REPEAT_MAX_LINES = 5;

/**
 * Counts non-empty lines (trimmed) in a textarea paste.
 */
export function countNonEmptyLines(text: string): number {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0).length;
}

/**
 * Composes the user turn sent through module chat when Generate is pressed.
 * Markers enable Studio batch overlay selection on the chat route.
 */
export function composeHookStudioUserMessage(options: {
  mode: HookStudioMode;
  profile: HookStudioProfile;
  modeInput: string;
}): string {
  const niche: string = options.profile.niche.trim();
  const proof: string = options.profile.proof.trim();
  const topics: string = options.profile.topics.trim();
  const modeInput: string = options.modeInput.trim();

  const profileLines: string[] = [
    "Profile:",
    `Niche / industry: ${niche}`,
    `Proof / credentials / story: ${proof}`,
  ];
  if (topics.length > 0) {
    profileLines.push(`Content topics: ${topics}`);
  }

  if (options.mode === "from-idea") {
    return [
      HOOK_STUDIO_MARKER_FROM_IDEA,
      "",
      ...profileLines,
      "",
      "Content idea / topic to open on:",
      modeInput,
      "",
      "Please generate 5 to 8 Hook Formula opening lines (对象 ＋ 痛点 ＋ 反差/结果 ＋ 好奇).",
      "Prefer a JSON object with a hooks array. Each item: hook_text, why_it_works, formula_legs (audience, pain, contrast_or_result, curiosity), film_first.",
      "Mark exactly one film_first true when possible. No overnight-fame or viral-guarantee claims.",
    ].join("\n");
  }

  if (options.mode === "rewrite") {
    return [
      HOOK_STUDIO_MARKER_REWRITE,
      "",
      ...profileLines,
      "",
      "Current hook (or hook + body topic) to rewrite:",
      modeInput,
      "",
      "Please rewrite stronger scroll-stop opens only. Keep the body topic. Prefer a JSON object with a hooks array: hook_text, why_it_works, formula_legs when possible, rewrite_note, film_first.",
      "Mark exactly one film_first true when possible. No overnight-fame or viral-guarantee claims. No trust-breaking clickbait.",
    ].join("\n");
  }

  if (options.mode === "competitor") {
    return [
      HOOK_STUDIO_MARKER_COMPETITOR,
      "",
      ...profileLines,
      "",
      "Competitor sample hooks (one per line; pattern study only, do not copy wording wholesale):",
      modeInput,
      "",
      "Extract what made these stop the scroll. Rewrite into THIS user's niche + proof + standpoint as 5 to 8 Hook Formula opens.",
      "Prefer a JSON object with a hooks array: hook_text, why_it_works (name the extracted pattern), formula_legs (all four required), film_first.",
      "Mark exactly one film_first true when possible. No overnight-fame, viral-guarantee, or go-viral-like-them claims.",
    ].join("\n");
  }

  // repeat
  return [
    HOOK_STUDIO_MARKER_REPEAT,
    "",
    ...profileLines,
    "",
    "My own strong hooks to vary (one per line; keep the winning mechanism):",
    modeInput,
    "",
    "Keep the winning mechanism. Vary angle and specificity into 5 to 8 Hook Formula opens. Do not near-duplicate the pasted lines.",
    "Prefer a JSON object with a hooks array: hook_text, why_it_works (name kept mechanism + what varied), formula_legs (all four required), film_first.",
    "Mark exactly one film_first true when possible. No overnight-fame or viral-guarantee claims. No trust-breaking clickbait.",
  ].join("\n");
}

/**
 * Returns validation issues that block Generate (profile, empty input, line counts).
 */
export function validateHookStudioGenerate(options: {
  mode: HookStudioMode;
  profile: HookStudioProfile;
  modeInput: string;
}): HookStudioValidationIssue[] {
  const issues: HookStudioValidationIssue[] = [];
  if (options.profile.niche.trim().length === 0) {
    issues.push("niche");
  }
  if (options.profile.proof.trim().length === 0) {
    issues.push("proof");
  }

  const trimmedInput: string = options.modeInput.trim();
  if (trimmedInput.length === 0) {
    issues.push("modeInput");
    return issues;
  }

  if (options.mode === "competitor") {
    const lines: number = countNonEmptyLines(options.modeInput);
    if (lines < HOOK_STUDIO_COMPETITOR_MIN_LINES) {
      issues.push("competitorMinLines");
    } else if (lines > HOOK_STUDIO_COMPETITOR_MAX_LINES) {
      issues.push("competitorMaxLines");
    }
  }

  if (options.mode === "repeat") {
    const lines: number = countNonEmptyLines(options.modeInput);
    if (lines < HOOK_STUDIO_REPEAT_MIN_LINES) {
      issues.push("repeatMinLines");
    } else if (lines > HOOK_STUDIO_REPEAT_MAX_LINES) {
      issues.push("repeatMaxLines");
    }
  }

  return issues;
}

/**
 * Returns which required Studio fields are still empty (legacy H1 helper).
 * Prefer validateHookStudioGenerate for H3 modes with line counts.
 */
export function missingHookStudioFields(options: {
  profile: HookStudioProfile;
  modeInput: string;
}): Array<"niche" | "proof" | "modeInput"> {
  const missing: Array<"niche" | "proof" | "modeInput"> = [];
  if (options.profile.niche.trim().length === 0) {
    missing.push("niche");
  }
  if (options.profile.proof.trim().length === 0) {
    missing.push("proof");
  }
  if (options.modeInput.trim().length === 0) {
    missing.push("modeInput");
  }
  return missing;
}
