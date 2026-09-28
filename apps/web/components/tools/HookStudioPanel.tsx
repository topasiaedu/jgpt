"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { postChat } from "@/lib/chatClient";
import {
  composeHookStudioUserMessage,
  validateHookStudioGenerate,
} from "@/lib/hookStudio/composeUserMessage";
import { parseHookStudioReply } from "@/lib/hookStudio/parseHookStudioHooks";
import {
  readHookStudioProfile,
  writeHookStudioProfile,
} from "@/lib/hookStudio/profileStorage";
import type {
  HookStudioCard,
  HookStudioMode,
  HookStudioParseResult,
  HookStudioProfile,
  HookStudioValidationIssue,
} from "@/lib/hookStudio/types";
import type { MessageKey } from "@/lib/i18n/messages";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { buildToolHrefFromStudio } from "@/lib/modules/homeHandoff";

type HookStudioPanelProps = {
  /** Catalog module id used for /api/chat module mode (scroll-stop-hook). */
  moduleId: string;
};

type StudioResultsState =
  | { kind: "idle" }
  | { kind: "error"; messageKey: "hookStudioErrorGeneric" | "hookStudioParseEmpty" }
  | { kind: "parsed"; parseResult: HookStudioParseResult; mode: HookStudioMode };

const MODE_CHIPS: Array<{ id: HookStudioMode; labelKey: MessageKey }> = [
  { id: "from-idea", labelKey: "hookStudioModeFromIdea" },
  { id: "rewrite", labelKey: "hookStudioModeRewrite" },
  { id: "competitor", labelKey: "hookStudioModeCompetitor" },
  { id: "repeat", labelKey: "hookStudioModeRepeat" },
];

/**
 * Hook Studio batch UI: profile + modes + Generate + copyable cards.
 * Calls /api/chat directly. Refine happens on the separate Hook Formula chat page.
 */
export default function HookStudioPanel({ moduleId }: HookStudioPanelProps) {
  const { t, locale } = useI18n();
  const [hydrated, setHydrated] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [profile, setProfile] = useState<HookStudioProfile>({
    niche: "",
    proof: "",
    topics: "",
  });
  const [mode, setMode] = useState<HookStudioMode>("from-idea");
  const [modeInput, setModeInput] = useState("");
  const [validationTip, setValidationTip] = useState<string | null>(null);
  const [results, setResults] = useState<StudioResultsState>({ kind: "idle" });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    setProfile(readHookStudioProfile());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    writeHookStudioProfile(profile);
  }, [hydrated, profile]);

  function updateProfileField(field: keyof HookStudioProfile, value: string): void {
    setProfile((current) => ({ ...current, [field]: value }));
    if (validationTip !== null) {
      setValidationTip(null);
    }
  }

  function handleModeChange(next: HookStudioMode): void {
    setMode(next);
    setValidationTip(null);
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isSending) {
      return;
    }

    const issues: HookStudioValidationIssue[] = validateHookStudioGenerate({
      mode,
      profile,
      modeInput,
    });
    if (issues.length > 0) {
      setValidationTip(buildValidationTip(issues, mode, t));
      return;
    }

    setValidationTip(null);
    setCopiedIndex(null);
    setIsSending(true);

    const userTurn: string = composeHookStudioUserMessage({
      mode,
      profile,
      modeInput,
    });

    const result = await postChat({
      messages: [{ role: "user", content: userTurn }],
      locale,
      moduleId,
    });

    setIsSending(false);

    if (!result.ok) {
      setResults({ kind: "error", messageKey: "hookStudioErrorGeneric" });
      return;
    }

    if (result.reply.trim().length === 0) {
      setResults({ kind: "error", messageKey: "hookStudioParseEmpty" });
      return;
    }

    setResults({
      kind: "parsed",
      mode,
      parseResult: parseHookStudioReply(result.reply, { mode }),
    });
  }

  async function handleCopy(card: HookStudioCard, index: number): Promise<void> {
    try {
      await navigator.clipboard.writeText(card.hook_text);
      setCopiedIndex(index);
      window.setTimeout(() => {
        setCopiedIndex((current) => (current === index ? null : current));
      }, 1600);
    } catch {
      // Clipboard may be blocked; leave card text selectable.
    }
  }

  const inputMeta = modeInputCopy(mode, t);

  return (
    <section className="hook-studio" aria-label={t("hookStudioTitle")}>
      <header className="hook-studio-header">
        <h2 className="hook-studio-title">{t("hookStudioTitle")}</h2>
        <p className="hook-studio-blurb">{t("hookStudioBlurb")}</p>
      </header>

      <form className="hook-studio-form" onSubmit={(event) => void handleGenerate(event)}>
        <fieldset className="hook-studio-profile" disabled={!hydrated || isSending}>
          <legend className="hook-studio-legend">{t("hookStudioProfileLegend")}</legend>

          <label className="hook-studio-field">
            <span className="hook-studio-label">
              {t("hookStudioNicheLabel")}
              <span className="hook-studio-required" aria-hidden="true">
                {" "}
                *
              </span>
            </span>
            <input
              className="input hook-studio-input"
              type="text"
              value={profile.niche}
              onChange={(event) => updateProfileField("niche", event.target.value)}
              placeholder={t("hookStudioNichePlaceholder")}
              autoComplete="off"
            />
          </label>

          <label className="hook-studio-field">
            <span className="hook-studio-label">
              {t("hookStudioProofLabel")}
              <span className="hook-studio-required" aria-hidden="true">
                {" "}
                *
              </span>
            </span>
            <textarea
              className="input hook-studio-input"
              rows={2}
              value={profile.proof}
              onChange={(event) => updateProfileField("proof", event.target.value)}
              placeholder={t("hookStudioProofPlaceholder")}
            />
          </label>

          <label className="hook-studio-field">
            <span className="hook-studio-label">{t("hookStudioTopicsLabel")}</span>
            <input
              className="input hook-studio-input"
              type="text"
              value={profile.topics}
              onChange={(event) => updateProfileField("topics", event.target.value)}
              placeholder={t("hookStudioTopicsPlaceholder")}
              autoComplete="off"
            />
          </label>
        </fieldset>

        <div className="hook-studio-modes" role="group" aria-label={t("hookStudioModesLabel")}>
          {MODE_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              className={
                mode === chip.id
                  ? "hook-studio-mode hook-studio-mode-active"
                  : "hook-studio-mode"
              }
              aria-pressed={mode === chip.id}
              disabled={isSending}
              onClick={() => handleModeChange(chip.id)}
            >
              {t(chip.labelKey)}
            </button>
          ))}
        </div>

        <label className="hook-studio-field">
          <span className="hook-studio-label">
            {inputMeta.label}
            <span className="hook-studio-required" aria-hidden="true">
              {" "}
              *
            </span>
          </span>
          <textarea
            className="input hook-studio-input"
            rows={inputMeta.rows}
            value={modeInput}
            onChange={(event) => {
              setModeInput(event.target.value);
              if (validationTip !== null) {
                setValidationTip(null);
              }
            }}
            placeholder={inputMeta.placeholder}
            disabled={isSending}
          />
        </label>

        {inputMeta.hint !== null ? (
          <p className="hook-studio-mode-hint">{inputMeta.hint}</p>
        ) : null}

        {validationTip !== null ? (
          <p className="hook-studio-tip" role="status">
            {validationTip}
          </p>
        ) : null}

        <button
          type="submit"
          className="hook-studio-generate"
          disabled={isSending || !hydrated}
        >
          {isSending ? t("hookStudioGenerating") : t("hookStudioGenerate")}
        </button>
      </form>

      <HookStudioResults
        moduleId={moduleId}
        results={results}
        copiedIndex={copiedIndex}
        onCopy={handleCopy}
      />
    </section>
  );
}

