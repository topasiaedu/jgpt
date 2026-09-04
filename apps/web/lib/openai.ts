import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/chat/completions";

import type { ChatMessage, ChatSource } from "@/lib/chatTypes";
import { mergeSourcesById } from "@/lib/mergeSources";
import type { ProbeResult } from "@/lib/probe";

const DEFAULT_MODEL = "gpt-4.1-mini";

/** Max refinement probes via tool calling after the automatic first probe. */
export const MAX_PROBE_TOOL_CALLS = 2;

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

export type OpenAIChatResult = {
  reply: string;
  model: string;
  sources: ChatSource[];
  probeToolCalls: number;
};

export type ProbeJeffArgs = {
  query: string;
  intent?: string;
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
 * Calls OpenAI Chat Completions with optional probe_jeff tool refinement.
 * Initial evidence is already in the system prompt; tool calls re-probe and append packs.
 * Caps tool loops at MAX_PROBE_TOOL_CALLS, then forces a final text answer.
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
}): Promise<OpenAIChatResult> {
  const client = new OpenAI({ apiKey: options.apiKey });

  const openAiMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: options.systemPrompt },
    ...options.messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  let probeToolCalls = 0;
  let turnSources: ChatSource[] = [...options.initialSources];

  while (true) {
    const allowTools: boolean = probeToolCalls < MAX_PROBE_TOOL_CALLS;
    const completion = await client.chat.completions.create({
      model: options.model,
      temperature: 0.4,
      messages: openAiMessages,
      tools: allowTools ? [PROBE_JEFF_TOOL] : undefined,
      tool_choice: allowTools ? "auto" : undefined,
    });

    const choice = completion.choices[0]?.message;
    if (choice === undefined) {
      throw new Error("OpenAI returned no completion choice.");
    }

    const toolCalls = choice.tool_calls;
    if (allowTools && toolCalls !== undefined && toolCalls.length > 0) {
      openAiMessages.push({
        role: "assistant",
        content: choice.content ?? null,
        tool_calls: toolCalls,
      });

      for (const toolCall of toolCalls) {
        if (probeToolCalls >= MAX_PROBE_TOOL_CALLS) {
          openAiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              error: "probe_jeff budget exhausted for this turn. Answer from evidence already provided.",
            }),
          });
          continue;
        }

        if (toolCall.type !== "function" || toolCall.function.name !== "probe_jeff") {
          openAiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: "Unknown tool. Use probe_jeff only." }),
          });
          continue;
        }

        const args = parseProbeJeffArgs(toolCall.function.arguments);
        if (args === null || args.query.trim().length === 0) {
          openAiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: "probe_jeff requires a non-empty query string." }),
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
      }

      continue;
    }

    const reply: string | null | undefined = choice.content;
    if (typeof reply !== "string" || reply.trim().length === 0) {
      throw new Error("OpenAI returned an empty reply.");
    }

    return {
      reply: reply.trim(),
      model: options.model,
      sources: turnSources,
      probeToolCalls,
    };
  }
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
