/**
 * Server-side chat history reads/writes (RLS + owner filters).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import { userOwnsBrandProfile } from "@/lib/brandProfile/ownedProfile";
import type { BrandChatSource, ChatSource } from "@/lib/chatTypes";
import {
  pickFolderColorForProfileId,
  type ChatFolderColor,
} from "@/lib/chatHistory/folderColors";
import { userOwnsChatFolder } from "@/lib/chatHistory/owned";
import {
  isDefaultConversationTitle,
  isPlainObject,
  normalizeChatHistoryName,
  normalizeMessageContent,
  parseChatConversationSummary,
  parseChatFolderDto,
  parseChatHistoryMessage,
  titleFromUserContent,
} from "@/lib/chatHistory/parse";
import {
  CHAT_HISTORY_MAX_FOLDERS_PER_USER,
  CHAT_HISTORY_MAX_MESSAGES_PER_CONVERSATION,
  DEFAULT_CONVERSATION_TITLE,
  type ChatConversationSummary,
  type ChatFolderDto,
  type ChatHistoryMessage,
} from "@/lib/chatHistory/types";
import { getModuleById } from "@/lib/modules/catalog";

export type ChatHistoryDbError = {
  ok: false;
  status: number;
  error: string;
};

const CONVERSATION_SELECT =
  "id, owner_user_id, module_id, brand_profile_id, folder_id, title, created_at, updated_at, deleted_at";

const MESSAGE_SELECT =
  "id, conversation_id, ordinal, role, content, sources, brand_sources, created_at";

const FOLDER_SELECT =
  "id, owner_user_id, name, color, parent_folder_id, brand_profile_id, created_at, updated_at";

/**
 * Validates moduleId against the tool catalog.
 */
export function requireCatalogModuleId(
  moduleId: string,
): ChatHistoryDbError | { ok: true; moduleId: string } {
  const trimmed: string = moduleId.trim();
  if (trimmed.length === 0) {
    return { ok: false, status: 400, error: "moduleId is required." };
  }
  if (getModuleById(trimmed) === undefined) {
    return { ok: false, status: 400, error: "Unknown moduleId." };
  }
  return { ok: true, moduleId: trimmed };
}

/**
 * Keeps only conversations that have at least one user message.
 * Opener-only threads stay out of sidebar lists (legacy junk + failed lazy-create).
 */
async function filterConversationsWithUserMessages(
  supabase: SupabaseClient,
  conversations: ChatConversationSummary[],
): Promise<
  { ok: true; conversations: ChatConversationSummary[] } | ChatHistoryDbError
> {
  if (conversations.length === 0) {
    return { ok: true, conversations };
  }

  const conversationIds: string[] = conversations.map((row) => row.id);
  const { data, error } = await supabase
    .from("chat_messages")
    .select("conversation_id")
    .in("conversation_id", conversationIds)
    .eq("role", "user");

  if (error !== null) {
    return { ok: false, status: 500, error: error.message };
  }

  const withUserMessage: Set<string> = new Set();
  if (Array.isArray(data)) {
    for (const item of data) {
      if (
        isPlainObject(item) &&
        typeof item.conversation_id === "string" &&
        item.conversation_id.trim().length > 0
      ) {
        withUserMessage.add(item.conversation_id);
      }
    }
  }

  return {
    ok: true,
    conversations: conversations.filter((row) => withUserMessage.has(row.id)),
  };
}

/**
 * Lists non-deleted conversations for this user, module, and profile key.
 * brandProfileId null means continue-without (IS NULL).
 * Opener-only threads (zero user messages) are omitted.
 */
export async function listOwnedConversations(
  supabase: SupabaseClient,
  userId: string,
  moduleId: string,
  brandProfileId: string | null,
): Promise<
  { ok: true; conversations: ChatConversationSummary[] } | ChatHistoryDbError
