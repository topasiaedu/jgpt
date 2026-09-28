/**
 * Hook Studio types for batch hook generation on Hook Formula.
 * Builder UX only. Not doctrine for jeff-wiki ingest.
 */

/**
 * Studio modes. H1/H2: from-idea, rewrite. H3: competitor, repeat.
 * Trends deferred (optional stretch not shipped in H3).
 */
export type HookStudioMode = "from-idea" | "rewrite" | "competitor" | "repeat";

/** Shared profile strip persisted for this tool. */
export type HookStudioProfile = {
  niche: string;
  proof: string;
  topics: string;
};

/** Four Hook Formula legs on a parsed card. */
export type HookStudioFormulaLegs = {
  audience: string;
  pain: string;
  contrast_or_result: string;
  curiosity: string;
};

/** One parsed hook card from a Studio batch reply. */
export type HookStudioCard = {
  hook_text: string;
  why_it_works: string;
  formula_legs: HookStudioFormulaLegs | null;
  rewrite_note: string | null;
  film_first: boolean;
};

/** Result of best-effort parse of an assistant turn. */
export type HookStudioParseResult =
  | { kind: "cards"; cards: HookStudioCard[] }
  | { kind: "fallback"; text: string }
  | { kind: "empty" };

/** Fields that can block Generate (profile, input, or mode line counts). */
export type HookStudioValidationIssue =
  | "niche"
  | "proof"
  | "modeInput"
  | "competitorMinLines"
  | "competitorMaxLines"
  | "repeatMinLines"
  | "repeatMaxLines";
