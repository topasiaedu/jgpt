import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/chat/completions";

import type { BrandChatSource, ChatMessage, ChatSource } from "@/lib/chatTypes";
import { mergeSourcesById } from "@/lib/mergeSources";
import {
  RECOMMEND_MAX,
  RECOMMEND_MIN,
  buildLightweightRecommendSystemPrompt,
  validateRecommendedModuleIds,
} from "@/lib/modules/recommend";
import type { ProbeResult } from "@/lib/probe";
import type { BrandProbeResult } from "@/lib/brandProfile/probeBrand";
import { MAX_BRAND_PROBE_TOOL_CALLS } from "@/lib/brandProfile/types";

const DEFAULT_MODEL = "gpt-4.1-mini";

/** Max refinement probes via tool calling after the automatic first probe. */
export const MAX_PROBE_TOOL_CALLS = 2;

/** Max probe_brand calls per turn (user Brand chunks only). */
export const MAX_BRAND_PROBE_CALLS = MAX_BRAND_PROBE_TOOL_CALLS;

/** Max recommend_modules calls per turn (home mode only). */
export const MAX_RECOMMEND_TOOL_CALLS = 1;

const PROBE_JEFF_TOOL: ChatCompletionTool = {
  type: "function",
  function: {
    name: "probe_jeff",
    description:
      "Re-probe jeff-graph and jeff-wiki with a focused query when this turn's evidence pack is thin, off-angle, or the user shifted topics. Use for a second Jeff angle (funnel, trust, webinar craft, positioning, etc.). Do not invent doctrine; only retrieve.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Focused search string for Jeff teaching nodes and wiki excerpts.",
        },
        intent: {
          type: "string",
          description: "Optional short label for why you are re-probing (e.g. webinar_funnel, trust).",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
};

const PROBE_BRAND_TOOL: ChatCompletionTool = {
  type: "function",
  function: {
    name: "probe_brand",
    description:
      "Search THIS client's Brand profile chunks (uploads and pastes) for a detail missing from USER_BRAND_FACTS. Use for deck lines, product names, warranties, proof wording. Do not use for Jeff teaching IP (use probe_jeff). Results are user brand facts, not Jeff citations.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Focused search string for this client's Brand documents only.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
};

const RECOMMEND_MODULES_TOOL: ChatCompletionTool = {
  type: "function",
  function: {
    name: "recommend_modules",
    description:
      "Recommend 2 to 4 Jeff IP tools from the home catalog for a clear create intent. Call only on home free chat when the user stated what IP content they want to make. Use catalog module ids only.",
    parameters: {
      type: "object",
      properties: {
        moduleIds: {
          type: "array",
          items: { type: "string" },
          minItems: RECOMMEND_MIN,
          maxItems: RECOMMEND_MAX,
          description: "Catalog module ids that fit the user's intent (ready / wired only).",
        },
      },
      required: ["moduleIds"],
      additionalProperties: false,
    },
  },
};

export type OpenAIChatResult = {
  reply: string;
  model: string;
  sources: ChatSource[];
  brandSources: BrandChatSource[];
  probeToolCalls: number;
  brandProbeToolCalls: number;
  /** Validated home recommend ids; empty when none or module mode. */
  recommendedModuleIds: string[];
};

export type ProbeJeffArgs = {
  query: string;
  intent?: string;
};

export type ProbeBrandArgs = {
  query: string;
};

export type RecommendModulesArgs = {
  moduleIds: string[];
};

/**
 * Reads server-only OpenAI config. Never call from client components.
 */
export function getOpenAIConfig(): { apiKey: string | null; model: string } {
  const apiKeyRaw: string | undefined = process.env.OPENAI_API_KEY;
  const apiKey: string | null =
    typeof apiKeyRaw === "string" && apiKeyRaw.trim().length > 0 ? apiKeyRaw.trim() : null;
  const modelRaw: string | undefined = process.env.OPENAI_MODEL;
  const model: string =
    typeof modelRaw === "string" && modelRaw.trim().length > 0 ? modelRaw.trim() : DEFAULT_MODEL;
  return { apiKey, model };
}

/**
 * Calls OpenAI Chat Completions with optional probe_jeff, probe_brand, and home recommend_modules.
 * Initial evidence is already in the system prompt; tool calls re-probe and append packs.
 * Caps Jeff probes at MAX_PROBE_TOOL_CALLS and Brand probes at MAX_BRAND_PROBE_CALLS.
 */
export async function generateJeffReply(options: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  /** Dialogue-only history (role + content). Must not include prior evidence blobs. */
  messages: ChatMessage[];
  /** Sources from the automatic first probe this turn. */
  initialSources: ChatSource[];
  /** Runs a teaching probe for a tool refinement query. */
  runProbe: (query: string) => ProbeResult;
  /**
   * When set, expose probe_brand and run profile-scoped Brand retrieval.
   * Omit on paths without an owned Brand profile.
   */
  runBrandProbe?: (query: string) => Promise<BrandProbeResult>;
  /**
   * When true (home free chat), expose recommend_modules so the model can
   * return structured catalog ids for UI deep links.
   */
  recommendMode?: boolean;
}): Promise<OpenAIChatResult> {
  const client = new OpenAI({ apiKey: options.apiKey });
  const recommendMode: boolean = options.recommendMode === true;

  const openAiMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: options.systemPrompt },
    ...options.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  let probeToolCalls = 0;
  let brandProbeToolCalls = 0;
  let recommendToolCalls = 0;
  let recommendedModuleIds: string[] = [];
  let turnSources: ChatSource[] = [...options.initialSources];
  let turnBrandSources: BrandChatSource[] = [];
  const brandProbeEnabled: boolean = options.runBrandProbe !== undefined;

  while (true) {
    const allowProbe: boolean = probeToolCalls < MAX_PROBE_TOOL_CALLS;
    const allowBrandProbe: boolean =
      brandProbeEnabled && brandProbeToolCalls < MAX_BRAND_PROBE_CALLS;
    const allowRecommend: boolean =
      recommendMode && recommendToolCalls < MAX_RECOMMEND_TOOL_CALLS;
    const tools: ChatCompletionTool[] = [];
    if (allowProbe) {
      tools.push(PROBE_JEFF_TOOL);
    }
    if (allowBrandProbe) {
      tools.push(PROBE_BRAND_TOOL);
    }
    if (allowRecommend) {
      tools.push(RECOMMEND_MODULES_TOOL);
    }
    const allowTools: boolean = tools.length > 0;

    const completion = await client.chat.completions.create({
      model: options.model,
      temperature: 0.4,
      messages: openAiMessages,
      tools: allowTools ? tools : undefined,
      tool_choice: allowTools ? "auto" : undefined,
    });

    const choice = completion.choices[0];
    if (choice === undefined || choice.message === undefined) {
      throw new Error("OpenAI returned no completion choice.");
    }
    const message = choice.message;

    const toolCalls = message.tool_calls;
    if (allowTools && toolCalls !== undefined && toolCalls.length > 0) {
      openAiMessages.push({
        role: "assistant",
        content: message.content ?? null,
        tool_calls: toolCalls,
      });

      for (const toolCall of toolCalls) {
        if (toolCall.type !== "function") {
          openAiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: "Unsupported tool call type." }),
          });
          continue;
        }

        const toolName: string = toolCall.function.name;

        if (toolName === "probe_jeff") {
          if (probeToolCalls >= MAX_PROBE_TOOL_CALLS) {
            openAiMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                error:
                  "probe_jeff budget exhausted for this turn. Answer from evidence already provided.",
              }),
            });
            continue;
          }

          const args = parseProbeJeffArgs(toolCall.function.arguments);
          if (args === null || args.query.trim().length === 0) {
            openAiMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                error: "probe_jeff requires a non-empty query string.",
              }),
            });
            probeToolCalls += 1;
            continue;
          }

          const probe: ProbeResult = options.runProbe(args.query.trim());
          probeToolCalls += 1;
          turnSources = mergeSourcesById(turnSources, probe.sources);

          openAiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: formatProbeToolPayload(probe, args.intent),
          });
          continue;
        }

        if (toolName === "probe_brand") {
          const runBrandProbe = options.runBrandProbe;
          if (runBrandProbe === undefined || brandProbeToolCalls >= MAX_BRAND_PROBE_CALLS) {
            openAiMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                error:
                  "probe_brand budget exhausted or unavailable this turn. Answer from USER_BRAND_FACTS already provided.",
              }),
            });
            continue;
          }

          const brandArgs = parseProbeBrandArgs(toolCall.function.arguments);
          if (brandArgs === null || brandArgs.query.trim().length === 0) {
            openAiMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                error: "probe_brand requires a non-empty query string.",
              }),
            });
            brandProbeToolCalls += 1;
            continue;
          }

          const brandProbe: BrandProbeResult = await runBrandProbe(brandArgs.query.trim());
          brandProbeToolCalls += 1;
          turnBrandSources = mergeBrandSourcesById(turnBrandSources, brandProbe.sources);

          openAiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: formatBrandProbeToolPayload(brandProbe),
          });
          continue;
        }

        if (toolName === "recommend_modules") {
          if (!recommendMode || recommendToolCalls >= MAX_RECOMMEND_TOOL_CALLS) {
            openAiMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                error: "recommend_modules is not available on this turn.",
              }),
            });
            continue;
          }

          const args = parseRecommendModulesArgs(toolCall.function.arguments);
          recommendToolCalls += 1;

          if (args === null) {
            openAiMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                error: "recommend_modules requires moduleIds: string[] (2 to 4 catalog ids).",
              }),
            });
            continue;
          }

          const validated: string[] = validateRecommendedModuleIds(args.moduleIds);
          recommendedModuleIds = validated;

          openAiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              ok: validated.length > 0,
              recommendedModuleIds: validated,
              note:
                validated.length > 0
                  ? "UI will show these as deep links. Continue with a short coaching reply; name tools by title."
                  : "No valid catalog ids. Ask one clarifying question, or retry with real catalog ids only.",
            }),
          });
          continue;
        }

        openAiMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            error: "Unknown tool. Use probe_jeff, probe_brand, or recommend_modules only.",
          }),
        });
      }

      continue;
    }

    const reply: string | null | undefined = message.content;
    if (typeof reply !== "string" || reply.trim().length === 0) {
      throw new Error("OpenAI returned an empty reply.");
    }

    return {
      reply: reply.trim(),
      model: options.model,
      sources: turnSources.filter((source) => !source.id.startsWith("brand:")),
      brandSources: turnBrandSources.filter(
        (source) => source.kind === "brand" && source.id.startsWith("brand:"),
      ),
      probeToolCalls,
      brandProbeToolCalls,
      recommendedModuleIds,
    };
  }
}