> {
  const catalog = requireCatalogModuleId(moduleId);
  if (!catalog.ok) {
    return catalog;
  }

  if (brandProfileId !== null) {
    const owned = await userOwnsBrandProfile(
      supabase,
      userId,
      brandProfileId,
    );
    if (!owned) {
      return {
        ok: false,
        status: 403,
        error: "Brand profile not found or not owned by this account.",
      };
    }
  }

  let query = supabase
    .from("chat_conversations")
    .select(CONVERSATION_SELECT)
    .eq("owner_user_id", userId)
    .eq("module_id", catalog.moduleId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (brandProfileId === null) {
    query = query.is("brand_profile_id", null);
  } else {
    query = query.eq("brand_profile_id", brandProfileId);
  }

  const { data, error } = await query;
  if (error !== null) {
    return { ok: false, status: 500, error: error.message };
  }

  const conversations: ChatConversationSummary[] = [];
  if (Array.isArray(data)) {
    for (const item of data) {
      const row = parseChatConversationSummary(item);
      if (row !== null) {
        conversations.push(row);
      }
    }
  }
  return filterConversationsWithUserMessages(supabase, conversations);
}

/**
 * Lists all non-deleted conversations for this user across tools and profiles.
 * Newest updated_at first. Used by the global history sidebar.
 * Opener-only threads (zero user messages) are omitted.
 */
export async function listAllOwnedConversations(
  supabase: SupabaseClient,
  userId: string,
): Promise<
  { ok: true; conversations: ChatConversationSummary[] } | ChatHistoryDbError
> {
  const { data, error } = await supabase
    .from("chat_conversations")
    .select(CONVERSATION_SELECT)
    .eq("owner_user_id", userId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error !== null) {
    return { ok: false, status: 500, error: error.message };
  }

  const conversations: ChatConversationSummary[] = [];
  if (Array.isArray(data)) {
    for (const item of data) {
      const row = parseChatConversationSummary(item);
      if (row !== null) {
        conversations.push(row);
      }
    }
  }
  return filterConversationsWithUserMessages(supabase, conversations);
}

export type CreateConversationInput = {
  moduleId: string;
  brandProfileId: string | null;
  title: string;
  openerContent: string;
};

/**
 * Creates a conversation with ordinal 0 assistant opener.
 * With a Brand profile, auto-files into that profile's folder (create or reuse).
 * Continue-without stays Ungrouped (folder_id null).
 */
export async function createOwnedConversation(
  supabase: SupabaseClient,
  userId: string,
  input: CreateConversationInput,
): Promise<
  | { ok: true; conversation: ChatConversationSummary; messages: ChatHistoryMessage[] }
  | ChatHistoryDbError
> {
  const catalog = requireCatalogModuleId(input.moduleId);
  if (!catalog.ok) {
    return catalog;
  }

  let folderId: string | null = null;

  if (input.brandProfileId !== null) {
    const owned = await userOwnsBrandProfile(
      supabase,
      userId,
      input.brandProfileId,
    );
    if (!owned) {
      return {
        ok: false,
        status: 403,
        error: "Brand profile not found or not owned by this account.",
      };
    }
    const profileFolder = await resolveOrCreateBrandProfileFolder(
      supabase,
      userId,
      input.brandProfileId,
    );
    if (!profileFolder.ok) {
      return profileFolder;
    }
    folderId = profileFolder.folderId;
  }

  const { data, error } = await supabase
    .from("chat_conversations")
    .insert({
      owner_user_id: userId,
      module_id: catalog.moduleId,
      brand_profile_id: input.brandProfileId,
      folder_id: folderId,
      title: input.title,
    })
    .select(CONVERSATION_SELECT)
    .single();

  if (error !== null) {
    return { ok: false, status: 500, error: error.message };
  }

  const conversation = parseChatConversationSummary(data);
  if (conversation === null) {
    if (isPlainObject(data) && typeof data.id === "string") {
      await supabase.from("chat_conversations").delete().eq("id", data.id);
    }
    return { ok: false, status: 500, error: "Could not create conversation." };
  }

  const { data: messageData, error: messageError } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: conversation.id,
      ordinal: 0,
      role: "assistant",
      content: input.openerContent,
      sources: null,
      brand_sources: null,
    })
    .select(MESSAGE_SELECT)
    .single();

  if (messageError !== null) {
    await supabase.from("chat_conversations").delete().eq("id", conversation.id);
    return { ok: false, status: 500, error: messageError.message };
  }

  const opener = parseChatHistoryMessage(messageData);
  if (opener === null) {
    await supabase.from("chat_conversations").delete().eq("id", conversation.id);
    return { ok: false, status: 500, error: "Could not store opener message." };
  }

  return { ok: true, conversation, messages: [opener] };
}

