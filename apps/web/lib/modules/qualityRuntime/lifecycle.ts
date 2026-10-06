/**
 * Lifecycle mode detection + Collect → Confirm → Deliver → Refine injection.
 *
 * Q0 heuristic (honest limits):
 * - Uses conversation text markers, optional legacy intake map, and critical slot labels.
 * - Not a full NLU slot filler. Q1+ packs can tighten with pack-specific markers.
 * - Default for unmigrated packs: qualityRuntime stays off; this module is unused.
 */

import type { ChatMessage } from "@/lib/chatTypes";
import type { ModulePack } from "@/lib/modules/types";
import { getFamilyDeliverableContract } from "@/lib/modules/qualityRuntime/families";
import { looksLikeIdkOrBlank } from "@/lib/modules/qualityRuntime/idkOptions";
import {
  criticalQualitySlots,
  formatQualitySlotChecklist,
  resolveQualitySlots,
} from "@/lib/modules/qualityRuntime/slots";
import { buildReplyBudgetInjection } from "@/lib/modules/qualityRuntime/budgets";
import { SCRIPT_SPOKEN_TIMING_CALIBRATION } from "@/lib/modules/qualityRuntime/spokenTiming";
import type {
  LifecycleDetection,
  LifecycleMode,
  QualitySlot,
} from "@/lib/modules/qualityRuntime/types";

/** Rough length that suggests a prior dense Script/Spoken deliverable already landed. */
const DENSE_ASSISTANT_CHAR_THRESHOLD: number = 900;

/**
 * Map / Diagnosis deliverables are shorter than ~60s scripts.
 * Still require structure markers so clarifying turns do not flip to Refine.
 */
const DENSE_MAP_DIAGNOSIS_CHAR_THRESHOLD: number = 420;

/** Hook/Line annotated opens are shorter than full scripts. */
const DENSE_HOOK_LINE_CHAR_THRESHOLD: number = 400;

/** Reply / micro-convert drafts are short-but-complete. */
const DENSE_REPLY_CHAR_THRESHOLD: number = 280;

/** Ideation banks, planners, mindset plans, and rewrites sit between map and script density. */
const DENSE_Q5_FAMILY_CHAR_THRESHOLD: number = 450;

const JUST_WRITE_PATTERNS: RegExp[] = [
  /\bjust\s+write\s+it\b/i,
  /\bwrite\s+it\s+now\b/i,
  /\bgive\s+me\s+the\s+(script|draft|full|map|diagnostic|scorecard|lines|hooks?|opens?|replies|closes?)\b/i,
  /\bgo\s+ahead\b/i,
  /\blet'?s\s+go\b/i,
  /\bready\b/i,
  /^yes\b/i,
  /^yep\b/i,
  /^ok\b/i,
  /^okay\b/i,
  /直接写/,
  /直接寫/,
  /写一版/,
  /寫一版/,
  /可以写了/,
  /可以寫了/,
  /开始写/,
  /開始寫/,
  /就这样写/,
  /就這樣寫/,
  /给我.*地图/,
  /給我.*地圖/,
  /给我诊断/,
  /給我診斷/,
  /写三行/,
  /寫三行/,
  /^好$/,
  /^行$/,
  /^可以$/,
];

const CONFIRM_ASSISTANT_PATTERNS: RegExp[] = [
  /\bhere'?s\s+what\s+i'?ll\s+(write|deliver|draft)\b/i,
  /\bi\s+will\s+(write|draft|deliver)\b/i,
  /\bconfirm\b/i,
  /\bready\s+to\s+write\b/i,
  /\bassumption/i,
  /我准备写/,
  /我準備寫/,
  /确认一下/,
  /確認一下/,
  /我会按/,
  /我會按/,
  /假设/,
  /假設/,
];

/**
 * Latest non-empty user message, or empty string.
 */
function latestUserContent(messages: ChatMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message: ChatMessage | undefined = messages[index];
    if (message === undefined || message.role !== "user") {
      continue;
    }
    const content: string = message.content.trim();
    if (content.length > 0) {
      return content;
    }
  }
  return "";
}

/**
 * True when intake or dialogue roughly covers this slot.
 * Q0 honesty: dialogue match requires a non-IDK user turn with enough substance.
 * Label substring alone on a blank/IDK line does not count as filled.
 */
