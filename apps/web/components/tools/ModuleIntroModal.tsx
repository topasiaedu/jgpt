"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import type { ChangeEvent } from "react";

import { useI18n } from "@/lib/i18n/LocaleProvider";
import { categoryMessageKey } from "@/lib/i18n/messages";
import { getModuleStatus } from "@/lib/modules/catalog";
import {
  getModuleDisplay,
  parseIntroSections,
} from "@/lib/modules/moduleDisplay";
import type { ModuleDefinition } from "@/lib/modules/types";

const SKIP_INTRO_PREFIX = "jeff-ip-module-skip-intro:";

type ModuleIntroModalProps = {
  module: ModuleDefinition;
  open: boolean;
  skipChecked: boolean;
  onSkipCheckedChange: (checked: boolean) => void;
  onClose: () => void;
  onStart: () => void;
};

type IntroSections = {
  job: string;
  bring: string;
  get: string;
};

/**
 * Short coach intro: job · bring this · you get this · Start.
 * Shown only when the user opens intro on demand (never auto on land).
 * Skip preference remembered per module id (ignored for auto-show; there is none).
 */
export default function ModuleIntroModal({
  module,
  open,
  skipChecked,
  onSkipCheckedChange,
  onClose,
  onStart,
}: ModuleIntroModalProps) {
  const { t, locale } = useI18n();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const status = getModuleStatus(module);
  const isReady = status === "ready";
  const display = getModuleDisplay(module, locale);

  const sections: IntroSections = useMemo(
    () => parseIntroSections(display.description),
    [display.description],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) {
      return;
    }

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className="module-intro-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className="module-intro-panel">
        <div className="module-intro-top">
          <p className="module-intro-category">{t(categoryMessageKey(module.category))}</p>
          <button
            type="button"
            className="module-intro-close"
            onClick={onClose}
            aria-label={t("introClose")}
          >
            {t("introClose")}
          </button>
        </div>
        <h2 id={titleId} className="module-intro-title">
          {display.title}
        </h2>
        <div id={descriptionId} className="module-intro-description module-intro-description-short">
          <div className="module-intro-block">
            <p className="module-intro-label">{t("introJobLabel")}</p>
            <p>{sections.job}</p>
          </div>
          <div className="module-intro-block">
            <p className="module-intro-label">{t("introBringLabel")}</p>
            <p>{sections.bring}</p>
          </div>
          <div className="module-intro-block">
            <p className="module-intro-label">{t("introGetLabel")}</p>
            <p>{sections.get}</p>
          </div>
        </div>
        <label className="module-intro-skip">
          <input
            type="checkbox"
            checked={skipChecked}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              onSkipCheckedChange(event.target.checked);
            }}
          />
          <span>{t("introSkip")}</span>
        </label>
        <div className="module-intro-actions">
          {isReady ? (
            <button type="button" className="module-intro-start" onClick={onStart}>
              {t("introStart")}
            </button>
          ) : (
            <button type="button" className="module-intro-start" disabled>
              {t("introComingSoon")}
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}

/**
 * localStorage key for skipping intro for a given module id.
 */
export function skipIntroStorageKey(moduleId: string): string {
  return `${SKIP_INTRO_PREFIX}${moduleId}`;
}

/**
 * Reads whether the user asked to skip the intro for this module.
 */
export function readSkipIntro(moduleId: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return window.localStorage.getItem(skipIntroStorageKey(moduleId)) === "1";
  } catch {
    return false;
  }
}

/**
 * Persists skip-intro preference for a module.
 */
export function writeSkipIntro(moduleId: string, skip: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const key = skipIntroStorageKey(moduleId);
    if (skip) {
      window.localStorage.setItem(key, "1");
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore quota / private-mode failures; modal still works per session.
  }
}

