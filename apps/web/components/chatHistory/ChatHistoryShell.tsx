"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AppNav, {
  AppNavLocaleToggle,
  appNavActiveFromPath,
} from "@/components/AppNav";
import {
  createChatConversation,
  createChatFolder,
  deleteChatFolder,
  fetchAllChatConversations,
  fetchChatFolders,
  patchChatConversation,
  patchChatFolder,
} from "@/lib/chatHistory/clientApi";
import {
  collectFolderAndDescendantIds,
  upsertConversationSummary,
} from "@/lib/chatHistory/group";
import {
  clearShellListCache,
  loadShellHistoryList,
  readShellListMemory,
  readShellListSession,
  writeShellListSnapshot,
} from "@/lib/chatHistory/shellListCache";
import type {
  ChatConversationSummary,
  ChatFolderCreateInput,
  ChatFolderDto,
  ChatFolderPatchInput,
} from "@/lib/chatHistory/types";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { getModuleById } from "@/lib/modules/catalog";
import {
  buildToolConversationHref,
  parseConversationSearchParam,
  parseProfileSearchParam,
  parseToolModuleIdFromPath,
} from "@/lib/modules/homeHandoff";
import { resolveModuleChatOpener } from "@/lib/modules/resolveChatOpener";
import { useAuthSession } from "@/lib/supabase/useAuthSession";

/**
 * History list UI is deferred so the signed-in shell chunk stays out of first paint.
 * ssr:false is safe: this tree only mounts after ChatHistoryShell hydrates (showHistory).
 */
const ChatHistorySidebar = dynamic(
  () => import("@/components/tools/ChatHistorySidebar"),
  {
    ssr: false,
    loading: () => (
      <div className="chat-history-sidebar chat-history-sidebar-loading" aria-busy="true" />
    ),
  },
);

type ChatHistoryShellApi = {
  /** Upserts a conversation row after bootstrap, create, or a persisted turn. */
  notifyConversationUpsert: (conversation: ChatConversationSummary) => void;
  /** Replaces the folder list (e.g. after brand-profile auto-folder create). */
  notifyFoldersReplace: (folders: ChatFolderDto[]) => void;
};

const ChatHistoryShellContext = createContext<ChatHistoryShellApi | null>(null);

type ChatHistoryShellProps = {
  children: ReactNode;
};

type ActiveConversationQuerySyncProps = {
  onConversationId: (conversationId: string | null) => void;
};

/**
 * True for /auth and /auth/* so the history chrome stays off sign-in surfaces.
 */
function isAuthPath(pathname: string): boolean {
  return pathname === "/auth" || pathname.startsWith("/auth/");
}

/**
 * Suspends in its own boundary so ?c= tracking never forks the outer shell SSR tree.
 */
function ActiveConversationQuerySync({
  onConversationId,
}: ActiveConversationQuerySyncProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const fromQuery = parseConversationSearchParam({
      c: searchParams.get("c") ?? undefined,
    });
    onConversationId(fromQuery === undefined ? null : fromQuery);
  }, [searchParams, onConversationId]);

  return null;
}

/**
 * Reads `c` / `profile` from the current URL without useSearchParams.
 * Keeps ChatHistoryShell out of a Suspense CSR bailout that would SSR bare
 * children while the client wraps them in app-with-history.
 */
function readToolSearchFields(): {
  conversationId: string | null;
  brandProfileId: string | null;
} {
  if (typeof window === "undefined") {
    return { conversationId: null, brandProfileId: null };
  }
  const params = new URLSearchParams(window.location.search);
  const conversationId = parseConversationSearchParam({
    c: params.get("c") ?? undefined,
  });
  const brandProfileId = parseProfileSearchParam({
    profile: params.get("profile") ?? undefined,
  });
  return {
    conversationId: conversationId === undefined ? null : conversationId,
    brandProfileId: brandProfileId === undefined ? null : brandProfileId,
  };
}

/**
 * Global signed-in chat history chrome: sidebar on desktop, drawer on mobile.
 * Mounts once under Providers so list state survives home ↔ tools ↔ profile routes.
 *
 * History chrome is deferred until after mount so SSR and the first client paint
 * share the same tree (page children only). Auth chromeHint / sessionStorage are
 * client-only and must not fork the wrapper className during hydration.
 */
