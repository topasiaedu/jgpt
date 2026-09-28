/**
 * Smoke eval for Quality Runtime Q2: remaining Script/Spoken family packs.
 * Offline only (no OpenAI). Asserts family opt-in + one lifecycle walk on value-teaching-reel.
 *
 * Run: npx tsx scripts/smoke-quality-runtime-q2.ts
 */

import type { ChatMessage } from "../lib/chatTypes";
import { MODULE_CATALOG } from "../lib/modules/catalog";
import { MODULE_ZH_COPY } from "../lib/modules/catalogZh";
import { FIRST_IMPRESSION_SCRIPT_PACK } from "../lib/modules/packs/first-impression-script";
import { GOAT_FOUR_BEATS_PACK } from "../lib/modules/packs/goat-four-beats";
import { HOT_TAKE_SCRIPT_PACK } from "../lib/modules/packs/hot-take-script";
import { LONG_VIDEO_TRUST_SCRIPT_PACK } from "../lib/modules/packs/long-video-trust-script";
import { PLATFORM_ADAPTER_PACK } from "../lib/modules/packs/platform-adapter";
import { PROCESS_PROOF_REEL_PACK } from "../lib/modules/packs/process-proof-reel";
import { REVISION_SHARPEN_PACK } from "../lib/modules/packs/revision-sharpen";
import { SCRIPT_HUMANIZER_PACK } from "../lib/modules/packs/script-humanizer";
import { STORY_STRUCTURE_SEARCH_PACK } from "../lib/modules/packs/story-structure-search";
import { STORY_TRUST_SCRIPT_PACK } from "../lib/modules/packs/story-trust-script";
import { VALUE_TEACHING_REEL_PACK } from "../lib/modules/packs/value-teaching-reel";
import {
  buildQualityRuntimeInjection,
  detectLifecycleMode,
  isQualityRuntimeEnabled,
  replyBudgetForMode,
} from "../lib/modules/qualityRuntime";
import type { ModulePack } from "../lib/modules/types";
import {
  assert,
  assertScriptSpokenPackContract,
  hasThinShortDurationAd,
} from "./lib/assertScriptFamilyPack";

/** Q2 listed Script packs + one clear extra (story-structure-search). */
const Q2_SCRIPT_PACKS: ModulePack[] = [
  VALUE_TEACHING_REEL_PACK,
  HOT_TAKE_SCRIPT_PACK,
  PROCESS_PROOF_REEL_PACK,
  FIRST_IMPRESSION_SCRIPT_PACK,
  GOAT_FOUR_BEATS_PACK,
  STORY_TRUST_SCRIPT_PACK,
  LONG_VIDEO_TRUST_SCRIPT_PACK,
  STORY_STRUCTURE_SEARCH_PACK,
];

/** Rewrite/Adapter packs deliberately left on legacy for later waves. */
const SKIPPED_ADAPTER_PACKS: ModulePack[] = [
  SCRIPT_HUMANIZER_PACK,
  PLATFORM_ADAPTER_PACK,
  REVISION_SHARPEN_PACK,
];

/** Short-form Script packs that should mention ~60s+ (long trust stays 5 to 15 min). */
const SHORT_FORM_60S_MODULE_IDS: Set<string> = new Set([
  "value-teaching-reel",
  "hot-take-script",
  "process-proof-reel",
  "first-impression-script",
  "goat-four-beats",
]);

function mentions60sOrLongTrust(text: string, moduleId: string): boolean {
  if (moduleId === "long-video-trust-script") {
    return /5\s*to\s*15/i.test(text) || /5\s*到\s*15/.test(text);
  }
  if (moduleId === "story-trust-script" || moduleId === "story-structure-search") {
    return (
      /dense/i.test(text) ||
      /密实/.test(text) ||
      /S\.T\.O\.R\.Y/.test(text) ||
      /Problem/.test(text) ||
      /故事/.test(text)
    );
  }
  return (
    /60\s*秒/.test(text) ||
    /60\s*seconds?/i.test(text) ||
    /~?\s*60s/i.test(text) ||
    /about\s+60/i.test(text) ||
    /大约\s*60/.test(text) ||
    /约\s*60/.test(text)
  );
}

function assertCatalogAligned(moduleId: string): void {
  const catalogEn = MODULE_CATALOG.find((entry) => entry.id === moduleId);
  assert(catalogEn !== undefined, `catalog EN missing ${moduleId}`);
  if (catalogEn === undefined) {
    return;
  }
  assert(
    !hasThinShortDurationAd(catalogEn.description),
    `catalog EN ${moduleId} still advertises 15 to 45`,
  );
  if (SHORT_FORM_60S_MODULE_IDS.has(moduleId)) {
    assert(
      mentions60sOrLongTrust(catalogEn.description, moduleId),
      `catalog EN ${moduleId} should mention ~60s+`,
    );
  }

  const catalogZh = MODULE_ZH_COPY[moduleId];
  assert(catalogZh !== undefined, `catalog ZH missing ${moduleId}`);
  if (catalogZh === undefined) {
    return;
  }
  assert(
    !hasThinShortDurationAd(catalogZh.description),
    `catalog ZH ${moduleId} still advertises 15 to 45`,
  );
  if (SHORT_FORM_60S_MODULE_IDS.has(moduleId)) {
    assert(
      mentions60sOrLongTrust(catalogZh.description, moduleId),
      `catalog ZH ${moduleId} should mention ~60s+`,
    );
  }
}

