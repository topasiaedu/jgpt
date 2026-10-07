/**
 * Browser fetch helpers for chat history APIs.
 */

import {
  parseChatConversationSummary,
  parseChatFolderDto,
  parseChatHistoryMessage,
} from "@/lib/chatHistory/parse";
import type {
  ChatConversationPatchInput,
  ChatConversationSummary,
  ChatFolderCreateInput,
  ChatFolderDto,
  ChatFolderPatchInput,
  ChatHistoryAppendInput,
  ChatHistoryMessage,
} from "@/lib/chatHistory/types";

export type {
  ChatConversationPatchInput,
  ChatConversationSummary,
  ChatFolderCreateInput,
  ChatFolderDto,
  ChatFolderPatchInput,
  ChatHistoryAppendInput,
  ChatHistoryMessage,
} from "@/lib/chatHistory/types";
export {
  CHAT_FOLDER_COLORS,
  CHAT_HISTORY_MAX_FOLDERS_PER_USER,
  CHAT_HISTORY_MAX_FOLDER_DEPTH,
  CHAT_HISTORY_MAX_MESSAGES_PER_CONVERSATION,
  CHAT_HISTORY_NAME_MAX_CHARS,
  DEFAULT_CHAT_FOLDER_COLOR,
  DEFAULT_CONVERSATION_TITLE,
} from "@/lib/chatHistory/types";

export type ChatHistoryClientError = {
  ok: false;
  status: number;
  error: string;
};

/**
 * Reads { error } from a failed API response, with a fallback message.
 */
async function readApiError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string" &&
      body.error.trim().length > 0
    ) {
      return body.error;
    }
  } catch {
    // Non-JSON error body.
  }
  return fallback;
}

/**
 * Parses conversations[] from a list or nested payload.
 */
function parseConversationList(value: unknown): ChatConversationSummary[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const conversations: ChatConversationSummary[] = [];
  for (const item of value) {
    const row = parseChatConversationSummary(item);
    if (row === null) {
      return null;
    }
    conversations.push(row);
  }
  return conversations;
}

/**
 * Parses messages[] from a payload.
 */
function parseMessageList(value: unknown): ChatHistoryMessage[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const messages: ChatHistoryMessage[] = [];
  for (const item of value) {
    const row = parseChatHistoryMessage(item);
    if (row === null) {
      return null;
    }
    messages.push(row);
  }
  return messages;
}

/**
 * Shared GET /api/chat-history list parser.
 */
async function fetchChatConversationList(
  query: string,
): Promise<
  { ok: true; conversations: ChatConversationSummary[] } | ChatHistoryClientError
> {
  try {
    const response: Response = await fetch(`/api/chat-history?${query}`, {
      method: "GET",
      credentials: "same-origin",
    });
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not load chat history."),
      };
    }
    const body: unknown = await response.json();
    if (
      typeof body !== "object" ||
      body === null ||
      !("conversations" in body)
    ) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected chat history list response.",
      };
    }
    const conversations = parseConversationList(body.conversations);
    if (conversations === null) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected chat history list response.",
      };
    }
    return { ok: true, conversations };
  } catch {
    return { ok: false, status: 0, error: "Network error loading chat history." };
  }
}

/**
 * GET /api/chat-history?moduleId=&brandProfileId=
 * Pass brandProfileId null to list continue-without threads (IS NULL).
 */
export async function fetchChatConversations(
  moduleId: string,
  brandProfileId: string | null,
): Promise<
  { ok: true; conversations: ChatConversationSummary[] } | ChatHistoryClientError
> {
  const params = new URLSearchParams();
  params.set("moduleId", moduleId);
  if (brandProfileId !== null && brandProfileId.trim().length > 0) {
    params.set("brandProfileId", brandProfileId.trim());
  }
  return fetchChatConversationList(params.toString());
}

/**
 * GET /api/chat-history?scope=all
 * All tools and Brand profiles for the signed-in user.
 */
