/**
 * Shared Quality Runtime overlay builders for family migrations (Q5+).
 * Packs supply job-specific deliverable lines; this fills lifecycle chrome.
 * BUILDER ONLY. Not doctrine for jeff-wiki ingest.
 */

import { getFamilyDeliverableContract } from "@/lib/modules/qualityRuntime/families";
import type { QualityFamilyId, QualitySlot } from "@/lib/modules/qualityRuntime/types";
import type { IntakeField } from "@/lib/modules/types";

/** Human labels for family ids in overlay titles. */
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
 * Parts for a job-shaped qualityRuntime system overlay.
 */
export type FamilyOverlayParts = {
  modeTitle: string;
  familyId: QualityFamilyId;
  /** Short job / doctrine lines kept above the lifecycle block. */
  jobLines: string[];
  /** One-line summary of critical slots for Collect. */
  criticalSlotSummary: string;
  /** Confirm mirror lines (skipped in overlay body when family does not require Confirm). */
  confirmLines: string[];
  /** Numbered or bulleted deliverable section lines. */
  deliverableLines: string[];
  /** Named refine lever lines. */
  refineLeverLines: string[];
  /** Extra doctrine / evidence / after lines (optional). */
  trailingLines?: string[];
  /** Override the default refuse-script line. */
  refuseScriptLine?: string;
};

/**
 * Builds typed QualitySlots from intake fields plus pack IDK maps.
 * Missing IDK lists get a safe scaffold stub (user still owns niche facts).
 */
export function buildQualitySlotsFromIntake(
  intakeFields: IntakeField[],
  idkOptionsBySlotId: Record<string, string[]>,
  extras?: QualitySlot[],
): QualitySlot[] {
  const fromIntake: QualitySlot[] = intakeFields.map((field) => {
    const idk: string[] | undefined = idkOptionsBySlotId[field.id];
    return {
      id: field.id,
      label: field.label,
      criticality: field.required === true ? "critical" : "optional",
      placeholder: field.placeholder,
      helpText: field.helpText,
      multiline: field.multiline,
      idkOptions:
        idk !== undefined && idk.length > 0
          ? idk
          : [
              `Offer 2 to 3 concrete scaffolds for "${field.label}" (they correct niche facts).`,
              "Or invite one plain sentence in their own words.",
            ],
    };
  });

  if (extras === undefined || extras.length === 0) {
    return fromIntake;
  }

  const seen: Set<string> = new Set(fromIntake.map((slot) => slot.id));
  const merged: QualitySlot[] = [...fromIntake];
  for (const extra of extras) {
    if (seen.has(extra.id)) {
      continue;
    }
    seen.add(extra.id);
    merged.push(extra);
  }
  return merged;
}

/**
 * Joins a full qualityRuntime system overlay with hard lifecycle chrome.
 */
export function joinQualityRuntimeOverlay(parts: FamilyOverlayParts): string {
  const contract = getFamilyDeliverableContract(parts.familyId);
  const requireConfirm: boolean = contract?.requireConfirmBeforeDeliver ?? true;
  const familyLabel: string = FAMILY_LABEL[parts.familyId];
  const refuse: string =
    parts.refuseScriptLine ??
    "Job-shaped density only. Never turn this tool into an Instagram Reel script writer.";

  const lines: string[] = [
    `## Module mode: ${parts.modeTitle} (qualityRuntime ${familyLabel})`,
    ...parts.jobLines,
    refuse,
    "Lifecycle is hard: Collect → Confirm → Deliver → Refine. Do not dense-dump in Collect.",
    requireConfirm
      ? "Confirm before the first dense deliverable unless they explicitly say just write it after criticals are filled."
      : "Confirm is optional for this family when criticals are filled; still mirror briefly if assumptions are heavy.",
    "",
    "### Critical slots (Collect gate)",
    `Need before Confirm / Deliver: ${parts.criticalSlotSummary}.`,
    "Ask at most 1 to 2 questions per Collect turn. Prefer Jeff-shaped asks over a generic questionnaire.",
    "If they say I do not know / blank, offer pack IDK choices. Do not invent niche facts, client names, or private proof.",
    "User owns niche facts. Jeff owns craft for this tool job.",
    "",
  ];

  if (requireConfirm) {
    lines.push(
      "### Confirm (before first dense Deliver)",
      ...parts.confirmLines,
      "Name assumptions honestly. Ask for go-ahead.",
      "Do not write the full dense deliverable in Confirm.",
      "",
    );
  } else {
    lines.push(
      "### Confirm (light)",
      ...parts.confirmLines,
      "",
    );
  }

  lines.push(
    "### Deliverable shape (dense; job-shaped)",
    ...parts.deliverableLines,
    "Ground every line in their concrete answers. Different inputs must produce different outputs.",
    "Write the whole deliverable in the locked UI locale language.",
    "End with named refine levers.",
    "",
    "### Refine",
    "After a dense deliverable exists, tweak named levers only. Do not re-interrogate filled critical slots.",
    "Named levers:",
    ...parts.refineLeverLines.map((lever) => `- ${lever}`),
    "",
    "### Hard bans",
    "No overnight-fame. No virality guarantee. Never invent Jeff niche case studies as doctrine.",
    "Sources only from probe / probe_jeff.",
    "Thin coverage: Generally → Jeff → steer, still Jeff-aide voice.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
  );

  if (parts.trailingLines !== undefined && parts.trailingLines.length > 0) {
    lines.push("", ...parts.trailingLines);
  }

  return lines.join("\n");
}

/**
 * Builds a chat-first opener that states job, lifecycle, and first ask.
 */
export function buildLifecycleOpener(opts: {
  jobLine: string;
  workBullets: [string, string, string];
  firstAsk: string;
  mentionConfirm: boolean;
}): string {
  const confirmBullet: string = opts.mentionConfirm
    ? opts.workBullets[0]
    : opts.workBullets[0];
  return [
    `Hey. ${opts.jobLine}`,
    "",
    "Here is how we will work:",
    `- ${confirmBullet}`,
    `- ${opts.workBullets[1]}`,
    `- ${opts.workBullets[2]}`,
    "",
    opts.firstAsk,
  ].join("\n");
}

/**
 * Builds a ZH chat-first opener mirroring EN lifecycle shape.
 */
export function buildLifecycleOpenerZh(opts: {
  jobLine: string;
  workBullets: [string, string, string];
  firstAsk: string;
}): string {
  return [
    opts.jobLine,
    "",
    "我们这样配合：",
    `- ${opts.workBullets[0]}`,
    `- ${opts.workBullets[1]}`,
    `- ${opts.workBullets[2]}`,
    "",
    opts.firstAsk,
  ].join("\n");
}