/**
 * Lightweight home recommend: one constrained completion, ids only.
 * No Jeff probe, no coaching essay. Returns [] when vague or invalid.
 */
export async function generateHomeRecommendIds(options: {
  apiKey: string;
  model: string;
  draft: string;
}): Promise<string[]> {
  const client = new OpenAI({ apiKey: options.apiKey });
  const draft: string = options.draft.trim();
  if (draft.length === 0) {
    return [];
  }

  const completion = await client.chat.completions.create({
    model: options.model,
    temperature: 0.2,
    messages: [
      { role: "system", content: buildLightweightRecommendSystemPrompt() },
      { role: "user", content: draft },
    ],
    tools: [RECOMMEND_MODULES_TOOL],
    tool_choice: "auto",
  });

  const choice = completion.choices[0];
  if (choice === undefined || choice.message === undefined) {
    return [];
  }

  const toolCalls = choice.message.tool_calls;
  if (toolCalls === undefined || toolCalls.length === 0) {
    return [];
  }

  for (const toolCall of toolCalls) {
    if (toolCall.type !== "function") {
      continue;
    }
    if (toolCall.function.name !== "recommend_modules") {
      continue;
    }
    const args = parseRecommendModulesArgs(toolCall.function.arguments);
    if (args === null) {
      continue;
    }
    return validateRecommendedModuleIds(args.moduleIds);
  }

  return [];
}

