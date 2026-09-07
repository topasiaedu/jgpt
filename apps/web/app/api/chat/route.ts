import { NextResponse } from "next/server";

import type {
  ChatErrorBody,
  ChatMessage,
  ChatRequestBody,
  ChatResponseBody,
} from "@/lib/chatTypes";
import { buildProbeQuery, toDialogueOnly } from "@/lib/dialogue";
import { generateJeffReply, getOpenAIConfig } from "@/lib/openai";
import { probeTeaching } from "@/lib/probe";
import { stripDashPunctuation } from "@/lib/stripDashPunctuation";
import { buildSystemPrompt } from "@/lib/systemPrompt";

/** fs-based probe + OpenAI tool loop; must not run on Edge. */
export const runtime = "nodejs";
/** Tool loops need headroom beyond the default 10s Hobby / 15s Pro limit. */
export const maxDuration = 60;
/** Always run on the server; never statically cache chat. */
export const dynamic = "force-dynamic";

/**
 * POST /api/chat: fresh probe this turn + dialogue-only history + optional probe_jeff tools.
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
      { error: "Body must include messages: { role, content }[]." },
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

  const dialogue: ChatMessage[] = toDialogueOnly(body.messages);
  const query: string = buildProbeQuery(dialogue);

  if (query.length === 0) {
    return NextResponse.json({ error: "Send at least one non-empty user message." }, { status: 400 });
  }

  let probe;
  try {
    // Automatic first probe on this turn's ask (not blind into the model).
    probe = probeTeaching(query);
  } catch (error) {
    const message: string =
      error instanceof Error ? error.message : "Teaching probe failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const systemPrompt: string = buildSystemPrompt({
    evidencePackText: probe.evidencePackText,
    coverage: probe.coverage,
  });

  try {
    const { reply, sources } = await generateJeffReply({
      apiKey,
      model,
      systemPrompt,
      messages: dialogue,
      initialSources: probe.sources,
      runProbe: (toolQuery: string) => probeTeaching(toolQuery),
    });

    const response: ChatResponseBody = {
      reply: stripDashPunctuation(reply),
      sources,
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

  return messages.every(isChatMessage);
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
