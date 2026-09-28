/**
 * Tiny offline smoke for Quality Runtime Q0 helpers (no OpenAI).
 * Run: npx tsx scripts/smoke-quality-runtime-q0.ts
 *
 * Asserts: flag off = legacy; flag on = lifecycle detect + injection present.
 */

import type { ChatMessage } from "../lib/chatTypes";
import type { ModulePack } from "../lib/modules/types";
import {
  buildQualityRuntimeInjection,
  detectLifecycleMode,
  isQualityRuntimeEnabled,
  replyBudgetForMode,
} from "../lib/modules/qualityRuntime";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const LEGACY_PACK: ModulePack = {
  moduleId: "smoke-legacy",
  intakeFields: [
    { id: "niche", label: "Niche", required: true },
    { id: "lesson", label: "Lesson", required: true },
  ],
  probeHints: [],
  systemOverlay: "legacy overlay",
  starterPrompt: "start",
  chatOpener: "opener",
};

const RUNTIME_PACK: ModulePack = {
  ...LEGACY_PACK,
  moduleId: "smoke-runtime",
  qualityRuntime: true,
  qualityFamily: "script-spoken",
  confirmBlurb: "I will draft a timed OPENS script. Confirm before I write the full cut.",
  refineLevers: ["tighter Opening", "stronger Evidence"],
};

function main(): void {
  assert(isQualityRuntimeEnabled(LEGACY_PACK) === false, "legacy pack must be flag-off");
  assert(isQualityRuntimeEnabled(RUNTIME_PACK) === true, "runtime pack must be flag-on");

  const collectMessages: ChatMessage[] = [
    { role: "user", content: "I want a Reel but I don't know my lesson yet." },
  ];
  const collect = detectLifecycleMode({
    pack: RUNTIME_PACK,
    messages: collectMessages,
  });
  assert(collect.mode === "collect", `expected collect, got ${collect.mode}`);
  assert(collect.replyBudget === "clarifying", "collect must use clarifying budget");
  assert(collect.latestUserLooksLikeIdk === true, "IDK should be detected");
  assert(replyBudgetForMode("deliver") === "dense", "deliver budget must be dense");

  const injection = buildQualityRuntimeInjection({
    pack: RUNTIME_PACK,
    messages: collectMessages,
  });
  assert(
    injection.promptBlock.includes("Quality Runtime lifecycle"),
    "injection must include lifecycle block",
  );
  assert(
    injection.promptBlock.includes("I-don't-know option engine"),
    "injection must include IDK stub when user is blank",
  );
  assert(
    injection.promptBlock.includes("COLLECT"),
    "injection must name COLLECT mode",
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        collectMode: collect.mode,
        collectReason: collect.reason,
        missingCritical: collect.missingCriticalSlotIds,
        injectionChars: injection.promptBlock.length,
      },
      null,
      2,
    ),
  );
}

main();
