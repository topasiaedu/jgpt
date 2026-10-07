"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

import type { BrandProfileSummary } from "@/lib/brandProfile/db";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type BrandProfilePickModalProps = {
  open: boolean;
  profiles: BrandProfileSummary[];
  lastActiveProfileId: string | null;
  loading: boolean;
  actionError: string | null;
  onClose: () => void;
  onChoose: (profileId: string | null) => void;
};

/**
 * Dark tool-entry picker: choose a Brand profile, open the Profile page, or continue without.
 * Profile is optional. last_active is preselected when it is still valid.
 */
export default function BrandProfilePickModal({
  open,
  profiles,
  lastActiveProfileId,
  loading,
  actionError,
  onClose,
  onChoose,
}: BrandProfilePickModalProps): ReactNode {
  const { t } = useI18n();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(lastActiveProfileId);

  useEffect(() => {
    if (!open) {
      return;
    }
    setSelectedId(lastActiveProfileId);
  }, [open, lastActiveProfileId]);

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

  const canUseSelected: boolean = selectedId !== null && !loading;

  return (
    <dialog
      ref={dialogRef}
      className="bp-pick-dialog"
      aria-labelledby={titleId}
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
      <div className="bp-pick-panel">
        <div className="bp-pick-top">
          <h2 id={titleId} className="bp-pick-title">
            {t("profileModalTitle")}
          </h2>
          <button
            type="button"
            className="bp-pick-close"
            onClick={onClose}
            aria-label={t("profileModalClose")}
          >
            {t("profileModalClose")}
          </button>
        </div>

        {actionError !== null ? (
          <p className="bp-pick-alert" role="alert">
            {actionError}
          </p>
        ) : null}

        {loading ? (
          <p className="bp-pick-muted" role="status">
            {t("profileModalLoading")}
          </p>
        ) : null}

        {!loading && profiles.length === 0 ? (
          <p className="bp-pick-muted">{t("profileModalEmpty")}</p>
        ) : null}

        {!loading && profiles.length > 0 ? (
          <div className="bp-pick-list" role="radiogroup" aria-labelledby={titleId}>
            {profiles.map((profile) => {
              const isActive: boolean = selectedId === profile.id;
              return (
                <label
                  key={profile.id}
                  className={isActive ? "bp-pick-option bp-pick-option-active" : "bp-pick-option"}
                >
                  <input
                    type="radio"
                    name="bp-pick-profile"
                    value={profile.id}
                    checked={isActive}
                    onChange={() => {
                      setSelectedId(profile.id);
                    }}
                  />
                  <span className="bp-pick-option-name">{profile.name}</span>
                </label>
              );
            })}
          </div>
        ) : null}

        <div className="bp-pick-actions">
          <button
            type="button"
            className="bp-pick-use"
            disabled={!canUseSelected}
            onClick={() => {
              if (selectedId === null) {
                return;
              }
              onChoose(selectedId);
            }}
          >
            {t("profileModalUse")}
          </button>
          <Link href="/brand-profiles" className="bp-pick-goto">
            {t("profileModalCreate")}
          </Link>
          <button
            type="button"
            className="bp-pick-skip"
            onClick={() => {
              onChoose(null);
            }}
          >
            {t("profileModalSkip")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
