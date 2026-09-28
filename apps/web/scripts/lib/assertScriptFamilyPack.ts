/**
 * Shared Script/Spoken family contract asserts for Quality Runtime smokes (Q1/Q2).
 * Offline helpers only. Not doctrine.
 */

import type { ModulePack } from "../../lib/modules/types";
import { PACK_CHAT_OPENERS_ZH } from "../../lib/modules/packChatOpenersZh";
import {
  criticalQualitySlots,
  isQualityRuntimeEnabled,
} from "../../lib/modules/qualityRuntime";

export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Asserts a pack opted into Script/Spoken Quality Runtime with checklist fields.
 */
export function assertScriptSpokenPackContract(pack: ModulePack): string[] {
  assert(isQualityRuntimeEnabled(pack) === true, `${pack.moduleId} must opt into qualityRuntime`);
  assert(pack.qualityFamily === "script-spoken", `${pack.moduleId} qualityFamily must be script-spoken`);
  assert(
    (pack.confirmBlurb ?? "").trim().length > 0,
    `${pack.moduleId} confirmBlurb required`,
  );
  assert(
    (pack.refineLevers ?? []).length >= 3,
    `${pack.moduleId} named refine levers required`,
  );
  assert(
    (pack.deliverableSectionOrder ?? []).length >= 3,
    `${pack.moduleId} deliverableSectionOrder required`,
  );
  assert(
    (pack.chatOpenerZh ?? "").trim().length > 0 ||
      (PACK_CHAT_OPENERS_ZH[pack.moduleId] ?? "").trim().length > 0,
    `${pack.moduleId} needs ZH opener (pack or map)`,
  );
  assert(
    pack.idkOptionsBySlotId !== undefined &&
      Object.keys(pack.idkOptionsBySlotId).length >= 3,
    `${pack.moduleId} idkOptionsBySlotId required`,
  );

  const criticalIds: string[] = criticalQualitySlots(pack).map((slot) => slot.id);
  assert(criticalIds.length >= 3, `${pack.moduleId} needs at least 3 critical slots`);

  const overlay: string = pack.systemOverlay;
  assert(overlay.includes("Collect"), `${pack.moduleId} overlay must name Collect`);
  assert(overlay.includes("Confirm"), `${pack.moduleId} overlay must name Confirm`);
  assert(overlay.includes("Deliver"), `${pack.moduleId} overlay must name Deliver`);
  assert(overlay.includes("Refine"), `${pack.moduleId} overlay must name Refine`);
  assert(
    /qualityRuntime/i.test(overlay) || /Script\/Spoken/i.test(overlay),
    `${pack.moduleId} overlay should declare qualityRuntime Script/Spoken mode`,
  );

  return criticalIds;
}

/**
 * True when copy still advertises thin 15 to 45 second ads (Script duration lock anti-pattern).
 */
export function hasThinShortDurationAd(text: string): boolean {
  const lower: string = text.toLowerCase();
  const badPatterns: RegExp[] = [
    /15\s*to\s*45/,
    /15\s*[-–—]\s*45/,
    /15\s*到\s*45/,
  ];
  return badPatterns.some((pattern) => pattern.test(lower) || pattern.test(text));
}
