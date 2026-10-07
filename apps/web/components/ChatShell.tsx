"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";

import BrandProfilePickModal from "@/components/brandProfiles/BrandProfilePickModal";
import {
  gateLastActiveProfileId,
  gateProfileList,
  useBrandProfileGate,
} from "@/lib/brandProfile/useBrandProfileGate";
import { postRecommend } from "@/lib/chatClient";
import { handleComposerKeyDown } from "@/lib/composerKeyboard";
import { categoryMessageKey } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/messages";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { getModuleById } from "@/lib/modules/catalog";
import {
  buildAuthHref,
  buildToolHrefFromHome,
} from "@/lib/modules/homeHandoff";
import { getModuleDisplay } from "@/lib/modules/moduleDisplay";
import { RECOMMEND_DRAFT_MIN_CHARS } from "@/lib/modules/recommend";
import type { ModuleDefinition } from "@/lib/modules/types";

/** Debounce for as-you-type home recommend (Artemo-style). */
const RECOMMEND_DEBOUNCE_MS = 400;

type RecommendUiStatus = "idle" | "loading" | "ok" | "vague" | "too_short" | "error";

/**
 * Joins the static create prefix with the editable rest for recommend.
 * ZH concatenates with no space; EN uses a single space.
 */
function composeCreateIntent(prefix: string, rest: string, locale: Locale): string {
  const trimmedRest: string = rest.trim().replace(/\s+/g, " ");
  if (trimmedRest.length === 0) {
    return "";
  }

  const trimmedPrefix: string = prefix.trim();
  if (locale === "zh") {
    return `${trimmedPrefix}${trimmedRest}`;
  }

  return `${trimmedPrefix} ${trimmedRest}`;
}

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
 * Decorative orange background blobs for the home create landing.
 * Pulse and drift are CSS-only; this markup is inert to pointer events.
 */
function HomeGlowBlobs(): ReactNode {
  return (
    <div className="home-glow" aria-hidden="true">
      <span className="home-glow-blob home-glow-blob-pulse" />
      <span className="home-glow-blob home-glow-blob-drift" />
    </div>
  );
}

/**
 * Filled paper-plane send icon for the create-surface composer.
 * Sized in CSS so Tailwind preflight cannot shrink it inside the orange button.
 */
