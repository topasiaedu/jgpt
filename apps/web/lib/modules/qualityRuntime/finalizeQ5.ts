/**
 * Finalize a legacy ModulePack onto Quality Runtime (Q5 family waves).
 * Preserves Jeff doctrine in the base overlay while injecting hard lifecycle chrome.
 * BUILDER ONLY. Not doctrine for jeff-wiki ingest.
 */

import {
  buildLifecycleOpener,
  buildLifecycleOpenerZh,
  buildQualitySlotsFromIntake,
} from "@/lib/modules/qualityRuntime/familyOverlay";
import { getFamilyDeliverableContract } from "@/lib/modules/qualityRuntime/families";
import { SCRIPT_SPOKEN_TIMING_CALIBRATION } from "@/lib/modules/qualityRuntime/spokenTiming";
import type { QualityFamilyId, QualitySlot } from "@/lib/modules/qualityRuntime/types";
import type { ModulePack } from "@/lib/modules/types";

/** Family label for overlay mode titles. */
const FAMILY_LABEL: Record<QualityFamilyId, string> = {
  diagnosis: "Diagnosis",
  "positioning-map": "Positioning/Map",
  "ideation-bank": "Ideation/Bank",
  "script-spoken": "Script/Spoken",
  "hook-line": "Hook/Line",
  "rewrite-adapter": "Rewrite/Adapter",
  "reply-micro-convert": "Reply/Micro-convert",
  "planner-ladder": "Planner/Ladder",
  "mindset-guardrail": "Mindset/Guardrail",
};

/**
 * Per-pack Q5 migration spec (job shape + openers + checklist fields).
 */
export type Q5MigrationSpec = {
  qualityFamily: QualityFamilyId;
  confirmBlurb: string;
  deliverableSectionOrder: string[];
  refineLevers: string[];
  /** IDK prompts keyed by slot id (at least 3 keys required by smokes). */
  idkOptionsBySlotId: Record<string, string[]>;
  /** Promote these intake ids to critical (when legacy required was too thin). */
  forceCriticalIds?: string[];
  /** Extra typed slots not present on intakeFields. */
  extraSlots?: QualitySlot[];
  chatOpener: string;
  chatOpenerZh: string;
  /** One-line refuse-script note injected if missing. */
  refuseScriptLine?: string;
};

/**
 * Default scaffold IDK list for a slot label.
 */
export function defaultIdkForLabel(label: string): string[] {
  return [
    `A concrete scaffold for "${label}" (they correct niche facts).`,
    `A second scaffold angle for "${label}" (they correct).`,
    `Or say "${label}" in one plain sentence of your own.`,
  ];
}

/**
 * Builds IDK map for the first N intake fields when a pack needs a quick fill.
 */
export function idkForIntakeIds(
  ids: string[],
  labelsById: Record<string, string>,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const id of ids) {
    out[id] = defaultIdkForLabel(labelsById[id] ?? id);
  }
  return out;
}

/**
 * Injects Collect → Confirm → Deliver → Refine chrome into a legacy overlay.
 * Keeps Jeff doctrine sections; replaces soft collect / soft deliver gates.
 */
