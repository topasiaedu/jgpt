import { NextResponse } from "next/server";

import { jsonError, requireAuthedApi } from "@/lib/brandProfile/apiAuth";
import {
  createOwnedConversation,
  listAllOwnedConversations,
  listOwnedConversations,
  normalizeChatHistoryName,
  normalizeMessageContent,
} from "@/lib/chatHistory/db";
import {
  parseJsonObjectBody,
  readBrandProfileIdQuery,
  readModuleIdQuery,
  readOptionalBrandProfileIdBody,
} from "@/lib/chatHistory/requestFields";
import {
  DEFAULT_CONVERSATION_TITLE,
  type ChatConversationSummary,
  type ChatHistoryMessage,
} from "@/lib/chatHistory/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type ChatHistoryListResponse = {
  conversations: ChatConversationSummary[];
};

export type ChatHistoryCreateResponse = {
  conversation: ChatConversationSummary;
  messages: ChatHistoryMessage[];
};

/**
 * GET /api/chat-history?moduleId=&brandProfileId=
 * GET /api/chat-history?scope=all
 * Lists non-deleted conversations for the signed-in user.
 * With moduleId: omitted or empty brandProfileId filters to continue-without (IS NULL).
 * With scope=all (and no moduleId): all tools and profiles, newest first.
 */
export async function GET(
  request: Request,
): Promise<NextResponse<ChatHistoryListResponse | { error: string }>> {
  const auth = await requireAuthedApi();
  if (!auth.ok) {
    return auth.response;
  }

  const url = new URL(request.url);
  const scopeRaw: string | null = url.searchParams.get("scope");
  const scopeAll: boolean =
    scopeRaw !== null && scopeRaw.trim().toLowerCase() === "all";
  const moduleId = readModuleIdQuery(url.searchParams);

  if (scopeAll) {
    if (moduleId !== null) {
      return jsonError(400, "Do not combine scope=all with moduleId.");
    }
    const allResult = await listAllOwnedConversations(
      auth.ctx.supabase,
      auth.ctx.user.id,
    );
    if (!allResult.ok) {
      return jsonError(allResult.status, allResult.error);
    }
    return NextResponse.json({ conversations: allResult.conversations });
  }

  if (moduleId === null) {
    return jsonError(400, "moduleId is required (or use scope=all).");
  }

  const brand = readBrandProfileIdQuery(url.searchParams);
  if (!brand.ok) {
    return jsonError(400, brand.error);
  }

  const result = await listOwnedConversations(
    auth.ctx.supabase,
    auth.ctx.user.id,
    moduleId,
    brand.id,
  );
  if (!result.ok) {
    return jsonError(result.status, result.error);
  }

  return NextResponse.json({ conversations: result.conversations });
}

/**
 * POST /api/chat-history: create a conversation with opener (ordinal 0).
 * Body: { moduleId, openerContent, brandProfileId?, title? }
 * With brandProfileId: auto-files into that profile's folder (create or reuse).
 * Continue-without (null): stays Ungrouped.
 */
export async function POST(
  request: Request,
): Promise<NextResponse<ChatHistoryCreateResponse | { error: string }>> {
  const auth = await requireAuthedApi();
  if (!auth.ok) {
    return auth.response;
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

  if (typeof record.moduleId !== "string") {
    return jsonError(400, "Body must include moduleId: string.");
  }

  const openerContent = normalizeMessageContent(record.openerContent);
  if (openerContent === null) {
    return jsonError(
      400,
      "openerContent is required (1 to 32000 characters after trim).",
    );
  }

  const brand = readOptionalBrandProfileIdBody(record);
  if (!brand.ok) {
    return jsonError(400, brand.error);
  }

  let title: string = DEFAULT_CONVERSATION_TITLE;
  if ("title" in record) {
    const normalized = normalizeChatHistoryName(record.title);
    if (normalized === null) {
      return jsonError(
        400,
        "title must be 1 to 80 characters after trim.",
      );
    }
    title = normalized;
  }

  const result = await createOwnedConversation(
    auth.ctx.supabase,
    auth.ctx.user.id,
    {
      moduleId: record.moduleId,
      brandProfileId: brand.id,
      title,
      openerContent,
    },
  );
  if (!result.ok) {
    return jsonError(result.status, result.error);
  }

  return NextResponse.json(
    { conversation: result.conversation, messages: result.messages },
    { status: 201 },
  );
}
