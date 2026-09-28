/**
 * Smoke eval for Quality Runtime Q4: Hook/Line + Reply family packs.
 * Offline only (no OpenAI). Asserts family opt-in + lifecycle walks + Studio batch force-Deliver.
 *
 * Migrated:
 * - Hook/Line: scroll-stop-hook, hook-rewriter, eight-ways-to-open
 * - Reply: comment-reply-three-lines, dm-comment-closer, soft-cta-closer
 * Skipped (optional picks): soundbite-one-liner, comment-to-content
 *
 * Run: npx tsx scripts/smoke-quality-runtime-q4.ts
 */

import type { ChatMessage } from "../lib/chatTypes";
import { HOOK_STUDIO_MARKER_FROM_IDEA } from "../lib/hookStudio/composeUserMessage";
import { parseHookStudioReply } from "../lib/hookStudio/parseHookStudioHooks";
import { resolvePackForHookStudioBatch } from "../lib/hookStudio/studioBatchOverlay";
import { MODULE_CATALOG } from "../lib/modules/catalog";
import { MODULE_ZH_COPY } from "../lib/modules/catalogZh";
import { COMMENT_REPLY_THREE_LINES_PACK } from "../lib/modules/packs/comment-reply-three-lines";
import { COMMENT_TO_CONTENT_PACK } from "../lib/modules/packs/comment-to-content";
import { DM_COMMENT_CLOSER_PACK } from "../lib/modules/packs/dm-comment-closer";
import { EIGHT_WAYS_TO_OPEN_PACK } from "../lib/modules/packs/eight-ways-to-open";
import { HOOK_REWRITER_PACK } from "../lib/modules/packs/hook-rewriter";
import { SCROLL_STOP_HOOK_PACK } from "../lib/modules/packs/scroll-stop-hook";
import { SOFT_CTA_CLOSER_PACK } from "../lib/modules/packs/soft-cta-closer";
import { SOUNDBITE_ONE_LINER_PACK } from "../lib/modules/packs/soundbite-one-liner";
import {
  buildQualityRuntimeInjection,
  detectLifecycleMode,
  isQualityRuntimeEnabled,
  replyBudgetForMode,
} from "../lib/modules/qualityRuntime";
import { assertHookOrReplyPackContract } from "./lib/assertHookReplyFamilyPack";
import { assert } from "./lib/assertScriptFamilyPack";

const HOOK_INTAKE: Record<string, string> = {
  audience: "Newly diagnosed adults with Type 1 diabetes",
  pain: "Apps and perfect-number advice make them freeze on messy Tuesdays",
  contrast: "One sticky daily habit beats motivation speeches",
  curiosity: "What changed after they stopped chasing perfect numbers",
};

const REPLY_INTAKE: Record<string, string> = {
  comment: "This is just fear marketing. Why should anyone listen?",
  standpoint: "I teach small daily systems from lived practice, not overnight cures",
  audience: "Newly diagnosed adults quietly reading the thread",
};

/**
 * Fixture dense Hook Formula batch for Refine detection.
 */
const HOOK_DENSE_OPENS: string = [
  "Here are annotated Hook Formula opens. Opens only, not a full Reel script.",
  "",
  "1. Newly diagnosed and drowning in apps? One sticky habit beats perfect numbers.",
  "对象: newly diagnosed adults / 痛点: app overwhelm / 反差或结果: sticky habit / 好奇: what changed",
  "",
  "2. Stop chasing perfect numbers on messy Tuesdays. Here is the one habit that stuck.",
  "对象: newly diagnosed adults / 痛点: perfect-number freeze / 反差或结果: one habit / 好奇: which habit",
  "",
  "3. If advice made you freeze, you are not broken. Your system is.",
  "对象: overwhelmed adults / 痛点: freeze / 反差或结果: system not self / 好奇: what system",
  "",
  "Refine levers you can pull next:",
  "- sharper 对象",
  "- stronger 痛点",
  "- clearer 反差/结果",
  "- tighter 好奇",
].join("\n");

/**
 * Fixture dense reply drafts for Refine detection.
 */