/**
 * Parses probe_jeff tool arguments from the model.
 */
function parseProbeJeffArgs(raw: string): ProbeJeffArgs | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }
    if (!("query" in parsed) || typeof (parsed as { query: unknown }).query !== "string") {
      return null;
    }
    const query: string = (parsed as { query: string }).query;
    const intentRaw = (parsed as { intent?: unknown }).intent;
    const intent: string | undefined =
      typeof intentRaw === "string" && intentRaw.trim().length > 0 ? intentRaw.trim() : undefined;
    return { query, intent };
  } catch {
    return null;
  }
}

/**
 * Parses recommend_modules tool arguments from the model.
 */
function parseRecommendModulesArgs(raw: string): RecommendModulesArgs | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }
    if (!("moduleIds" in parsed)) {
      return null;
    }
    const moduleIdsRaw = (parsed as { moduleIds: unknown }).moduleIds;
    if (!Array.isArray(moduleIdsRaw)) {
      return null;
    }
    if (!moduleIdsRaw.every((entry) => typeof entry === "string")) {
      return null;
    }
    return { moduleIds: moduleIdsRaw };
  } catch {
    return null;
  }
}

/**
 * Parses probe_brand tool arguments from the model.
 */
function parseProbeBrandArgs(raw: string): ProbeBrandArgs | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }
    if (!("query" in parsed) || typeof (parsed as { query: unknown }).query !== "string") {
      return null;
    }
    return { query: (parsed as { query: string }).query };
  } catch {
    return null;
  }
}

/**
 * Compact Brand tool payload: user excerpts only, never Jeff graph ids.
 */
function formatBrandProbeToolPayload(probe: BrandProbeResult): string {
  return JSON.stringify({
    query: probe.query,
    kind: "user_brand_excerpts",
    not_jeff_doctrine: true,
    sources: probe.sources,
    excerpts: probe.evidencePackText,
  });
}

/**
 * Unions Brand chips by id, preserving first-seen order.
 */
function mergeBrandSourcesById(
  current: BrandChatSource[],
  incoming: BrandChatSource[],
): BrandChatSource[] {
  const byId: Map<string, BrandChatSource> = new Map();
  for (const source of current) {
    if (!byId.has(source.id)) {
      byId.set(source.id, source);
    }
  }
  for (const source of incoming) {
    if (!byId.has(source.id)) {
      byId.set(source.id, source);
    }
  }
  return [...byId.values()];
}

/**
 * Compact tool payload: sources + this-probe evidence pack (not prior turns).
 */
function formatProbeToolPayload(probe: ProbeResult, intent: string | undefined): string {
  return JSON.stringify({
    query: probe.query,
    intent: intent ?? null,
    coverage: probe.coverage,
    sources: probe.sources,
    evidence_pack: probe.evidencePackText,
  });
}
