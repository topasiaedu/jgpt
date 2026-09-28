/**
 * Golden / smoke eval for Quality Runtime Q1: ig-reel-script flagship.
 * Offline only (no OpenAI). Walks a Type-1 diabetes-style coaching path through
 * Collect → Confirm → Deliver → Refine and asserts Artemo-comparable density gates.
 *
 * Run: npx tsx scripts/smoke-quality-runtime-q1.ts
 *
 * Limits (honest):
 * - Does not call the live model; density is asserted on a fixture deliverable + pack contract.
 * - Lifecycle mode uses intake + dialogue heuristics from Q0 (not full NLU).
 */

import type { ChatMessage } from "../lib/chatTypes";
import { MODULE_CATALOG } from "../lib/modules/catalog";
import { MODULE_ZH_COPY } from "../lib/modules/catalogZh";
import { PACK_CHAT_OPENERS_ZH } from "../lib/modules/packChatOpenersZh";
import { IG_REEL_SCRIPT_PACK } from "../lib/modules/packs/ig-reel-script";
import {
  buildQualityRuntimeInjection,
  criticalQualitySlots,
  detectLifecycleMode,
  isQualityRuntimeEnabled,
  replyBudgetForMode,
} from "../lib/modules/qualityRuntime";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertNoShortDurationAd(text: string, label: string): void {
  const lower: string = text.toLowerCase();
  const badPatterns: RegExp[] = [
    /15\s*to\s*45/,
    /15\s*[-–—]\s*45/,
    /15\s*到\s*45/,
  ];
  for (const pattern of badPatterns) {
    assert(!pattern.test(lower) && !pattern.test(text), `${label} still advertises 15 to 45 duration`);
  }
}

function assertMentions60s(text: string, label: string): void {
  const ok: boolean =
    /60\s*秒/.test(text) ||
    /60\s*seconds?/i.test(text) ||
    /~?\s*60s/i.test(text) ||
    /about\s+60/i.test(text) ||
    /大约\s*60/.test(text) ||
    /约\s*60/.test(text);
  assert(ok, `${label} must mention ~60s+ duration`);
}

/** Diabetes-style critical answers (user owns niche facts; scaffold for eval only). */
const DIABETES_INTAKE: Record<string, string> = {
  niche: "Type 1 diabetes education for newly diagnosed adults",
  audience: "Adults recently diagnosed with Type 1 who feel overwhelmed by daily decisions",
  standpoint: "Small daily systems beat motivation speeches",
  lesson:
    "The first week after diagnosis, people chase perfect numbers. One sticky habit beats five abandoned apps.",
  language: "English",
  ctaSoftness: "Soft: follow or save for the next tip",
  assetType: "认知",
};

/**
 * Fixture dense OPENS deliverable (~60s+). Used to assert density gates and Refine mode.
 * Not model output; shape must match Script/Spoken contract expectations.
 */
const DIABETES_DENSE_DELIVERABLE: string = [
  "Here is your dense OPENS Reel, about 60 seconds and above. Teaching asset, not a hard-sell ad.",
  "",
  "## Opening 开场 (0 to 8s)",
  "If you were just diagnosed with Type 1 and your phone is full of apps you already quit, this is for you.",
  "On-screen: \"New diagnosis. Too many apps.\"",
  "",
  "## Problem 问题 (8 to 20s)",
  "You are not lazy. You are drowning in perfect-number advice while breakfast still has to happen.",
  "The stuck point is not information. It is one habit that survives a messy Tuesday.",
  "On-screen: \"Info overload ≠ a system\"",
  "",
  "## Evidence 证据 (20 to 35s)",
  "I see the same pattern: five trackers installed, zero used after day three.",
  "Lived beat: the week someone picked one meal check-in and kept it beat the week they chased five dashboards.",
  "On-screen: \"One habit > five dashboards\"",
  "",
  "## New Way 新解 (35 to 52s)",
  "Standpoint: small daily systems beat motivation speeches.",
  "Pick one sticky habit for seven days. Not a new identity. One move you can film and repeat.",
  "On-screen: \"Systems > speeches\"",
  "",
  "## Step 下一步 (52 to 65s)",
  "If this is your stuck point, save this Reel and follow for the next tiny system.",
  "No overnight fame. Just the next tip you can use tomorrow morning.",
  "On-screen: \"Save · follow for tip 2\"",
  "",
  "四种内容资产 tag: 认知",
  "",
  "Refine levers you can pull next:",
  "- tighter Opening",
  "- stronger Evidence",
  "- softer Step",
].join("\n");

const OPENS_BEAT_MARKERS: string[] = [
  "Opening",
  "Problem",
  "Evidence",
  "New Way",
  "Step",
];