/**
 * Loads a live (not soft-deleted) owned conversation.
 */
export async function getOwnedLiveConversation(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string,
): Promise<{ ok: true; conversation: ChatConversationSummary } | ChatHistoryDbError> {
  const { data, error } = await supabase
    .from("chat_conversations")
    .select(CONVERSATION_SELECT)
    .eq("id", conversationId)
    .eq("owner_user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error !== null) {
    return { ok: false, status: 500, error: error.message };
  }
  const conversation = parseChatConversationSummary(data);
  if (conversation === null) {
    return { ok: false, status: 404, error: "Conversation not found." };
  }
  return { ok: true, conversation };
}

/**
 * Loads conversation plus messages in ordinal order (hard cap).
 */
export async function getOwnedConversationWithMessages(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string,
): Promise<
  | { ok: true; conversation: ChatConversationSummary; messages: ChatHistoryMessage[] }
  | ChatHistoryDbError
> {
  const loaded = await getOwnedLiveConversation(
    supabase,
    userId,
    conversationId,
  );
  if (!loaded.ok) {
    return loaded;
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .select(MESSAGE_SELECT)
    .eq("conversation_id", conversationId)
    .order("ordinal", { ascending: true })
    .limit(CHAT_HISTORY_MAX_MESSAGES_PER_CONVERSATION);

  if (error !== null) {
    return { ok: false, status: 500, error: error.message };
  }

  const messages: ChatHistoryMessage[] = [];
  if (Array.isArray(data)) {
    for (const item of data) {
      const row = parseChatHistoryMessage(item);
      if (row !== null) {
        messages.push(row);
      }
    }
  }
  return { ok: true, conversation: loaded.conversation, messages };
}

export type ConversationPatchFields = {
  title?: string;
  folderId?: string | null;
  deleted?: boolean;
};

/**
 * Renames, moves (folderId null ungroups), and/or soft-deletes a live conversation.
 */
export async function patchOwnedConversation(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string,
  fields: ConversationPatchFields,
): Promise<
  | { ok: true; conversation: ChatConversationSummary | null; deleted: boolean }
  | ChatHistoryDbError
> {
  const loaded = await getOwnedLiveConversation(
    supabase,
    userId,
    conversationId,
  );
  if (!loaded.ok) {
    return loaded;
  }

  if (fields.folderId !== undefined && fields.folderId !== null) {
    const ownedFolder = await userOwnsChatFolder(
      supabase,
      userId,
      fields.folderId,
    );
    if (!ownedFolder) {
      return {
        ok: false,
        status: 403,
        error: "Folder not found or not owned by this account.",
      };
    }
  }

  const nowIso: string = new Date().toISOString();
  const patch: {
    title?: string;
    folder_id?: string | null;
    deleted_at?: string;
    updated_at: string;
  } = { updated_at: nowIso };

  if (fields.title !== undefined) {
    patch.title = fields.title;
  }
  if (fields.folderId !== undefined) {
    patch.folder_id = fields.folderId;
  }
  if (fields.deleted === true) {
    patch.deleted_at = nowIso;
  }

  const { data, error } = await supabase
    .from("chat_conversations")
    .update(patch)
    .eq("id", conversationId)
    .eq("owner_user_id", userId)
    .is("deleted_at", null)
    .select(CONVERSATION_SELECT)
    .maybeSingle();

  if (error !== null) {
    return { ok: false, status: 500, error: error.message };
  }
  if (data === null) {
    return { ok: false, status: 404, error: "Conversation not found." };
  }

  if (fields.deleted === true) {
    return { ok: true, conversation: null, deleted: true };
  }

  const conversation = parseChatConversationSummary(data);
  if (conversation === null) {
    return { ok: false, status: 500, error: "Could not update conversation." };
  }
  return { ok: true, conversation, deleted: false };
}

export type AppendTurnInput = {
  userContent: string;
  assistantContent: string;
  sources: ChatSource[] | null;
  brandSources: BrandChatSource[] | null;
};

/**
 * Appends a user + assistant pair and bumps updated_at. First user turn may set title.
 */
export async function appendOwnedTurn(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string,
  input: AppendTurnInput,
): Promise<
  | { ok: true; conversation: ChatConversationSummary; messages: ChatHistoryMessage[] }
  | ChatHistoryDbError
> {
  const loaded = await getOwnedLiveConversation(
    supabase,
    userId,
    conversationId,
  );
  if (!loaded.ok) {
    return loaded;
  }

  const { data: lastRow, error: lastError } = await supabase
    .from("chat_messages")
    .select("ordinal")
    .eq("conversation_id", conversationId)
    .order("ordinal", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastError !== null) {
    return { ok: false, status: 500, error: lastError.message };
  }

  let nextOrdinal = 0;
  if (lastRow !== null && isPlainOrdinal(lastRow)) {
    nextOrdinal = lastRow.ordinal + 1;
  }

  if (nextOrdinal + 1 >= CHAT_HISTORY_MAX_MESSAGES_PER_CONVERSATION) {
    return {
      ok: false,
      status: 400,
      error: `This conversation already has ${String(CHAT_HISTORY_MAX_MESSAGES_PER_CONVERSATION)} messages.`,
    };
  }

  const userOrdinal: number = nextOrdinal;
  const assistantOrdinal: number = nextOrdinal + 1;

  const { data: inserted, error: insertError } = await supabase
    .from("chat_messages")
    .insert([
      {
        conversation_id: conversationId,
        ordinal: userOrdinal,
        role: "user",
        content: input.userContent,
        sources: null,
        brand_sources: null,
      },
      {
        conversation_id: conversationId,
        ordinal: assistantOrdinal,
        role: "assistant",
        content: input.assistantContent,
        sources: input.sources,
        brand_sources: input.brandSources,
      },
    ])
    .select(MESSAGE_SELECT)
    .order("ordinal", { ascending: true });

  if (insertError !== null) {
    const conflict: boolean =
      insertError.code === "23505" ||
      insertError.message.toLowerCase().includes("duplicate");
    return {
      ok: false,
      status: conflict ? 409 : 500,
      error: conflict
        ? "Could not append messages because of a concurrent write. Retry."
        : insertError.message,
    };
  }

  const messages: ChatHistoryMessage[] = [];
  if (Array.isArray(inserted)) {
    for (const item of inserted) {
      const row = parseChatHistoryMessage(item);
      if (row !== null) {
        messages.push(row);
      }
    }
  }
  if (messages.length !== 2) {
    return { ok: false, status: 500, error: "Could not append messages." };
  }

  const nowIso: string = new Date().toISOString();
  const conversationPatch: { title?: string; updated_at: string } = {
    updated_at: nowIso,
  };
  if (isDefaultConversationTitle(loaded.conversation.title)) {
    const derived = titleFromUserContent(input.userContent);
    if (derived !== null) {
      conversationPatch.title = derived;
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("chat_conversations")
    .update(conversationPatch)
    .eq("id", conversationId)
    .eq("owner_user_id", userId)
    .is("deleted_at", null)
    .select(CONVERSATION_SELECT)
    .maybeSingle();

  if (updateError !== null) {
    return { ok: false, status: 500, error: updateError.message };
  }
  const conversation = parseChatConversationSummary(updated);
  if (conversation === null) {
    return { ok: false, status: 500, error: "Could not update conversation after append." };
  }

  return { ok: true, conversation, messages };
}

/**
 * Lists folders for the owner (newest first). Global, not filtered by module.
 */
export async function listOwnedFolders(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ ok: true; folders: ChatFolderDto[] } | ChatHistoryDbError> {
  const { data, error } = await supabase
    .from("chat_folders")
    .select(FOLDER_SELECT)
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false });

  if (error !== null) {
    return { ok: false, status: 500, error: error.message };
  }

  const folders: ChatFolderDto[] = [];
  if (Array.isArray(data)) {
    for (const item of data) {
      const row = parseChatFolderDto(item);
      if (row !== null) {
        folders.push(row);
      }
    }
  }
  return { ok: true, folders };
}

export type CreateFolderInput = {
  name: string;
  color: ChatFolderColor;
  parentFolderId: string | null;
  brandProfileId: string | null;
};

/**
 * Creates a folder. Enforces the per-user cap, color palette, and nesting rules.
 */
export async function createOwnedFolder(
  supabase: SupabaseClient,
  userId: string,
  input: CreateFolderInput,
): Promise<{ ok: true; folder: ChatFolderDto } | ChatHistoryDbError> {
  const { count, error: countError } = await supabase
    .from("chat_folders")
    .select("id", { count: "exact", head: true })
    .eq("owner_user_id", userId);

  if (countError !== null) {
    return { ok: false, status: 500, error: countError.message };
  }
  const currentCount: number = typeof count === "number" ? count : 0;
  if (currentCount >= CHAT_HISTORY_MAX_FOLDERS_PER_USER) {
    return {
      ok: false,
      status: 400,
      error: `You already have ${String(CHAT_HISTORY_MAX_FOLDERS_PER_USER)} folders. Delete one before creating another.`,
    };
  }

  if (input.parentFolderId !== null) {
    const parentOk = await assertValidParentFolder(
      supabase,
      userId,
      input.parentFolderId,
      null,
    );
    if (!parentOk.ok) {
      return parentOk;
    }
  }

  if (input.brandProfileId !== null) {
    const owned = await userOwnsBrandProfile(
      supabase,
      userId,
      input.brandProfileId,
    );
    if (!owned) {
      return {
        ok: false,
        status: 403,
        error: "Brand profile not found or not owned by this account.",
      };
    }
  }

  const { data, error } = await supabase
    .from("chat_folders")
    .insert({
      owner_user_id: userId,
      name: input.name,
      color: input.color,
      parent_folder_id: input.parentFolderId,
      brand_profile_id: input.brandProfileId,
    })
    .select(FOLDER_SELECT)
    .single();

  if (error !== null) {
    return {
      ok: false,
      status: mapFolderWriteErrorStatus(error.message),
      error: mapFolderWriteErrorMessage(error.message),
    };
  }
  const folder = parseChatFolderDto(data);
  if (folder === null) {
    return { ok: false, status: 500, error: "Could not create folder." };
  }
  return { ok: true, folder };
}

export type FolderPatchFields = {
  name?: string;
  color?: ChatFolderColor;
  parentFolderId?: string | null;
};

/**
 * Updates name, color, and/or parent for an owned folder.
 */
export async function patchOwnedFolder(
  supabase: SupabaseClient,
  userId: string,
  folderId: string,
  fields: FolderPatchFields,
): Promise<{ ok: true; folder: ChatFolderDto } | ChatHistoryDbError> {
  if (
    fields.name === undefined &&
    fields.color === undefined &&
    fields.parentFolderId === undefined
  ) {
    return {
      ok: false,
      status: 400,
      error: "Provide at least one of name, color, or parentFolderId.",
    };
  }

  if (fields.parentFolderId !== undefined && fields.parentFolderId !== null) {
    const parentOk = await assertValidParentFolder(
      supabase,
      userId,
      fields.parentFolderId,
      folderId,
    );
    if (!parentOk.ok) {
      return parentOk;
    }
  }

  const nowIso: string = new Date().toISOString();
  const patch: {
    name?: string;
    color?: ChatFolderColor;
    parent_folder_id?: string | null;
    updated_at: string;
  } = { updated_at: nowIso };

  if (fields.name !== undefined) {
    patch.name = fields.name;
  }
  if (fields.color !== undefined) {
    patch.color = fields.color;
  }
  if (fields.parentFolderId !== undefined) {
    patch.parent_folder_id = fields.parentFolderId;
  }

  const { data, error } = await supabase
    .from("chat_folders")
    .update(patch)
    .eq("id", folderId)
    .eq("owner_user_id", userId)
    .select(FOLDER_SELECT)
    .maybeSingle();

  if (error !== null) {
    return {
      ok: false,
      status: mapFolderWriteErrorStatus(error.message),
      error: mapFolderWriteErrorMessage(error.message),
    };
  }
  const folder = parseChatFolderDto(data);
  if (folder === null) {
    return { ok: false, status: 404, error: "Folder not found." };
  }
  return { ok: true, folder };
}

/**
 * Renames an owned folder (compat wrapper around patchOwnedFolder).
 */
export async function renameOwnedFolder(
  supabase: SupabaseClient,
  userId: string,
  folderId: string,
  name: string,
): Promise<{ ok: true; folder: ChatFolderDto } | ChatHistoryDbError> {
  return patchOwnedFolder(supabase, userId, folderId, { name });
}

/**
 * Finds or creates the root folder linked to a Brand profile for auto-filing.
 */
export async function resolveOrCreateBrandProfileFolder(
  supabase: SupabaseClient,
  userId: string,
  brandProfileId: string,
): Promise<{ ok: true; folderId: string } | ChatHistoryDbError> {
  const existing = await findBrandProfileFolder(
    supabase,
    userId,
    brandProfileId,
  );
  if (!existing.ok) {
    return existing;
  }
  if (existing.folderId !== null) {
    return { ok: true, folderId: existing.folderId };
  }

  const { data: profileRow, error: profileError } = await supabase
    .from("brand_profiles")
    .select("id, name")
    .eq("id", brandProfileId)
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (profileError !== null) {
    return { ok: false, status: 500, error: profileError.message };
  }
  if (profileRow === null || !isPlainObject(profileRow)) {
    return {
      ok: false,
      status: 403,
      error: "Brand profile not found or not owned by this account.",
    };
  }
  if (typeof profileRow.name !== "string") {
    return {
      ok: false,
      status: 500,
      error: "Brand profile is missing a name.",
    };
  }

  const folderName: string =
    normalizeChatHistoryName(profileRow.name) ?? "Brand profile";
  const color: ChatFolderColor = pickFolderColorForProfileId(brandProfileId);

  const created = await createOwnedFolder(supabase, userId, {
    name: folderName,
    color,
    parentFolderId: null,
    brandProfileId,
  });

  if (created.ok) {
    return { ok: true, folderId: created.folder.id };
  }

  // Concurrent create: unique (owner, brand_profile_id) race → re-read.
  if (
    created.status === 409 ||
    created.error.toLowerCase().includes("duplicate") ||
    created.error.toLowerCase().includes("unique")
  ) {
    const again = await findBrandProfileFolder(
      supabase,
      userId,
      brandProfileId,
    );
    if (!again.ok) {
      return again;
    }
    if (again.folderId !== null) {
      return { ok: true, folderId: again.folderId };
    }
  }

  return created;
}

/**
 * Loads the folder id linked to a Brand profile, if any.
 */
async function findBrandProfileFolder(
  supabase: SupabaseClient,
  userId: string,
  brandProfileId: string,
): Promise<{ ok: true; folderId: string | null } | ChatHistoryDbError> {
  const { data, error } = await supabase
    .from("chat_folders")
    .select("id")
    .eq("owner_user_id", userId)
    .eq("brand_profile_id", brandProfileId)
    .maybeSingle();

  if (error !== null) {
    return { ok: false, status: 500, error: error.message };
  }
  if (data === null || !isPlainObject(data) || typeof data.id !== "string") {
    return { ok: true, folderId: null };
  }
  const folderId: string = data.id.trim();
  if (folderId.length === 0) {
    return { ok: true, folderId: null };
  }
  return { ok: true, folderId };
}

/**
 * Parent must be an owned root folder. movingFolderId (when set) cannot be the parent.
 */
async function assertValidParentFolder(
  supabase: SupabaseClient,
  userId: string,
  parentFolderId: string,
  movingFolderId: string | null,
): Promise<{ ok: true } | ChatHistoryDbError> {
  if (movingFolderId !== null && parentFolderId === movingFolderId) {
    return {
      ok: false,
      status: 400,
      error: "A folder cannot be its own parent.",
    };
  }

  const owned = await userOwnsChatFolder(supabase, userId, parentFolderId);
  if (!owned) {
    return {
      ok: false,
      status: 403,
      error: "Parent folder not found or not owned by this account.",
    };
  }

  const { data, error } = await supabase
    .from("chat_folders")
    .select("id, parent_folder_id")
    .eq("id", parentFolderId)
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (error !== null) {
    return { ok: false, status: 500, error: error.message };
  }
  if (data === null || !isPlainObject(data)) {
    return {
      ok: false,
      status: 403,
      error: "Parent folder not found or not owned by this account.",
    };
  }
  const parentParent: unknown = data.parent_folder_id;
  if (parentParent !== null && parentParent !== undefined) {
    return {
      ok: false,
      status: 400,
      error: "Folders can only nest two levels deep. Pick a top-level folder.",
    };
  }

  if (movingFolderId !== null) {
    const { count, error: childError } = await supabase
      .from("chat_folders")
      .select("id", { count: "exact", head: true })
      .eq("owner_user_id", userId)
      .eq("parent_folder_id", movingFolderId);

    if (childError !== null) {
      return { ok: false, status: 500, error: childError.message };
    }
    const childCount: number = typeof count === "number" ? count : 0;
    if (childCount > 0) {
      return {
        ok: false,
        status: 400,
        error: "Move or delete subfolders first. A folder with subfolders cannot nest under another.",
      };
    }
  }

  return { ok: true };
}

/**
 * Maps Postgres trigger / unique errors to a client status.
 */
function mapFolderWriteErrorStatus(message: string): number {
  const lower: string = message.toLowerCase();
  if (
    lower.includes("duplicate") ||
    lower.includes("unique") ||
    lower.includes("chat_folders_owner_brand_profile")
  ) {
    return 409;
  }
  if (
    lower.includes("two levels") ||
    lower.includes("own parent") ||
    lower.includes("already has subfolders") ||
    lower.includes("same owner") ||
    lower.includes("not found")
  ) {
    return 400;
  }
  return 500;
}

/**
 * Softens raw trigger messages for API clients.
 */
function mapFolderWriteErrorMessage(message: string): string {
  const trimmed: string = message.trim();
  if (trimmed.length === 0) {
    return "Could not save folder.";
  }
  return trimmed;
}

/**
 * Hard-deletes an owned folder. Conversations ungroup via ON DELETE SET NULL.
 */
export async function deleteOwnedFolder(
  supabase: SupabaseClient,
  userId: string,
  folderId: string,
): Promise<{ ok: true } | ChatHistoryDbError> {
  const { data, error } = await supabase
    .from("chat_folders")
    .delete()
    .eq("id", folderId)
    .eq("owner_user_id", userId)
    .select("id")
    .maybeSingle();

  if (error !== null) {
    return { ok: false, status: 500, error: error.message };
  }
  if (data === null) {
    return { ok: false, status: 404, error: "Folder not found." };
  }
  return { ok: true };
}

/**
 * Re-exports name/content normalizers for route handlers.
 */
export { normalizeChatHistoryName, normalizeMessageContent };

/**
 * Narrows a last-ordinal query row.
 */
function isPlainOrdinal(value: unknown): value is { ordinal: number } {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("ordinal" in value)) {
    return false;
  }
  const ordinal: unknown = value.ordinal;
  return typeof ordinal === "number" && Number.isInteger(ordinal) && ordinal >= 0;
}
