/**
 * Smoke eval for Quality Runtime Q5: remaining Map / Ideation / Planner / Mindset /
 * Rewrite / leftover Hook / Diagnosis packs.
 * Offline only (no OpenAI). Asserts family opt-in via getModulePack + sample lifecycle walks.
 *
 * Run: npx tsx scripts/smoke-quality-runtime-q5.ts
 */

import type { ChatMessage } from "../lib/chatTypes";
import { getModulePack } from "../lib/modules/packs";
import {
  Q5_MIGRATED_IDS,
  Q5_MIGRATIONS,
  buildQualityRuntimeInjection,
  detectLifecycleMode,
  isQualityRuntimeEnabled,
  replyBudgetForMode,
} from "../lib/modules/qualityRuntime";
import type { QualityFamilyId } from "../lib/modules/qualityRuntime/types";
import { assertQ5FamilyPackContract } from "./lib/assertQ5FamilyPack";
import { assert } from "./lib/assertScriptFamilyPack";

/** Representative packs for lifecycle walks (one per major Q5 family). */
const LIFECYCLE_SAMPLES: Array<{
  moduleId: string;
  family: QualityFamilyId;
  intake: Record<string, string>;
  collectUser: string;
  filledUser: string;
  denseMinChars: number;
}> = [
  {
    moduleId: "positioning-four-questions",
    family: "positioning-map",
    intake: {
      sellWhat: "Daily systems coaching for Type 1 diabetes",
      sellTo: "Newly diagnosed adults",
      sellWhy: "Lived practice beats perfect-number apps",
      mostOf: "Most practical daily-habit coach for messy Tuesdays",
    },
    collectUser: "I need positioning but I don't know who I sell to yet.",
    filledUser:
      "I sell daily systems coaching to newly diagnosed adults because lived practice beats apps. I am the most practical daily-habit coach for messy Tuesdays.",
    denseMinChars: 400,
  },
  {
    moduleId: "faq-content-bank",
    family: "ideation-bank",
    intake: {
      topicsOrQuestions: "Why numbers spike after coffee; myth that perfect ratios equal health",
      niche: "Type 1 diabetes education",
      preferredForms: "口播",
      statusDefault: "idea",
      boundaries: "No medical diagnosis claims",
    },
    collectUser: "I don't know what topics to bank yet.",
    filledUser:
      "Niche Type 1 diabetes education. Topics: coffee spike questions and perfect-ratio myths. Prefer 口播. Status idea. No diagnosis claims.",
    denseMinChars: 400,
  },
  {
    moduleId: "content-asset-planner",
    family: "planner-ladder",
    intake: {
      stage: "building trust",
      slots: "Tue evening, Sunday morning",
      themes: "sticky habits, app overwhelm",
      platform: "IG Reels",
    },
    collectUser: "I don't know my stage yet.",
    filledUser:
      "Stage building trust. Slots Tue evening and Sunday morning. Themes sticky habits and app overwhelm. Platform IG Reels.",
    denseMinChars: 400,
  },
  {
    moduleId: "advice-vs-ego-coach",
    family: "mindset-guardrail",
    intake: {
      plan: "I will tell my story of getting 10k followers fast",
      viewerWhy: "Viewers need one habit they can keep",
      flexLines: "Look how many people follow me",
      format: "Reel",
    },
    collectUser: "I don't know what I plan to say.",
    filledUser:
      "Plan: tell my 10k followers story. Viewer why: one habit they can keep. Flex line: look how many follow me. Format Reel.",
    denseMinChars: 280,
  },
  {
    moduleId: "script-humanizer",
    family: "rewrite-adapter",
    intake: {
      draft: "One must utilize consistent methodologies to optimize glycemic variability outcomes.",
      speakingLanguage: "English",
      jargon: "Type 1",
      length: "60 seconds",
    },
    collectUser: "I don't have a draft yet.",
    filledUser:
      "Draft: One must utilize consistent methodologies to optimize glycemic variability outcomes. Language English. Keep Type 1. About 60 seconds.",
    denseMinChars: 350,
  },
  {
    moduleId: "soundbite-one-liner",
    family: "hook-line",
    intake: {
      niche: "Type 1 diabetes education",
      belief: "Sticky habits beat perfect numbers",
      wordsYouSay: "Messy Tuesday habit",
      wordsFake: "Optimize your endocrine stack",
    },
    collectUser: "I don't know my belief yet.",
    filledUser:
      "Niche Type 1 diabetes education. Belief: sticky habits beat perfect numbers. Words I say: messy Tuesday habit. Fake words: optimize your endocrine stack.",
    denseMinChars: 350,
  },
  {
    moduleId: "ad-vs-asset-checker",
    family: "diagnosis",
    intake: {
      draft: "Buy my course today before seats run out",
      audience: "Newly diagnosed adults",
      goal: "Teach one sticky habit then soft invite",
      mustKeep: "Course name",
    },
    collectUser: "I don't know if this is an ad.",
    filledUser:
      "Draft: Buy my course today before seats run out. Audience newly diagnosed adults. Goal teach one sticky habit then soft invite. Keep course name.",
    denseMinChars: 350,
  },
];

