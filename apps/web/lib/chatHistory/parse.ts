/**
 * Parsers for chat_folders / chat_conversations / chat_messages rows and JSON bodies.
 */

import type { BrandChatSource, ChatRole, ChatSource } from "@/lib/chatTypes";

import {
  DEFAULT_CHAT_FOLDER_COLOR,
  parseChatFolderColor,
} from "@/lib/chatHistory/folderColors";
import {
  CHAT_HISTORY_MAX_MESSAGE_CHARS,
  CHAT_HISTORY_NAME_MAX_CHARS,
  DEFAULT_CONVERSATION_TITLE,
  type ChatConversationSummary,
  type ChatFolderDto,
  type ChatHistoryMessage,
} from "@/lib/chatHistory/types";

/**
 * True when value is a non-array object.
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Trims, collapses internal whitespace, and caps a title or folder name.
 * Returns null when empty or over the cap.
 */
export function normalizeChatHistoryName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const name: string = value.trim().replace(/\s+/g, " ");
  if (name.length === 0 || name.length > CHAT_HISTORY_NAME_MAX_CHARS) {
    return null;
  }
  return name;
}

/**
 * Builds a default title from the first user line (cap 80). Empty input returns null.
 */
export function titleFromUserContent(userContent: string): string | null {
  const lines: string[] = userContent.split("\n");
  const firstLine: string | undefined = lines[0];
  if (firstLine === undefined) {
    return null;
  }
  return normalizeChatHistoryName(firstLine);
}

/**
 * Trims message/opener content. Rejects empty or oversized bodies.
 */
export function normalizeMessageContent(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const content: string = value.trim();
  if (content.length === 0 || content.length > CHAT_HISTORY_MAX_MESSAGE_CHARS) {
    return null;
  }
  return content;
}

/**
 * Parses a Jeff-graph source chip from JSON.
 */
export function parseChatSource(value: unknown): ChatSource | null {
  if (!isPlainObject(value)) {
    return null;
  }
  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.type !== "string"
  ) {
    return null;
  }
  const id: string = value.id.trim();
  const title: string = value.title.trim();
  const type: string = value.type.trim();
  if (id.length === 0 || title.length === 0 || type.length === 0) {
    return null;
  }
  return { id, title, type };
}

/**
 * Parses a brand-excerpt chip from JSON.
 */
export function parseBrandChatSource(value: unknown): BrandChatSource | null {
  if (!isPlainObject(value)) {
    return null;
  }
  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    value.kind !== "brand"
  ) {
    return null;
  }
  const id: string = value.id.trim();
  const title: string = value.title.trim();
  if (id.length === 0 || title.length === 0) {
    return null;
  }
  return { id, title, kind: "brand" };
}

/**
 * Parses optional sources JSON. Omitted/null/empty becomes null. Invalid shape fails.
 */
export function parseOptionalChatSources(
  value: unknown,
): { ok: true; value: ChatSource[] | null } | { ok: false } {
  if (value === undefined || value === null) {
    return { ok: true, value: null };
  }
  if (!Array.isArray(value)) {
    return { ok: false };
  }
  const sources: ChatSource[] = [];
  for (const item of value) {
    const parsed = parseChatSource(item);
    if (parsed === null) {
      return { ok: false };
    }
    sources.push(parsed);
  }
  return { ok: true, value: sources.length === 0 ? null : sources };
}

/**
 * Parses optional brandSources JSON. Omitted/null/empty becomes null. Invalid shape fails.
 */
export function parseOptionalBrandSources(
  value: unknown,
): { ok: true; value: BrandChatSource[] | null } | { ok: false } {
  if (value === undefined || value === null) {
    return { ok: true, value: null };
  }
  if (!Array.isArray(value)) {
    return { ok: false };
  }
  const sources: BrandChatSource[] = [];
  for (const item of value) {
    const parsed = parseBrandChatSource(item);
    if (parsed === null) {
      return { ok: false };
    }
    sources.push(parsed);
  }
  return { ok: true, value: sources.length === 0 ? null : sources };
}

/**
 * Maps a chat_folders row (or API DTO) to ChatFolderDto.
 */
