/**
 * Shared Q5 family contract asserts for Quality Runtime smokes.
 * Covers Map / Ideation / Planner / Mindset / Rewrite / leftover Hook / Diagnosis.
 * Offline helpers only. Not doctrine.
 */

import type { ModulePack } from "../../lib/modules/types";
import { PACK_CHAT_OPENERS_ZH } from "../../lib/modules/packChatOpenersZh";
import {
  criticalQualitySlots,
  isQualityRuntimeEnabled,
} from "../../lib/modules/qualityRuntime";
import type { QualityFamilyId } from "../../lib/modules/qualityRuntime/types";
import { assert } from "./assertScriptFamilyPack";

const Q5_FAMILIES: QualityFamilyId[] = [
  "positioning-map",
  "diagnosis",
  "ideation-bank",
  "planner-ladder",
  "mindset-guardrail",
  "rewrite-adapter",
  "hook-line",
];

/**
 * Asserts a pack opted into a Q5 Quality Runtime family with checklist fields.
 */
export function assertQ5FamilyPackContract(
  pack: ModulePack,
  expectedFamily: QualityFamilyId,
): string[] {
  assert(
    Q5_FAMILIES.includes(expectedFamily),
    `${pack.moduleId} expectedFamily must be a Q5 family`,
  );
  assert(isQualityRuntimeEnabled(pack) === true, `${pack.moduleId} must opt into qualityRuntime`);
  assert(
    pack.qualityFamily === expectedFamily,
    `${pack.moduleId} qualityFamily must be ${expectedFamily}`,
  );
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
    `${pack.moduleId} idkOptionsBySlotId required (>=3 keys)`,
  );

  const criticalIds: string[] = criticalQualitySlots(pack).map((slot) => slot.id);
  assert(criticalIds.length >= 3, `${pack.moduleId} needs at least 3 critical slots`);

  const overlay: string = pack.systemOverlay;
  assert(overlay.includes("Collect"), `${pack.moduleId} overlay must name Collect`);
  assert(overlay.includes("Deliver"), `${pack.moduleId} overlay must name Deliver`);
  assert(overlay.includes("Refine"), `${pack.moduleId} overlay must name Refine`);
  assert(
    /qualityRuntime/i.test(overlay),
    `${pack.moduleId} overlay should declare qualityRuntime mode`,
  );
  assert(
    /not a(?:n)?\s+(?:Instagram\s+)?Reel script|不是 Reel|Never turn this tool into an Instagram Reel|Opens and memory lines only|Job-shaped density only|guardrail plan/i.test(
      overlay,
    ),
    `${pack.moduleId} overlay must refuse Reel-script deliverable shape`,
  );

  const openerBlob: string = [pack.chatOpener, pack.chatOpenerZh ?? ""].join("\n");
  assert(
    !/\bOPENS\b/.test(openerBlob) && !/可拍的密实 OPENS/.test(openerBlob),
    `${pack.moduleId} openers must not advertise OPENS Reel writing`,
  );

  const contractNeedsConfirm: boolean =
    expectedFamily !== "mindset-guardrail" && expectedFamily !== "reply-micro-convert";
  if (contractNeedsConfirm) {
    assert(overlay.includes("Confirm"), `${pack.moduleId} overlay must name Confirm`);
    assert(
      /confirm|确认/i.test(openerBlob),
      `${pack.moduleId} openers should mention confirm before dense deliver`,
    );
  }

  return criticalIds;
}