function SendPlaneIcon(): ReactNode {
  return (
    <svg
      className="send-plane-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

type PendingToolOpen = {
  moduleId: string;
  intent: string | undefined;
};

/**
 * Home shell: Artemo create landing only.
 * Debounced /api/recommend cards sit under the input. Opening a tool card leaves create mode.
 * Typing, Enter, and Send must never start a Jeff coach chat transcript.
 * Tool cards open a Brand profile picker. Profile is optional.
 */
export default function ChatShell() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { state: brandGate, actionError, selectProfile } = useBrandProfileGate();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const recommendAbortRef = useRef<AbortController | null>(null);
  const recommendTimerRef = useRef<number | null>(null);
  /** Monotonic id so stale responses cannot overwrite a newer request. */
  const recommendRequestIdRef = useRef(0);

  const [draft, setDraft] = useState("");
  const [composerModuleIds, setComposerModuleIds] = useState<string[]>([]);
  const [composerIntent, setComposerIntent] = useState<string>("");
  const [recommendStatus, setRecommendStatus] = useState<RecommendUiStatus>("idle");
  const [pendingTool, setPendingTool] = useState<PendingToolOpen | null>(null);

  /**
   * Unsigned users go straight to /auth instead of a home sign-in CTA panel.
   */
  useEffect(() => {
    if (brandGate.kind === "signed_out") {
      router.replace(buildAuthHref("/"));
    }
  }, [brandGate.kind, router]);

  const createPrefix: string = t("composerPrefix");
  const recommendDraft: string = composeCreateIntent(createPrefix, draft, locale);
  const composerModules: ModuleDefinition[] = resolveRecommendedModules(composerModuleIds);
  const isRecommendLoading: boolean = recommendStatus === "loading";

  /**
   * Clears any pending debounce timer without touching in-flight fetch state.
   */
  function clearRecommendTimer(): void {
    if (recommendTimerRef.current !== null) {
      window.clearTimeout(recommendTimerRef.current);
      recommendTimerRef.current = null;
    }
  }

  /**
   * Aborts the in-flight recommend fetch, if any.
   */
  function abortInFlightRecommend(): void {
    if (recommendAbortRef.current !== null) {
      recommendAbortRef.current.abort();
      recommendAbortRef.current = null;
    }
  }

  /**
   * Runs /api/recommend for the composed create intent and updates card UI.
   * Never opens coach chat. Failures surface as inline create-surface errors.
   */
  function runRecommendFetch(trimmed: string): void {
    abortInFlightRecommend();
    const controller = new AbortController();
    recommendAbortRef.current = controller;
    const requestId: number = recommendRequestIdRef.current + 1;
    recommendRequestIdRef.current = requestId;
    setRecommendStatus("loading");

    void (async () => {
      const result = await postRecommend({
        draft: trimmed,
        locale,
        signal: controller.signal,
      });

      if (requestId !== recommendRequestIdRef.current) {
        return;
      }

      if (!result.ok) {
        if (result.error === "aborted") {
          return;
        }
        setComposerModuleIds([]);
        setComposerIntent("");
        setRecommendStatus("error");
        return;
      }

      setComposerModuleIds(result.moduleIds);
      setComposerIntent(result.moduleIds.length > 0 ? trimmed : "");
      setRecommendStatus(result.status);
    })();
  }

  /**
   * Debounced as-you-type recommend under the create composer.
   * Aborts in-flight requests when the draft changes again or the effect cleans up.
   */
  useEffect(() => {
    const trimmed: string = recommendDraft;

    clearRecommendTimer();

    if (trimmed.length < RECOMMEND_DRAFT_MIN_CHARS) {
      abortInFlightRecommend();
      recommendRequestIdRef.current += 1;
      setComposerModuleIds([]);
      setComposerIntent("");
      setRecommendStatus(trimmed.length === 0 ? "idle" : "too_short");
      return;
    }

    recommendTimerRef.current = window.setTimeout(() => {
      recommendTimerRef.current = null;
      runRecommendFetch(trimmed);
    }, RECOMMEND_DEBOUNCE_MS);

    return () => {
      clearRecommendTimer();
      abortInFlightRecommend();
      recommendRequestIdRef.current += 1;
    };
    // runRecommendFetch closes over locale/draft helpers; deps are the inputs that matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-fire on draft/locale
  }, [recommendDraft, locale]);

  /**
   * Immediately refreshes recommend for the current create intent (Enter / Send).
   * Keeps focus on the input. Never starts a coach chat.
   */
  function confirmCreateRecommend(): void {
    const trimmed: string = recommendDraft;

    clearRecommendTimer();

    if (trimmed.length < RECOMMEND_DRAFT_MIN_CHARS) {
      abortInFlightRecommend();
      recommendRequestIdRef.current += 1;
      setComposerModuleIds([]);
      setComposerIntent("");
      setRecommendStatus(trimmed.length === 0 ? "idle" : "too_short");
      inputRef.current?.focus();
      return;
    }

    runRecommendFetch(trimmed);
    inputRef.current?.focus();
  }

  /**
   * Form submit on create: confirm recommend only (no /api/chat).
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    confirmCreateRecommend();
  }

  /**
   * Enter confirms recommend (same as send); Shift+Enter keeps a newline.
   */
  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    handleComposerKeyDown(event, {
      isSending: isRecommendLoading,
      onSubmit: () => {
        confirmCreateRecommend();
      },
    });
  }

  const showVagueTip: boolean =
    recommendStatus === "vague" && composerModules.length === 0 && draft.trim().length > 0;
  const showLoadingTip: boolean = isRecommendLoading;
  const showErrorTip: boolean = recommendStatus === "error";
  const showTooShortTip: boolean =
    recommendStatus === "too_short" && draft.trim().length > 0;
  const canConfirm: boolean = draft.trim().length > 0;

  /**
   * Opens the Brand profile picker for a recommend card. Profile is optional.
   */
  function openToolPicker(moduleId: string, intent: string | undefined): void {
    setPendingTool({ moduleId, intent });
  }

  /**
   * Navigates to the pending tool with or without a Brand profile query.
   */
  function finishToolOpen(profileId: string | null): void {
    const pending: PendingToolOpen | null = pendingTool;
    setPendingTool(null);
    if (pending === null) {
      return;
    }
    if (profileId !== null) {
      void selectProfile(profileId);
    }
    router.push(
      buildToolHrefFromHome(
        pending.moduleId,
        pending.intent,
        profileId === null ? undefined : profileId,
      ),
    );
  }

  /**
   * Recommend cards under the create composer (2 to 4 tools).
   * Click opens the Brand profile picker instead of jumping straight in.
   */
  function renderRecommendBlock(): ReactNode {
    if (composerModules.length === 0) {
      return null;
    }

    return (
      <div className="recommend-block recommend-block-under-composer" aria-label={t("recommendTitle")}>
        <p className="recommend-title">{t("recommendTitle")}</p>
        <ul className="recommend-list">
          {composerModules.map((entry) => {
            const display = getModuleDisplay(entry, locale);
            const intentForLink: string | undefined =
              composerIntent.length > 0 ? composerIntent : undefined;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  className="recommend-card"
                  onClick={() => {
                    openToolPicker(entry.id, intentForLink);
                  }}
                >
                  <span className="recommend-card-text">
                    <span className="recommend-card-title">{display.title}</span>
                    <span className="recommend-card-meta">
                      {t(categoryMessageKey(entry.category))}
                    </span>
                  </span>
                  <span className="recommend-card-cta">{t("recommendOpen")}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  /**
   * Sentence-completion composer on the create landing.
   * Send confirms recommend; it does not open a chat transcript.
   */
  function renderCreateComposer(): ReactNode {
    const sendClassName: string = [
      "send",
      "send-create",
      canConfirm ? "send-pulse" : "",
      isRecommendLoading ? "send-create-loading" : "",
    ]
      .filter((part) => part.length > 0)
      .join(" ");

    return (
      <form className="composer composer-create" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="chat-input">
          {t("composerLabel")}
        </label>
        <span className="composer-prefix" aria-hidden="true">
          {createPrefix}
        </span>
        <textarea
          ref={inputRef}
          id="chat-input"
          className="input input-create"
          rows={1}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onComposerKeyDown}
          placeholder={t("composerPlaceholderCreate")}
          aria-busy={isRecommendLoading}
        />
        <button
          className={sendClassName}
          type="submit"
          disabled={!canConfirm || isRecommendLoading}
          aria-label={isRecommendLoading ? t("recommendLoading") : t("send")}
        >
          <SendPlaneIcon />
        </button>
      </form>
    );
  }

  return (
    <div className="shell shell-create">
      <HomeGlowBlobs />

      <div className="main">
        <section className="chat chat-create" aria-label={t("homeAsk")}>
          <div className="create-surface empty-state-enter">
            <h1 className="create-ask">{t("homeAsk")}</h1>
            {renderCreateComposer()}
            <p className="composer-under-tip create-tip">{t("homeComposerTip")}</p>
            {showLoadingTip ? (
              <p className="composer-under-tip composer-under-tip-loading" aria-live="polite">
                {t("recommendLoading")}
              </p>
            ) : null}
            {showErrorTip ? (
              <p className="composer-under-tip create-recommend-error" role="alert">
                {t("recommendError")}
              </p>
            ) : null}
            {showTooShortTip ? (
              <p className="composer-under-tip" role="status">
                {t("recommendTipTooShort")}
              </p>
            ) : null}
            {showVagueTip ? (
              <p className="composer-under-tip" role="status">
                {t("recommendTipVague")}
              </p>
            ) : null}
            {renderRecommendBlock()}
          </div>
        </section>
      </div>
      <BrandProfilePickModal
        open={pendingTool !== null}
        profiles={gateProfileList(brandGate)}
        lastActiveProfileId={gateLastActiveProfileId(brandGate)}
        loading={brandGate.kind === "loading"}
        actionError={actionError}
        onClose={() => {
          setPendingTool(null);
        }}
        onChoose={finishToolOpen}
      />
    </div>
  );
}
