/**
 * Quality Runtime public API (Q0 platform spine).
 * Opt-in per pack via ModulePack.qualityRuntime === true.
 */

export type {
  FamilyDeliverableContract,
  LifecycleDetection,
  LifecycleMode,
  QualityFamilyId,
  QualitySlot,
  QualitySlotCriticality,
  ReplyBudgetMode,
} from "@/lib/modules/qualityRuntime/types";

export {
  FAMILY_DELIVERABLE_CONTRACTS,
  getFamilyDeliverableContract,
  listQualityFamilyIds,
} from "@/lib/modules/qualityRuntime/families";

export {
  criticalQualitySlots,
  formatQualitySlotChecklist,
  isQualityRuntimeEnabled,
  qualitySlotFromIntakeField,
  resolveQualitySlots,
} from "@/lib/modules/qualityRuntime/slots";

export {
  buildClarifyingBudgetRules,
  buildDenseBudgetRules,
  buildReplyBudgetInjection,
  replyBudgetForMode,
  systemPromptFormattingOverride,
} from "@/lib/modules/qualityRuntime/budgets";

export {
  buildIdkOptionEngineStub,
  buildIdkOptionLines,
  looksLikeIdkOrBlank,
} from "@/lib/modules/qualityRuntime/idkOptions";

export {
  buildLifecycleModeRules,
  detectLifecycleMode,
} from "@/lib/modules/qualityRuntime/lifecycle";

export { buildQualityRuntimeInjection } from "@/lib/modules/qualityRuntime/inject";

export {
  SCRIPT_SPOKEN_DENSITY_NOTE,
  SCRIPT_SPOKEN_TIMING_CALIBRATION,
} from "@/lib/modules/qualityRuntime/spokenTiming";

export {
  buildLifecycleOpener,
  buildLifecycleOpenerZh,
  buildQualitySlotsFromIntake,
  joinQualityRuntimeOverlay,
} from "@/lib/modules/qualityRuntime/familyOverlay";
export type { FamilyOverlayParts } from "@/lib/modules/qualityRuntime/familyOverlay";

export {
  defaultIdkForLabel,
  finalizeQ5Pack,
  injectLifecycleIntoOverlay,
  q5Openers,
} from "@/lib/modules/qualityRuntime/finalizeQ5";
export type { Q5MigrationSpec } from "@/lib/modules/qualityRuntime/finalizeQ5";

export { Q5_MIGRATED_IDS, Q5_MIGRATIONS } from "@/lib/modules/qualityRuntime/q5Migrations";
