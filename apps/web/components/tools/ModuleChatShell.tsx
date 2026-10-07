"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import AssistantMessage from "@/components/AssistantMessage";
import {
  appendChatHistoryTurn,
  createChatConversation,
  patchChatConversation,
} from "@/lib/chatHistory/clientApi";
import type {
  ChatConversationSummary,
  ChatFolderDto,
} from "@/lib/chatHistory/types";
import { postChat } from "@/lib/chatClient";
import { chatErrorMessageKey } from "@/lib/chatErrors";
import type { ChatMessage } from "@/lib/chatTypes";
import { handleComposerKeyDown } from "@/lib/composerKeyboard";
import { toDialogueOnly } from "@/lib/dialogue";
import { useI18n } from "@/lib/i18n/LocaleProvider";

/** Distance from the list end that still counts as pinned to the latest turn. */
const MESSAGE_LIST_PIN_THRESHOLD_PX = 96;

/** Smooth-scroll only when the remaining jump is within about one viewport. */
const MESSAGE_LIST_SMOOTH_MAX_DELTA_PX = 720;

type ModuleChatShellProps = {
  moduleId: string;
  moduleTitle: string;
  /**
   * Persisted conversation id, or null when the opener is ephemeral
   * (lazy-create on the first successful user send).
   */
  conversationId: string | null;
  /** Pack opener stored with the conversation on first persist. */
  openerContent: string;
  /** Full UI transcript from history (opener plus turns). */
  initialMessages: ChatMessage[];
  /** Optional home → tool intent (silent API hint on later turns). */
  homeIntent?: string;
  /**
   * Optional owned Brand profile id. Sent on /api/chat and lazy-create when set.
   */
  brandProfileId?: string;
  /**
   * Called after lazy-create when the server auto-filed into a profile folder
   * so the sidebar can upsert that folder before the conversation row.
   */
  onAutoFolderReady?: (folder: ChatFolderDto) => void;
  /** Called after a successful history append so the sidebar title can refresh. */
  onTurnPersisted?: (conversation: ChatConversationSummary) => void;
  /** Lets the parent disable conversation switch while a reply is in flight. */
  onSendingChange?: (isSending: boolean) => void;
};

/**
 * Module chat UI: brand bubbles. Posts moduleId every turn.
 * Parent remounts via conversationId (or ephemeral key) when the student picks another thread.
 * Graph and brand sources stay on the API payload; they are not shown on bubbles.
 */
