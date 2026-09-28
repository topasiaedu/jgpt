/**
 * Smoke eval for Quality Runtime Q3: Positioning + Diagnosis flagships.
 * Offline only (no OpenAI). Asserts family opt-in + lifecycle walks.
 *
 * Positioning flagship chosen: who-i-serve (stronger OCR-locked three-line overlay;
 * positioning-four-questions stays legacy / elevated draft).
 * Diagnosis flagship: ip-stage-check.
 *
 * Run: npx tsx scripts/smoke-quality-runtime-q3.ts
 */

import type { ChatMessage } from "../lib/chatTypes";
import { MODULE_CATALOG } from "../lib/modules/catalog";
import { MODULE_ZH_COPY } from "../lib/modules/catalogZh";
import { IP_STAGE_CHECK_PACK } from "../lib/modules/packs/ip-stage-check";
import { POSITIONING_FOUR_QUESTIONS_PACK } from "../lib/modules/packs/positioning-four-questions";
import { WHO_I_SERVE_PACK } from "../lib/modules/packs/who-i-serve";
import {
  buildQualityRuntimeInjection,
  detectLifecycleMode,
  isQualityRuntimeEnabled,
  replyBudgetForMode,
} from "../lib/modules/qualityRuntime";
import { assertMapOrDiagnosisPackContract } from "./lib/assertMapDiagnosisFamilyPack";
import { assert } from "./lib/assertScriptFamilyPack";

const WHO_INTAKE: Record<string, string> = {
  whoAmI:
    "Type 1 diabetes educator and coach who teaches daily systems from lived practice",
  whoIHelp: "Newly diagnosed adults who feel overwhelmed by apps and perfect-number advice",
  whatISolve:
    "Turn diagnosis chaos into one sticky daily habit they can keep on a messy Tuesday",
};

const STAGE_INTAKE: Record<string, string> = {
  context: "Solo Type 1 diabetes education IP on Instagram and short video",
  check01: "No: still guessing which three content types fit best",
  check02: "Unclear: posted in bursts, not four stable weeks",
  check03: "No: every Reel tries to teach and sell at once",
  check04: "Unclear: some steps exist, edit and publish are improvised",
  check05: "No: post and move on without weekly review",
  check06: "No: DMs come in but no clear inquire to delivery path",
};

/**
 * Fixture dense three-line map for Refine detection (map threshold ~420 chars).
 */
const WHO_DENSE_MAP: string = [
  "Here is your filled three-line positioning map. Not a Reel script.",
  "",
  "## 1. 我是谁",
  "Type 1 diabetes educator and coach who teaches daily systems from lived practice, not motivation speeches.",
  "",
  "## 2. 我帮谁",
  "Newly diagnosed adults who feel overwhelmed by apps and perfect-number advice.",
  "",
  "## 3. 解决什么",
  "Turn diagnosis chaos into one sticky daily habit they can keep on a messy Tuesday.",
  "",
  "Refine levers you can pull next:",
  "- sharper 我是谁",
  "- narrower 我帮谁",
  "- clearer 解决什么",
  "- tighter market language",
].join("\n");

/**
 * Fixture dense diagnostic for Refine detection.
 */
const STAGE_DENSE_DIAGNOSTIC: string = [
  "SELF DIAGNOSTIC / 自我诊断 scorecard. Not a Reel script.",
  "",
  "## Framing call (内容还是系统)",
  "Closer to 内容 than 系统: you can teach, but publishing rhythm, roles, and inquire path are not a working system yet.",
  "",
  "## Six-check scorecard",
  "01 three content types: No. Cite: still guessing which three fit.",
  "02 four weeks publish: Unclear. Cite: bursty posting, not four stable weeks.",
  "03 traffic / trust / deal roles: No. Cite: every Reel tries to teach and sell.",
  "04 topic-to-publish flow: Unclear. Cite: edit and publish improvised.",
  "05 weekly data adjust: No. Cite: post and move on.",
  "06 inquire / deliver / deal: No. Cite: DMs with no delivery path.",
  "",
  "## Ranked next stage",
  "1. Lock three content types you will actually film.",
  "2. Build four weeks of continuous publish before adding deal pressure.",
  "3. Split traffic vs trust pieces so one Reel is not everything.",
  "",
  "Refine levers you can pull next:",
  "- clearer framing call",
  "- re-ranked next checks",
  "- more concrete top action",
].join("\n");