export async function fetchAllChatConversations(): Promise<
  { ok: true; conversations: ChatConversationSummary[] } | ChatHistoryClientError
> {
  return fetchChatConversationList("scope=all");
}

export type CreateChatConversationInput = {
  moduleId: string;
  openerContent: string;
  brandProfileId?: string | null;
  title?: string;
};

/**
 * POST /api/chat-history: new ungrouped thread with opener.
 */
export async function createChatConversation(
  input: CreateChatConversationInput,
): Promise<
  | { ok: true; conversation: ChatConversationSummary; messages: ChatHistoryMessage[] }
  | ChatHistoryClientError
> {
  const payload: {
    moduleId: string;
    openerContent: string;
    brandProfileId?: string | null;
    title?: string;
  } = {
    moduleId: input.moduleId,
    openerContent: input.openerContent,
  };
  if (input.brandProfileId !== undefined) {
    payload.brandProfileId = input.brandProfileId;
  }
  if (input.title !== undefined) {
    payload.title = input.title;
  }
  try {
    const response: Response = await fetch("/api/chat-history", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not start a new chat."),
      };
    }
    return parseConversationWithMessages(
      await response.json(),
      "Unexpected create chat response.",
    );
  } catch {
    return { ok: false, status: 0, error: "Network error starting a new chat." };
  }
}

/**
 * GET /api/chat-history/[id]
 */
export async function fetchChatConversation(
  conversationId: string,
): Promise<
  | { ok: true; conversation: ChatConversationSummary; messages: ChatHistoryMessage[] }
  | ChatHistoryClientError
> {
  try {
    const response: Response = await fetch(
      `/api/chat-history/${encodeURIComponent(conversationId)}`,
      {
        method: "GET",
        credentials: "same-origin",
      },
    );
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not load conversation."),
      };
    }
    return parseConversationWithMessages(
      await response.json(),
      "Unexpected conversation response.",
    );
  } catch {
    return { ok: false, status: 0, error: "Network error loading conversation." };
  }
}

/**
 * PATCH /api/chat-history/[id]: title, folderId (null ungroups), and/or deleted: true.
 */
export async function patchChatConversation(
  conversationId: string,
  input: ChatConversationPatchInput,
): Promise<
  | { ok: true; conversation: ChatConversationSummary | null; deleted: boolean }
  | ChatHistoryClientError
> {
  try {
    const response: Response = await fetch(
      `/api/chat-history/${encodeURIComponent(conversationId)}`,
      {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    );
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not update conversation."),
      };
    }
    const body: unknown = await response.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "ok" in body &&
      body.ok === true &&
      !("conversation" in body)
    ) {
      return { ok: true, conversation: null, deleted: true };
    }
    if (typeof body !== "object" || body === null || !("conversation" in body)) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected update conversation response.",
      };
    }
    const conversation = parseChatConversationSummary(body.conversation);
    if (conversation === null) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected update conversation response.",
      };
    }
    return { ok: true, conversation, deleted: false };
  } catch {
    return {
      ok: false,
      status: 0,
      error: "Network error updating conversation.",
    };
  }
}

/**
 * POST /api/chat-history/[id]/messages after a successful postChat.
 */
export async function appendChatHistoryTurn(
  conversationId: string,
  input: ChatHistoryAppendInput,
): Promise<
  | { ok: true; conversation: ChatConversationSummary; messages: ChatHistoryMessage[] }
  | ChatHistoryClientError
> {
  try {
    const response: Response = await fetch(
      `/api/chat-history/${encodeURIComponent(conversationId)}/messages`,
      {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    );
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not save this turn."),
      };
    }
    return parseConversationWithMessages(
      await response.json(),
      "Unexpected save turn response.",
    );
  } catch {
    return { ok: false, status: 0, error: "Network error saving this turn." };
  }
}

/**
 * GET /api/chat-history/folders
 */
export async function fetchChatFolders(): Promise<
  { ok: true; folders: ChatFolderDto[] } | ChatHistoryClientError
