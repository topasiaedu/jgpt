"use client";

import type { ChatSource } from "@/lib/chatTypes";

type MessageSourcesChipProps = {
  sources: ChatSource[];
  open: boolean;
  onToggle: () => void;
};

/**
 * Compact top-right affordance on a Jeff bubble: source count or honest empty label.
 * Expands a short list (id, title, type) so stakeholders can see grounding per reply.
 */
export default function MessageSourcesChip({
  sources,
  open,
  onToggle,
}: MessageSourcesChipProps) {
  const isEmpty: boolean = sources.length === 0;
  const label: string = isEmpty
    ? "No graph source"
    : sources.length === 1
      ? "1 source"
      : `${String(sources.length)} sources`;

  return (
    <div className="msg-sources">
      <button
        type="button"
        className={isEmpty ? "msg-sources-chip msg-sources-chip-empty" : "msg-sources-chip"}
        aria-expanded={open}
        aria-label={isEmpty ? "No graph source for this reply" : `Show ${label} for this reply`}
        onClick={onToggle}
      >
        {label}
      </button>
      {open ? (
        <div className="msg-sources-popover" role="region" aria-label="Sources for this reply">
          {isEmpty ? (
            <p className="msg-sources-empty">
              No graph source. General steer: Jeff craft framing only; this niche claim is not cited from the teaching graph.
            </p>
          ) : (
            <ul className="msg-sources-list">
              {sources.map((source) => (
                <li key={source.id} className="msg-sources-item">
                  <span className="source-type">{source.type}</span>
                  <span className="source-title">{source.title}</span>
                  <code className="source-id">{source.id}</code>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