export default function ModuleChatShell({
  moduleId,
  moduleTitle,
  conversationId,
  openerContent,
  initialMessages,
  homeIntent,
  brandProfileId,
  onAutoFolderReady,
  onTurnPersisted,
  onSendingChange,
}: ModuleChatShellProps) {
  const { t, locale } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>(() => initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [persistError, setPersistError] = useState<string | null>(null);

  const messagesRef = useRef<ChatMessage[]>(messages);
  const conversationIdRef = useRef<string | null>(conversationId);
  const openerContentRef = useRef<string>(openerContent);
  const brandProfileIdRef = useRef<string | undefined>(brandProfileId);
  const isSendingRef = useRef(false);
  const wasSendingRef = useRef(false);
  const messageListRef = useRef<HTMLUListElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const stickToBottomRef = useRef(true);
  const forcePinRef = useRef(false);
  const programmaticScrollRef = useRef(false);
  const hasCompletedInitialPinRef = useRef(false);
  const programmaticSettleTimerRef = useRef<number | null>(null);

  /**
   * Returns focus to the composer when it is editable.
   * Skips a disabled field so the browser does not throw or no-op.
   */
  function restoreComposerFocus(): void {
    const composerEl: HTMLTextAreaElement | null = composerRef.current;
    if (composerEl === null || composerEl.disabled) {
      return;
    }
    composerEl.focus();
  }

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    openerContentRef.current = openerContent;
  }, [openerContent]);

  useEffect(() => {
    brandProfileIdRef.current = brandProfileId;
  }, [brandProfileId]);

  /**
   * Places the caret in the composer on first paint of this thread.
   */
  useEffect(() => {
    const frame: number = window.requestAnimationFrame(() => {
      restoreComposerFocus();
    });
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  /**
   * Maximum scrollTop that places the last layout pixel at the list bottom.
   */
  function getMessageListMaxScrollTop(listEl: HTMLUListElement): number {
    return Math.max(0, listEl.scrollHeight - listEl.clientHeight);
  }

  /**
   * True while we should keep the transcript pinned (follow new layout).
   */
  function shouldPinMessageList(): boolean {
    return forcePinRef.current || stickToBottomRef.current;
  }

  /**
   * Scrolls ul.message-list to true bottom. Smooth only for small follow-up jumps.
   * Instant corrections after ResizeObserver so a smooth animation cannot stop short.
   */
  function scrollMessageListToTrueBottom(behavior: ScrollBehavior): void {
    const listEl: HTMLUListElement | null = messageListRef.current;
    if (listEl === null) {
      return;
    }

    const maxScrollTop: number = getMessageListMaxScrollTop(listEl);
    programmaticScrollRef.current = true;
    if (behavior === "smooth") {
      listEl.scrollTo({ top: maxScrollTop, behavior: "smooth" });
    } else {
      listEl.scrollTop = maxScrollTop;
    }

    if (programmaticSettleTimerRef.current !== null) {
      window.clearTimeout(programmaticSettleTimerRef.current);
    }
    const settleMs: number = behavior === "smooth" ? 450 : 32;
    programmaticSettleTimerRef.current = window.setTimeout(() => {
      programmaticScrollRef.current = false;
      programmaticSettleTimerRef.current = null;
      const latestListEl: HTMLUListElement | null = messageListRef.current;
      if (latestListEl === null || !shouldPinMessageList()) {
        return;
      }
      const endScrollTop: number = getMessageListMaxScrollTop(latestListEl);
      if (endScrollTop - latestListEl.scrollTop > 1) {
        latestListEl.scrollTop = endScrollTop;
      }
    }, settleMs);
  }

  /**
   * Pins to true bottom when following the thread. First long jump is instant.
   * Kept in a ref so the message-list effect can call the latest logic without
   * re-subscribing ResizeObserver on every render.
   */
  const pinMessageListIfNeededRef = useRef<(allowSmooth: boolean) => void>(
    () => undefined,
  );
  pinMessageListIfNeededRef.current = (allowSmooth: boolean): void => {
    if (!shouldPinMessageList()) {
      return;
    }

    const listEl: HTMLUListElement | null = messageListRef.current;
    if (listEl === null) {
      return;
    }

    const maxScrollTop: number = getMessageListMaxScrollTop(listEl);
    const delta: number = maxScrollTop - listEl.scrollTop;
    if (delta <= 1) {
      return;
    }

    const useSmooth: boolean =
      allowSmooth &&
      hasCompletedInitialPinRef.current &&
      delta < MESSAGE_LIST_SMOOTH_MAX_DELTA_PX;
    scrollMessageListToTrueBottom(useSmooth ? "smooth" : "auto");
    hasCompletedInitialPinRef.current = true;
  };

  /**
   * Tracks whether the student is still at the bottom of the transcript.
   * Ignores programmatic pin scrolls so a smooth jump cannot unpin them.
   */
  function handleMessageListScroll(): void {
    if (programmaticScrollRef.current) {
      return;
    }

    const listEl: HTMLUListElement | null = messageListRef.current;
    if (listEl === null) {
      return;
    }

    const distanceFromBottom: number =
      listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight;
    const isPinned: boolean = distanceFromBottom < MESSAGE_LIST_PIN_THRESHOLD_PX;
    stickToBottomRef.current = isPinned;
    if (!isPinned) {
      forcePinRef.current = false;
    }
  }

  /**
   * Scrolls the message list, not the window, after new turns, thinking, or reflow.
   * Observes each li so markdown and enter animation height is included.
   */
  useEffect(() => {
    const listEl: HTMLUListElement | null = messageListRef.current;
    if (listEl === null) {
      return;
    }

    let cancelled = false;
    let innerFrame = 0;
    const outerFrame: number = window.requestAnimationFrame(() => {
      innerFrame = window.requestAnimationFrame(() => {
        if (!cancelled) {
          pinMessageListIfNeededRef.current(true);
        }
      });
    });

    const resizeObserver = new ResizeObserver(() => {
      if (!cancelled) {
        pinMessageListIfNeededRef.current(false);
      }
    });
    resizeObserver.observe(listEl);
    const childCount: number = listEl.children.length;
    for (let index = 0; index < childCount; index += 1) {
      const child = listEl.children.item(index);
      if (child instanceof Element) {
        resizeObserver.observe(child);
      }
    }

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(outerFrame);
      window.cancelAnimationFrame(innerFrame);
      resizeObserver.disconnect();
      if (programmaticSettleTimerRef.current !== null) {
        window.clearTimeout(programmaticSettleTimerRef.current);
        programmaticSettleTimerRef.current = null;
      }
    };
  }, [messages, isSending]);

  /**
   * After Enter/send, keep the caret in the composer.
   * If the field was disabled while a reply is in flight, restore focus
   * on the next frame after it becomes editable again.
   */
  useEffect(() => {
    const wasSending: boolean = wasSendingRef.current;
    wasSendingRef.current = isSending;
    const shouldRestore: boolean = isSending || wasSending;
    if (!shouldRestore) {
      return;
    }

    const frame: number = window.requestAnimationFrame(() => {
      restoreComposerFocus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isSending]);

  /**
   * Sends a user message and appends the module-mode reply.
   * History is written only after a successful postChat.
   */
  async function sendMessage(content: string): Promise<void> {
    const trimmed: string = content.trim();
    if (trimmed.length === 0 || isSendingRef.current) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messagesRef.current,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    messagesRef.current = nextMessages;
    stickToBottomRef.current = true;
    forcePinRef.current = true;
    setDraft("");
    setError(null);
    setPersistError(null);
    isSendingRef.current = true;
    setIsSending(true);
    if (onSendingChange !== undefined) {
      onSendingChange(true);
    }
    window.requestAnimationFrame(() => {
      restoreComposerFocus();
    });

    const sessionBrandProfileId: string | undefined = brandProfileIdRef.current;
    const result = await postChat({
      messages: toDialogueOnly(nextMessages),
      locale,
      moduleId,
      ...(typeof sessionBrandProfileId === "string" &&
      sessionBrandProfileId.length > 0
        ? { brandProfileId: sessionBrandProfileId }
        : {}),
      ...(typeof homeIntent === "string" && homeIntent.length > 0
        ? { homeIntent }
        : {}),
    });

    if (!result.ok) {
      setError(t(chatErrorMessageKey(result.error)));
      isSendingRef.current = false;
      setIsSending(false);
      if (onSendingChange !== undefined) {
        onSendingChange(false);
      }
      return;
    }

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: result.reply,
      sources: result.sources,
      ...(result.brandSources.length > 0 ? { brandSources: result.brandSources } : {}),
    };
    const withAssistant: ChatMessage[] = [...nextMessages, assistantMessage];
    setMessages(withAssistant);
    messagesRef.current = withAssistant;
    isSendingRef.current = false;
    setIsSending(false);
    if (onSendingChange !== undefined) {
      onSendingChange(false);
    }

    /**
     * Persist only after a successful reply. Lazy-create the conversation
     * (opener row) on the first user send when none exists yet.
     */
    let historyId: string | null = conversationIdRef.current;
    let createdThisSend: string | null = null;
    if (historyId === null) {
      const created = await createChatConversation({
        moduleId,
        openerContent: openerContentRef.current,
        brandProfileId:
          typeof sessionBrandProfileId === "string" &&
          sessionBrandProfileId.length > 0
            ? sessionBrandProfileId
            : null,
      });
      if (!created.ok) {
        setPersistError(t("histSaveFailed"));
        return;
      }
      historyId = created.conversation.id;
      createdThisSend = historyId;
      conversationIdRef.current = historyId;
      if (created.folder !== null && onAutoFolderReady !== undefined) {
        onAutoFolderReady(created.folder);
      }
    }

    const appendResult = await appendChatHistoryTurn(historyId, {
      userContent: trimmed,
      assistantContent: result.reply,
      sources: result.sources,
      brandSources: result.brandSources,
    });
    if (!appendResult.ok) {
      if (createdThisSend !== null) {
        // Avoid leaving opener-only junk in the DB after a failed first append.
        await patchChatConversation(createdThisSend, { deleted: true });
        conversationIdRef.current = null;
      }
      setPersistError(t("histSaveFailed"));
      return;
    }
    if (onTurnPersisted !== undefined) {
      onTurnPersisted(appendResult.conversation);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await sendMessage(draft);
  }

  /**
   * Enter sends (same as the send button); Shift+Enter keeps a newline.
   */
  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    handleComposerKeyDown(event, {
      isSending,
      onSubmit: () => {
        void sendMessage(draft);
      },
    });
  }

  return (
    <div className="module-chat">
      <div className="main">
        <section className="chat" aria-label={`${moduleTitle} chat`}>
          <ul
            className="message-list"
            ref={messageListRef}
            onScroll={handleMessageListScroll}
          >
            {messages.map((message, index) => {
              const messageClass =
                message.role === "user"
                  ? "message message-user message-enter"
                  : "message message-assistant message-enter";
              return (
                <li key={`${message.role}-${index}`} className={messageClass}>
                  {message.role === "assistant" ? (
                    <>
                      <div className="message-header">
                        <span className="message-role message-role-jeff">{t("roleJeff")}</span>
                      </div>
                      <AssistantMessage content={message.content} />
                    </>
                  ) : (
                    <>
                      <div className="message-header">
                        <span className="message-role">{t("roleYou")}</span>
                      </div>
                      <p className="message-body">{message.content}</p>
                    </>
                  )}
                </li>
              );
            })}
            {isSending ? (
              <li className="message message-assistant message-enter message-loading" aria-live="polite">
                <span className="message-role message-role-jeff">{t("roleJeff")}</span>
                <p className="message-body loading-text">{t("thinking")}</p>
              </li>
            ) : null}
          </ul>

          {error !== null ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}
          {persistError !== null ? (
            <p className="error" role="alert">
              {persistError}
            </p>
          ) : null}

          <form className="composer" onSubmit={(event) => void handleSubmit(event)}>
            <label className="sr-only" htmlFor="module-composer">
              {t("composerLabel")}
            </label>
            <textarea
              ref={composerRef}
              id="module-composer"
              className="input"
              rows={2}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onComposerKeyDown}
              placeholder={t("moduleComposerPlaceholder")}
              aria-busy={isSending}
            />
            <button type="submit" className="send" disabled={isSending || draft.trim().length === 0}>
              {t("send")}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
