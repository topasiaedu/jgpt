"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { useChatHistoryShell } from "@/components/chatHistory/ChatHistoryShell";
import ModuleChatShell from "@/components/tools/ModuleChatShell";
import ModuleIntroModal, {
  readSkipIntro,
  writeSkipIntro,
} from "@/components/tools/ModuleIntroModal";
import { fetchBrandProfile } from "@/lib/brandProfile/clientApi";
import { bootstrapToolChatHistory } from "@/lib/chatHistory/bootstrap";
import { historyMessagesToChat } from "@/lib/chatHistory/toChatMessages";
import type {
  ChatConversationSummary,
  ChatFolderDto,
} from "@/lib/chatHistory/types";
import type { ChatMessage } from "@/lib/chatTypes";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { getModuleStatus } from "@/lib/modules/catalog";
import {
  buildToolChatOpener,
  clearToolConversationQuery,
  parseConversationSearchParam,
  parseHomeHandoffSearchParams,
  replaceToolConversationQuery,
} from "@/lib/modules/homeHandoff";
import { getModuleDisplay } from "@/lib/modules/moduleDisplay";
import { getModulePack } from "@/lib/modules/packs";
import { defaultChatOpener, getPackChatOpener } from "@/lib/modules/packLocale";
import type { ModuleDefinition } from "@/lib/modules/types";

type ModuleWorkspaceProps = {
  module: ModuleDefinition;
  /** Owned Brand profile id when the student chose one. Undefined means continue without. */
  brandProfileId?: string;
  /** Raw Next.js searchParams for optional `?from=home&q=`, `?profile=`, and `?c=`. */
  searchParams?: {
    from?: string | string[];
    q?: string | string[];
    profile?: string | string[];
    c?: string | string[];
  };
};

/**
 * Module route body: resume ?c= / latest user-thread, or show an ephemeral opener.
 * No DB conversation until the first successful user send (lazy-create in ModuleChatShell).
 * Global chat history chrome lives in ChatHistoryShell (not here).
 * Intro modal is on demand only (never auto-shown on land).
 */