const REPLY_DENSE_DRAFTS: string = [
  "Here are short reply drafts. Not a Reel script.",
  "",
  "1. 接住: Thanks for saying that out loud.",
  "澄清: I am not selling fear. I teach one daily habit from lived practice.",
  "拉回主轴: If you want systems over overnight cures, stay for the next tip.",
  "",
  "2. Soft boundary version for drain risk.",
  "",
  "Refine levers: softer 接住, clearer 澄清, stronger 拉回主轴.",
].join("\n");

function assertCatalogJobShaped(moduleId: string): void {
  const catalogEn = MODULE_CATALOG.find((entry) => entry.id === moduleId);
  assert(catalogEn !== undefined, `catalog EN missing ${moduleId}`);
  if (catalogEn === undefined) {
    return;
  }
  assert(
    /open|hook|reply|close|CTA|Collect|confirm|short/i.test(catalogEn.description),
    `catalog EN ${moduleId} should stress opens/replies or lifecycle`,
  );
  assert(
    !/OPENS 60|full Reel script as the only job/i.test(catalogEn.description),
    `catalog EN ${moduleId} must not advertise OPENS as primary job`,
  );

  const catalogZh = MODULE_ZH_COPY[moduleId];
  assert(catalogZh !== undefined, `catalog ZH missing ${moduleId}`);
  if (catalogZh === undefined) {
    return;
  }
  assert(
    /开场|钩子|回复|收尾|收集|确认|短/.test(catalogZh.description),
    `catalog ZH ${moduleId} should stress opens/replies or lifecycle`,
  );
}

function walkScrollStopHookLifecycle(): {
  collect: string;
  confirm: string;
  deliver: string;
  refine: string;
  studioDeliver: string;
} {
  const pack = SCROLL_STOP_HOOK_PACK;

  const collectMessages: ChatMessage[] = [
    {
      role: "user",
      content: "I need hooks but I don't know the pain yet.",
    },
  ];
  const collect = detectLifecycleMode({ pack, messages: collectMessages });
  assert(collect.mode === "collect", `scroll-stop-hook expected collect, got ${collect.mode}`);
  assert(collect.latestUserLooksLikeIdk === true, "scroll-stop-hook IDK should be detected");

  const collectInjection = buildQualityRuntimeInjection({
    pack,
    messages: collectMessages,
  });
  assert(
    collectInjection.promptBlock.includes("COLLECT"),
    "scroll-stop-hook collect injection must name COLLECT",
  );
  assert(
    collectInjection.promptBlock.includes("hook-line"),
    "scroll-stop-hook injection must name hook-line family",
  );

  const confirm = detectLifecycleMode({
    pack,
    messages: [
      {
        role: "user",
        content:
          "Audience newly diagnosed adults. Pain is app overwhelm. Contrast is one sticky habit. Curiosity is what changed.",
      },
    ],
    intake: HOOK_INTAKE,
  });
  assert(
    confirm.mode === "confirm",
    `scroll-stop-hook expected confirm, got ${confirm.mode} (${confirm.reason})`,
  );

  const deliverMessages: ChatMessage[] = [
    {
      role: "user",
      content:
        "Audience newly diagnosed adults. Pain is app overwhelm. Contrast is one sticky habit. Curiosity is what changed.",
    },
    {
      role: "assistant",
      content:
        "Here is what I will deliver: 5 to 8 Hook Formula opens with four-leg annotations. Assumptions: English. Confirm before I write the dense opens?",
    },
    { role: "user", content: "Yes, go ahead and write it." },
  ];
  const deliver = detectLifecycleMode({
    pack,
    messages: deliverMessages,
    intake: HOOK_INTAKE,
  });
  assert(
    deliver.mode === "deliver",
    `scroll-stop-hook expected deliver, got ${deliver.mode} (${deliver.reason})`,
  );
  assert(replyBudgetForMode("deliver") === "dense", "deliver budget must be dense");

  assert(
    HOOK_DENSE_OPENS.length >= 400,
    `hook fixture must be >= 400 chars (got ${HOOK_DENSE_OPENS.length})`,
  );

  const refine = detectLifecycleMode({
    pack,
    messages: [
      ...deliverMessages,
      { role: "assistant", content: HOOK_DENSE_OPENS },
      { role: "user", content: "Make 痛点 sharper." },
    ],
    intake: HOOK_INTAKE,
  });
  assert(
    refine.mode === "refine",
    `scroll-stop-hook expected refine, got ${refine.mode} (${refine.reason})`,
  );

  const studioDeliver = detectLifecycleMode({
    pack,
    messages: [
      {
        role: "user",
        content: [
          HOOK_STUDIO_MARKER_FROM_IDEA,
          "Profile:",
          "Niche / industry: Type 1 diabetes education",
          "Proof / lived edge: Daily systems from lived practice",
          "Topics I can teach: sticky habits, app overwhelm",
          "",
          "Idea: stop chasing perfect numbers",
        ].join("\n"),
      },
    ],
  });
  assert(
    studioDeliver.mode === "deliver",
    `Hook Studio batch must force deliver, got ${studioDeliver.mode} (${studioDeliver.reason})`,
  );
  assert(
    studioDeliver.reason.startsWith("hook_studio_batch:"),
    "Studio force-deliver reason must name hook_studio_batch",
  );

  return {
    collect: collect.mode,
    confirm: confirm.mode,
    deliver: deliver.mode,
    refine: refine.mode,
    studioDeliver: studioDeliver.mode,
  };
}