function slotLooksFilled(
  slot: QualitySlot,
  messages: ChatMessage[],
  intake: Record<string, string> | undefined,
): boolean {
  if (intake !== undefined) {
    const raw: string | undefined = intake[slot.id];
    if (typeof raw === "string" && raw.trim().length > 0) {
      return true;
    }
  }

  const labelToken: string = slot.label.trim().toLowerCase();
  const idToken: string = slot.id.trim().toLowerCase();

  for (const message of messages) {
    if (message.role !== "user") {
      continue;
    }
    const content: string = message.content.trim();
    if (content.length < 40) {
      continue;
    }
    if (looksLikeIdkOrBlank(content)) {
      continue;
    }
    const haystack: string = content.toLowerCase();
    if (labelToken.length >= 4 && haystack.includes(labelToken)) {
      return true;
    }
    if (idToken.length >= 3 && haystack.includes(idToken)) {
      return true;
    }
  }

  return false;
}

/**
 * True when content looks structured for the pack family (or shared markers).
 */
function looksStructuredDeliverable(
  content: string,
  familyId: ModulePack["qualityFamily"],
): boolean {
  const shared: boolean =
    /^#{1,3}\s+/m.test(content) ||
    /^\d+\.\s+/m.test(content) ||
    /Opening|Problem|Evidence|New Way|Step|开场|问题|证据|新解|下一步/i.test(content);

  if (familyId === "positioning-map") {
    return (
      shared ||
      /我是谁|我幫誰|我帮谁|解决什么|解決什麼|three-line|anti-audience|one-liner|定位/i.test(
        content,
      )
    );
  }

  if (familyId === "diagnosis") {
    return (
      shared ||
      /SELF\s*DIAGNOSTIC|自我诊断|自我診斷|内容还是系统|內容還是系統|scorecard|记分卡|記分卡|Next stage|下一阶段|下一階段/i.test(
        content,
      )
    );
  }

  if (familyId === "hook-line") {
    return (
      shared ||
      /Hook Formula|对象|痛点|反差|好奇|formula_legs|opening line|开场|八法|Eight Ways|rewrite_note/i.test(
        content,
      )
    );
  }

  if (familyId === "reply-micro-convert") {
    return (
      shared ||
      /接住|澄清|拉回主轴|soft close|CTA Structure|总结价值|发出指令|降低门槛|softer variant|firmer variant|下一步/i.test(
        content,
      )
    );
  }

  if (familyId === "ideation-bank") {
    return (
      shared ||
      /题材|分类|形式|状态|CONTENT BANK|内容库|numbered bank|Topic Bingo|九宫格|waffle|caption angle|穿心线/i.test(
        content,
      )
    );
  }

  if (familyId === "planner-ladder") {
    return (
      shared ||
      /四种内容资产|曝光|认知|信任|成交|ladder|week plan|checkpoint|短视频|长视频|购买路径|堆叠/i.test(
        content,
      )
    );
  }

  if (familyId === "mindset-guardrail") {
    return (
      shared ||
      /reframe|do\/don't|do \/ don't|B\.R\.E\.A\.K|Baselines|Keep Going|advice vs ego|judgment|护栏|不要外包/i.test(
        content,
      )
    );
  }

  if (familyId === "rewrite-adapter") {
    return (
      shared ||
      /before\s*→\s*after|before\s*->\s*after|humanized|adapted cut|cut list|keep list|sharpen|platform adapt/i.test(
        content,
      )
    );
  }

  return shared;
}

/**
 * Char threshold for "dense already landed" by family.
 * Positioning maps, hooks, and reply drafts are shorter than Script/Spoken cuts.
 */
function denseCharThreshold(familyId: ModulePack["qualityFamily"]): number {
  if (familyId === "positioning-map" || familyId === "diagnosis") {
    return DENSE_MAP_DIAGNOSIS_CHAR_THRESHOLD;
  }
  if (familyId === "hook-line") {
    return DENSE_HOOK_LINE_CHAR_THRESHOLD;
  }
  if (familyId === "reply-micro-convert") {
    return DENSE_REPLY_CHAR_THRESHOLD;
  }
  if (
    familyId === "ideation-bank" ||
    familyId === "planner-ladder" ||
    familyId === "mindset-guardrail" ||
    familyId === "rewrite-adapter"
  ) {
    return DENSE_Q5_FAMILY_CHAR_THRESHOLD;
  }
  return DENSE_ASSISTANT_CHAR_THRESHOLD;
}

