"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import AssistantMessage from "@/components/AssistantMessage";
import MessageSourcesChip from "@/components/MessageSourcesChip";
import type { ChatMessage, ChatResponseBody, ChatSource } from "@/lib/chatTypes";

/** Example prompts shown in the empty state for stakeholders. */
const EXAMPLE_QUESTIONS: string[] = [
  "I am an unseen founder. Where should I start with personal brand and IP?",
  "People trust me online, but deals still do not close. What is Jeff's angle?",
  "Another course says skip brand and just run ads. How would Jeff respond?",
];

/**
 * Jeff IP test chat shell: message list, composer, and Sources used panel.
 * Calls POST /api/chat (graph probe + OpenAI).
 */
export default function ChatShell() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [panelSources, setPanelSources] = useState<ChatSource[]>([]);
  const [panelHasReply, setPanelHasReply] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [openChipIndex, setOpenChipIndex] = useState<number | null>(null);

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
    setOpenChipIndex(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Dialogue only: do not resend prior-turn sources into the API.
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Chat request failed.";
        setError(message);
        return;
      }

      if (!isChatResponseBody(data)) {
        setError("Unexpected response from chat API.");
        return;
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.reply,
        sources: data.sources,
      };
      setMessages([...nextMessages, assistantMessage]);
      setPanelSources(data.sources);
      setPanelHasReply(true);
      setOpenChipIndex(null);
    } catch {
      setError("Could not reach the chat API. Check that the server is running.");
    } finally {
      setIsSending(false);
    }
  }

  /**
   * Form submit handler for the composer.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await sendMessage(draft);
  }

  /**
   * Selects a message's sources for the sidebar and toggles that bubble's chip popover.
   */
  function handleSourcesChipToggle(index: number, messageSources: ChatSource[]): void {
    setPanelSources(messageSources);
    setPanelHasReply(true);
    setSourcesOpen(true);
    setOpenChipIndex((current) => (current === index ? null : index));
  }

  return (
    <div className="shell">
      <header className="header">
        <h1 className="title">Jeff IP test</h1>
        <p className="subtitle">
          Stakeholder chat grounded in jeff-graph and jeff-wiki. Draft teaching graph; not the full Jeff corpus yet.
        </p>
      </header>

      <div className="main">
        <section className="chat" aria-label="Chat messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p className="empty">Ask a question about IP, brand, trust, or positioning.</p>
              <p className="empty-hint">Try one of these:</p>
              <ul className="example-list">
                {EXAMPLE_QUESTIONS.map((question) => (
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
              {messages.map((message, index) => (
                <li
                  key={`${message.role}-${index}`}
                  className={message.role === "user" ? "message message-user" : "message message-assistant"}
                >
                  {message.role === "assistant" ? (
                    <>
                      <div className="message-header">
                        <span className="message-role">Jeff</span>
                        <MessageSourcesChip
                          sources={message.sources ?? []}
                          open={openChipIndex === index}
                          onToggle={() => {
                            handleSourcesChipToggle(index, message.sources ?? []);
                          }}
                        />
                      </div>
                      <AssistantMessage content={message.content} />
                    </>
                  ) : (
                    <>
                      <span className="message-role">You</span>
                      <p className="message-body">{message.content}</p>
                    </>
                  )}
                </li>
              ))}
              {isSending ? (
                <li className="message message-assistant message-loading" aria-live="polite">
                  <span className="message-role">Jeff</span>
                  <p className="message-body loading-text">Thinking…</p>
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
              Message
            </label>
            <textarea
              id="chat-input"
              className="input"
              rows={2}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type a message…"
              disabled={isSending}
            />
            <button className="send" type="submit" disabled={isSending || draft.trim().length === 0}>
              {isSending ? "Sending…" : "Send"}
            </button>
          </form>
        </section>

        <aside className="sources" aria-label="Sources used">
          <button
            type="button"
            className="sources-toggle"
            aria-expanded={sourcesOpen}
            onClick={() => setSourcesOpen((open) => !open)}
          >
            <h2 className="sources-title">Sources used</h2>
            <span className="sources-toggle-label">{sourcesOpen ? "Hide" : "Show"}</span>
          </button>
          <div className={sourcesOpen ? "sources-body sources-body-open" : "sources-body"}>
            {!panelHasReply ? (
              <p className="sources-empty">
                Send a message to see which graph nodes grounded the answer. Each Jeff bubble also shows a sources chip.
              </p>
            ) : panelSources.length === 0 ? (
              <div className="sources-empty-block">
                <p className="sources-empty-label">No graph source</p>
                <p className="sources-empty">
                  General steer: this reply used Jeff craft framing without a cited graph node for the niche claim.
                </p>
              </div>
            ) : (
              <ul className="sources-list">
                {panelSources.map((source) => (
                  <li key={source.id} className="source-item">
                    <span className="source-type">{source.type}</span>
                    <span className="source-title">{source.title}</span>
                    <code className="source-id">{source.id}</code>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Narrows unknown JSON to the expected chat response shape.
 */
function isChatResponseBody(value: unknown): value is ChatResponseBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("reply" in value) || !("sources" in value)) {
    return false;
  }

  const reply = (value as { reply: unknown }).reply;
  const sources = (value as { sources: unknown }).sources;

  if (typeof reply !== "string" || !Array.isArray(sources)) {
    return false;
  }

  return sources.every((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }
    const candidate = item as { id?: unknown; title?: unknown; type?: unknown };
    return (
      typeof candidate.id === "string" &&
      typeof candidate.title === "string" &&
      typeof candidate.type === "string"
    );
  });
}
