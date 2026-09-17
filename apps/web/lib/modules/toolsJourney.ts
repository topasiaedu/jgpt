/**
 * Tools page journey IA helpers: stage order, section ids, core vs practice membership.
 * Product UX only. Not doctrine for jeff-wiki ingest.
 * Core cards show on the journey page; practice stays in catalog for deep links.
 * Core/practice lists locked in raw/agent-handoff/07-tools-journey-ux-what-we-are-doing.md.
 */

import type { MessageKey } from "@/lib/i18n/messages";
import { MODULE_CATALOG, MODULE_CATEGORY_ORDER } from "@/lib/modules/catalog";
import type { ModuleCategory, ModuleDefinition } from "@/lib/modules/types";

/** Ordered ladder stages (same order as MODULE_CATEGORY_ORDER). */
export const JOURNEY_STAGES: readonly ModuleCategory[] = MODULE_CATEGORY_ORDER;

/** Stable DOM ids for stage sections (scroll targets). */
const STAGE_SECTION_IDS: Record<ModuleCategory, string> = {
  Ideation: "stage-ideation",
  "IP Positioning": "stage-ip-positioning",
  Content: "stage-content",
  Trust: "stage-trust",
  Convert: "stage-convert",
};

/** One-line job blurb message keys per stage. */
const STAGE_BLURB_KEYS: Record<ModuleCategory, MessageKey> = {
  Ideation: "stageBlurbIdeation",
  "IP Positioning": "stageBlurbIpPositioning",
  Content: "stageBlurbContent",
  Trust: "stageBlurbTrust",
  Convert: "stageBlurbConvert",
};

/**
 * Core module ids that stay visible in each stage section.
 * Convert: every convert catalog module is core.
 * Any catalog id not listed here defaults to practice.
 */
const CORE_MODULE_IDS: ReadonlySet<string> = new Set([
  "ip-stage-check",
  "content-ideation-ip",
  "direction-fixer",
  "who-i-serve",
  "standpoint-builder",
  "ip-pillars",
  "content-asset-planner",
  "content-asset-stack",
  "scroll-stop-hook",
  "faq-content-bank",
  "ig-reel-script",
  "soundbite-one-liner",
  "comment-reply-three-lines",
  "criticism-armor",
  "comment-to-content",
  "long-video-trust-script",
  "story-trust-script",
  "value-convert-ladder",
  "soft-cta-closer",
  "trust-offer-bridge",
  "dm-comment-closer",
  "offer-explanation-simple",
  "two-kinds-student-two-methods",
  "three-c-method",
  "three-r-method",
  "waffle-grid",
  "content-not-working-checklists",
  "positioning-four-questions",
  "brand-stance-model",
  "goat-four-beats",
  "story-structure-search",
  "eight-ways-to-open",
  "hit-100x-followers",
  "six-caption-angles",
  "four-content-layers",
  "content-authority-ladder",
]);

/**
 * Explicit practice ids from the 07 handoff (collapse in Phase B).
 * Unlisted non-core catalog ids still count as practice via isPracticeModule.
 */
export const PRACTICE_MODULE_IDS: ReadonlySet<string> = new Set([
  "value-teaching-reel",
  "hot-take-script",
  "process-proof-reel",
  "first-impression-script",
  "short-vs-long-planner",
  "ad-vs-asset-checker",
  "advice-vs-ego-coach",
  "script-humanizer",
  "revision-sharpen",
  "hook-rewriter",
  "platform-adapter",
  "bullet-caption-pack",
  "bianhao-coach",
  "high-ticket-caution",
  "dont-outsource-judgment",
  "authority-relatable-mixer",
  "learning-journey-series",
  "boss-brand-brief",
  "lean-ip-setup",
]);

/**
 * Returns the stable section element id for a journey stage.
 */
export function stageSectionId(category: ModuleCategory): string {
  return STAGE_SECTION_IDS[category];
}

/**
 * Returns the i18n message key for a stage one-line job blurb.
 */