function walkCommentReplyLifecycle(): {
  collect: string;
  deliver: string;
  refine: string;
} {
  const pack = COMMENT_REPLY_THREE_LINES_PACK;

  const collect = detectLifecycleMode({
    pack,
    messages: [{ role: "user", content: "I don't know how to answer this comment." }],
  });
  assert(collect.mode === "collect", `comment-reply expected collect, got ${collect.mode}`);

  const deliverMessages: ChatMessage[] = [
    {
      role: "user",
      content:
        "Comment: This is just fear marketing. Standpoint: I teach daily systems. Audience: newly diagnosed adults.",
    },
  ];
  const deliver = detectLifecycleMode({
    pack,
    messages: deliverMessages,
    intake: REPLY_INTAKE,
  });
  assert(
    deliver.mode === "deliver",
    `comment-reply expected deliver (confirm optional), got ${deliver.mode} (${deliver.reason})`,
  );

  assert(
    REPLY_DENSE_DRAFTS.length >= 280,
    `reply fixture must be >= 280 chars (got ${REPLY_DENSE_DRAFTS.length})`,
  );

  const refine = detectLifecycleMode({
    pack,
    messages: [
      ...deliverMessages,
      { role: "assistant", content: REPLY_DENSE_DRAFTS },
      { role: "user", content: "Make 拉回主轴 stronger." },
    ],
    intake: REPLY_INTAKE,
  });
  assert(
    refine.mode === "refine",
    `comment-reply expected refine, got ${refine.mode} (${refine.reason})`,
  );

  return {
    collect: collect.mode,
    deliver: deliver.mode,
    refine: refine.mode,
  };
}

function assertStudioRegression(): void {
  const studioResolved = resolvePackForHookStudioBatch({
    pack: SCROLL_STOP_HOOK_PACK,
    latestUserMessage: `${HOOK_STUDIO_MARKER_FROM_IDEA}\nProfile:\nNiche / industry: test`,
  });
  assert(studioResolved.studioMode === "from-idea", "Studio from-idea mode must detect");
  assert(
    studioResolved.pack.moduleId === "scroll-stop-hook",
    "Studio from-idea must stay on scroll-stop-hook pack",
  );

  const rewriteResolved = resolvePackForHookStudioBatch({
    pack: SCROLL_STOP_HOOK_PACK,
    latestUserMessage: "[Hook Studio · rewrite]\nPaste: old open",
  });
  assert(rewriteResolved.studioMode === "rewrite", "Studio rewrite mode must detect");
  assert(
    rewriteResolved.pack.systemOverlay.includes("Hook Rewriter"),
    "Studio rewrite must swap Hook Rewriter overlay",
  );

  const parseResult = parseHookStudioReply(
    [
      "```json",
      JSON.stringify({
        hooks: [
          {
            hook_text: "Open A",
            why_it_works: "Four legs land",
            formula_legs: {
              audience: "coaches",
              pain: "invisible",
              contrast_or_result: "seen then trusted",
              curiosity: "what changed",
            },
            film_first: true,
          },
        ],
      }),
      "```",
    ].join("\n"),
    { mode: "from-idea" },
  );
  assert(parseResult.kind === "cards", "Studio parser must still yield cards");
  if (parseResult.kind === "cards") {
    assert(parseResult.cards.length === 1, "Studio parser card count");
  }
}

