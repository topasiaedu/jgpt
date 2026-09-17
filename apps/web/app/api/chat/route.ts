import { NextResponse } from "next/server";

import type {
  ChatErrorBody,
  ChatMessage,
  ChatRequestBody,
  ChatResponseBody,
} from "@/lib/chatTypes";
import { buildProbeQuery, toDialogueOnly } from "@/lib/dialogue";
import {
  appendModuleSystemOverlay,
  buildModuleProbeQuery,
} from "@/lib/modules/modulePrompt";
import { getModulePack } from "@/lib/modules/packs";
import { HOME_INTENT_Q_MAX_CHARS } from "@/lib/modules/homeHandoff";
import { appendHomeRecommendOverlay } from "@/lib/modules/recommend";
import { generateJeffReply, getOpenAIConfig } from "@/lib/openai";
import { mergeBoundNodesIntoProbe, probeTeaching } from "@/lib/probe";
import { DEFAULT_LOCALE, parseLocale, type Locale } from "@/lib/i18n/messages";
import { sanitizeAssistantReply } from "@/lib/sanitizeAssistantReply";
import { buildSystemPrompt } from "@/lib/systemPrompt";

/** fs-based probe + OpenAI tool loop; must not run on Edge. */
export const runtime = "nodejs";
/** Tool loops need headroom beyond the default 10s Hobby / 15s Pro limit. */
export const maxDuration = 60;
/** Always run on the server; never statically cache chat. */
export const dynamic = "force-dynamic";

/**
 * POST /api/chat: fresh probe this turn + dialogue-only history + optional probe_jeff tools.
 * Optional moduleId enables named IP module packs (same closed-doctrine stack).
 * Legacy intake map is optional; chat-first modules rely on conversation history.
 * Soft-fails with JSON error if OPENAI_API_KEY is missing.
 * Always returns JSON so the client never has to parse an HTML error page for app errors.
 */
export async function POST(request: Request): Promise<NextResponse<ChatResponseBody | ChatErrorBody>> {
  try {
    return await handleChatPost(request);
  } catch (error) {
    const message: string =
      error instanceof Error ? error.message : "Unexpected chat API failure.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Core chat handler. Thrown errors are converted to JSON by POST.
 */
async function handleChatPost(
  request: Request,
): Promise<NextResponse<ChatResponseBody | ChatErrorBody>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  if (!isChatRequestBody(body)) {
    return NextResponse.json(
      {
        error:
          "Body must include messages: { role, content }[]. Optional locale, moduleId, intake, and homeIntent must be well-typed.",
      },
      { status: 400 },
    );
  }

  const { apiKey, model } = getOpenAIConfig();
  if (apiKey === null) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is not set on the server. Add it in the Vercel project Environment Variables (Production), then redeploy.",
      },
      { status: 503 },
    );
  }

  const locale: Locale = parseLocale(body.locale) ?? DEFAULT_LOCALE;
  const dialogue: ChatMessage[] = toDialogueOnly(body.messages);
  const baseQuery: string = buildProbeQuery(dialogue);

  if (baseQuery.length === 0) {
    return NextResponse.json({ error: "Send at least one non-empty user message." }, { status: 400 });
  }

  const moduleId: string | undefined = body.moduleId;
  const intake: Record<string, string> | undefined = body.intake;
  const homeIntent: string | undefined =
    typeof body.homeIntent === "string" && body.homeIntent.trim().length > 0
      ? body.homeIntent.trim().slice(0, HOME_INTENT_Q_MAX_CHARS)
      : undefined;
  const pack = typeof moduleId === "string" ? getModulePack(moduleId) : undefined;

  if (typeof moduleId === "string" && moduleId.trim().length > 0 && pack === undefined) {
    return NextResponse.json(
      { error: `Unknown or not-yet-wired moduleId: ${moduleId}` },
      { status: 400 },
    );
  }

  const query: string =
    pack !== undefined
      ? buildModuleProbeQuery({ baseQuery, pack, intake })
      : baseQuery;

  let probe;
  try {
    // Automatic first probe on this turn's ask (not blind into the model).
    probe = probeTeaching(query);
    // Module packs: soft-append bound anchors after user-led ranking (no lexical flood).
    if (pack !== undefined) {
      probe = mergeBoundNodesIntoProbe(probe, pack.boundNodeIds);
    }
  } catch (error) {
    const message: string =
      error instanceof Error ? error.message : "Teaching probe failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const baseSystemPrompt: string = buildSystemPrompt({
    evidencePackText: probe.evidencePackText,
    coverage: probe.coverage,
    locale,
  });

  const recommendMode: boolean = pack === undefined;
  const systemPrompt: string =
    pack !== undefined
      ? appendModuleSystemOverlay({
          baseSystemPrompt,
          pack,
          intake,
          homeIntent,
          locale,
        })
      : appendHomeRecommendOverlay(baseSystemPrompt, locale);

  try {
    const { reply, sources, recommendedModuleIds } = await generateJeffReply({
      apiKey,
      model,
      systemPrompt,
      messages: dialogue,
      initialSources: probe.sources,
      runProbe: (toolQuery: string) => probeTeaching(toolQuery),
      recommendMode,
    });

    const response: ChatResponseBody = {
      reply: sanitizeAssistantReply(reply, locale),
      sources,
      ...(recommendMode && recommendedModuleIds.length > 0
        ? { recommendedModuleIds }
        : {}),
    };
    return NextResponse.json(response);
  } catch (error) {
    const message: string =
      error instanceof Error ? error.message : "OpenAI request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/**
 * Runtime validation for the chat request body.
 */
function isChatRequestBody(value: unknown): value is ChatRequestBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("messages" in value)) {
    return false;
  }

  const messages = (value as { messages: unknown }).messages;
  if (!Array.isArray(messages)) {
    return false;
  }

  if (!messages.every(isChatMessage)) {
    return false;
  }

  if ("moduleId" in value) {
    const moduleId = (value as { moduleId: unknown }).moduleId;
    if (moduleId !== undefined && typeof moduleId !== "string") {
      return false;
    }
  }

  if ("intake" in value) {
    const intake = (value as { intake: unknown }).intake;
    if (intake !== undefined && !isStringRecord(intake)) {
      return false;
    }
  }

  if ("homeIntent" in value) {
    const homeIntent = (value as { homeIntent: unknown }).homeIntent;
    if (homeIntent !== undefined && typeof homeIntent !== "string") {
      return false;
    }
  }

  if ("locale" in value) {
    const locale = (value as { locale: unknown }).locale;
    if (locale !== undefined && locale !== "zh" && locale !== "en") {
      return false;
    }
  }

  return true;
}

/**
 * Runtime validation for a single chat message.
 */
function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("role" in value) || !("content" in value)) {
    return false;
  }

  const role = (value as { role: unknown }).role;
  const content = (value as { content: unknown }).content;

  const roleOk = role === "user" || role === "assistant";
  const contentOk = typeof content === "string";

  return roleOk && contentOk;
}

/**
 * Runtime validation for intake: object with string values only.
 */
function isStringRecord(value: unknown): value is Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === "string");
}
