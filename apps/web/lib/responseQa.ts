/**
 * Post-completion QA for module/tool chat deliverables.
 *
 * After the primary Jeff reply is finalized (tool loops done), a second model
 * call judges whether the reply matches the user ask (length vs duration,
 * missing deliverable, obvious mismatch). On fail: at most one repair rewrite.
 *
 * Scope: module chat only (home recommend stays out). Soft-fails to the
 * original reply if the judge errors or returns unusable JSON.
 *
 * Q0 note: ask-match only. Family-contract / lifecycle golden evals land later
 * (after Q1 fixtures). Do not treat this file as Collect→Confirm enforcement.
 *
 * Env:
 * - OPENAI_QA_ENABLED: set to "0" / "false" / "off" to skip QA (default: on)
 * - OPENAI_QA_MODEL: judge model id (default: gpt-4.1-nano). Repair uses the
 *   primary OPENAI_MODEL so Jeff voice stays on the main completion model.
 */

import OpenAI from "openai";

import type { ChatMessage } from "@/lib/chatTypes";
import type { Locale } from "@/lib/i18n/messages";

/** Default judge model: same provider family, cheaper/faster than primary. */
const DEFAULT_QA_MODEL = "gpt-4.1-nano";

/** Bound judge output so Vercel stays under maxDuration. */
const JUDGE_MAX_TOKENS = 280;

/** Bound one repair rewrite (scripts need more room than clarifying turns). */
const REPAIR_MAX_TOKENS = 2200;

/** Truncate payloads sent to the judge. */
const MAX_ASK_CHARS = 1200;
const MAX_DRAFT_CHARS = 6000;
const MAX_MODULE_TITLE_CHARS = 80;

export type ResponseQaVerdict = {
  pass: boolean;
  reasons: string[];
  /** Concrete rewrite guidance when pass is false. */
  fixInstructions: string;
};

export type ModuleResponseQaResult = {
  /** Reply to return to the client (original or one repair). */
  reply: string;
  qaRan: boolean;
  qaPassed: boolean;
  repaired: boolean;
  /** Internal log fields only; never send raw judge JSON to the client. */
  judgeReasons: string[];
};

/**
 * Returns true unless OPENAI_QA_ENABLED is explicitly off.
 */
export function isResponseQaEnabled(): boolean {
  const raw: string | undefined = process.env.OPENAI_QA_ENABLED;
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return true;
  }
  const normalized: string = raw.trim().toLowerCase();
  return normalized !== "0" && normalized !== "false" && normalized !== "off" && normalized !== "no";
}

/**
 * Judge model id. Defaults to a faster/cheaper sibling of the primary model.
 */
export function getQaModel(): string {
  const raw: string | undefined = process.env.OPENAI_QA_MODEL;
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.trim();
  }
  return DEFAULT_QA_MODEL;
}

/**
 * Latest non-empty user message content, or empty string.
 */
export function latestUserAsk(messages: ChatMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message === undefined) {
      continue;
    }
    if (message.role !== "user") {
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
 * Parses and validates a judge JSON object. Exported for unit tests.
 */
export function parseJudgeVerdict(value: unknown): ResponseQaVerdict | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const record = value as {
    pass?: unknown;
    reasons?: unknown;
    fixInstructions?: unknown;
    fix_instructions?: unknown;
  };

  if (typeof record.pass !== "boolean") {
    return null;
  }

  const reasons: string[] = normalizeStringList(record.reasons);
  const fixRaw =
    typeof record.fixInstructions === "string"
      ? record.fixInstructions
      : typeof record.fix_instructions === "string"
        ? record.fix_instructions
        : "";
  const fixInstructions: string = fixRaw.trim();

  if (!record.pass && fixInstructions.length === 0 && reasons.length === 0) {
    return null;
  }

  return {
    pass: record.pass,
    reasons,
    fixInstructions:
      fixInstructions.length > 0
        ? fixInstructions
        : reasons.length > 0
          ? reasons.join(" ")
          : "Rewrite the reply so it fully meets the user ask.",
  };
}

/**
 * Parses judge completion text (expects JSON object).
 */
export function parseJudgeVerdictFromText(raw: string): ResponseQaVerdict | null {
  const trimmed: string = raw.trim();
  if (trimmed.length === 0) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);
    return parseJudgeVerdict(parsed);
  } catch {
    const extracted = extractJsonObject(trimmed);
    if (extracted === null) {
      return null;
    }
    try {
      const parsed: unknown = JSON.parse(extracted);
      return parseJudgeVerdict(parsed);
    } catch {
      return null;
    }
  }
}

/**
 * Module-path QA: judge once, repair at most once. Soft-fails to draft.
 */