export function injectLifecycleIntoOverlay(
  baseOverlay: string,
  spec: Q5MigrationSpec,
  criticalSummary: string,
): string {
  const familyLabel: string = FAMILY_LABEL[spec.qualityFamily];
  const contract = getFamilyDeliverableContract(spec.qualityFamily);
  const requireConfirm: boolean = contract?.requireConfirmBeforeDeliver ?? true;
  const refuse: string =
    spec.refuseScriptLine ??
    "Job-shaped density only. Never turn this tool into an Instagram Reel script writer.";

  let overlay: string = baseOverlay.trim();

  // Stamp qualityRuntime on the mode title line.
  if (/## Module mode:/.test(overlay)) {
    overlay = overlay.replace(
      /## Module mode:\s*([^\n]+)/,
      (full: string, title: string): string => {
        if (/qualityRuntime/i.test(title)) {
          return full;
        }
        return `## Module mode: ${title.trim()} (qualityRuntime ${familyLabel})`;
      },
    );
  } else {
    overlay = `## Module mode: (qualityRuntime ${familyLabel})\n${overlay}`;
  }

  if (!/Never turn this tool into an Instagram Reel|不是 Reel|not a(?:n)?\s+(?:Instagram\s+)?Reel script|Job-shaped density only/i.test(overlay)) {
    overlay = `${overlay}\n${refuse}`;
  }

  const lifecycleBlock: string = [
    "",
    "### Critical slots (Collect gate)",
    `Need before Confirm / Deliver: ${criticalSummary}.`,
    "Lifecycle is hard: Collect → Confirm → Deliver → Refine. Do not dense-dump in Collect.",
    requireConfirm
      ? "Confirm before the first dense deliverable unless they explicitly say just write it after criticals are filled."
      : "Confirm is optional for this family when criticals are filled; still mirror briefly if assumptions are heavy.",
    "Ask at most 1 to 2 questions per Collect turn. Prefer Jeff-shaped asks over a generic questionnaire.",
    "If they say I do not know / blank, offer pack IDK choices. Do not invent niche facts, client names, or private proof.",
    "User owns niche facts. Jeff owns craft for this tool job.",
    "",
    requireConfirm ? "### Confirm (before first dense Deliver)" : "### Confirm (light)",
    spec.confirmBlurb,
    requireConfirm
      ? "Name assumptions honestly. Ask for go-ahead. Do not write the full dense deliverable in Confirm."
      : "Name assumptions if heavy. You may deliver when criticals are filled.",
    "",
    "### Deliverable shape (dense; job-shaped)",
    ...spec.deliverableSectionOrder.map((section: string, index: number) => `${index + 1}. ${section}`),
    "Ground every line in their concrete answers. Different inputs must produce different outputs.",
    "Write the whole deliverable in the locked UI locale language.",
    "Multiple options: ## heading per option, then bullets. Numbered lists must be 1. 2. 3. in one list. Hash headings are expected in Deliver.",
    "End with named refine levers.",
    "",
    ...(spec.qualityFamily === "script-spoken" ? [SCRIPT_SPOKEN_TIMING_CALIBRATION, ""] : []),
    "### Refine",
    "After a dense deliverable exists, tweak named levers only. Do not re-interrogate filled critical slots.",
    `Named levers: ${spec.refineLevers.join("; ")}.`,
    "",
    "### Hard bans (qualityRuntime)",
    "No overnight-fame. No virality guarantee.",
    "On I don't know / blank: normalize + belief + 2 forks + warm invite. Ban 别躲 / don't hide shame closers.",
  ].join("\n");

  // Remove soft collect / soft output gates that fight the hard lifecycle.
  overlay = overlay.replace(
    /### Conversational collect[\s\S]*?(?=\n### |\n*$)/g,
    "",
  );
  overlay = overlay.replace(
    /### Output (?:format|shape)[\s\S]*?(?=\n### |\n*$)/g,
    "",
  );
  overlay = overlay.replace(
    /When enough is known, or the user says just write it,[^\n]*\n?/g,
    "",
  );

  // Avoid duplicating if re-applied.
  if (overlay.includes("### Critical slots (Collect gate)")) {
    return overlay;
  }

  return `${overlay.trim()}\n${lifecycleBlock}\n`;
}

/**
 * Applies a Q5 migration spec onto a legacy (or already-stamped) pack.
 * Idempotent when qualityRuntime is already true and family matches.
 */
export function finalizeQ5Pack(base: ModulePack, spec: Q5MigrationSpec): ModulePack {
  if (base.qualityRuntime === true && base.qualityFamily === spec.qualityFamily) {
    return base;
  }

  const qualitySlots: QualitySlot[] = buildQualitySlotsFromIntake(
    base.intakeFields,
    spec.idkOptionsBySlotId,
    spec.extraSlots,
  ).map((slot: QualitySlot) => {
    if (spec.forceCriticalIds !== undefined && spec.forceCriticalIds.includes(slot.id)) {
      return { ...slot, criticality: "critical" };
    }
    return slot;
  });

  const criticalSummary: string = qualitySlots
    .filter((slot: QualitySlot) => slot.criticality === "critical")
    .map((slot: QualitySlot) => slot.label)
    .join(", ");

  return {
    ...base,
    qualityRuntime: true,
    qualityFamily: spec.qualityFamily,
    confirmBlurb: spec.confirmBlurb,
    deliverableSectionOrder: spec.deliverableSectionOrder,
    refineLevers: spec.refineLevers,
    qualitySlots,
    idkOptionsBySlotId: spec.idkOptionsBySlotId,
    chatOpener: spec.chatOpener,
    chatOpenerZh: spec.chatOpenerZh,
    systemOverlay: injectLifecycleIntoOverlay(base.systemOverlay, spec, criticalSummary),
  };
}

/**
 * Helper to build EN/ZH one-line openers (spoken beat + job sentence + first ask).
 */
export function q5Openers(opts: {
  jobEn: string;
  jobZh: string;
  askEn: string;
  askZh: string;
  seed?: string;
}): { chatOpener: string; chatOpenerZh: string } {
  const seed: string = opts.seed ?? `${opts.jobEn}|${opts.jobZh}`;
  return {
    chatOpener: buildLifecycleOpener({
      jobLine: opts.jobEn,
      firstAsk: opts.askEn,
      seed,
    }),
    chatOpenerZh: buildLifecycleOpenerZh({
      jobLine: opts.jobZh,
      firstAsk: opts.askZh,
      seed,
    }),
  };
}