> {
  try {
    const response: Response = await fetch("/api/chat-history/folders", {
      method: "GET",
      credentials: "same-origin",
    });
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not load folders."),
      };
    }
    const body: unknown = await response.json();
    if (typeof body !== "object" || body === null || !("folders" in body)) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected folders list response.",
      };
    }
    if (!Array.isArray(body.folders)) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected folders list response.",
      };
    }
    const folders: ChatFolderDto[] = [];
    for (const item of body.folders) {
      const folder = parseChatFolderDto(item);
      if (folder === null) {
        return {
          ok: false,
          status: 500,
          error: "Unexpected folders list response.",
        };
      }
      folders.push(folder);
    }
    return { ok: true, folders };
  } catch {
    return { ok: false, status: 0, error: "Network error loading folders." };
  }
}

/**
 * POST /api/chat-history/folders
 */
export async function createChatFolder(
  input: ChatFolderCreateInput | string,
): Promise<{ ok: true; folder: ChatFolderDto } | ChatHistoryClientError> {
  const payload: ChatFolderCreateInput =
    typeof input === "string" ? { name: input } : input;
  try {
    const response: Response = await fetch("/api/chat-history/folders", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not create folder."),
      };
    }
    return parseFolderPayload(
      await response.json(),
      "Unexpected create folder response.",
    );
  } catch {
    return { ok: false, status: 0, error: "Network error creating folder." };
  }
}

/**
 * PATCH /api/chat-history/folders/[id]
 */
export async function patchChatFolder(
  folderId: string,
  input: ChatFolderPatchInput,
): Promise<{ ok: true; folder: ChatFolderDto } | ChatHistoryClientError> {
  try {
    const response: Response = await fetch(
      `/api/chat-history/folders/${encodeURIComponent(folderId)}`,
      {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    );
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not update folder."),
      };
    }
    return parseFolderPayload(
      await response.json(),
      "Unexpected update folder response.",
    );
  } catch {
    return { ok: false, status: 0, error: "Network error updating folder." };
  }
}

/**
 * PATCH /api/chat-history/folders/[id] rename helper.
 */
export async function renameChatFolder(
  folderId: string,
  name: string,
): Promise<{ ok: true; folder: ChatFolderDto } | ChatHistoryClientError> {
  return patchChatFolder(folderId, { name });
}

/**
 * DELETE /api/chat-history/folders/[id]. Chats stay and return to Ungrouped.
 */
export async function deleteChatFolder(
  folderId: string,
): Promise<{ ok: true } | ChatHistoryClientError> {
  try {
    const response: Response = await fetch(
      `/api/chat-history/folders/${encodeURIComponent(folderId)}`,
      {
        method: "DELETE",
        credentials: "same-origin",
      },
    );
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not delete folder."),
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, status: 0, error: "Network error deleting folder." };
  }
}

/**
 * Shared parser for { conversation, messages }.
 */
function parseConversationWithMessages(
  body: unknown,
  fallback: string,
):
  | { ok: true; conversation: ChatConversationSummary; messages: ChatHistoryMessage[] }
  | ChatHistoryClientError {
  if (
    typeof body !== "object" ||
    body === null ||
    !("conversation" in body) ||
    !("messages" in body)
  ) {
    return { ok: false, status: 500, error: fallback };
  }
  const conversation = parseChatConversationSummary(body.conversation);
  const messages = parseMessageList(body.messages);
  if (conversation === null || messages === null) {
    return { ok: false, status: 500, error: fallback };
  }
  return { ok: true, conversation, messages };
}

/**
 * Shared parser for { folder }.
 */
function parseFolderPayload(
  body: unknown,
  fallback: string,
): { ok: true; folder: ChatFolderDto } | ChatHistoryClientError {
  if (typeof body !== "object" || body === null || !("folder" in body)) {
    return { ok: false, status: 500, error: fallback };
  }
  const folder = parseChatFolderDto(body.folder);
  if (folder === null) {
    return { ok: false, status: 500, error: fallback };
  }
  return { ok: true, folder };
}
