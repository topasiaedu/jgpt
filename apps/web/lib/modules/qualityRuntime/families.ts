/**
 * Family deliverable contract stubs for Quality Runtime.
 * Minimal Q0 registry; Q1+ packs implement overlays against these shapes.
 */

import type { FamilyDeliverableContract, QualityFamilyId } from "@/lib/modules/qualityRuntime/types";

/**
 * Stub contracts keyed by quality family id.
 * Section orders are scaffolds packs refine in migration waves.
 */
export const FAMILY_DELIVERABLE_CONTRACTS: Record<QualityFamilyId, FamilyDeliverableContract> = {
  diagnosis: {
    familyId: "diagnosis",
    deliverableJob: "Diagnostic brief with ranked next actions (not a script).",
    sectionOrder: [
      "framing-call",
      "evidence-or-scorecard",
      "ranked-next-actions",
      "named-levers",
    ],
    densityNote:
      "Dense enough to decide the next move: framing, evidence scorecard, ranked next actions. Never a Reel script.",
    requireConfirmBeforeDeliver: true,
  },
  "positioning-map": {
    familyId: "positioning-map",
    deliverableJob: "Structured who/serve/standpoint map; user owns niche facts.",
    sectionOrder: [
      "who",
      "who-helped",
      "what-solved",
      "optional-anti-audience-or-one-liner",
      "named-levers",
    ],
    densityNote:
      "Map density: sharp structured who/serve/solve (or four-question) answers. Never a spoken Reel script.",
    requireConfirmBeforeDeliver: true,
  },
  "ideation-bank": {
    familyId: "ideation-bank",
    deliverableJob: "Numbered usable bank with tags and reuse notes.",
    sectionOrder: ["filters", "numbered-bank", "tags", "reuse-notes"],
    densityNote: "Volume with filters; bank not essay.",
    requireConfirmBeforeDeliver: true,
  },
  "script-spoken": {
    familyId: "script-spoken",
    deliverableJob: "Shootable spoken script at about 60 seconds and above.",
    sectionOrder: ["timed-beats", "on-screen-text", "soft-step", "named-levers"],
    densityNote: "Dense speakable beats (~60s+ default). Confirm before first full script.",
    requireConfirmBeforeDeliver: true,
  },
  "hook-line": {
    familyId: "hook-line",
    deliverableJob: "Scroll-stop opens or lines with why/legs; not a full Reel.",
    sectionOrder: ["lines", "why", "legs-or-rewrite-note"],
    densityNote: "Multiple annotated lines; stay under a full script.",
    requireConfirmBeforeDeliver: true,
  },
  "rewrite-adapter": {
    familyId: "rewrite-adapter",
    deliverableJob: "Stronger version of their draft; preserve intent.",
    sectionOrder: ["before-after-or-adapted-cut", "notes"],
    densityNote: "Rewrite density matches source length and goal.",
    requireConfirmBeforeDeliver: true,
  },
  "reply-micro-convert": {
    familyId: "reply-micro-convert",
    deliverableJob: "Short reply paths that invite the next step.",
    sectionOrder: ["options", "soft-cta"],
    densityNote: "Short but complete (2 to 3 line options). Not a long script.",
    requireConfirmBeforeDeliver: false,
  },
  "planner-ladder": {
    familyId: "planner-ladder",
    deliverableJob: "Sequence plan with checkpoints; not one script.",
    sectionOrder: ["horizon", "ladder-or-week-plan", "checkpoints"],
    densityNote: "Plan density: sequenced steps with constraints named.",
    requireConfirmBeforeDeliver: true,
  },
  "mindset-guardrail": {
    familyId: "mindset-guardrail",
    deliverableJob: "Guardrail coaching: reframe, do/don't, one practice.",
    sectionOrder: ["reframe", "do-dont", "one-practice"],
    densityNote: "Firm guardrail coaching; refuse fame hacks. Not a script writer.",
    requireConfirmBeforeDeliver: false,
  },
};

/**
 * Returns the stub contract for a family, or undefined when family is unset.
 */
export function getFamilyDeliverableContract(
  familyId: QualityFamilyId | undefined,
): FamilyDeliverableContract | undefined {
  if (familyId === undefined) {
    return undefined;
  }
  return FAMILY_DELIVERABLE_CONTRACTS[familyId];
}

/**
 * All family ids for migration inventory helpers (Q1+).
 */
export function listQualityFamilyIds(): QualityFamilyId[] {
  return [
    "diagnosis",
    "positioning-map",
    "ideation-bank",
    "script-spoken",
    "hook-line",
    "rewrite-adapter",
    "reply-micro-convert",
    "planner-ladder",
    "mindset-guardrail",
  ];
}
