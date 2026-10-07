import { NextResponse } from "next/server";

import { jsonError, requireAuthedApi } from "@/lib/brandProfile/apiAuth";
import { isUuid } from "@/lib/brandProfile/db";
import { appendOwnedTurn, normalizeMessageContent } from "@/lib/chatHistory/db";
import {
  parseOptionalBrandSources,
  parseOptionalChatSources,
} from "@/lib/chatHistory/parse";
import { parseJsonObjectBody } from "@/lib/chatHistory/requestFields";
import type {
  ChatConversationSummary,
  ChatHistoryMessage,
} from "@/lib/chatHistory/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type ChatHistoryAppendResponse = {
  conversation: ChatConversationSummary;
  messages: ChatHistoryMessage[];
};

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/chat-history/[id]/messages: persist user + assistant after postChat.
 */
export async function POST(
  request: Request,
  context: RouteParams,
): Promise<NextResponse<ChatHistoryAppendResponse | { error: string }>> {
  const auth = await requireAuthedApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { id: rawId } = await context.params;
  const id: string = rawId.trim();
  if (!isUuid(id)) {
    return jsonError(400, "Invalid conversation id.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Request body must be JSON.");
  }

  const record = parseJsonObjectBody(body);
  if (record === null) {
    return jsonError(400, "Body must be a JSON object.");
  }

  const userContent = normalizeMessageContent(record.userContent);
  if (userContent === null) {
    return jsonError(
      400,
      "userContent is required (1 to 32000 characters after trim).",
    );
  }

  const assistantContent = normalizeMessageContent(record.assistantContent);
  if (assistantContent === null) {
    return jsonError(
      400,
      "assistantContent is required (1 to 32000 characters after trim).",
    );
  }

  const sourcesParsed = parseOptionalChatSources(record.sources);
  if (!sourcesParsed.ok) {
    return jsonError(400, "sources must be an array of { id, title, type }.");
  }

  const brandParsed = parseOptionalBrandSources(
    "brandSources" in record ? record.brandSources : record.brand_sources,
  );
  if (!brandParsed.ok) {
    return jsonError(
      400,
      "brandSources must be an array of { id, title, kind: \"brand\" }.",
    );
  }

  const result = await appendOwnedTurn(
    auth.ctx.supabase,
    auth.ctx.user.id,
    id,
    {
      userContent,
      assistantContent,
      sources: sourcesParsed.value,
      brandSources: brandParsed.value,
    },
  );
  if (!result.ok) {
    return jsonError(result.status, result.error);
  }

  return NextResponse.json({
    conversation: result.conversation,
    messages: result.messages,
  });
}
