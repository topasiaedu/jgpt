"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
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
  upsertFolderDto,
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
import {
  buildToolConversationHref,
  parseConversationSearchParam,
  parseToolModuleIdFromPath,
} from "@/lib/modules/homeHandoff";
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
  /** Inserts or replaces one folder (e.g. brand-profile auto-folder from lazy-create). */
  notifyFolderUpsert: (folder: ChatFolderDto) => void;
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
 * Focused full-page loader while product chrome (auth + history rail) resolves.
 * Matches auth redirect styling so login → home never paints the legacy top bar.
 */
function ProductChromeLoader() {
  const { t } = useI18n();

  return (
    <div className="shell shell-studio shell-auth chrome-loading-shell" aria-busy="true">
      <main className="studio-main">
        <div className="auth-surface auth-surface-redirecting empty-state-enter">
          <div className="auth-brand">
            <Image
              src="/brand/influence-engine-mark.png"
              alt=""
              width={36}
              height={42}
              className="auth-brand-mark"
              priority
            />
            <span className="auth-brand-name">{t("productName")}</span>
          </div>
          <div
            className="auth-redirect"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <span className="auth-redirect-spinner" aria-hidden="true" />
            <p className="auth-redirect-message">{t("appChromeLoading")}</p>
          </div>
        </div>
      </main>
    </div>
  );
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
 * Global signed-in chat history chrome: sidebar on desktop, drawer on mobile.
 * Mounts once under Providers so list state survives home ↔ tools ↔ profile routes.
 *
 * Until `hydrated && auth.ready`, product routes render a chrome loader on both
 * SSR and the first client paint (same tree). After auth resolves as signed-in,
 * `app-with-history` mounts in one paint. Auth paths keep their own surface.
 */
export default function ChatHistoryShell({ children }: ChatHistoryShellProps) {
  const { t } = useI18n();
  const auth = useAuthSession();
  const pathname = usePathname();
  const router = useRouter();

  const onAuthSurface: boolean = isAuthPath(pathname);

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
   * Same on server and first client paint: loader until mount + session settle.
   * Avoids painting page chrome without the rail, then snapping to sidebar.
   */
  const showChromeLoader: boolean =
    !onAuthSurface && (!hydrated || !auth.ready);

  /**
   * History rail only after hydrate + confirmed session. No chromeHint optimism:
   * loader covers the wait so layout does not fork mid-flight.
   */
  const showHistory: boolean =
    hydrated &&
    auth.ready &&
    auth.user !== null &&
    !onAuthSurface;

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
   * Rail New chat stays available during this fetch (it only navigates home).
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
       * Rail New chat stays available (home navigation, not create).
       */
      const authWaitTimer: number = window.setTimeout(() => {
        setLoading(false);
      }, 8_000);
      return () => {
        window.clearTimeout(authWaitTimer);
      };
    }

    // Depend on user id only (see deps below) so token refreshes do not refetch.
    const signedInUserId: string | undefined = auth.user?.id;
    if (signedInUserId === undefined) {
      clearShellListCache();
      setLoading(false);
      setConversations([]);
      setFolders([]);
      return;
    }
    const userId: string = signedInUserId;

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
  }, [hydrated, showHistory, auth.ready, auth.user?.id, t]);

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

  const notifyFolderUpsert = useCallback(
    (folder: ChatFolderDto): void => {
      setFolders((current) => {
        const next = upsertFolderDto(current, folder);
        // Eager ref so a follow-up conversation upsert in the same turn
        // already sees the auto-folder (avoids a one-frame Ungrouped flash).
        foldersRef.current = next;
        const userId: string | undefined = auth.user?.id;
        if (userId !== undefined) {
          writeShellListSnapshot({
            userId,
            conversations: conversationsRef.current,
            folders: next,
            fetchedAt: Date.now(),
          });
        }
        return next;
      });
    },
    [auth.user?.id],
  );

  const notifyConversationUpsert = useCallback(
    (conversation: ChatConversationSummary): void => {
      const folderId: string | null = conversation.folderId;
      const folderKnown: boolean =
        folderId === null ||
        foldersRef.current.some((folder) => folder.id === folderId);

      /**
       * Self-heal: conversation.folderId points at a brand auto-folder the
       * sidebar has not loaded yet (common on first profile send). Refetch
       * folders so the row groups under the profile folder instead of Ungrouped.
       */
      if (!folderKnown && folderId !== null) {
        void (async () => {
          const result = await fetchChatFolders();
          if (!result.ok) {
            return;
          }
          notifyFoldersReplace(result.folders);
        })();
      }

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
    [auth.user?.id, notifyFoldersReplace],
  );

  const shellApi = useMemo<ChatHistoryShellApi>(
    () => ({
      notifyConversationUpsert,
      notifyFolderUpsert,
      notifyFoldersReplace,
    }),
    [notifyConversationUpsert, notifyFolderUpsert, notifyFoldersReplace],
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
   * Global rail New chat: always go to home create launcher.
   * Clears tool conversation context (`?c=`) by navigating to `/`.
   * Does not create a tool thread; tool-local new-thread (if any) stays separate.
   */
  function handleNewChat(): void {
    setActiveConversationId(null);
    setError(null);
    closeSidebarIfMobile();
    const alreadyHomeClean: boolean =
      pathname === "/" &&
      (typeof window === "undefined" || window.location.search === "");
    if (alreadyHomeClean) {
      return;
    }
    router.push("/");
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

  if (showChromeLoader) {
    return (
      <ChatHistoryShellContext.Provider value={shellApi}>
        <ProductChromeLoader />
      </ChatHistoryShellContext.Provider>
    );
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
                  onClick={() => {
                    handleNewChat();
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