type HookStudioResultsProps = {
  moduleId: string;
  results: StudioResultsState;
  copiedIndex: number | null;
  onCopy: (card: HookStudioCard, index: number) => void;
};

/**
 * Renders idle hint, error, parsed cards, or plain-text fallback (never invents cards).
 */
function HookStudioResults({
  moduleId,
  results,
  copiedIndex,
  onCopy,
}: HookStudioResultsProps) {
  const { t } = useI18n();

  if (results.kind === "idle") {
    return (
      <p className="hook-studio-empty" role="status">
        {t("hookStudioEmptyHint")}
      </p>
    );
  }

  if (results.kind === "error") {
    return (
      <p className="hook-studio-error" role="alert">
        {t(results.messageKey)}
      </p>
    );
  }

  const { parseResult, mode } = results;

  if (parseResult.kind === "empty") {
    return (
      <p className="hook-studio-error" role="alert">
        {t("hookStudioParseEmpty")}
      </p>
    );
  }

  if (parseResult.kind === "fallback") {
    return (
      <div className="hook-studio-fallback" aria-live="polite">
        <h3 className="hook-studio-results-title">{t("hookStudioFallbackTitle")}</h3>
        <p className="hook-studio-fallback-body">{parseResult.text}</p>
        <p className="hook-studio-refine-wrap">
          <Link
            href={buildToolHrefFromStudio(moduleId, parseResult.text)}
            className="hook-studio-refine"
          >
            {t("hookStudioRefineInChat")}
          </Link>
        </p>
      </div>
    );
  }

  const showLegsPrimary: boolean =
    mode === "from-idea" || mode === "competitor" || mode === "repeat";

  return (
    <div className="hook-studio-cards" aria-live="polite">
      <h3 className="hook-studio-results-title">{t("hookStudioResultsTitle")}</h3>
      <ul className="hook-studio-card-list">
        {parseResult.cards.map((card, index) => (
          <li
            key={`${card.hook_text.slice(0, 48)}-${String(index)}`}
            className={
              card.film_first
                ? "hook-studio-card hook-studio-card-film-first"
                : "hook-studio-card"
            }
          >
            {card.film_first ? (
              <p className="hook-studio-film-first">{t("hookStudioFilmFirst")}</p>
            ) : null}
            <p className="hook-studio-hook-text">{card.hook_text}</p>
            {card.why_it_works.length > 0 ? (
              <p className="hook-studio-why">
                <span className="hook-studio-meta-label">{t("hookStudioWhyLabel")}</span>
                {card.why_it_works}
              </p>
            ) : null}
            {showLegsPrimary || card.formula_legs !== null ? (
              <FormulaLegsBlock legs={card.formula_legs} />
            ) : null}
            {card.rewrite_note !== null ? (
              <p className="hook-studio-rewrite-note">
                <span className="hook-studio-meta-label">{t("hookStudioRewriteNoteLabel")}</span>
                {card.rewrite_note}
              </p>
            ) : null}
            <div className="hook-studio-card-actions">
              <button
                type="button"
                className="hook-studio-copy"
                onClick={() => onCopy(card, index)}
              >
                {copiedIndex === index ? t("hookStudioCopied") : t("hookStudioCopy")}
              </button>
              <Link
                href={buildToolHrefFromStudio(moduleId, card.hook_text)}
                className="hook-studio-refine"
              >
                {t("hookStudioRefineInChat")}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

type FormulaLegsBlockProps = {
  legs: HookStudioCard["formula_legs"];
};

/**
 * Shows the four Hook Formula legs when present.
 */
function FormulaLegsBlock({ legs }: FormulaLegsBlockProps) {
  const { t } = useI18n();
  if (legs === null) {
    return null;
  }

  return (
    <ul className="hook-studio-legs">
      {legs.audience.length > 0 ? (
        <li>
          <span className="hook-studio-meta-label">{t("hookStudioLegAudience")}</span>
          {legs.audience}
        </li>
      ) : null}
      {legs.pain.length > 0 ? (
        <li>
          <span className="hook-studio-meta-label">{t("hookStudioLegPain")}</span>
          {legs.pain}
        </li>
      ) : null}
      {legs.contrast_or_result.length > 0 ? (
        <li>
          <span className="hook-studio-meta-label">{t("hookStudioLegContrast")}</span>
          {legs.contrast_or_result}
        </li>
      ) : null}
      {legs.curiosity.length > 0 ? (
        <li>
          <span className="hook-studio-meta-label">{t("hookStudioLegCuriosity")}</span>
          {legs.curiosity}
        </li>
      ) : null}
    </ul>
  );
}

type TranslateFn = (key: MessageKey) => string;

type ModeInputCopy = {
  label: string;
  placeholder: string;
  hint: string | null;
  rows: number;
};

/**
 * Label, placeholder, optional hint, and textarea rows for the active mode.
 */
function modeInputCopy(mode: HookStudioMode, translate: TranslateFn): ModeInputCopy {
  if (mode === "from-idea") {
    return {
      label: translate("hookStudioIdeaLabel"),
      placeholder: translate("hookStudioIdeaPlaceholder"),
      hint: null,
      rows: 3,
    };
  }
  if (mode === "rewrite") {
    return {
      label: translate("hookStudioRewriteLabel"),
      placeholder: translate("hookStudioRewritePlaceholder"),
      hint: null,
      rows: 3,
    };
  }
  if (mode === "competitor") {
    return {
      label: translate("hookStudioCompetitorLabel"),
      placeholder: translate("hookStudioCompetitorPlaceholder"),
      hint: translate("hookStudioCompetitorHint"),
      rows: 6,
    };
  }
  return {
    label: translate("hookStudioRepeatLabel"),
    placeholder: translate("hookStudioRepeatPlaceholder"),
    hint: translate("hookStudioRepeatHint"),
    rows: 5,
  };
}

/**
 * Builds a short inline tip from validation issues (no alert spam).
 */
function buildValidationTip(
  issues: HookStudioValidationIssue[],
  mode: HookStudioMode,
  translate: TranslateFn,
): string {
  const lineOnly: HookStudioValidationIssue | undefined = issues.find(
    (issue) =>
      issue === "competitorMinLines" ||
      issue === "competitorMaxLines" ||
      issue === "repeatMinLines" ||
      issue === "repeatMaxLines",
  );
  if (lineOnly === "competitorMinLines") {
    return translate("hookStudioTipCompetitorMin");
  }
  if (lineOnly === "competitorMaxLines") {
    return translate("hookStudioTipCompetitorMax");
  }
  if (lineOnly === "repeatMinLines") {
    return translate("hookStudioTipRepeatMin");
  }
  if (lineOnly === "repeatMaxLines") {
    return translate("hookStudioTipRepeatMax");
  }

  const fieldIssues = issues.filter(
    (issue): issue is "niche" | "proof" | "modeInput" =>
      issue === "niche" || issue === "proof" || issue === "modeInput",
  );
  if (fieldIssues.length === 0) {
    return translate("hookStudioTipMissingSuffix");
  }

  const labels: string[] = fieldIssues.map((field) => {
    if (field === "niche") {
      return translate("hookStudioNicheLabel");
    }
    if (field === "proof") {
      return translate("hookStudioProofLabel");
    }
    return modeInputCopy(mode, translate).label;
  });

  return `${translate("hookStudioTipMissingPrefix")}${labels.join(translate("hookStudioTipMissingJoin"))}${translate("hookStudioTipMissingSuffix")}`;
}
