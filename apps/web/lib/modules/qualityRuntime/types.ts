/**
 * Quality Runtime spine types (Artemo-level Collect → Confirm → Deliver → Refine).
 * BUILDER ONLY product runtime. Not doctrine for jeff-wiki ingest.
 *
 * Packs opt in via ModulePack.qualityRuntime === true (default off = legacy).
 */

/**
 * Conversation lifecycle mode for qualityRuntime packs.
 * Injected into the module system prompt each turn.
 */
export type LifecycleMode = "collect" | "confirm" | "deliver" | "refine";

/**
 * Quality family taxonomy (not catalog stage labels).
 * Matches raw/agent-handoff/13-artemo-quality-runtime-what-we-are-doing.md.
 */
export type QualityFamilyId =
  | "diagnosis"
  | "positioning-map"
  | "ideation-bank"
  | "script-spoken"
  | "hook-line"
  | "rewrite-adapter"
  | "reply-micro-convert"
  | "planner-ladder"
  | "mindset-guardrail";

/** Criticality beyond soft IntakeField.required. */
export type QualitySlotCriticality = "critical" | "optional";

/**
 * Typed slot collected in conversation (chat-first; not a form).
 * Missing critical slots keep the turn in Collect.
 */
export type QualitySlot = {
  id: string;
  label: string;
  criticality: QualitySlotCriticality;
  /** Hint for how to ask this slot in Collect. */
  probeHint?: string;
  placeholder?: string;
  helpText?: string;
  multiline?: boolean;
  /**
   * Concrete choice prompts when the user says they do not know.
   * Pack-specific lists land in Q1+; empty uses the shared IDK stub.
   */
  idkOptions?: string[];
};

/**
 * Family deliverable contract stub.
 * Shape fields are minimal in Q0; packs fill overlays against these later.
 */
export type FamilyDeliverableContract = {
  familyId: QualityFamilyId;
  /** One-line job of this family's dense deliverable. */
  deliverableJob: string;
  /** Expected section order (stub lists OK in Q0). */
  sectionOrder: string[];
  /** Density / duration note for prompt injection. */
  densityNote: string;
  /** Confirm step required before first dense Deliver. */
  requireConfirmBeforeDeliver: boolean;
};

/**
 * Reply budget mode for system prompt formatting.
 * Clarifying stays short; dense overrides the home free-chat ~3 paragraph cap.
 */
export type ReplyBudgetMode = "clarifying" | "dense";

/**
 * Result of Q0 heuristic mode detection for one module turn.
 */
export type LifecycleDetection = {
  mode: LifecycleMode;
  replyBudget: ReplyBudgetMode;
  /**
   * Honest note for builders / logs: which heuristic branch fired.
   * Not shown to students.
   */
  reason: string;
  /** Critical slot ids that still look empty. */
  missingCriticalSlotIds: string[];
  /** True when latest user message looks like I-do-not-know / blank. */
  latestUserLooksLikeIdk: boolean;
};