export async function runModuleResponseQa(options: {
  apiKey: string;
  /** Primary chat model used for the one repair rewrite. */
  repairModel: string;
  locale: Locale;
  moduleId: string;
  moduleTitle: string;
  messages: ChatMessage[];
  draftReply: string;
}): Promise<ModuleResponseQaResult> {
  const draft: string = options.draftReply.trim();
  const ask: string = latestUserAsk(options.messages);

  if (!isResponseQaEnabled() || draft.length === 0 || ask.length === 0) {
    return {
      reply: draft.length > 0 ? draft : options.draftReply,
      qaRan: false,
      qaPassed: true,
      repaired: false,
      judgeReasons: [],
    };
  }

  const client = new OpenAI({ apiKey: options.apiKey });
  const qaModel: string = getQaModel();

  let verdict: ResponseQaVerdict;
  try {
    verdict = await judgeReply({
      client,
      model: qaModel,
      locale: options.locale,
      moduleId: options.moduleId,
      moduleTitle: options.moduleTitle,
      userAsk: ask,
      draftReply: draft,
    });
  } catch (error) {
    const message: string = error instanceof Error ? error.message : "judge failed";
    console.info("[responseQa] judge soft-fail; returning original", {
      moduleId: options.moduleId,
      error: message,
    });
    return {
      reply: draft,
      qaRan: true,
      qaPassed: true,
      repaired: false,
      judgeReasons: [`judge_error: ${message}`],
    };
  }

  if (verdict.pass) {
    console.info("[responseQa] pass", {
      moduleId: options.moduleId,
      model: qaModel,
      reasons: verdict.reasons,
    });
    return {
      reply: draft,
      qaRan: true,
      qaPassed: true,
      repaired: false,
      judgeReasons: verdict.reasons,
    };
  }

  console.info("[responseQa] fail; repairing once", {
    moduleId: options.moduleId,
    judgeModel: qaModel,
    repairModel: options.repairModel,
    reasons: verdict.reasons,
    fixInstructions: verdict.fixInstructions.slice(0, 240),
  });

  try {
    const repaired: string = await repairReply({
      client,
      model: options.repairModel,
      locale: options.locale,
      moduleId: options.moduleId,
      moduleTitle: options.moduleTitle,
      userAsk: ask,
      draftReply: draft,
      fixInstructions: verdict.fixInstructions,
      reasons: verdict.reasons,
    });

    if (repaired.trim().length === 0) {
      return {
        reply: draft,
        qaRan: true,
        qaPassed: false,
        repaired: false,
        judgeReasons: verdict.reasons,
      };
    }

    return {
      reply: repaired.trim(),
      qaRan: true,
      qaPassed: false,
      repaired: true,
      judgeReasons: verdict.reasons,
    };
  } catch (error) {
    const message: string = error instanceof Error ? error.message : "repair failed";
    console.info("[responseQa] repair soft-fail; returning original", {
      moduleId: options.moduleId,
      error: message,
    });
    return {
      reply: draft,
      qaRan: true,
      qaPassed: false,
      repaired: false,
      judgeReasons: [...verdict.reasons, `repair_error: ${message}`],
    };
  }
}

/**
 * One JSON judge completion.
 */
async function judgeReply(options: {
  client: OpenAI;
  model: string;
  locale: Locale;
  moduleId: string;
  moduleTitle: string;
  userAsk: string;
  draftReply: string;
}): Promise<ResponseQaVerdict> {
  const systemPrompt: string = [
    "You are a strict QA judge for a Jeff IP coaching tool chat.",
    "Decide if the assistant draft satisfies the latest user ask for this module.",
    "Return ONLY a JSON object with keys: pass (boolean), reasons (string[]), fixInstructions (string).",
    "",
    "Fail when any of these are true:",
    "- User asked for a timed script (e.g. 1 minute, 60 seconds, 45s Reel) but the draft is a short stub (a few sentences or lines) that could not fill that duration when spoken.",
    "- Draft claims a runtime (timestamps or \"about N minutes\") but spoken body is far under fill: English under ~130 words per claimed minute, or Chinese under ~220 characters per claimed minute (spoken lines only).",
    "- User asked to write / draft / give the deliverable, and the draft has no usable deliverable (only vague tips or a curriculum lecture).",
    "- Obvious mismatch: wrong format (e.g. asked for a shootable script, got a long theory lesson).",
    "",
    "Pass when:",
    "- Draft is a clarifying turn (1 to 2 questions) and the user has not yet provided enough to write, or has not asked to write yet.",
    "- Draft briefly redirects an off-topic user ask back to this module's job (clarifying or deliverable) without answering the rabbit hole in depth.",
    "- Deliverable roughly matches the ask (length, format, completeness).",
    "",
    "Do not grade Jeff voice, doctrine fidelity, or polish. Only ask-match.",
    "fixInstructions must be concrete and short when pass is false. Empty string when pass is true.",
    "reasons: 1 to 3 short English strings.",
  ].join("\n");

  const userPayload = {
    locale: options.locale,
    moduleId: options.moduleId,
    moduleTitle: clip(options.moduleTitle, MAX_MODULE_TITLE_CHARS),
    userAsk: clip(options.userAsk, MAX_ASK_CHARS),
    draftReply: clip(options.draftReply, MAX_DRAFT_CHARS),
    draftCharCount: options.draftReply.length,
    draftLineCount: countNonEmptyLines(options.draftReply),
  };

  const completion = await options.client.chat.completions.create({
    model: options.model,
    temperature: 0,
    max_tokens: JUDGE_MAX_TOKENS,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: JSON.stringify(userPayload),
      },
    ],
  });

  const choice = completion.choices[0];
  if (choice === undefined || choice.message === undefined) {
    throw new Error("QA judge returned no completion choice.");
  }

  const content: string | null = choice.message.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("QA judge returned empty content.");
  }

  const verdict = parseJudgeVerdictFromText(content);
  if (verdict === null) {
    throw new Error("QA judge returned unparseable JSON.");
  }

  return verdict;
}

