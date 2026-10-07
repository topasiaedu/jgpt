import { NextResponse } from "next/server";

import { jsonError, requireAuthedApi } from "@/lib/brandProfile/apiAuth";
import { isUuid } from "@/lib/brandProfile/db";
import {
  deleteOwnedFolder,
  normalizeChatHistoryName,
  patchOwnedFolder,
  type FolderPatchFields,
} from "@/lib/chatHistory/db";
import {
  parseJsonObjectBody,
  readOptionalFolderColorBody,
  readOptionalParentFolderIdBody,
} from "@/lib/chatHistory/requestFields";
import type { ChatFolderDto } from "@/lib/chatHistory/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type ChatFolderUpdateResponse = {
  folder: ChatFolderDto;
};

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * PATCH /api/chat-history/folders/[id]: { name?, color?, parentFolderId? }.
 */
export async function PATCH(
  request: Request,
  context: RouteParams,
): Promise<NextResponse<ChatFolderUpdateResponse | { error: string }>> {
  const auth = await requireAuthedApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { id: rawId } = await context.params;
  const id: string = rawId.trim();
  if (!isUuid(id)) {
    return jsonError(400, "Invalid folder id.");
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

  const fields: FolderPatchFields = {};

  if ("name" in record) {
    const name = normalizeChatHistoryName(record.name);
    if (name === null) {
      return jsonError(400, "name must be 1 to 80 characters after trim.");
    }
    fields.name = name;
  }

  const colorField = readOptionalFolderColorBody(record);
  if (!colorField.ok) {
    return jsonError(400, colorField.error);
  }
  if (colorField.present) {
    fields.color = colorField.color;
  }

  const parentField = readOptionalParentFolderIdBody(record);
  if (!parentField.ok) {
    return jsonError(400, parentField.error);
  }
  if (parentField.present) {
    fields.parentFolderId = parentField.id;
  }

  if (
    fields.name === undefined &&
    fields.color === undefined &&
    fields.parentFolderId === undefined
  ) {
    return jsonError(
      400,
      "Provide at least one of name, color, or parentFolderId.",
    );
  }

  const result = await patchOwnedFolder(
    auth.ctx.supabase,
    auth.ctx.user.id,
    id,
    fields,
  );
  if (!result.ok) {
    return jsonError(result.status, result.error);
  }

  return NextResponse.json({ folder: result.folder });
}

/**
 * DELETE /api/chat-history/folders/[id]: hard-delete folder (and nested children).
 * Chats in deleted folders ungroup via ON DELETE SET NULL.
 */
export async function DELETE(
  _request: Request,
  context: RouteParams,
): Promise<NextResponse<{ ok: true } | { error: string }>> {
  const auth = await requireAuthedApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { id: rawId } = await context.params;
  const id: string = rawId.trim();
  if (!isUuid(id)) {
    return jsonError(400, "Invalid folder id.");
  }

  const result = await deleteOwnedFolder(
    auth.ctx.supabase,
    auth.ctx.user.id,
    id,
  );
  if (!result.ok) {
    return jsonError(result.status, result.error);
  }

  return NextResponse.json({ ok: true });
}
