"use client";

import type { ChatSource } from "@/lib/chatTypes";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type MessageSourcesChipProps = {
  sources: ChatSource[];
  open: boolean;
  onToggle: () => void;
};

/**
 * Compact top-right affordance on a Jeff bubble: source count or honest empty label.
 * Gold accent when graph sources hit; quieter empty state.
 */
export default function MessageSourcesChip({
  sources,
  open,
  onToggle,
}: MessageSourcesChipProps) {
  const { t } = useI18n();
  const isEmpty: boolean = sources.length === 0;
  const label: string = isEmpty
    ? t("sourcesChipEmpty")
    : sources.length === 1
      ? t("sourcesChipOne")
      : t("sourcesChipMany", { n: sources.length });

  const chipClass = isEmpty
    ? "msg-sources-chip msg-sources-chip-empty"
    : "msg-sources-chip msg-sources-chip-hit";

  return (
    <div className="msg-sources">
      <button
        type="button"
        className={chipClass}
        aria-expanded={open}
        aria-label={label}
        onClick={onToggle}
      >
        {label}
      </button>
      {open ? (
        <div className="msg-sources-popover" role="region" aria-label={t("sourcesTitle")}>
          {isEmpty ? (
            <p className="msg-sources-empty">{t("sourcesChipEmptyDetail")}</p>
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