function assertCatalogNotScript(moduleId: string): void {
  const catalogEn = MODULE_CATALOG.find((entry) => entry.id === moduleId);
  assert(catalogEn !== undefined, `catalog EN missing ${moduleId}`);
  if (catalogEn === undefined) {
    return;
  }
  assert(
    /not a(?:n)?\s+(?:spoken\s+)?Reel|not a script|diagnostic|map/i.test(catalogEn.description) ||
      /Collect|confirm|dense/i.test(catalogEn.description),
    `catalog EN ${moduleId} should stress map/diagnostic job or lifecycle`,
  );

  const catalogZh = MODULE_ZH_COPY[moduleId];
  assert(catalogZh !== undefined, `catalog ZH missing ${moduleId}`);
  if (catalogZh === undefined) {
    return;
  }
  assert(
    /不是 Reel|不是脚本|地图|诊断|收集|确认/.test(catalogZh.description),
    `catalog ZH ${moduleId} should stress map/diagnostic job or lifecycle`,
  );
}

function walkWhoIServeLifecycle(): {
  collect: string;
  confirm: string;
  deliver: string;
  refine: string;
} {
  const pack = WHO_I_SERVE_PACK;

  const collectMessages: ChatMessage[] = [
    {
      role: "user",
      content: "I want positioning help but I don't know who I help yet.",
    },
  ];
  const collect = detectLifecycleMode({ pack, messages: collectMessages });
  assert(collect.mode === "collect", `who-i-serve expected collect, got ${collect.mode}`);
  assert(collect.latestUserLooksLikeIdk === true, "who-i-serve IDK should be detected");

  const collectInjection = buildQualityRuntimeInjection({
    pack,
    messages: collectMessages,
  });
  assert(
    collectInjection.promptBlock.includes("COLLECT"),
    "who-i-serve collect injection must name COLLECT",
  );
  assert(
    collectInjection.promptBlock.includes("positioning-map"),
    "who-i-serve injection must name positioning-map family",
  );

  const confirm = detectLifecycleMode({
    pack,
    messages: [
      {
        role: "user",
        content:
          "I am a Type 1 diabetes educator. I help newly diagnosed adults. I solve sticky daily habits.",
      },
    ],
    intake: WHO_INTAKE,
  });
  assert(
    confirm.mode === "confirm",
    `who-i-serve expected confirm, got ${confirm.mode} (${confirm.reason})`,
  );

  const deliverMessages: ChatMessage[] = [
    {
      role: "user",
      content:
        "I am a Type 1 diabetes educator. I help newly diagnosed adults. I solve sticky daily habits.",
    },
    {
      role: "assistant",
      content:
        "Here is what I will deliver: three-line map (我是谁 / 我帮谁 / 解决什么). Assumptions: English, no stitch one-liner unless you ask. Confirm before I write the filled map?",
    },
    { role: "user", content: "Yes, go ahead and write it." },
  ];
  const deliver = detectLifecycleMode({
    pack,
    messages: deliverMessages,
    intake: WHO_INTAKE,
  });
  assert(
    deliver.mode === "deliver",
    `who-i-serve expected deliver, got ${deliver.mode} (${deliver.reason})`,
  );
  assert(replyBudgetForMode("deliver") === "dense", "deliver budget must be dense");

  assert(
    WHO_DENSE_MAP.length >= 420,
    `who map fixture must be >= 420 chars (got ${WHO_DENSE_MAP.length})`,
  );

  const refine = detectLifecycleMode({
    pack,
    messages: [
      ...deliverMessages,
      { role: "assistant", content: WHO_DENSE_MAP },
      { role: "user", content: "Make 我帮谁 narrower." },
    ],
    intake: WHO_INTAKE,
  });
  assert(
    refine.mode === "refine",
    `who-i-serve expected refine, got ${refine.mode} (${refine.reason})`,
  );

  return {
    collect: collect.mode,
    confirm: confirm.mode,
    deliver: deliver.mode,
    refine: refine.mode,
  };
}

