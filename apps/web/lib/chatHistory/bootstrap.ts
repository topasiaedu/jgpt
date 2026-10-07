/**
 * Loads tool chat history for a module + optional Brand profile.
 * Resumes ?c= or the latest thread with a user message; otherwise stays ephemeral
 * (pack opener in UI only, no DB row until the first successful user send).
 * Dedupes concurrent calls (React Strict Mode) per module/profile key.
 */

import {
  fetchChatConversation,
  fetchChatConversations,
  fetchChatFolders,
  type ChatHistoryClientError,
} from "@/lib/chatHistory/clientApi";
import type {
  ChatConversationSummary,
  ChatFolderDto,
  ChatHistoryMessage,
} from "@/lib/chatHistory/types";

export type ToolChatBootstrapInput = {
  moduleId: string;
  brandProfileId: string | null;
  preferredConversationId: string | undefined;
  /** Pack opener shown when no persisted thread is resumed (not written to DB). */
  openerContent: string;
};

export type ToolChatBootstrapSuccess = {
  ok: true;
  /**
   * Persisted thread when resumed; null when the UI should show an ephemeral opener
   * with no chat_conversations row yet.
   */
  conversation: ChatConversationSummary | null;
  messages: ChatHistoryMessage[];
  conversations: ChatConversationSummary[];
  folders: ChatFolderDto[];
};

export type ToolChatBootstrapResult =
  | ToolChatBootstrapSuccess
  | ChatHistoryClientError;

const inflightByKey: Map<string, Promise<ToolChatBootstrapResult>> = new Map();

/**
 * Builds a cache key for (module, continue-without vs profile uuid).
 */
function bootstrapKey(moduleId: string, brandProfileId: string | null): string {
  if (brandProfileId === null) {
    return `${moduleId}::none`;
  }
  return `${moduleId}::${brandProfileId}`;
}

/**
 * True when the resumed conversation matches this tool + Brand profile key.
 */
function conversationMatchesScope(
  conversation: ChatConversationSummary,
  moduleId: string,
  brandProfileId: string | null,
): boolean {
  if (conversation.moduleId !== moduleId) {
    return false;
  }
  return conversation.brandProfileId === brandProfileId;
}

/**
 * List + folders, then ?c= if valid, else latest listed thread, else ephemeral opener.
 * Never inserts a conversation on land.
 */
async function runToolChatBootstrap(
  input: ToolChatBootstrapInput,
): Promise<ToolChatBootstrapResult> {
  const [listResult, foldersResult] = await Promise.all([
    fetchChatConversations(input.moduleId, input.brandProfileId),
    fetchChatFolders(),
  ]);
  if (!listResult.ok) {
    return listResult;
  }
  if (!foldersResult.ok) {
    return foldersResult;
  }

  const conversations: ChatConversationSummary[] = listResult.conversations;
  const folders: ChatFolderDto[] = foldersResult.folders;

  const preferredId: string | undefined = input.preferredConversationId;
  if (preferredId !== undefined) {
    const preferred = await fetchChatConversation(preferredId);
    if (
      preferred.ok &&
      conversationMatchesScope(
        preferred.conversation,
        input.moduleId,
        input.brandProfileId,
      )
    ) {
      return {
        ok: true,
        conversation: preferred.conversation,
        messages: preferred.messages,
        conversations,
        folders,
      };
    }
  }

  const latest: ChatConversationSummary | undefined = conversations[0];
  if (latest !== undefined) {
    const resumed = await fetchChatConversation(latest.id);
    if (
      resumed.ok &&
      conversationMatchesScope(
        resumed.conversation,
        input.moduleId,
        input.brandProfileId,
      )
    ) {
      return {
        ok: true,
        conversation: resumed.conversation,
        messages: resumed.messages,
        conversations,
        folders,
      };
    }
  }

  return {
    ok: true,
    conversation: null,
    messages: [],
    conversations,
    folders,
  };
}

/**
 * Auto-resumes a persisted thread, or leaves the tool on an ephemeral opener.
 * Shares in-flight work per module/profile.
 */
export function bootstrapToolChatHistory(
  input: ToolChatBootstrapInput,
): Promise<ToolChatBootstrapResult> {
  const key: string = bootstrapKey(input.moduleId, input.brandProfileId);
  const existing: Promise<ToolChatBootstrapResult> | undefined =
    inflightByKey.get(key);
  if (existing !== undefined) {
    return existing;
  }
  const pending: Promise<ToolChatBootstrapResult> = runToolChatBootstrap(
    input,
  ).finally(() => {
    inflightByKey.delete(key);
  });
  inflightByKey.set(key, pending);
  return pending;
}
