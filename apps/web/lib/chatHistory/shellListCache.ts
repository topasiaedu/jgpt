/**
 * Short-lived client cache for the global chat history sidebar list.
 * Survives soft navigations via module memory, and full reloads via sessionStorage.
 * Never CDN-caches user history: this is browser-local only.
 */

import {
  parseChatConversationSummary,
  parseChatFolderDto,
} from "@/lib/chatHistory/parse";
import type {
  ChatConversationSummary,
  ChatFolderDto,
} from "@/lib/chatHistory/types";

const STORAGE_KEY = "influence-engine.chat-history-shell-v2";

/** Fresh enough to paint immediately; still revalidated in the background. */
export const SHELL_LIST_CACHE_TTL_MS = 60_000;

export type ShellHistoryListSnapshot = {
  userId: string;
  conversations: ChatConversationSummary[];
  folders: ChatFolderDto[];
  fetchedAt: number;
};

export type ShellHistoryListFetchResult =
  | {
      ok: true;
      conversations: ChatConversationSummary[];
      folders: ChatFolderDto[];
    }
  | { ok: false; error: string };

let memoryCache: ShellHistoryListSnapshot | null = null;
const inflightByUserId: Map<string, Promise<ShellHistoryListFetchResult>> =
  new Map();

/**
 * True when a snapshot belongs to this user and is within the TTL.
 */
export function isShellListSnapshotFresh(
  snapshot: ShellHistoryListSnapshot,
  userId: string,
  nowMs: number = Date.now(),
): boolean {
  if (snapshot.userId !== userId) {
    return false;
  }
  return nowMs - snapshot.fetchedAt <= SHELL_LIST_CACHE_TTL_MS;
}

/**
 * Reads the in-memory snapshot when present and fresh.
 */
export function readShellListMemory(
  userId: string,
): ShellHistoryListSnapshot | null {
  if (memoryCache === null) {
    return null;
  }
  if (!isShellListSnapshotFresh(memoryCache, userId)) {
    return null;
  }
  return memoryCache;
}

/**
 * Best-effort sessionStorage read for first paint after a full reload.
 */
export function readShellListSession(
  userId: string,
): ShellHistoryListSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw: string | null = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw === null || raw.trim().length === 0) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    const snapshot = parseShellListSnapshot(parsed);
    if (snapshot === null) {
      return null;
    }
    if (!isShellListSnapshotFresh(snapshot, userId)) {
      return null;
    }
    memoryCache = snapshot;
    return snapshot;
  } catch {
    return null;
  }
}

/**
 * Writes memory + sessionStorage after a successful network load or local mutation.
 */
export function writeShellListSnapshot(
  snapshot: ShellHistoryListSnapshot,
): void {
  memoryCache = snapshot;
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Quota or private mode: memory cache still helps within the tab lifetime.
  }
}

/**
 * Drops cached list data (sign-out or hard auth change).
 */
export function clearShellListCache(): void {
  memoryCache = null;
  inflightByUserId.clear();
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

/**
 * Dedupes concurrent list+folders fetches per user id.
 */
export function loadShellHistoryList(input: {
  userId: string;
  fetchOnce: () => Promise<ShellHistoryListFetchResult>;
}): Promise<ShellHistoryListFetchResult> {
  const existing: Promise<ShellHistoryListFetchResult> | undefined =
    inflightByUserId.get(input.userId);
  if (existing !== undefined) {
    return existing;
  }

  const pending: Promise<ShellHistoryListFetchResult> = input
    .fetchOnce()
    .then((result) => {
      if (result.ok) {
        writeShellListSnapshot({
          userId: input.userId,
          conversations: result.conversations,
          folders: result.folders,
          fetchedAt: Date.now(),
        });
      }
      return result;
    })
    .finally(() => {
      inflightByUserId.delete(input.userId);
    });

  inflightByUserId.set(input.userId, pending);
  return pending;
}

/**
 * Structural parse so sessionStorage junk never crashes the shell.
 */
function parseShellListSnapshot(value: unknown): ShellHistoryListSnapshot | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  if (
    !("userId" in value) ||
    !("conversations" in value) ||
    !("folders" in value) ||
    !("fetchedAt" in value)
  ) {
    return null;
  }
  if (typeof value.userId !== "string" || value.userId.trim().length === 0) {
    return null;
  }
  if (typeof value.fetchedAt !== "number" || !Number.isFinite(value.fetchedAt)) {
    return null;
  }
  if (!Array.isArray(value.conversations) || !Array.isArray(value.folders)) {
    return null;
  }

  const conversations: ChatConversationSummary[] = [];
  for (const item of value.conversations) {
    const row = parseChatConversationSummary(item);
    if (row === null) {
      return null;
    }
    conversations.push(row);
  }

  const folders: ChatFolderDto[] = [];
  for (const item of value.folders) {
    const row = parseChatFolderDto(item);
    if (row === null) {
      return null;
    }
    folders.push(row);
  }

  return {
    userId: value.userId,
    conversations,
    folders,
    fetchedAt: value.fetchedAt,
  };
}