function walkIpStageCheckLifecycle(): {
  collect: string;
  confirm: string;
  deliver: string;
  refine: string;
} {
  const pack = IP_STAGE_CHECK_PACK;

  const collectMessages: ChatMessage[] = [
    {
      role: "user",
      content: "I need a stage check but I don't know my three content types.",
    },
  ];
  const collect = detectLifecycleMode({ pack, messages: collectMessages });
  assert(collect.mode === "collect", `ip-stage-check expected collect, got ${collect.mode}`);
  assert(collect.latestUserLooksLikeIdk === true, "ip-stage-check IDK should be detected");

  const collectInjection = buildQualityRuntimeInjection({
    pack,
    messages: collectMessages,
  });
  assert(
    collectInjection.promptBlock.includes("COLLECT"),
    "ip-stage-check collect injection must name COLLECT",
  );
  assert(
    collectInjection.promptBlock.includes("diagnosis"),
    "ip-stage-check injection must name diagnosis family",
  );

  const confirm = detectLifecycleMode({
    pack,
    messages: [
      {
        role: "user",
        content:
          "I teach Type 1 diabetes education. Checks: no on types, unclear publish, no on roles, unclear flow, no data, no inquire path.",
      },
    ],
    intake: STAGE_INTAKE,
  });
  assert(
    confirm.mode === "confirm",
    `ip-stage-check expected confirm, got ${confirm.mode} (${confirm.reason})`,
  );

  const deliverMessages: ChatMessage[] = [
    {
      role: "user",
      content:
        "I teach Type 1 diabetes education. Checks: no on types, unclear publish, no on roles, unclear flow, no data, no inquire path.",
    },
    {
      role: "assistant",
      content:
        "Here is what I will deliver: 内容还是系统 framing, six-check scorecard, ranked unanswered next stage. Assumptions from your nos and unclears. Confirm before the dense diagnostic?",
    },
    { role: "user", content: "Yes, go ahead." },
  ];
  const deliver = detectLifecycleMode({
    pack,
    messages: deliverMessages,
    intake: STAGE_INTAKE,
  });
  assert(
    deliver.mode === "deliver",
    `ip-stage-check expected deliver, got ${deliver.mode} (${deliver.reason})`,
  );

  assert(
    STAGE_DENSE_DIAGNOSTIC.length >= 420,
    `stage fixture must be >= 420 chars (got ${STAGE_DENSE_DIAGNOSTIC.length})`,
  );

  const refine = detectLifecycleMode({
    pack,
    messages: [
      ...deliverMessages,
      { role: "assistant", content: STAGE_DENSE_DIAGNOSTIC },
      { role: "user", content: "Re-rank the next checks with a more concrete top action." },
    ],
    intake: STAGE_INTAKE,
  });
  assert(
    refine.mode === "refine",
    `ip-stage-check expected refine, got ${refine.mode} (${refine.reason})`,
  );

  return {
    collect: collect.mode,
    confirm: confirm.mode,
    deliver: deliver.mode,
    refine: refine.mode,
  };
}

function main(): void {
  const whoCritical = assertMapOrDiagnosisPackContract(WHO_I_SERVE_PACK, "positioning-map");
  const stageCritical = assertMapOrDiagnosisPackContract(IP_STAGE_CHECK_PACK, "diagnosis");

  assertCatalogNotScript("who-i-serve");
  assertCatalogNotScript("ip-stage-check");

  assert(
    isQualityRuntimeEnabled(POSITIONING_FOUR_QUESTIONS_PACK) === false,
    "positioning-four-questions must stay legacy in Q3 (not chosen flagship)",
  );

  const whoModes = walkWhoIServeLifecycle();
  const stageModes = walkIpStageCheckLifecycle();

  console.log(
    JSON.stringify(
      {
        ok: true,
        positioningFlagship: "who-i-serve",
        positioningChoiceWhy:
          "Stronger OCR-locked three-line overlay and approved slide binding; positioning-four-questions was deferred in Q3 (raw pack file still legacy; Q5 migrates it at getModulePack).",
        diagnosisFlagship: "ip-stage-check",
        deliberatelySkippedPositioningInQ3: ["positioning-four-questions"],
        criticalById: {
          "who-i-serve": whoCritical,
          "ip-stage-check": stageCritical,
        },
        whoIServeLifecycle: whoModes,
        ipStageCheckLifecycle: stageModes,
        residualRisks: [
          "Live model density is not executed here; browser QC still recommended.",
          "Lifecycle slot fill is intake + heuristic; natural chat without intake may stay in Collect longer.",
          "Q5 migrates remaining Map/Ideation/Planner/Mindset via Q5_MIGRATIONS at registration.",
        ],
      },
      null,
      2,
    ),
  );
}

main();
