import { NextResponse } from "next/server";

import { jsonError, requireAuthedApi } from "@/lib/brandProfile/apiAuth";
import { isUuid } from "@/lib/brandProfile/db";
import {
  getOwnedConversationWithMessages,
  patchOwnedConversation,
  type ConversationPatchFields,
} from "@/lib/chatHistory/db";
import { normalizeChatHistoryName } from "@/lib/chatHistory/parse";
import {
  parseJsonObjectBody,
  readOptionalFolderIdBody,
} from "@/lib/chatHistory/requestFields";
import type {
  ChatConversationSummary,
  ChatHistoryMessage,
} from "@/lib/chatHistory/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type ChatHistoryGetResponse = {
  conversation: ChatConversationSummary;
  messages: ChatHistoryMessage[];
};

export type ChatHistoryPatchResponse = {
  conversation?: ChatConversationSummary;
  ok?: true;
};

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/chat-history/[id]: owned live conversation + messages by ordinal.
 */
export async function GET(
  _request: Request,
  context: RouteParams,
): Promise<NextResponse<ChatHistoryGetResponse | { error: string }>> {
  const auth = await requireAuthedApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { id: rawId } = await context.params;
  const id: string = rawId.trim();
  if (!isUuid(id)) {
    return jsonError(400, "Invalid conversation id.");
  }

  const result = await getOwnedConversationWithMessages(
    auth.ctx.supabase,
    auth.ctx.user.id,
    id,
  );
  if (!result.ok) {
    return jsonError(result.status, result.error);
  }

  return NextResponse.json({
    conversation: result.conversation,
    messages: result.messages,
  });
}

/**
 * PATCH /api/chat-history/[id]: rename, move folder (null ungroups), and/or soft-delete.
 */
export async function PATCH(
  request: Request,
  context: RouteParams,
): Promise<NextResponse<ChatHistoryPatchResponse | { error: string }>> {
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

  const fields: ConversationPatchFields = {};
  let hasField = false;

  if ("title" in record) {
    const title = normalizeChatHistoryName(record.title);
    if (title === null) {
      return jsonError(400, "title must be 1 to 80 characters after trim.");
    }
    fields.title = title;
    hasField = true;
  }

  if ("deleted" in record) {
    if (record.deleted !== true) {
      return jsonError(400, "deleted must be true to soft-delete a conversation.");
    }
    fields.deleted = true;
    hasField = true;
  }

  const folder = readOptionalFolderIdBody(record);
  if (!folder.ok) {
    return jsonError(400, folder.error);
  }
  if (folder.present) {
    fields.folderId = folder.id;
    hasField = true;
  }

  if (!hasField) {
    return jsonError(
      400,
      "Provide at least one of title, folderId, or deleted: true.",
    );
  }

  const result = await patchOwnedConversation(
    auth.ctx.supabase,
    auth.ctx.user.id,
    id,
    fields,
  );
  if (!result.ok) {
    return jsonError(result.status, result.error);
  }

  if (result.deleted) {
    return NextResponse.json({ ok: true });
  }
  if (result.conversation === null) {
    return jsonError(500, "Could not update conversation.");
  }
  return NextResponse.json({ conversation: result.conversation });
}
