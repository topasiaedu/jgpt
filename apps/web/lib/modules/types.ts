/**
 * Product module types for Jeff IP test Artemo-style tools.
 * Catalog holds UX copy; packs hold slots + probe hints + system overlays.
 */

/** Top-level grouping on the All Tools grid. */
export type ModuleCategory =
  | "IP Foundation"
  | "Get Seen"
  | "Earn Trust"
  | "Content Asset System"
  | "On-Camera Coach"
  | "Convert"
  | "Polish";

/** Whether a module can start end-to-end work in the current product phase. */
export type ModuleStatus = "ready" | "soon";

/**
 * One slot the assistant should collect via chat before the full deliverable.
 * Not rendered as a form UI; used as an internal checklist in the system overlay.
 */
export type IntakeField = {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  /** Optional hint for the assistant when asking this slot. */
  helpText?: string;
  /** Prefer longer answers for this slot. */
  multiline?: boolean;
};

/** One named IP tool shown on /tools and opened at /tools/[moduleId]. */
export type ModuleDefinition = {
  id: string;
  title: string;
  category: ModuleCategory;
  /** Full Artemo-style intro copy for the modal. */
  description: string;
  status?: ModuleStatus;
};

/**
 * Runtime pack for a module: chat slots, probe hints, and system overlay.
 * Product UX only. Not doctrine for jeff-wiki ingest.
 */
export type ModulePack = {
  moduleId: string;
  /**
   * Internal checklist of answers to gather in conversation before the full deliverable.
   * Not shown as a form.
   */
  intakeFields: IntakeField[];
  /** Keywords blended into the automatic first probe query. */
  probeHints: string[];
  /** Appended after the base Jeff system prompt in module mode. */
  systemOverlay: string;
  /**
   * Preferred jeff-graph node ids to mention as binding targets in the overlay.
   * Citations still come only from probe evidence; do not fake sources.
   */
  boundNodeIds?: string[];
  /**
   * Optional one-click starter if the UI needs a user-initiated generate chip.
   * Chat-first flow prefers chatOpener instead.
   */
  starterPrompt: string;
  /**
   * Seeded as the first assistant message when the module chat opens.
   * States the deliverable in one line, then asks the first Jeff-relevant question.
   */
  chatOpener: string;
  /**
   * Optional Chinese opener. When set, preferred over packChatOpenersZh for zh locale.
   */
  chatOpenerZh?: string;
};