function main(): void {
  const hookCritical = assertHookOrReplyPackContract(SCROLL_STOP_HOOK_PACK, "hook-line");
  const rewriterCritical = assertHookOrReplyPackContract(HOOK_REWRITER_PACK, "hook-line");
  const eightCritical = assertHookOrReplyPackContract(EIGHT_WAYS_TO_OPEN_PACK, "hook-line");
  const replyCritical = assertHookOrReplyPackContract(
    COMMENT_REPLY_THREE_LINES_PACK,
    "reply-micro-convert",
  );
  const dmCritical = assertHookOrReplyPackContract(DM_COMMENT_CLOSER_PACK, "reply-micro-convert");
  const softCritical = assertHookOrReplyPackContract(SOFT_CTA_CLOSER_PACK, "reply-micro-convert");

  for (const moduleId of [
    "scroll-stop-hook",
    "hook-rewriter",
    "eight-ways-to-open",
    "comment-reply-three-lines",
    "dm-comment-closer",
    "soft-cta-closer",
  ]) {
    assertCatalogJobShaped(moduleId);
  }

  // Q4 scope: raw pack exports stay unflagged. Q5 migrates these at getModulePack.
  assert(
    isQualityRuntimeEnabled(SOUNDBITE_ONE_LINER_PACK) === false,
    "soundbite-one-liner raw pack must stay unflagged in Q4 scope",
  );
  assert(
    isQualityRuntimeEnabled(COMMENT_TO_CONTENT_PACK) === false,
    "comment-to-content raw pack must stay unflagged in Q4 scope",
  );

  const hookModes = walkScrollStopHookLifecycle();
  const replyModes = walkCommentReplyLifecycle();
  assertStudioRegression();

  console.log(
    JSON.stringify(
      {
        ok: true,
        migratedHookLine: ["scroll-stop-hook", "hook-rewriter", "eight-ways-to-open"],
        migratedReply: [
          "comment-reply-three-lines",
          "dm-comment-closer",
          "soft-cta-closer",
        ],
        deliberatelySkippedInQ4: ["soundbite-one-liner", "comment-to-content"],
        pickNotes: {
          eightWaysOverSoundbite:
            "Eight Ways complements Hook Formula opens; Memory Hook migrated later in Q5 at getModulePack.",
          softCtaOverCommentToContent:
            "Soft CTA is micro-convert close craft; comment-to-content is Ideation-adjacent and migrated in Q5.",
        },
        criticalById: {
          "scroll-stop-hook": hookCritical,
          "hook-rewriter": rewriterCritical,
          "eight-ways-to-open": eightCritical,
          "comment-reply-three-lines": replyCritical,
          "dm-comment-closer": dmCritical,
          "soft-cta-closer": softCritical,
        },
        scrollStopHookLifecycle: hookModes,
        commentReplyLifecycle: replyModes,
        studioRegression: "parse + resolvePack + force-Deliver on Studio markers OK",
        residualRisks: [
          "Live model density is not executed here; browser QC still recommended.",
          "Hook Studio rewrite overlay swap keeps scroll-stop-hook qualitySlots; Studio markers force Deliver.",
          "Q5 migrates soundbite-one-liner and comment-to-content via Q5_MIGRATIONS at registration.",
        ],
      },
      null,
      2,
    ),
  );
}

main();