function denseFixture(moduleId: string, family: QualityFamilyId): string {
  return [
    `# Dense ${family} deliverable for ${moduleId}`,
    "Not a Reel script. Job-shaped output only.",
    "",
    "1. Framing grounded in the user's niche facts and constraints.",
    "2. Concrete numbered output with enough detail to use this week.",
    "3. Checkpoints, tags, or do/don't notes so the student knows what to pull next.",
    "4. Crown, rewrite note, or practice line when the family asks for it.",
    "",
    "Refine levers you can pull next:",
    "- sharper core",
    "- tighter audience",
    "- clearer next move",
    "- which piece to use first",
    "",
    "Padding for refine threshold detection: the student already filled critical slots,",
    "confirmed the plan, and now holds a job-shaped bank, map, plan, rewrite, or guardrail",
    "they can act on without another interrogation loop about the same critical facts.",
    "Extra lines keep this fixture above family dense-char thresholds for smoke coverage.",
  ].join("\n");
}

function walkLifecycle(sample: (typeof LIFECYCLE_SAMPLES)[number]): {
  collect: string;
  confirmOrDeliver: string;
  deliver: string;
  refine: string;
} {
  const pack = getModulePack(sample.moduleId);
  assert(pack !== undefined, `missing pack ${sample.moduleId}`);
  if (pack === undefined) {
    throw new Error(`missing pack ${sample.moduleId}`);
  }

  const collectMessages: ChatMessage[] = [
    { role: "user", content: sample.collectUser },
  ];
  const collect = detectLifecycleMode({ pack, messages: collectMessages });
  assert(
    collect.mode === "collect",
    `${sample.moduleId} expected collect, got ${collect.mode}`,
  );

  const collectInjection = buildQualityRuntimeInjection({
    pack,
    messages: collectMessages,
  });
  assert(
    collectInjection.promptBlock.includes("COLLECT") ||
      collectInjection.promptBlock.toLowerCase().includes("collect"),
    `${sample.moduleId} collect injection must name collect`,
  );
  assert(
    collectInjection.promptBlock.includes(sample.family),
    `${sample.moduleId} injection must name family ${sample.family}`,
  );

  const filledMessages: ChatMessage[] = [
    { role: "user", content: sample.filledUser },
  ];
  const afterFill = detectLifecycleMode({
    pack,
    messages: filledMessages,
    intake: sample.intake,
  });

  const needsConfirm: boolean =
    sample.family !== "mindset-guardrail" && sample.family !== "reply-micro-convert";

  if (needsConfirm) {
    assert(
      afterFill.mode === "confirm",
      `${sample.moduleId} expected confirm after fill, got ${afterFill.mode} (${afterFill.reason})`,
    );
  } else {
    assert(
      afterFill.mode === "deliver" || afterFill.mode === "confirm",
      `${sample.moduleId} expected deliver or confirm after fill, got ${afterFill.mode}`,
    );
  }

  const deliverMessages: ChatMessage[] = needsConfirm
    ? [
        { role: "user", content: sample.filledUser },
        {
          role: "assistant",
          content:
            "Here is what I will deliver in 2 to 4 bullets. Assumptions named. Confirm before I write the dense version?",
        },
        { role: "user", content: "Yes, go ahead and write it." },
      ]
    : filledMessages;

  const deliver = detectLifecycleMode({
    pack,
    messages: deliverMessages,
    intake: sample.intake,
  });
  assert(
    deliver.mode === "deliver",
    `${sample.moduleId} expected deliver, got ${deliver.mode} (${deliver.reason})`,
  );
  assert(replyBudgetForMode("deliver") === "dense", "deliver budget must be dense");

  const dense: string = denseFixture(sample.moduleId, sample.family);
  assert(
    dense.length >= sample.denseMinChars,
    `${sample.moduleId} fixture must be >= ${sample.denseMinChars} (got ${dense.length})`,
  );

  const refine = detectLifecycleMode({
    pack,
    messages: [
      ...deliverMessages,
      { role: "assistant", content: dense },
      { role: "user", content: "Make the core sharper." },
    ],
    intake: sample.intake,
  });
  assert(
    refine.mode === "refine",
    `${sample.moduleId} expected refine, got ${refine.mode} (${refine.reason})`,
  );

  return {
    collect: collect.mode,
    confirmOrDeliver: afterFill.mode,
    deliver: deliver.mode,
    refine: refine.mode,
  };
}

