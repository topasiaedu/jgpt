/**
 * Product module types for Jeff IP test Artemo-style tools.
 * Catalog holds UX copy; packs hold slots + probe hints + system overlays.
 */

import type {
  QualityFamilyId,
  QualitySlot,
} from "@/lib/modules/qualityRuntime/types";

/** Top-level grouping on the All Tools grid (5-stage product flow). */
export type ModuleCategory =
  | "Ideation"
  | "IP Positioning"
  | "Content"
  | "Trust"
  | "Convert";

/** Whether a module can start end-to-end work in the current product phase. */
export type ModuleStatus = "ready" | "soon";

/**
 * One slot the assistant should collect via chat before the full deliverable.
 * Not rendered as a form UI; used as an internal checklist in the system overlay.
 * Legacy soft checklist: `required` is advisory only unless qualityRuntime is on
 * (then QualitySlot.criticality / adapted required→critical enforces Collect gate).
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
  /**
   * Keywords lightly blended into the automatic first probe query (capped in buildModuleProbeQuery).
   * Prefer short doctrine phrases; do not rely on dumping many synonyms.
   */
  probeHints: string[];
  /** Appended after the base Jeff system prompt in module mode. */
  systemOverlay: string;
  /**
   * Preferred jeff-graph node ids for this tool.
   * Soft-merged into the evidence pack after user-led probe ranking (not dumped into the lexical query).
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
   * Spoken beat + one job sentence + one concrete first collect ask.
   * No "Here is how we will work" process bullets.
   */
  chatOpener: string;
  /**
   * Optional Chinese opener (口语化). When set, preferred over packChatOpenersZh for zh locale.
   * Same shape as chatOpener: spoken beat + job + ask, no "我们这样配合" block.
   */
  chatOpenerZh?: string;
  /**
   * When true, Quality Runtime lifecycle is enforced (Collect → Confirm → Deliver → Refine),
   * with typed critical slots, mode-aware reply budgets, and IDK option prompts.
   * Default / undefined = legacy soft checklist behavior (unmigrated packs).
   * Q0 ships the spine only; packs opt in starting Q1 (`ig-reel-script`).
   */
  qualityRuntime?: boolean;
  /**
   * Quality family for deliverable contract lookup.
   * Set when migrating a pack onto a family template (Q1+).
   */
  qualityFamily?: QualityFamilyId;
  /**
   * Typed critical/optional slots for Quality Runtime.
   * When omitted with qualityRuntime on, intakeFields are adapted (required → critical).
   */
  qualitySlots?: QualitySlot[];
  /**
   * What Confirm should mirror before dense Deliver (pack-specific).
   */
  confirmBlurb?: string;
  /**
   * Deliverable section order matching the family contract (pack overlay fills this).
   */
  deliverableSectionOrder?: string[];
  /**
   * Named Refine levers the student can pull without restarting Collect.
   */
  refineLevers?: string[];
  /**
   * Pack-level IDK option prompts keyed by slot id (Q1+).
   * Falls back to QualitySlot.idkOptions then shared stub.
   */
  idkOptionsBySlotId?: Record<string, string[]>;
};