/**
 * True when any prior assistant message looks like a dense deliverable.
 */
function priorDenseDeliverable(
  messages: ChatMessage[],
  familyId: ModulePack["qualityFamily"],
): boolean {
  const threshold: number = denseCharThreshold(familyId);
  for (const message of messages) {
    if (message.role !== "assistant") {
      continue;
    }
    const content: string = message.content.trim();
    if (content.length < threshold) {
      continue;
    }
    if (looksStructuredDeliverable(content, familyId)) {
      return true;
    }
  }
  return false;
}

/**
 * True when a recent assistant turn asked for confirm / mirrored a plan.
 */
function priorConfirmAsk(messages: ChatMessage[]): boolean {
  const assistants: ChatMessage[] = messages.filter((message) => message.role === "assistant");
  const recent: ChatMessage[] = assistants.slice(-3);
  return recent.some((message) =>
    CONFIRM_ASSISTANT_PATTERNS.some((pattern) => pattern.test(message.content)),
  );
}

/**
 * True when the latest user message is an explicit go-ahead / just-write-it.
 */
function userGaveGoAhead(userText: string): boolean {
  const trimmed: string = userText.trim();
  if (trimmed.length === 0) {
    return false;
  }
  return JUST_WRITE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Detects Collect | Confirm | Deliver | Refine for a qualityRuntime pack turn.
 */
export function detectLifecycleMode(options: {
  pack: ModulePack;
  messages: ChatMessage[];
  intake?: Record<string, string>;
}): LifecycleDetection {
  const criticalSlots: QualitySlot[] = criticalQualitySlots(options.pack);
  const latestUser: string = latestUserContent(options.messages);
  const latestUserLooksLikeIdk: boolean = looksLikeIdkOrBlank(latestUser);

  const missingCriticalSlotIds: string[] = criticalSlots
    .filter((slot) => !slotLooksFilled(slot, options.messages, options.intake))
    .map((slot) => slot.id);

  const denseAlready: boolean = priorDenseDeliverable(
    options.messages,
    options.pack.qualityFamily,
  );
  const goAhead: boolean = userGaveGoAhead(latestUser);
  const confirmAsked: boolean = priorConfirmAsk(options.messages);
  const contract = getFamilyDeliverableContract(options.pack.qualityFamily);
  const requireConfirm: boolean =
    contract !== undefined ? contract.requireConfirmBeforeDeliver : true;

  let mode: LifecycleMode;
  let reason: string;

  if (denseAlready) {
    mode = "refine";
    reason = "prior_dense_deliverable";
  } else if (missingCriticalSlotIds.length > 0 && !goAhead) {
    mode = "collect";
    reason = `missing_critical:${missingCriticalSlotIds.join(",")}`;
  } else if (goAhead && missingCriticalSlotIds.length === 0) {
    mode = "deliver";
    reason = "go_ahead_criticals_filled";
  } else if (goAhead && missingCriticalSlotIds.length > 0) {
    // Explicit just-write-it with gaps: deliver with named assumptions (still allowed).
    mode = "deliver";
    reason = "go_ahead_with_named_assumptions";
  } else if (requireConfirm && !confirmAsked) {
    mode = "confirm";
    reason = "criticals_filled_need_confirm";
  } else if (requireConfirm && confirmAsked && !goAhead) {
    mode = "confirm";
    reason = "awaiting_go_ahead";
  } else {
    mode = "deliver";
    reason = "criticals_filled_ready";
  }

  return {
    mode,
    replyBudget: mode === "deliver" || mode === "refine" ? "dense" : "clarifying",
    reason,
    missingCriticalSlotIds,
    latestUserLooksLikeIdk,
  };
}

/**
 * Hard lifecycle rules for the detected mode (injected into module system prompt).
 */
export function buildLifecycleModeRules(options: {
  pack: ModulePack;
  detection: LifecycleDetection;
}): string {
  const slots: QualitySlot[] = resolveQualitySlots(options.pack);
  const slotBlock: string = formatQualitySlotChecklist(slots);
  const contract = getFamilyDeliverableContract(options.pack.qualityFamily);
  const familyLine: string =
    options.pack.qualityFamily !== undefined
      ? `Quality family: ${options.pack.qualityFamily}.`
      : "Quality family: unset (use pack overlay job until Q1 sets qualityFamily).";
  const contractLines: string[] =
    contract !== undefined
      ? [
          `Family deliverable job: ${contract.deliverableJob}`,
          `Density: ${contract.densityNote}`,
          `Section order stub: ${contract.sectionOrder.join(" → ")}`,
          ...(options.pack.qualityFamily === "script-spoken"
            ? ["", SCRIPT_SPOKEN_TIMING_CALIBRATION]
            : []),
        ]
      : ["Family deliverable contract: stub not selected yet; follow pack overlay job shape."];

  const confirmBlurb: string =
    typeof options.pack.confirmBlurb === "string" && options.pack.confirmBlurb.trim().length > 0
      ? options.pack.confirmBlurb.trim()
      : "Mirror what you will deliver in 2 to 4 bullets, name assumptions, ask for go-ahead.";

  const levers: string[] =
    options.pack.refineLevers !== undefined && options.pack.refineLevers.length > 0
      ? options.pack.refineLevers
      : ["tighter opening", "stronger evidence", "softer close", "clearer standpoint"];

  const sectionOrder: string[] =
    options.pack.deliverableSectionOrder !== undefined &&
    options.pack.deliverableSectionOrder.length > 0
      ? options.pack.deliverableSectionOrder
      : contract !== undefined
        ? contract.sectionOrder
        : ["deliverable", "named-levers"];

  const mode: LifecycleMode = options.detection.mode;
  const missing: string =
    options.detection.missingCriticalSlotIds.length > 0
      ? options.detection.missingCriticalSlotIds.join(", ")
      : "(none detected by Q0 heuristic)";

  const modeRules: string[] = (() => {
    switch (mode) {
      case "collect":
        return [
          "### Current mode: COLLECT (hard)",
          "Critical slots are still open. Stay in Collect.",
          `Heuristic missing critical ids: ${missing}`,
          "Ask at most 1 to 2 clarifying questions for critical gaps. Bullets if two.",
          "Do NOT produce the dense family deliverable yet.",
          "If they say I don't know / blank, use the I-don't-know option engine (choices, not invented niche facts).",
        ];
      case "confirm":
        return [
          "### Current mode: CONFIRM (hard)",
          "Critical slots look filled enough. Do NOT dense-deliver yet.",
          confirmBlurb,
          "Name assumptions honestly. User owns niche facts; Jeff owns craft.",
          "Wait for go-ahead (yes / go / 直接写一版 / just write it) before Deliver.",
          "Keep this turn short (clarifying budget).",
        ];
      case "deliver":
        return [
          "### Current mode: DELIVER (hard)",
          "Produce the full job-shaped dense deliverable now.",
          `Follow section order: ${sectionOrder.join(" → ")}`,
          "Ground every beat in their concrete answers. Name assumptions where gaps remain.",
          ...(options.pack.qualityFamily === "script-spoken"
            ? [
                "Spoken timing: claimed minutes/seconds must match spoken volume (EN ~130 to 160 WPM; ZH ~220 to 280 CPM).",
              ]
            : []),
          "End with named refine levers they can pull next:",
          ...levers.map((lever) => `- ${lever}`),
          "Do not restart a full interrogation.",
        ];
      case "refine":
        return [
          "### Current mode: REFINE (hard)",
          "A dense deliverable already exists in this chat. Tweak named levers only.",
          "Do NOT re-ask filled critical slots. Do NOT restart Collect from scratch.",
          "Named levers:",
          ...levers.map((lever) => `- ${lever}`),
          ...(options.pack.qualityFamily === "script-spoken"
            ? [
                "If they challenge WPM/timing/duration, re-check spoken volume vs claimed runtime and expand or shorten claims.",
              ]
            : []),
          "Keep changes grounded in their prior answers.",
        ];
      default: {
        const _exhaustive: never = mode;
        return [`### Current mode: unknown (${String(_exhaustive)})`];
      }
    }
  })();

  return [
    "## Quality Runtime lifecycle (hard; Collect → Confirm → Deliver → Refine)",
    "qualityRuntime is ON for this pack. Soft \"when enough is known, just write it\" escape hatches do not skip Confirm when this family requires it (unless the user explicitly says just write it after criticals are filled).",
    familyLine,
    ...contractLines,
    "",
    "Typed slots (critical vs optional):",
    slotBlock,
    "",
    `Detected mode this turn: ${mode} (heuristic reason: ${options.detection.reason}).`,
    ...modeRules,
    "",
    buildReplyBudgetInjection(options.detection.replyBudget),
  ].join("\n");
}