/**
 * One repair completion toward the user ask, keeping Jeff voice constraints.
 */
async function repairReply(options: {
  client: OpenAI;
  model: string;
  locale: Locale;
  moduleId: string;
  moduleTitle: string;
  userAsk: string;
  draftReply: string;
  fixInstructions: string;
  reasons: string[];
}): Promise<string> {
  const languageLock: string =
    options.locale === "zh"
      ? "Output language: mainly Chinese (UI locale zh). Light English classroom mix OK."
      : "Output language: full English only (UI locale en). ASCII quotes only. No Chinese characters.";

  const systemPrompt: string = [
    "You repair one Jeff IP tool-chat reply so it meets the user ask.",
    "You are the teacher's aide channeling Jeff: short punches, direct, warm, 1-on-1.",
    languageLock,
    "Apply Jeff craft; do not teach frameworks or dump curriculum.",
    "Firm not fierce. Prefer deliverable over lecture.",
    "If the user asked for a timed script (e.g. 1 minute), write a full speakable script with enough beats/lines to fill that time. Do not return a 5-line stub.",
    "Match claimed runtime: English ~130 to 160 words per minute; Chinese ~220 to 280 characters per minute in spoken lines. Expand content or shorten the claim.",
    "When producing a script or deliverable, lists and multi-beat structure are allowed even if longer than a normal coaching tip.",
    "Never use em dash, en dash, or spaced hyphen as punctuation.",
    "Return ONLY the repaired student-facing reply. No JSON. No judge commentary.",
  ].join("\n");

  const userContent: string = [
    `Module: ${options.moduleTitle} (${options.moduleId})`,
    "",
    "## User ask",
    clip(options.userAsk, MAX_ASK_CHARS),
    "",
    "## Failed draft",
    clip(options.draftReply, MAX_DRAFT_CHARS),
    "",
    "## Why it failed",
    options.reasons.length > 0 ? options.reasons.map((r) => `- ${r}`).join("\n") : "- (unspecified)",
    "",
    "## Fix instructions",
    options.fixInstructions,
    "",
    "Rewrite the reply to meet the ask. Keep Jeff voice.",
  ].join("\n");

  const completion = await options.client.chat.completions.create({
    model: options.model,
    temperature: 0.35,
    max_tokens: REPAIR_MAX_TOKENS,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
  });

  const choice = completion.choices[0];
  if (choice === undefined || choice.message === undefined) {
    throw new Error("QA repair returned no completion choice.");
  }

  const content: string | null = choice.message.content;
  if (typeof content !== "string") {
    throw new Error("QA repair returned empty content.");
  }

  return content.trim();
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const out: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string") {
      continue;
    }
    const trimmed: string = entry.trim();
    if (trimmed.length === 0) {
      continue;
    }
    out.push(trimmed);
    if (out.length >= 5) {
      break;
    }
  }
  return out;
}

function clip(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }
  return `${text.slice(0, maxChars)}\n…[truncated]`;
}

function countNonEmptyLines(text: string): number {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0).length;
}

/**
 * Best-effort extract of a top-level JSON object from messy model output.
 */
function extractJsonObject(text: string): string | null {
  const start: number = text.indexOf("{");
  const end: number = text.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return null;
  }
  return text.slice(start, end + 1);
}
