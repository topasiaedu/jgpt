"use client";

import { useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import Link from "next/link";

import AppFooter from "@/components/AppFooter";
import AppNav from "@/components/AppNav";
import AssistantMessage from "@/components/AssistantMessage";
import { postChat } from "@/lib/chatClient";
import { chatErrorMessageKey } from "@/lib/chatErrors";
import type { ChatMessage } from "@/lib/chatTypes";
import { handleComposerKeyDown } from "@/lib/composerKeyboard";
import { categoryMessageKey } from "@/lib/i18n/messages";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { getModuleById } from "@/lib/modules/catalog";
import { buildToolHrefFromHome } from "@/lib/modules/homeHandoff";
import { getModuleDisplay } from "@/lib/modules/moduleDisplay";
import type { ModuleDefinition } from "@/lib/modules/types";

/**
 * Resolves validated recommend ids to catalog modules for deep-link cards.
 * Skips unknown ids (should already be filtered server-side).
 */
function resolveRecommendedModules(moduleIds: string[] | undefined): ModuleDefinition[] {
  if (moduleIds === undefined || moduleIds.length === 0) {
    return [];
  }

  const resolved: ModuleDefinition[] = [];
  for (const moduleId of moduleIds) {
    const entry = getModuleById(moduleId);
    if (entry !== undefined) {
      resolved.push(entry);
    }
  }
  return resolved;
}

/**
 * Finds the nearest prior user message before an assistant recommend turn.
 * Used to pass home intent as `?from=home&q=` on tool deep links.
 */
function findPriorUserContent(
  messages: ChatMessage[],
  assistantIndex: number,
): string | undefined {
  for (let i = assistantIndex - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message !== undefined && message.role === "user") {
      const trimmed: string = message.content.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }
  return undefined;
}

/**
 * Free-chat shell: home ask, recommend cards, composer, soft footer.
 * Calls POST /api/chat (graph probe + OpenAI). Free chat: no moduleId.
 * Sources stay in the API payload for builders; not shown in student UI.
 */
export default function ChatShell() {
  const { t, locale } = useI18n();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exampleQuestions: string[] = [t("example1"), t("example2"), t("example3")];

  /**
   * Sends a user message (from composer or example chip) and appends the reply.
   */
  async function sendMessage(content: string): Promise<void> {
    const trimmed: string = content.trim();
    if (trimmed.length === 0 || isSending) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setIsSending(true);

    const result = await postChat({ messages: nextMessages, locale });

    if (!result.ok) {
      setError(t(chatErrorMessageKey(result.error)));
      setIsSending(false);
      return;
    }

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: result.reply,
      ...(result.recommendedModuleIds.length > 0
        ? { recommendedModuleIds: result.recommendedModuleIds }
        : {}),
    };
    setMessages([...nextMessages, assistantMessage]);
    setIsSending(false);
  }

  /**
   * Form submit handler for the composer.
   */
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
    <div className="shell">
      <header className="header header-brand">
        <AppNav active="home" />
      </header>

      <div className="main">
        <section className="chat" aria-label="Chat messages">
          {messages.length === 0 ? (
            <div className="empty-state empty-state-brand empty-state-enter">
              <p className="brand-kicker">{t("productName")}</p>
              <p className="brand-tagline-soft">{t("productTagline")}</p>
              <h1 className="brand-title home-ask">{t("homeAsk")}</h1>
              <p className="brand-promise">{t("homePromise")}</p>
              <ul className="path-chip-list" aria-label="Paths">
                <li>
                  <Link href="/tools" className="path-chip">
                    {t("pathTools")}
                  </Link>
                </li>
                <li>
                  <Link href="/tools/ig-reel-script" className="path-chip">
                    {t("pathJumpReel")}
                  </Link>
                </li>
                <li>
                  <Link href="/tools/standpoint-builder" className="path-chip">
                    {t("pathJumpStandpoint")}
                  </Link>
                </li>
                <li>
                  <Link href="/tools/ip-stage-check" className="path-chip path-chip-quiet">
                    {t("pathStart")}
                  </Link>
                </li>
              </ul>
              <p className="empty-hint">{t("emptyHint")}</p>
              <ul className="example-list">
                {exampleQuestions.map((question) => (
                  <li key={question}>
                    <button
                      type="button"
                      className="example-chip"
                      disabled={isSending}
                      onClick={() => {
                        void sendMessage(question);
                      }}
                    >
                      {question}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="message-list">
              {messages.map((message, index) => {
                const recommendedModules =
                  message.role === "assistant"
                    ? resolveRecommendedModules(message.recommendedModuleIds)
                    : [];
                const priorUserIntent =
                  recommendedModules.length > 0
                    ? findPriorUserContent(messages, index)
                    : undefined;
                const messageClass =
                  message.role === "user"
                    ? "message message-user"
                    : "message message-assistant";

                return (
                  <li key={`${message.role}-${index}`} className={messageClass}>
                    {message.role === "assistant" ? (
                      <>
                        <span className="message-role message-role-jeff">{t("roleJeff")}</span>
                        <AssistantMessage content={message.content} />
                        {recommendedModules.length > 0 ? (
                          <div className="recommend-block" aria-label={t("recommendTitle")}>
                            <p className="recommend-title">{t("recommendTitle")}</p>
                            <ul className="recommend-list">
                              {recommendedModules.map((entry) => {
                                const display = getModuleDisplay(entry, locale);
                                return (
                                <li key={entry.id}>
                                  <Link
                                    href={buildToolHrefFromHome(entry.id, priorUserIntent)}
                                    className="recommend-card"
                                  >
                                    <span className="recommend-card-text">
                                      <span className="recommend-card-title">{display.title}</span>
                                      <span className="recommend-card-meta">
                                        {t(categoryMessageKey(entry.category))}
                                      </span>
                                    </span>
                                    <span className="recommend-card-cta">{t("recommendOpen")}</span>
                                  </Link>
                                </li>
                                );
                              })}
                            </ul>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <span className="message-role">{t("roleYou")}</span>
                        <p className="message-body">{message.content}</p>
                      </>
                    )}
                  </li>
                );
              })}
              {isSending ? (
                <li className="message message-assistant message-loading" aria-live="polite">
                  <span className="message-role message-role-jeff">{t("roleJeff")}</span>
                  <p className="message-body loading-text">{t("thinking")}</p>
                </li>
              ) : null}
            </ul>
          )}

          {error !== null ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}

          <form className="composer" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="chat-input">
              {t("composerLabel")}
            </label>
            <textarea
              ref={inputRef}
              id="chat-input"
              className="input"
              rows={2}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onComposerKeyDown}
              placeholder={t("composerPlaceholder")}
              disabled={isSending}
            />
            <button
              className={
                isSending || draft.trim().length === 0 ? "send" : "send send-pulse"
              }
              type="submit"
              disabled={isSending || draft.trim().length === 0}
            >
              {isSending ? t("sending") : t("send")}
            </button>
          </form>
        </section>
      </div>

      <AppFooter />
    </div>
  );
}