export function parseChatFolderDto(value: unknown): ChatFolderDto | null {
  if (!isPlainObject(value)) {
    return null;
  }
  const id: unknown = value.id;
  const name: unknown = value.name;
  const colorRaw: unknown =
    value.color !== undefined ? value.color : DEFAULT_CHAT_FOLDER_COLOR;
  const parentFolderIdRaw: unknown =
    value.parentFolderId !== undefined
      ? value.parentFolderId
      : value.parent_folder_id;
  const brandProfileIdRaw: unknown =
    value.brandProfileId !== undefined
      ? value.brandProfileId
      : value.brand_profile_id;
  const createdAt: unknown =
    value.createdAt !== undefined ? value.createdAt : value.created_at;
  const updatedAt: unknown =
    value.updatedAt !== undefined ? value.updatedAt : value.updated_at;
  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof createdAt !== "string" ||
    typeof updatedAt !== "string"
  ) {
    return null;
  }
  const color = parseChatFolderColor(colorRaw);
  if (color === null) {
    return null;
  }
  if (parentFolderIdRaw !== null && parentFolderIdRaw !== undefined) {
    if (typeof parentFolderIdRaw !== "string") {
      return null;
    }
  }
  if (brandProfileIdRaw !== null && brandProfileIdRaw !== undefined) {
    if (typeof brandProfileIdRaw !== "string") {
      return null;
    }
  }
  const trimmedId: string = id.trim();
  const trimmedName: string = name.trim();
  if (trimmedId.length === 0 || trimmedName.length === 0) {
    return null;
  }
  const parentFolderId: string | null =
    typeof parentFolderIdRaw === "string" && parentFolderIdRaw.trim().length > 0
      ? parentFolderIdRaw.trim()
      : null;
  const brandProfileId: string | null =
    typeof brandProfileIdRaw === "string" && brandProfileIdRaw.trim().length > 0
      ? brandProfileIdRaw.trim()
      : null;
  return {
    id: trimmedId,
    name: trimmedName,
    color,
    parentFolderId,
    brandProfileId,
    createdAt,
    updatedAt,
  };
}

/**
 * Maps a chat_conversations row (or API DTO) to a summary. Soft-deleted rows are rejected.
 */
export function parseChatConversationSummary(
  value: unknown,
): ChatConversationSummary | null {
  if (!isPlainObject(value)) {
    return null;
  }
  const id: unknown = value.id;
  const moduleId: unknown =
    value.moduleId !== undefined ? value.moduleId : value.module_id;
  const brandProfileId: unknown =
    value.brandProfileId !== undefined
      ? value.brandProfileId
      : value.brand_profile_id;
  const folderId: unknown =
    value.folderId !== undefined ? value.folderId : value.folder_id;
  const title: unknown = value.title;
  const createdAt: unknown =
    value.createdAt !== undefined ? value.createdAt : value.created_at;
  const updatedAt: unknown =
    value.updatedAt !== undefined ? value.updatedAt : value.updated_at;
  const deletedAt: unknown =
    value.deletedAt !== undefined ? value.deletedAt : value.deleted_at;
  if (
    typeof id !== "string" ||
    typeof moduleId !== "string" ||
    typeof title !== "string" ||
    typeof createdAt !== "string" ||
    typeof updatedAt !== "string"
  ) {
    return null;
  }
  if (deletedAt !== undefined && deletedAt !== null) {
    return null;
  }
  if (brandProfileId !== null && typeof brandProfileId !== "string") {
    return null;
  }
  if (folderId !== null && typeof folderId !== "string") {
    return null;
  }
  const trimmedId: string = id.trim();
  const trimmedModule: string = moduleId.trim();
  const trimmedTitle: string = title.trim();
  if (trimmedId.length === 0 || trimmedModule.length === 0 || trimmedTitle.length === 0) {
    return null;
  }
  return {
    id: trimmedId,
    moduleId: trimmedModule,
    brandProfileId:
      typeof brandProfileId === "string" && brandProfileId.trim().length > 0
        ? brandProfileId.trim()
        : null,
    folderId:
      typeof folderId === "string" && folderId.trim().length > 0
        ? folderId.trim()
        : null,
    title: trimmedTitle,
    createdAt,
    updatedAt,
  };
}

/**
 * Parses a chat_messages row (or API DTO).
 */
export function parseChatHistoryMessage(
  value: unknown,
): ChatHistoryMessage | null {
  if (!isPlainObject(value)) {
    return null;
  }
  const id: unknown = value.id;
  const ordinal: unknown = value.ordinal;
  const role: unknown = value.role;
  const content: unknown = value.content;
  const createdAt: unknown =
    value.createdAt !== undefined ? value.createdAt : value.created_at;
  const sourcesRaw: unknown =
    value.sources !== undefined ? value.sources : null;
  const brandRaw: unknown =
    value.brandSources !== undefined
      ? value.brandSources
      : value.brand_sources;
  if (
    typeof id !== "string" ||
    typeof content !== "string" ||
    typeof createdAt !== "string" ||
    !isChatRole(role) ||
    typeof ordinal !== "number" ||
    !Number.isInteger(ordinal) ||
    ordinal < 0
  ) {
    return null;
  }
  const sourcesParsed = parseOptionalChatSources(sourcesRaw);
  const brandParsed = parseOptionalBrandSources(brandRaw ?? null);
  if (!sourcesParsed.ok || !brandParsed.ok) {
    return null;
  }
  const trimmedId: string = id.trim();
  const trimmedContent: string = content.trim();
  if (trimmedId.length === 0 || trimmedContent.length === 0) {
    return null;
  }
  return {
    id: trimmedId,
    ordinal,
    role,
    content: trimmedContent,
    sources: sourcesParsed.value,
    brandSources: brandParsed.value,
    createdAt,
  };
}

/**
 * Narrows unknown to a chat role.
 */
function isChatRole(value: unknown): value is ChatRole {
  return value === "user" || value === "assistant";
}

/**
 * True when title is still the locale-neutral default placeholder.
 */
export function isDefaultConversationTitle(title: string): boolean {
  return title.trim() === DEFAULT_CONVERSATION_TITLE;
}