function assertDensityGates(deliverable: string): void {
  assert(
    deliverable.length >= 900,
    `dense deliverable must be >= 900 chars (got ${deliverable.length})`,
  );
  for (const marker of OPENS_BEAT_MARKERS) {
    assert(
      deliverable.includes(marker),
      `dense deliverable missing OPENS beat marker: ${marker}`,
    );
  }
  assertMentions60s(deliverable, "fixture deliverable");
  assert(
    /on-screen/i.test(deliverable),
    "dense deliverable should include on-screen text cues",
  );
  assert(
    /refine lever/i.test(deliverable) || /tighter Opening/i.test(deliverable),
    "dense deliverable should name refine levers",
  );
  const timingHits: number = (deliverable.match(/\d+\s*to\s*\d+s/gi) ?? []).length;
  assert(timingHits >= 4, `expected timed beat ranges, got ${timingHits}`);
}

function main(): void {
  const pack = IG_REEL_SCRIPT_PACK;

  // --- Pack opt-in + Script family ---
  assert(isQualityRuntimeEnabled(pack) === true, "ig-reel-script must opt into qualityRuntime");
  assert(pack.qualityFamily === "script-spoken", "qualityFamily must be script-spoken");
  assert(
    (pack.confirmBlurb ?? "").trim().length > 0,
    "confirmBlurb required before dense deliver",
  );
  assert(
    (pack.refineLevers ?? []).length >= 3,
    "named refine levers required",
  );
  assert(
    (pack.deliverableSectionOrder ?? []).length >= 5,
    "deliverableSectionOrder must cover OPENS beats",
  );

  const criticalIds: string[] = criticalQualitySlots(pack).map((slot) => slot.id);
  for (const requiredId of [
    "niche",
    "audience",
    "standpoint",
    "lesson",
    "language",
    "ctaSoftness",
  ]) {
    assert(criticalIds.includes(requiredId), `missing critical slot: ${requiredId}`);
  }
  assert(
    pack.idkOptionsBySlotId !== undefined &&
      Object.keys(pack.idkOptionsBySlotId).length >= 5,
    "idkOptionsBySlotId required for critical slots",
  );

  // --- Duration lock: openers / starter / catalog (must not advertise 15–45) ---
  assertNoShortDurationAd(pack.chatOpener, "chatOpener EN");
  assertNoShortDurationAd(pack.chatOpenerZh ?? "", "chatOpenerZh");
  assertNoShortDurationAd(pack.starterPrompt, "starterPrompt");
  assertMentions60s(pack.chatOpener, "chatOpener EN");
  assertMentions60s(pack.chatOpenerZh ?? "", "chatOpenerZh");
  assertMentions60s(pack.starterPrompt, "starterPrompt");
  assertMentions60s(pack.systemOverlay, "systemOverlay");

  const zhMapOpener: string | undefined = PACK_CHAT_OPENERS_ZH["ig-reel-script"];
  assert(typeof zhMapOpener === "string" && zhMapOpener.length > 0, "ZH map opener missing");
  assertNoShortDurationAd(zhMapOpener, "packChatOpenersZh ig-reel-script");
  assertMentions60s(zhMapOpener, "packChatOpenersZh ig-reel-script");

  const catalogEn = MODULE_CATALOG.find((entry) => entry.id === "ig-reel-script");
  if (catalogEn === undefined) {
    throw new Error("catalog EN missing ig-reel-script");
  }
  assertNoShortDurationAd(catalogEn.description, "catalog EN description");
  assertMentions60s(catalogEn.description, "catalog EN description");
  assertMentions60s(catalogEn.title, "catalog EN title");

  const catalogZh = MODULE_ZH_COPY["ig-reel-script"];
  if (catalogZh === undefined) {
    throw new Error("catalog ZH missing ig-reel-script");
  }
  assertNoShortDurationAd(catalogZh.description, "catalog ZH description");
  assertMentions60s(catalogZh.description, "catalog ZH description");
  assertMentions60s(catalogZh.title, "catalog ZH title");

  // --- Density fixture (Artemo-comparable shape gates) ---
  assertDensityGates(DIABETES_DENSE_DELIVERABLE);

  // --- Lifecycle walk: diabetes-style Collect → Confirm → Deliver → Refine ---
  const collectMessages: ChatMessage[] = [
    {
      role: "user",
      content: "I want an IG Reel for my Type 1 diabetes education work, but I don't know my lesson yet.",
    },
  ];
  const collect = detectLifecycleMode({
    pack,
    messages: collectMessages,
  });
  assert(collect.mode === "collect", `expected collect, got ${collect.mode}`);
  assert(collect.replyBudget === "clarifying", "collect must use clarifying budget");
  assert(collect.latestUserLooksLikeIdk === true, "IDK / blank lesson should be detected");
  assert(collect.missingCriticalSlotIds.length > 0, "collect should report missing criticals");

  const collectInjection = buildQualityRuntimeInjection({
    pack,
    messages: collectMessages,
  });
  assert(
    collectInjection.promptBlock.includes("COLLECT"),
    "collect injection must name COLLECT",
  );
  assert(
    collectInjection.promptBlock.includes("I-don't-know option engine"),
    "collect IDK turn must include option engine",
  );
  assert(
    collectInjection.promptBlock.includes("Niche") ||
      collectInjection.promptBlock.includes("lesson"),
    "IDK options should surface a critical slot label",
  );

  const confirm = detectLifecycleMode({
    pack,
    messages: [
      {
        role: "user",
        content:
          "Niche is Type 1 diabetes education. Audience is newly diagnosed adults. Lesson is one sticky habit beats five abandoned apps.",
      },
    ],
    intake: DIABETES_INTAKE,
  });
  assert(confirm.mode === "confirm", `expected confirm, got ${confirm.mode} (${confirm.reason})`);
  assert(confirm.replyBudget === "clarifying", "confirm must stay clarifying");
  assert(confirm.missingCriticalSlotIds.length === 0, "intake should fill all criticals");

  const confirmInjection = buildQualityRuntimeInjection({
    pack,
    messages: [
      {
        role: "user",
        content:
          "Niche is Type 1 diabetes education. Audience is newly diagnosed adults. Lesson is one sticky habit beats five abandoned apps.",
      },
    ],
    intake: DIABETES_INTAKE,
  });
  assert(
    confirmInjection.promptBlock.includes("CONFIRM"),
    "confirm injection must name CONFIRM",
  );
  assert(
    !confirmInjection.promptBlock.includes("### Current mode: DELIVER"),
    "confirm must not be deliver mode",
  );

  const deliverMessages: ChatMessage[] = [
    {
      role: "user",
      content:
        "Niche is Type 1 diabetes education. Audience is newly diagnosed adults. Lesson is one sticky habit beats five abandoned apps.",
    },
    {
      role: "assistant",
      content:
        "Here is what I will draft: a ~60s+ OPENS Reel on one sticky habit after diagnosis. Assumptions: soft follow/save close, English on camera. Confirm before I write the full cut?",
    },
    { role: "user", content: "Yes, go ahead and write it." },
  ];
  const deliver = detectLifecycleMode({
    pack,
    messages: deliverMessages,
    intake: DIABETES_INTAKE,
  });
  assert(deliver.mode === "deliver", `expected deliver, got ${deliver.mode} (${deliver.reason})`);
  assert(replyBudgetForMode("deliver") === "dense", "deliver budget must be dense");
  assert(deliver.replyBudget === "dense", "deliver detection must set dense budget");

  const deliverInjection = buildQualityRuntimeInjection({
    pack,
    messages: deliverMessages,
    intake: DIABETES_INTAKE,
  });
  assert(
    deliverInjection.promptBlock.includes("DELIVER"),
    "deliver injection must name DELIVER",
  );
  assert(
    deliverInjection.promptBlock.includes("qualityRuntime dense OVERRIDE") ||
      deliverInjection.promptBlock.includes("dense"),
    "deliver injection must allow dense budget",
  );
  assert(
    deliverInjection.promptBlock.includes("Opening") ||
      deliverInjection.promptBlock.includes("timed"),
    "deliver section order should reference OPENS / timed beats",
  );

  const refineMessages: ChatMessage[] = [
    ...deliverMessages,
    { role: "assistant", content: DIABETES_DENSE_DELIVERABLE },
    { role: "user", content: "Make the Opening tighter and keep Evidence strong." },
  ];
  const refine = detectLifecycleMode({
    pack,
    messages: refineMessages,
    intake: DIABETES_INTAKE,
  });
  assert(refine.mode === "refine", `expected refine, got ${refine.mode} (${refine.reason})`);
  assert(refine.replyBudget === "dense", "refine must keep dense budget");

  const refineInjection = buildQualityRuntimeInjection({
    pack,
    messages: refineMessages,
    intake: DIABETES_INTAKE,
  });
  assert(
    refineInjection.promptBlock.includes("REFINE"),
    "refine injection must name REFINE",
  );
  assert(
    refineInjection.promptBlock.includes("tighter Opening"),
    "refine injection should list named levers",
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        moduleId: pack.moduleId,
        qualityFamily: pack.qualityFamily,
        criticalSlotIds: criticalIds,
        modes: {
          collect: collect.mode,
          confirm: confirm.mode,
          deliver: deliver.mode,
          refine: refine.mode,
        },
        densityChars: DIABETES_DENSE_DELIVERABLE.length,
        residualRisks: [
          "Live model density is not executed here; browser QC still recommended.",
          "Lifecycle slot fill is intake + heuristic; natural chat without intake may stay in Collect longer.",
        ],
      },
      null,
      2,
    ),
  );
}

main();