function walkValueTeachingLifecycle(): {
  collect: string;
  confirm: string;
  deliver: string;
  refine: string;
} {
  const pack = VALUE_TEACHING_REEL_PACK;
  const intake: Record<string, string> = {
    tip: "One sticky morning check beats five abandoned trackers",
    whoHelps: "Newly diagnosed adults who feel overwhelmed",
    nextStep: "Soft: follow or save for the next tip",
    language: "English",
  };

  const collectMessages: ChatMessage[] = [
    {
      role: "user",
      content: "I want a value Reel but I don't know my tip yet.",
    },
  ];
  const collect = detectLifecycleMode({ pack, messages: collectMessages });
  assert(collect.mode === "collect", `expected collect, got ${collect.mode}`);
  assert(collect.latestUserLooksLikeIdk === true, "IDK tip should be detected");

  const collectInjection = buildQualityRuntimeInjection({
    pack,
    messages: collectMessages,
  });
  assert(
    collectInjection.promptBlock.includes("COLLECT"),
    "collect injection must name COLLECT",
  );

  const confirm = detectLifecycleMode({
    pack,
    messages: [
      {
        role: "user",
        content:
          "Tip is one sticky morning check. Audience is newly diagnosed adults. Soft follow close.",
      },
    ],
    intake,
  });
  assert(confirm.mode === "confirm", `expected confirm, got ${confirm.mode} (${confirm.reason})`);

  const deliverMessages: ChatMessage[] = [
    {
      role: "user",
      content:
        "Tip is one sticky morning check. Audience is newly diagnosed adults. Soft follow close.",
    },
    {
      role: "assistant",
      content:
        "Here is what I will draft: a ~60s+ value Reel teaching one sticky morning check. Assumptions: English, soft follow. Confirm before I write the full cut?",
    },
    { role: "user", content: "Yes, go ahead and write it." },
  ];
  const deliver = detectLifecycleMode({
    pack,
    messages: deliverMessages,
    intake,
  });
  assert(deliver.mode === "deliver", `expected deliver, got ${deliver.mode} (${deliver.reason})`);
  assert(replyBudgetForMode("deliver") === "dense", "deliver budget must be dense");

  const denseFixture: string = [
    "Here is your dense value Reel, about 60 seconds and above. Teaching asset, not a hard-sell ad.",
    "",
    "## Hook (0 to 8s)",
    "If five trackers already failed you this week and breakfast still has to happen, keep watching.",
    "On-screen: \"Too many apps. No system.\"",
    "",
    "## Teaching beat (8 to 48s)",
    "You are not lazy. You are drowning in perfect-number advice while the morning still has to start.",
    "Pick one sticky morning check. Do it before phone apps. Say the steps out loud so you can film them.",
    "Step one: open the same note every morning. Step two: write one number you actually need. Step three: close the apps.",
    "Lived beat: the week someone kept one check beat the week they chased five dashboards.",
    "On-screen: \"One habit > five dashboards\"",
    "",
    "## Light invite (48 to 65s)",
    "If this is your stuck point, save this Reel and follow for the next tiny system.",
    "No overnight fame. Just the next tip you can use tomorrow morning.",
    "On-screen: \"Save · follow for tip 2\"",
    "",
    "Refine levers you can pull next:",
    "- tighter Hook",
    "- clearer teaching steps",
    "- softer next step",
  ].join("\n");
  assert(
    denseFixture.length >= 900,
    `value teaching fixture must be >= 900 chars (got ${denseFixture.length})`,
  );

  const refine = detectLifecycleMode({
    pack,
    messages: [
      ...deliverMessages,
      { role: "assistant", content: denseFixture },
      { role: "user", content: "Make the Hook tighter." },
    ],
    intake,
  });
  assert(refine.mode === "refine", `expected refine, got ${refine.mode} (${refine.reason})`);

  return {
    collect: collect.mode,
    confirm: confirm.mode,
    deliver: deliver.mode,
    refine: refine.mode,
  };
}

function main(): void {
  const migratedIds: string[] = [];
  const criticalById: Record<string, string[]> = {};

  for (const pack of Q2_SCRIPT_PACKS) {
    criticalById[pack.moduleId] = assertScriptSpokenPackContract(pack);
    assert(
      !hasThinShortDurationAd(pack.chatOpener),
      `${pack.moduleId} EN opener must not advertise 15 to 45`,
    );
    assert(
      !hasThinShortDurationAd(pack.chatOpenerZh ?? ""),
      `${pack.moduleId} ZH opener must not advertise 15 to 45`,
    );
    if (SHORT_FORM_60S_MODULE_IDS.has(pack.moduleId)) {
      assert(
        mentions60sOrLongTrust(pack.chatOpener, pack.moduleId),
        `${pack.moduleId} EN opener should mention ~60s+`,
      );
      assert(
        mentions60sOrLongTrust(pack.chatOpenerZh ?? "", pack.moduleId),
        `${pack.moduleId} ZH opener should mention ~60s+`,
      );
    }
    assertCatalogAligned(pack.moduleId);
    migratedIds.push(pack.moduleId);
  }

  for (const pack of SKIPPED_ADAPTER_PACKS) {
    assert(
      isQualityRuntimeEnabled(pack) === false,
      `${pack.moduleId} must stay legacy (Rewrite/Adapter)`,
    );
  }

  const modes = walkValueTeachingLifecycle();

  console.log(
    JSON.stringify(
      {
        ok: true,
        migratedModuleIds: migratedIds,
        extraScriptPack: "story-structure-search",
        deliberatelySkippedAdapters: SKIPPED_ADAPTER_PACKS.map((pack) => pack.moduleId),
        criticalById,
        valueTeachingLifecycle: modes,
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
