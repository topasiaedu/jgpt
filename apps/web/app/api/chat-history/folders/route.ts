import { NextResponse } from "next/server";

import { jsonError, requireAuthedApi } from "@/lib/brandProfile/apiAuth";
import {
  createOwnedFolder,
  listOwnedFolders,
  normalizeChatHistoryName,
} from "@/lib/chatHistory/db";
import { DEFAULT_CHAT_FOLDER_COLOR } from "@/lib/chatHistory/folderColors";
import {
  parseJsonObjectBody,
  readOptionalFolderColorBody,
  readOptionalParentFolderIdBody,
} from "@/lib/chatHistory/requestFields";
import type { ChatFolderDto } from "@/lib/chatHistory/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type ChatFoldersListResponse = {
  folders: ChatFolderDto[];
};

export type ChatFolderCreateResponse = {
  folder: ChatFolderDto;
};

/**
 * GET /api/chat-history/folders: list owner folders (flat list with parentFolderId).
 */
export async function GET(): Promise<
  NextResponse<ChatFoldersListResponse | { error: string }>
> {
  const auth = await requireAuthedApi();
  if (!auth.ok) {
    return auth.response;
  }

  const result = await listOwnedFolders(auth.ctx.supabase, auth.ctx.user.id);
  if (!result.ok) {
    return jsonError(result.status, result.error);
  }

  return NextResponse.json({ folders: result.folders });
}

/**
 * POST /api/chat-history/folders: create { name, color?, parentFolderId? }.
 */
export async function POST(
  request: Request,
): Promise<NextResponse<ChatFolderCreateResponse | { error: string }>> {
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

  const name = normalizeChatHistoryName(record.name);
  if (name === null) {
    return jsonError(400, "name is required (1 to 80 characters after trim).");
  }

  const colorField = readOptionalFolderColorBody(record);
  if (!colorField.ok) {
    return jsonError(400, colorField.error);
  }

  const parentField = readOptionalParentFolderIdBody(record);
  if (!parentField.ok) {
    return jsonError(400, parentField.error);
  }

  const result = await createOwnedFolder(
    auth.ctx.supabase,
    auth.ctx.user.id,
    {
      name,
      color: colorField.present ? colorField.color : DEFAULT_CHAT_FOLDER_COLOR,
      parentFolderId: parentField.present ? parentField.id : null,
      brandProfileId: null,
    },
  );
  if (!result.ok) {
    return jsonError(result.status, result.error);
  }

  return NextResponse.json({ folder: result.folder }, { status: 201 });
}
