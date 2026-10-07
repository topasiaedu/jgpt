/**
 * Chat history DTOs and caps (user transcripts, not Jeff doctrine).
 */

import type { ChatFolderColor } from "@/lib/chatHistory/folderColors";
import type { BrandChatSource, ChatRole, ChatSource } from "@/lib/chatTypes";

export type { ChatFolderColor } from "@/lib/chatHistory/folderColors";
export {
  CHAT_FOLDER_COLORS,
  DEFAULT_CHAT_FOLDER_COLOR,
  isChatFolderColor,
  parseChatFolderColor,
  pickFolderColorForProfileId,
} from "@/lib/chatHistory/folderColors";

/** Default conversation title until the first user turn (locale-neutral placeholder). */
export const DEFAULT_CONVERSATION_TITLE = "New chat";

/** Max characters for conversation title and folder name after trim. */
export const CHAT_HISTORY_NAME_MAX_CHARS = 80;

/** Abuse cap: folders per signed-in user. */
export const CHAT_HISTORY_MAX_FOLDERS_PER_USER = 50;

/**
 * Nesting depth: root (depth 1) and one subfolder level (depth 2).
 * Parent folders must themselves be roots.
 */
export const CHAT_HISTORY_MAX_FOLDER_DEPTH = 2;

/** Hard cap on stored messages per conversation (UI transcript, not LLM window). */
export const CHAT_HISTORY_MAX_MESSAGES_PER_CONVERSATION = 500;

/** Max characters for a stored message or opener body. */
export const CHAT_HISTORY_MAX_MESSAGE_CHARS = 32_000;

/** List/card row for a tool thread. */
export type ChatConversationSummary = {
  id: string;
  moduleId: string;
  brandProfileId: string | null;
  folderId: string | null;
  title: string;
  createdAt: string;
  updatedAt: string;
};

/** One persisted transcript turn. */
export type ChatHistoryMessage = {
  id: string;
  ordinal: number;
  role: ChatRole;
  content: string;
  sources: ChatSource[] | null;
  brandSources: BrandChatSource[] | null;
  createdAt: string;
};

/** User-owned project grouping (not a Brand profile). */
export type ChatFolderDto = {
  id: string;
  name: string;
  color: ChatFolderColor;
  parentFolderId: string | null;
  /** When set, new chats for this Brand profile auto-file here. */
  brandProfileId: string | null;
  createdAt: string;
  updatedAt: string;
};

/** POST body for creating a folder. */
export type ChatFolderCreateInput = {
  name: string;
  color?: ChatFolderColor;
  parentFolderId?: string | null;
};

/** PATCH body for a folder (all fields optional; at least one required). */
export type ChatFolderPatchInput = {
  name?: string;
  color?: ChatFolderColor;
  parentFolderId?: string | null;
};

/** PATCH body for a conversation (all fields optional; at least one required). */
export type ChatConversationPatchInput = {
  title?: string;
  deleted?: boolean;
  folderId?: string | null;
};

/** POST append-turn body after a successful /api/chat. */
export type ChatHistoryAppendInput = {
  userContent: string;
  assistantContent: string;
  sources?: ChatSource[];
  brandSources?: BrandChatSource[];
};