export default function ModuleWorkspace({
  module,
  brandProfileId,
  searchParams,
}: ModuleWorkspaceProps) {
  const { t, locale } = useI18n();
  const historyShell = useChatHistoryShell();
  const status = getModuleStatus(module);
  const isReady = status === "ready";
  const pack = getModulePack(module.id);
  const hasPack = pack !== undefined;
  const display = getModuleDisplay(module, locale);

  const handoff = parseHomeHandoffSearchParams(searchParams ?? {});
  const homeIntent: string | undefined = handoff.intentQ;
  const profileKey: string | null =
    typeof brandProfileId === "string" && brandProfileId.length > 0
      ? brandProfileId
      : null;

  const [hydrated, setHydrated] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [skipChecked, setSkipChecked] = useState(false);
  /** Owned profile display name; null until loaded or when no profile is in use. */
  const [profileName, setProfileName] = useState<string | null>(null);

  const [historyReady, setHistoryReady] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] =
    useState<ChatConversationSummary | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  /** True while the UI shows a pack opener with no persisted conversation yet. */
  const [ephemeralOpen, setEphemeralOpen] = useState(false);

  const openerRef = useRef<string>("");
  const preferredConversationId: string | undefined = parseConversationSearchParam(
    searchParams ?? {},
  );
  const preferredConversationRef = useRef<string | undefined>(preferredConversationId);

  const packOpener: string =
    pack !== undefined ? getPackChatOpener(pack, locale) : defaultChatOpener(locale);
  const chatOpener: string = buildToolChatOpener(packOpener, homeIntent, locale);
  openerRef.current = chatOpener;

  useEffect(() => {
    setHydrated(true);
    setIntroOpen(false);
  }, [module.id]);

  /**
   * Loads the Brand profile display name for the title chip.
   * Skips when the student continued without a profile. Omits the chip on fetch failure.
   */
  useEffect(() => {
    if (typeof brandProfileId !== "string" || brandProfileId.length === 0) {
      setProfileName(null);
      return;
    }

    const profileId: string = brandProfileId;
    let cancelled: boolean = false;

    /**
     * Fetches one owned profile and stores its name when still current.
     */
    async function loadProfileName(): Promise<void> {
      const result = await fetchBrandProfile(profileId);
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setProfileName(null);
        return;
      }
      const nextName: string = result.profile.name.trim();
      setProfileName(nextName.length > 0 ? nextName : null);
    }

    void loadProfileName();
    return () => {
      cancelled = true;
    };
  }, [brandProfileId]);

  /**
   * Applies a persisted conversation to local state and the URL.
   * Sidebar upsert only when the thread already has a user message (never opener-only).
   */
  const applyPersistedThread = useCallback(
    (conversation: ChatConversationSummary, messages: ChatMessage[]): void => {
      setEphemeralOpen(false);
      setActiveConversation(conversation);
      setActiveMessages(messages);
      replaceToolConversationQuery(conversation.id);
      const hasUserMessage: boolean = messages.some(
        (message) => message.role === "user",
      );
      if (historyShell !== null && hasUserMessage) {
        historyShell.notifyConversationUpsert(conversation);
      }
    },
    [historyShell],
  );

  /**
   * Shows the pack opener in the UI without a DB row or sidebar entry.
   */
  const applyEphemeralThread = useCallback((openerContent: string): void => {
    setEphemeralOpen(true);
    setActiveConversation(null);
    setActiveMessages([{ role: "assistant", content: openerContent }]);
    clearToolConversationQuery();
  }, []);

  /**
   * Auto-resumes ?c= or the latest user-message thread; otherwise stays ephemeral.
   */
  useEffect(() => {
    if (!hydrated || !isReady || !hasPack) {
      return;
    }

    let cancelled = false;
    setHistoryReady(false);
    setHistoryError(null);
    preferredConversationRef.current = preferredConversationId;

    /**
     * Runs list/resume (never create) for this module + profile key.
     */
    async function loadHistory(): Promise<void> {
      const result = await bootstrapToolChatHistory({
        moduleId: module.id,
        brandProfileId: profileKey,
        preferredConversationId: preferredConversationRef.current,
        openerContent: openerRef.current,
      });
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setHistoryError(result.error);
        setHistoryReady(true);
        return;
      }
      if (result.conversation !== null) {
        applyPersistedThread(
          result.conversation,
          historyMessagesToChat(result.messages),
        );
      } else {
        applyEphemeralThread(openerRef.current);
      }
      if (historyShell !== null) {
        historyShell.notifyFoldersReplace(result.folders);
      }
      setHistoryReady(true);
    }

    void loadHistory();
    return () => {
      cancelled = true;
    };
  }, [
    hydrated,
    isReady,
    hasPack,
    module.id,
    profileKey,
    preferredConversationId,
    applyPersistedThread,
    applyEphemeralThread,
    historyShell,
  ]);

  function handleStartFromIntro(): void {
    writeSkipIntro(module.id, skipChecked);
    setIntroOpen(false);
  }

  function handleCloseIntro(): void {
    setIntroOpen(false);
  }

  function handleShowIntroAgain(): void {
    setSkipChecked(readSkipIntro(module.id));
    setIntroOpen(true);
  }

  /**
   * Reloads resume after a bootstrap failure.
   */
  function handleRetryHistory(): void {
    setHistoryReady(false);
    setHistoryError(null);
    preferredConversationRef.current = preferredConversationId;
    void (async () => {
      const result = await bootstrapToolChatHistory({
        moduleId: module.id,
        brandProfileId: profileKey,
        preferredConversationId: preferredConversationRef.current,
        openerContent: openerRef.current,
      });
      if (!result.ok) {
        setHistoryError(result.error);
        setHistoryReady(true);
        return;
      }
      if (result.conversation !== null) {
        applyPersistedThread(
          result.conversation,
          historyMessagesToChat(result.messages),
        );
      } else {
        applyEphemeralThread(openerRef.current);
      }
      if (historyShell !== null) {
        historyShell.notifyFoldersReplace(result.folders);
      }
      setHistoryReady(true);
    })();
  }

  /**
   * After lazy-create auto-folder: ensure the profile folder is in the sidebar
   * before the conversation row upserts (so it groups under the folder, not Ungrouped).
   */
  function handleAutoFolderReady(folder: ChatFolderDto): void {
    if (historyShell !== null) {
      historyShell.notifyFolderUpsert(folder);
    }
  }

  /**
   * After lazy-create + first turn persist: bind URL, local state, and sidebar.
   */
  function handleTurnPersisted(conversation: ChatConversationSummary): void {
    setEphemeralOpen(false);
    setActiveConversation(conversation);
    replaceToolConversationQuery(conversation.id);
    if (historyShell !== null) {
      historyShell.notifyConversationUpsert(conversation);
    }
  }

  const showChat: boolean = hydrated && isReady && pack !== undefined;
  const chatReady: boolean =
    historyReady && (activeConversation !== null || ephemeralOpen);
  const shellKey: string =
    activeConversation !== null
      ? activeConversation.id
      : `ephemeral:${module.id}:${profileKey ?? "none"}`;

  return (
    <div className="shell shell-studio shell-studio-chat">
      <header className="header header-create">
        <div className="module-workspace-heading">
          <h1 className="studio-title">{display.title}</h1>
          {typeof brandProfileId === "string" &&
          brandProfileId.length > 0 &&
          profileName !== null ? (
            <Link
              href={`/brand-profiles/${brandProfileId}`}
              className="module-workspace-chip"
            >
              {profileName}
            </Link>
          ) : null}
        </div>
      </header>

      {!hydrated ? (
        <p className="tools-loading">{t("moduleLoading")}</p>
      ) : showChat ? (
        <div className="studio-main module-workspace-body">
          <div className="module-workspace-chat-col">
            {!historyReady ? (
              <p className="tools-loading">{t("histLoading")}</p>
            ) : historyError !== null && !chatReady ? (
              <div className="module-history-fallback">
                <p className="error" role="alert">
                  {historyError}
                </p>
                <button
                  type="button"
                  className="chat-history-new"
                  onClick={handleRetryHistory}
                >
                  {t("histRetry")}
                </button>
              </div>
            ) : chatReady ? (
              <>
                {historyError !== null ? (
                  <p className="error" role="alert">
                    {historyError}
                  </p>
                ) : null}
                <ModuleChatShell
                  key={shellKey}
                  moduleId={module.id}
                  moduleTitle={display.title}
                  conversationId={
                    activeConversation !== null ? activeConversation.id : null
                  }
                  openerContent={chatOpener}
                  initialMessages={activeMessages}
                  homeIntent={homeIntent}
                  brandProfileId={brandProfileId}
                  onAutoFolderReady={handleAutoFolderReady}
                  onTurnPersisted={handleTurnPersisted}
                />
              </>
            ) : (
              <p className="tools-loading">{t("histLoading")}</p>
            )}
          </div>
        </div>
      ) : (
        <section className="studio-main module-placeholder" aria-label={t("moduleSoonTitle")}>
          <h2 className="module-placeholder-title">{t("moduleSoonTitle")}</h2>
          <p className="module-placeholder-body">{t("moduleSoonBody")}</p>
          <button type="button" className="module-intro-start" onClick={handleShowIntroAgain}>
            {t("moduleShowIntro")}
          </button>
        </section>
      )}

      <ModuleIntroModal
        module={module}
        open={introOpen}
        skipChecked={skipChecked}
        onSkipCheckedChange={setSkipChecked}
        onClose={handleCloseIntro}
        onStart={handleStartFromIntro}
      />
    </div>
  );
}