function main(): void {
  assert(Q5_MIGRATED_IDS.length === 38, `expected 38 Q5 migrations, got ${Q5_MIGRATED_IDS.length}`);

  const byFamily: Record<string, string[]> = {};
  const criticalById: Record<string, string[]> = {};

  for (const moduleId of Q5_MIGRATED_IDS) {
    const migration = Q5_MIGRATIONS[moduleId];
    assert(migration !== undefined, `missing migration ${moduleId}`);
    if (migration === undefined) {
      continue;
    }

    const pack = getModulePack(moduleId);
    assert(pack !== undefined, `getModulePack missing ${moduleId}`);
    if (pack === undefined) {
      continue;
    }

    assert(
      isQualityRuntimeEnabled(pack) === true,
      `${moduleId} registered pack must have qualityRuntime on`,
    );

    const criticalIds = assertQ5FamilyPackContract(pack, migration.qualityFamily);
    criticalById[moduleId] = criticalIds;

    const bucket: string[] = byFamily[migration.qualityFamily] ?? [];
    bucket.push(moduleId);
    byFamily[migration.qualityFamily] = bucket;
  }

  // Prior flagships must still resolve migrated through getModulePack without Q5 overwrite.
  const who = getModulePack("who-i-serve");
  assert(who !== undefined && who.qualityFamily === "positioning-map", "who-i-serve intact");
  const ig = getModulePack("ig-reel-script");
  assert(ig !== undefined && ig.qualityFamily === "script-spoken", "ig-reel-script intact");
  const scroll = getModulePack("scroll-stop-hook");
  assert(scroll !== undefined && scroll.qualityFamily === "hook-line", "scroll-stop-hook intact");

  const lifecycleById: Record<string, ReturnType<typeof walkLifecycle>> = {};
  for (const sample of LIFECYCLE_SAMPLES) {
    lifecycleById[sample.moduleId] = walkLifecycle(sample);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        migratedCount: Q5_MIGRATED_IDS.length,
        byFamily,
        lifecycleSamples: lifecycleById,
        criticalSample: {
          "positioning-four-questions": criticalById["positioning-four-questions"],
          "faq-content-bank": criticalById["faq-content-bank"],
          "content-asset-planner": criticalById["content-asset-planner"],
          "advice-vs-ego-coach": criticalById["advice-vs-ego-coach"],
          "script-humanizer": criticalById["script-humanizer"],
        },
        remainingLegacy: [],
        note: "Q5 migrations apply at getModulePack registration via Q5_MIGRATIONS + finalizeQ5Pack.",
        residualRisks: [
          "Live model density is not executed here; browser QC still recommended on two non-script tools.",
          "Raw pack file exports stay source doctrine; runtime packs are finalized at registration.",
        ],
      },
      null,
      2,
    ),
  );
}

main();