export default function ChatHistoryShell({ children }: ChatHistoryShellProps) {
  const { t, locale } = useI18n();
  const auth = useAuthSession();
  const pathname = usePathname();
  const router = useRouter();

  const signedIn: boolean =
    auth.user !== null || (!auth.ready && auth.chromeHint === "signed_in");

  const railNavActive = useMemo(
    () => appNavActiveFromPath(pathname),
    [pathname],
  );

  const [hydrated, setHydrated] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ChatConversationSummary[]>(
    [],
  );
  const [folders, setFolders] = useState<ChatFolderDto[]>([]);
  const conversationsRef = useRef(conversations);
  const foldersRef = useRef(folders);
  conversationsRef.current = conversations;
  foldersRef.current = folders;

  /**
   * Same on server and first client paint (false). Only then may the history
   * wrapper mount, so brand-profile shell classNames stay on the page root div.
   */
  const showHistory: boolean =
    hydrated && signedIn && !isAuthPath(pathname);

  useEffect(() => {
    setHydrated(true);
    const media: MediaQueryList = window.matchMedia("(max-width: 767px)");
    /**
     * Desktop keeps the rail open; mobile starts closed as a drawer.
     */
    function syncSidebarToViewport(): void {
      setSidebarOpen(!media.matches);
    }
    syncSidebarToViewport();
    media.addEventListener("change", syncSidebarToViewport);
    return () => {
      media.removeEventListener("change", syncSidebarToViewport);
    };
  }, []);

  /**
   * Loads the cross-tool conversation list and folders when signed in.
   * Uses a short client cache so reloads paint the list immediately, then revalidate.
   * New chat stays clickable during this fetch (disabled only while creating).
   */
  useEffect(() => {
    if (!hydrated || !showHistory) {
      setLoading(false);
      return;
    }
    if (!auth.ready) {
      setLoading(true);
      /**
       * If getSession stalls, clear the spinner so the rail does not look broken forever.
       * New chat is already clickable (busy-only disable).
       */
      const authWaitTimer: number = window.setTimeout(() => {
        setLoading(false);
      }, 8_000);
      return () => {
        window.clearTimeout(authWaitTimer);
      };
    }
    if (auth.user === null) {
      clearShellListCache();
      setLoading(false);
      setConversations([]);
      setFolders([]);
      return;
    }

    const userId: string = auth.user.id;
    const cached =
      readShellListMemory(userId) ?? readShellListSession(userId);
    if (cached !== null) {
      setConversations(cached.conversations);
      setFolders(cached.folders);
      setLoading(false);
      setError(null);
    } else {
      setLoading(true);
      setError(null);
    }

    let cancelled = false;

    /**
     * Parallel list + folders fetch; shared across remounts via loadShellHistoryList.
     */
    async function loadAll(): Promise<void> {
      try {
        const result = await loadShellHistoryList({
          userId,
          fetchOnce: async () => {
            const [listResult, foldersResult] = await Promise.all([
              fetchAllChatConversations(),
              fetchChatFolders(),
            ]);
            if (!listResult.ok) {
              return { ok: false, error: listResult.error };
            }
            if (!foldersResult.ok) {
              return { ok: false, error: foldersResult.error };
            }
            return {
              ok: true,
              conversations: listResult.conversations,
              folders: foldersResult.folders,
            };
          },
        });
        if (cancelled) {
          return;
        }
        if (!result.ok) {
          if (cached === null) {
            setError(result.error);
            setConversations([]);
            setFolders([]);
          }
          return;
        }
        setConversations(result.conversations);
        setFolders(result.folders);
        setError(null);
      } catch {
        if (cancelled) {
          return;
        }
        if (cached === null) {
          setError(t("histError"));
          setConversations([]);
          setFolders([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAll();
    return () => {
      cancelled = true;
    };
    // Use user id (not the User object) so token refreshes do not refetch the list.
  }, [hydrated, showHistory, auth.ready, auth.user?.id]);

  /**
   * Keeps the client cache aligned after local list mutations.
   */
  function persistShellList(
    nextConversations: ChatConversationSummary[],
    nextFolders: ChatFolderDto[],
  ): void {
    const userId: string | undefined = auth.user?.id;
    if (userId === undefined) {
      return;
    }
    writeShellListSnapshot({
      userId,
      conversations: nextConversations,
      folders: nextFolders,
      fetchedAt: Date.now(),
    });
  }

  const notifyConversationUpsert = useCallback(
    (conversation: ChatConversationSummary): void => {
      setConversations((current) => {
        const next = upsertConversationSummary(current, conversation);
        const userId: string | undefined = auth.user?.id;
        if (userId !== undefined) {
          writeShellListSnapshot({
            userId,
            conversations: next,
            folders: foldersRef.current,
            fetchedAt: Date.now(),
          });
        }
        return next;
      });
    },
    [auth.user?.id],
  );

  const notifyFoldersReplace = useCallback(
    (next: ChatFolderDto[]): void => {
      setFolders(next);
      const userId: string | undefined = auth.user?.id;
      if (userId !== undefined) {
        writeShellListSnapshot({
          userId,
          conversations: conversationsRef.current,
          folders: next,
          fetchedAt: Date.now(),
        });
      }
    },
    [auth.user?.id],
  );

  const shellApi = useMemo<ChatHistoryShellApi>(
    () => ({ notifyConversationUpsert, notifyFoldersReplace }),
    [notifyConversationUpsert, notifyFoldersReplace],
  );

  /**
   * Closes the drawer after an action on narrow viewports.
   */
  function closeSidebarIfMobile(): void {
    if (typeof window === "undefined") {
      return;
    }
    if (window.matchMedia("(max-width: 767px)").matches) {
      setSidebarOpen(false);
    }
  }

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }
    /**
     * Escape closes the mobile history drawer.
     */
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape") {
        return;
      }
      if (!window.matchMedia("(max-width: 767px)").matches) {
        return;
      }
      setSidebarOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!showHistory) {
      return;
    }
    /**
     * After All Tools / Profile / conversation navigation, close the mobile drawer.
     */
    closeSidebarIfMobile();
  }, [pathname, showHistory]);

  /**
   * Opens a conversation in its tool workspace (profile query when present).
   */
  function handleSelectConversation(conversationId: string): void {
    const target: ChatConversationSummary | undefined = conversations.find(
      (row) => row.id === conversationId,
    );
    if (target === undefined) {
      return;
    }
    if (
      activeConversationId === conversationId &&
      parseToolModuleIdFromPath(pathname) === target.moduleId
    ) {
      closeSidebarIfMobile();
      return;
    }
    closeSidebarIfMobile();
    router.push(
      buildToolConversationHref(
        target.moduleId,
        target.id,
        target.brandProfileId,
      ),
    );
  }

  /**
   * Starts a new chat on the current tool, or the last-used tool, else All Tools.
   */
  async function handleNewChat(): Promise<void> {
    if (busy) {
      return;
    }

    const pathModuleId: string | null = parseToolModuleIdFromPath(pathname);
    let moduleId: string | null = pathModuleId;
    let brandProfileId: string | null = null;

    if (moduleId !== null) {
      brandProfileId = readToolSearchFields().brandProfileId;
    } else {
      const latest: ChatConversationSummary | undefined = conversations[0];
      if (latest === undefined) {
        closeSidebarIfMobile();
        router.push("/tools");
        return;
      }
      moduleId = latest.moduleId;
      brandProfileId = latest.brandProfileId;
    }

    if (moduleId === null || getModuleById(moduleId) === undefined) {
      closeSidebarIfMobile();
      router.push("/tools");
      return;
    }

    setBusy(true);
    setError(null);
    const openerContent: string = await resolveModuleChatOpener(moduleId, locale);
    const created = await createChatConversation({
      moduleId,
      openerContent,
      brandProfileId,
    });
    if (!created.ok) {
      setBusy(false);
      setError(created.error);
      return;
    }
    const nextConversations = upsertConversationSummary(
      conversations,
      created.conversation,
    );
    setConversations(nextConversations);

    let nextFolders: ChatFolderDto[] = folders;
    const assignedFolderId: string | null = created.conversation.folderId;
    if (
      assignedFolderId !== null &&
      !folders.some((folder) => folder.id === assignedFolderId)
    ) {
      const refreshed = await fetchChatFolders();
      if (refreshed.ok) {
        nextFolders = refreshed.folders;
        setFolders(nextFolders);
      }
    }
    persistShellList(nextConversations, nextFolders);

    setBusy(false);
    closeSidebarIfMobile();
    router.push(
      buildToolConversationHref(
        created.conversation.moduleId,
        created.conversation.id,
        created.conversation.brandProfileId,
      ),
    );
  }

  /**
   * Moves a conversation into a folder, or null to Ungrouped.
   */
  async function handleMoveToFolder(
    conversationId: string,
    folderId: string | null,
  ): Promise<void> {
    if (busy) {
      return;
    }
    setBusy(true);
    const patched = await patchChatConversation(conversationId, { folderId });
    setBusy(false);
    if (!patched.ok) {
      setError(patched.error);
      return;
    }
    const moved: ChatConversationSummary | null = patched.conversation;
    if (moved === null) {
      return;
    }
    setConversations((current) => {
      const next = upsertConversationSummary(current, moved);
      persistShellList(next, folders);
      return next;
    });
  }

  /**
   * Creates a project-grouping folder (optional color and parent).
   */
  async function handleCreateFolder(input: ChatFolderCreateInput): Promise<void> {
    setBusy(true);
    const created = await createChatFolder(input);
    setBusy(false);
    if (!created.ok) {
      setError(created.error);
      return;
    }
    setFolders((current) => {
      const next = [created.folder, ...current];
      persistShellList(conversations, next);
      return next;
    });
  }

  /**
   * Patches name, color, and/or parent for an owned folder.
   */
  async function handleUpdateFolder(
    folderId: string,
    input: ChatFolderPatchInput,
  ): Promise<void> {
    setBusy(true);
    const updated = await patchChatFolder(folderId, input);
    setBusy(false);
    if (!updated.ok) {
      setError(updated.error);
      return;
    }
    setFolders((current) => {
      const next = current.map((folder) =>
        folder.id === folderId ? updated.folder : folder,
      );
      persistShellList(conversations, next);
      return next;
    });
  }

  /**
   * Deletes a folder (and nested children via DB cascade). Chats return to Ungrouped.
   */
  async function handleDeleteFolder(folderId: string): Promise<void> {
    setBusy(true);
    const deleted = await deleteChatFolder(folderId);
    setBusy(false);
    if (!deleted.ok) {
      setError(deleted.error);
      return;
    }
    const removedIds = collectFolderAndDescendantIds(folders, folderId);
    const nextFolders = folders.filter(
      (folder) => !removedIds.has(folder.id),
    );
    const nextConversations = conversations.map((row) => {
      if (row.folderId === null || !removedIds.has(row.folderId)) {
        return row;
      }
      return { ...row, folderId: null };
    });
    setFolders(nextFolders);
    setConversations(nextConversations);
    persistShellList(nextConversations, nextFolders);
  }

  /**
   * Renames a conversation title.
   */
  async function handleRenameConversation(
    conversationId: string,
    title: string,
  ): Promise<void> {
    if (busy) {
      return;
    }
    setBusy(true);
    setError(null);
    const patched = await patchChatConversation(conversationId, { title });
    setBusy(false);
    if (!patched.ok) {
      setError(patched.error);
      return;
    }
    const renamed: ChatConversationSummary | null = patched.conversation;
    if (renamed === null) {
      return;
    }
    setConversations((current) => {
      const next = upsertConversationSummary(current, renamed);
      persistShellList(next, folders);
      return next;
    });
  }

  /**
   * Soft-deletes a conversation. If it was open, jumps to the next thread or All Tools.
   */
  async function handleDeleteConversation(conversationId: string): Promise<void> {
    if (busy) {
      return;
    }
    setBusy(true);
    setError(null);
    const patched = await patchChatConversation(conversationId, {
      deleted: true,
    });
    if (!patched.ok) {
      setBusy(false);
      setError(patched.error);
      return;
    }

    const remaining: ChatConversationSummary[] = conversations.filter(
      (row) => row.id !== conversationId,
    );
    setConversations(remaining);
    persistShellList(remaining, folders);
    setBusy(false);
    closeSidebarIfMobile();

    const wasActive: boolean = activeConversationId === conversationId;
    if (!wasActive) {
      return;
    }

    const next: ChatConversationSummary | undefined = remaining[0];
    if (next !== undefined) {
      router.push(
        buildToolConversationHref(next.moduleId, next.id, next.brandProfileId),
      );
      return;
    }
    router.push("/tools");
  }

  if (!showHistory) {
    return (
      <ChatHistoryShellContext.Provider value={shellApi}>
        {children}
      </ChatHistoryShellContext.Provider>
    );
  }

  return (
    <ChatHistoryShellContext.Provider value={shellApi}>
      <div className="app-with-history">
        <Suspense fallback={null}>
          <ActiveConversationQuerySync
            onConversationId={setActiveConversationId}
          />
        </Suspense>
        <button
          type="button"
          className="chat-history-mobile-toggle chat-history-global-toggle"
          aria-expanded={sidebarOpen}
          aria-controls="chat-history-drawer"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          {sidebarOpen ? t("histCloseHistory") : t("histOpenHistory")}
        </button>
        {sidebarOpen ? (
          <button
            type="button"
            className="chat-history-backdrop"
            aria-label={t("histCloseHistory")}
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}
        {sidebarOpen ? (
          <div className="chat-history-drawer" id="chat-history-drawer">
            <AppNav
              active={railNavActive}
              placement="rail"
              railInsertAfterBrand={
                <button
                  type="button"
                  className="chat-history-new chat-history-new-rail"
                  disabled={busy}
                  onClick={() => {
                    void handleNewChat();
                  }}
                >
                  <svg
                    className="chat-history-new-icon"
                    viewBox="0 0 20 20"
                    width="18"
                    height="18"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4.5 4.75A1.25 1.25 0 0 1 5.75 3.5h5.1c.33 0 .65.13.88.36l3.4 3.4c.24.24.37.56.37.89v6.1A1.25 1.25 0 0 1 14.25 15.5H5.75A1.25 1.25 0 0 1 4.5 14.25V4.75Z"
                      stroke="currentColor"
                      strokeWidth="1.35"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11 3.75V6.5c0 .69.56 1.25 1.25 1.25h2.75"
                      stroke="currentColor"
                      strokeWidth="1.35"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7.25 11.25h5.5M7.25 8.75h2.25"
                      stroke="currentColor"
                      strokeWidth="1.35"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>{t("histNewChat")}</span>
                </button>
              }
            />
            <div className="chat-history-drawer-body">
              <ChatHistorySidebar
                conversations={conversations}
                folders={folders}
                activeConversationId={activeConversationId}
                disabled={busy}
                loading={loading}
                onSelectConversation={handleSelectConversation}
                onMoveToFolder={(conversationId, folderId) => {
                  void handleMoveToFolder(conversationId, folderId);
                }}
                onCreateFolder={(input) => {
                  void handleCreateFolder(input);
                }}
                onUpdateFolder={(folderId, input) => {
                  void handleUpdateFolder(folderId, input);
                }}
                onDeleteFolder={(folderId) => {
                  void handleDeleteFolder(folderId);
                }}
                onRenameConversation={(conversationId, title) => {
                  void handleRenameConversation(conversationId, title);
                }}
                onDeleteConversation={(conversationId) => {
                  void handleDeleteConversation(conversationId);
                }}
              />
              {error !== null ? (
                <p className="chat-history-error" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
            <div className="chat-history-rail-footer">
              <AppNavLocaleToggle />
            </div>
          </div>
        ) : null}
        <div className="app-with-history-main">{children}</div>
      </div>
    </ChatHistoryShellContext.Provider>
  );
}

/**
 * Optional bridge for tool workspace to keep the global list in sync.
 */
export function useChatHistoryShell(): ChatHistoryShellApi | null {
  return useContext(ChatHistoryShellContext);
}