export function stageBlurbMessageKey(category: ModuleCategory): MessageKey {
  return STAGE_BLURB_KEYS[category];
}

/**
 * True when the module id is in the approved core list for journey UI.
 */
export function isCoreModule(moduleId: string): boolean {
  return CORE_MODULE_IDS.has(moduleId);
}

/**
 * True when the module is practice/polish (not core).
 * Any catalog id not listed in core defaults to practice.
 */
export function isPracticeModule(moduleId: string): boolean {
  return !CORE_MODULE_IDS.has(moduleId);
}

/**
 * Splits stage modules into core then practice (catalog order preserved within each).
 * ToolsGrid shows core on the journey page; practice is deep-link only.
 */
export function splitStageModules(modules: readonly ModuleDefinition[]): {
  core: ModuleDefinition[];
  practice: ModuleDefinition[];
} {
  const core: ModuleDefinition[] = [];
  const practice: ModuleDefinition[] = [];
  for (const entry of modules) {
    if (isCoreModule(entry.id)) {
      core.push(entry);
    } else {
      practice.push(entry);
    }
  }
  return { core, practice };
}

/**
 * Display index (1-based) for a journey stage in rail chrome.
 */
export function stageRailNumber(category: ModuleCategory): number {
  const index = JOURNEY_STAGES.indexOf(category);
  if (index < 0) {
    return 0;
  }
  return index + 1;
}

/** Per-category membership counts for journey UI audits. */
export type JourneyCategoryMembership = {
  category: ModuleCategory;
  catalog: number;
  core: number;
  practice: number;
  ok: boolean;
};

/**
 * Catalog vs core/practice membership report.
 * Every catalog id must land in exactly one of core or practice (unknown → practice).
 * Does not throw; callers may log in development.
 */
export type JourneyMembershipAudit = {
  ok: boolean;
  catalogCount: number;
  coreCount: number;
  practiceCount: number;
  /** Non-core catalog ids not listed in PRACTICE_MODULE_IDS (still shown as practice). */
  unlistedPracticeIds: string[];
  /** Ids present in both CORE_MODULE_IDS and PRACTICE_MODULE_IDS (should be empty). */
  overlapIds: string[];
  categoryCounts: JourneyCategoryMembership[];
};

/**
 * Audits that every MODULE_CATALOG id is accounted for in core or practice helpers,
 * and that per-category core+practice counts match the catalog filter for that stage.
 */
export function auditJourneyMembership(
  catalog: readonly ModuleDefinition[] = MODULE_CATALOG,
): JourneyMembershipAudit {
  const overlapIds: string[] = [];
  for (const id of CORE_MODULE_IDS) {
    if (PRACTICE_MODULE_IDS.has(id)) {
      overlapIds.push(id);
    }
  }

  const unlistedPracticeIds: string[] = [];
  let coreCount = 0;
  let practiceCount = 0;
  for (const entry of catalog) {
    if (isCoreModule(entry.id)) {
      coreCount += 1;
    } else {
      practiceCount += 1;
      if (!PRACTICE_MODULE_IDS.has(entry.id)) {
        unlistedPracticeIds.push(entry.id);
      }
    }
  }

  const categoryCounts: JourneyCategoryMembership[] = JOURNEY_STAGES.map((category) => {
    const inStage = catalog.filter((module) => module.category === category);
    const { core, practice } = splitStageModules(inStage);
    const catalogCount = inStage.length;
    const splitTotal = core.length + practice.length;
    return {
      category,
      catalog: catalogCount,
      core: core.length,
      practice: practice.length,
      ok: catalogCount === splitTotal,
    };
  });

  const catalogCount = catalog.length;
  const ok =
    overlapIds.length === 0 &&
    unlistedPracticeIds.length === 0 &&
    coreCount + practiceCount === catalogCount &&
    categoryCounts.every((row) => row.ok);

  return {
    ok,
    catalogCount,
    coreCount,
    practiceCount,
    unlistedPracticeIds,
    overlapIds,
    categoryCounts,
  };
}
