"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import AssistantMessage from "@/components/AssistantMessage";
import { postChat } from "@/lib/chatClient";
import { chatErrorMessageKey } from "@/lib/chatErrors";
import type { ChatMessage } from "@/lib/chatTypes";
import { handleComposerKeyDown } from "@/lib/composerKeyboard";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type ModuleChatShellProps = {
  moduleId: string;
  moduleTitle: string;
  /** Seeded first assistant turn; no API call until the user replies. */
  chatOpener: string;
  /** Optional home → tool intent (silent API hint on later turns). */
  homeIntent?: string;
};

/**
 * Module chat UI: brand bubbles. Posts moduleId every turn.
 * Parent remounts via key so each tool open starts a fresh thread + opener.
 * Sources stay in the API payload for builders; not shown in student UI.
 */
export default function ModuleChatShell({
  moduleId,
  moduleTitle,
  chatOpener,
  homeIntent,
}: ModuleChatShellProps) {
  const { t, locale } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { role: "assistant", content: chatOpener },
  ]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesRef = useRef<ChatMessage[]>(messages);
  const isSendingRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /**
   * Sends a user message and appends the module-mode reply.
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
    setDraft("");
    setError(null);
    isSendingRef.current = true;
    setIsSending(true);

    const result = await postChat({
      messages: nextMessages,
      locale,
      moduleId,
      ...(typeof homeIntent === "string" && homeIntent.length > 0
        ? { homeIntent }
        : {}),
    });

    if (!result.ok) {
      setError(t(chatErrorMessageKey(result.error)));
      isSendingRef.current = false;
      setIsSending(false);
      return;
    }

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: result.reply,
    };
    const withAssistant: ChatMessage[] = [...nextMessages, assistantMessage];
    setMessages(withAssistant);
    messagesRef.current = withAssistant;
    isSendingRef.current = false;
    setIsSending(false);
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
          <ul className="message-list">
            {messages.map((message, index) => {
              const openerClass =
                index === 0 && message.role === "assistant" ? " message-opener" : "";
              const messageClass =
                message.role === "user"
                  ? "message message-user"
                  : `message message-assistant${openerClass}`;

              return (
                <li key={`${message.role}-${index}`} className={messageClass}>
                  {message.role === "assistant" ? (
                    <>
                      <span className="message-role message-role-jeff">{t("roleJeff")}</span>
                      <AssistantMessage content={message.content} />
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

          {error !== null ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}

          <form className="composer" onSubmit={(event) => void handleSubmit(event)}>
            <label className="sr-only" htmlFor="module-composer">
              {t("composerLabel")}
            </label>
            <textarea
              id="module-composer"
              className="input"
              rows={2}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onComposerKeyDown}
              placeholder={t("moduleComposerPlaceholder")}
              disabled={isSending}
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
