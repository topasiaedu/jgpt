/**
 * Loads or creates the tool conversation for a module + optional Brand profile.
 * Dedupes concurrent calls (React Strict Mode) per module/profile key.
 */

import {
  createChatConversation,
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
  openerContent: string;
};

export type ToolChatBootstrapSuccess = {
  ok: true;
  conversation: ChatConversationSummary;
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
 * True when the preferred id is in the filtered live list.
 */
function listHasConversation(
  conversations: ChatConversationSummary[],
  conversationId: string,
): boolean {
  return conversations.some((row) => row.id === conversationId);
}

/**
 * List + folders, then ?c= if valid, else latest, else create with opener (ungrouped).
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

  let conversations: ChatConversationSummary[] = listResult.conversations;
  const folders: ChatFolderDto[] = foldersResult.folders;

  const preferredId: string | undefined = input.preferredConversationId;
  if (
    preferredId !== undefined &&
    listHasConversation(conversations, preferredId)
  ) {
    const preferred = await fetchChatConversation(preferredId);
    if (preferred.ok) {
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
    if (resumed.ok) {
      return {
        ok: true,
        conversation: resumed.conversation,
        messages: resumed.messages,
        conversations,
        folders,
      };
    }
  }

  const created = await createChatConversation({
    moduleId: input.moduleId,
    openerContent: input.openerContent,
    brandProfileId: input.brandProfileId,
  });
  if (!created.ok) {
    return created;
  }

  conversations = [
    created.conversation,
    ...conversations.filter((row) => row.id !== created.conversation.id),
  ];

  // Brand-profile auto-filing may create a folder; refresh so the sidebar sees it.
  let nextFolders: ChatFolderDto[] = folders;
  const assignedFolderId: string | null = created.conversation.folderId;
  if (
    assignedFolderId !== null &&
    !folders.some((folder) => folder.id === assignedFolderId)
  ) {
    const refreshed = await fetchChatFolders();
    if (refreshed.ok) {
      nextFolders = refreshed.folders;
    }
  }

  return {
    ok: true,
    conversation: created.conversation,
    messages: created.messages,
    conversations,
    folders: nextFolders,
  };
}

/**
 * Auto-resumes or creates the landing thread. Shares in-flight work per module/profile.
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
