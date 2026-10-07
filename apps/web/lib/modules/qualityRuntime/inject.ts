/**
 * Assembles the Quality Runtime prompt injection for one module chat turn.
 * Only called when pack.qualityRuntime === true.
 */

import type { ChatMessage } from "@/lib/chatTypes";
import type { ModulePack } from "@/lib/modules/types";
import { buildIdkOptionEngineStub } from "@/lib/modules/qualityRuntime/idkOptions";
import {
  buildLifecycleModeRules,
  detectLifecycleMode,
} from "@/lib/modules/qualityRuntime/lifecycle";
import { criticalQualitySlots, resolveQualitySlots } from "@/lib/modules/qualityRuntime/slots";
import type { LifecycleDetection, QualitySlot } from "@/lib/modules/qualityRuntime/types";
import type { BrandProfileStructured } from "@/lib/brandProfile/types";

export type QualityRuntimeInjection = {
  detection: LifecycleDetection;
  /** Full markdown block appended to the module system prompt. */
  promptBlock: string;
};

/**
 * Builds lifecycle + budget + IDK stub injection for a qualityRuntime pack turn.
 */
export function buildQualityRuntimeInjection(options: {
  pack: ModulePack;
  messages: ChatMessage[];
  intake?: Record<string, string>;
  brandStructured?: BrandProfileStructured;
}): QualityRuntimeInjection {
  const detection: LifecycleDetection = detectLifecycleMode({
    pack: options.pack,
    messages: options.messages,
    intake: options.intake,
    brandStructured: options.brandStructured,
  });

  const allSlots: QualitySlot[] = resolveQualitySlots(options.pack);
  const missingCriticalSlots: QualitySlot[] = criticalQualitySlots(options.pack).filter((slot) =>
    detection.missingCriticalSlotIds.includes(slot.id),
  );

  // Prefer pack-level idkOptionsBySlotId when present (Q1+).
  const slotsWithPackIdk: QualitySlot[] = missingCriticalSlots.map((slot) => {
    const fromPack: string[] | undefined = options.pack.idkOptionsBySlotId?.[slot.id];
    if (fromPack === undefined || fromPack.length === 0) {
      return slot;
    }
    return {
      ...slot,
      idkOptions: slot.idkOptions !== undefined && slot.idkOptions.length > 0 ? slot.idkOptions : fromPack,
    };
  });

  const lifecycleBlock: string = buildLifecycleModeRules({
    pack: options.pack,
    detection,
  });

  const idkBlock: string = buildIdkOptionEngineStub({
    missingCriticalSlots: slotsWithPackIdk.length > 0 ? slotsWithPackIdk : missingCriticalSlots,
    latestUserLooksLikeIdk: detection.latestUserLooksLikeIdk,
  });

  const optInNote: string = [
    "## Quality Runtime flag",
    `Pack ${options.pack.moduleId} has qualityRuntime=true.`,
    "Unmigrated packs omit this flag and keep legacy soft checklist behavior.",
    `Slots resolved: ${allSlots.length} (critical: ${criticalQualitySlots(options.pack).length}).`,
  ].join("\n");

  const parts: string[] = [optInNote, "", lifecycleBlock];
  if (idkBlock.length > 0) {
    parts.push("", idkBlock);
  }

  return {
    detection,
    promptBlock: parts.join("\n"),
  };
}
