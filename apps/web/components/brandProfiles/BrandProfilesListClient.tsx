"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AppNav from "@/components/AppNav";
import {
  deleteBrandProfile,
  fetchBrandProfiles,
  fetchUserPreferences,
  retargetLastActiveAfterDelete,
} from "@/lib/brandProfile/clientApi";
import type { BrandProfileSummary } from "@/lib/brandProfile/db";
import type { BrandProfileStructured } from "@/lib/brandProfile/types";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n/messages";
import { useAuthSession } from "@/lib/supabase/useAuthSession";

const CARD_PREVIEW_MAX_CHARS = 88;

type CardPreviewField = {
  key: keyof Pick<
    BrandProfileStructured,
    "whoTheyServe" | "whatTheySell" | "offerCta"
  >;
  labelKey: MessageKey;
};

const CARD_PREVIEW_FIELDS: CardPreviewField[] = [
  { key: "whoTheyServe", labelKey: "bpFieldWhoTheyServe" },
  { key: "whatTheySell", labelKey: "bpFieldWhatTheySell" },
  { key: "offerCta", labelKey: "bpFieldOfferCta" },
];

/**
 * Truncates a card preview line without using dash punctuation.
 */
function truncatePreview(value: string): string {
  const trimmed: string = value.trim();
  if (trimmed.length <= CARD_PREVIEW_MAX_CHARS) {
    return trimmed;
  }
  return `${trimmed.slice(0, CARD_PREVIEW_MAX_CHARS).trimEnd()}…`;
}

/**
 * Thin-line pencil icon for card edit action.
 */
function CardIconEdit() {
  return (
    <svg
      className="bp-card-icon-svg"
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12.6 3.9a1.65 1.65 0 0 1 2.33 2.33L6.7 14.46l-3.05.72.72-3.05L12.6 3.9Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M11.35 5.15l2.33 2.33"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Thin-line trash icon for card delete action.
 */
function CardIconDelete() {
  return (
    <svg
      className="bp-card-icon-svg"
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.25 6.25h11.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M7.5 6.25V4.9c0-.64.52-1.15 1.15-1.15h2.7c.63 0 1.15.51 1.15 1.15v1.35"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M6.6 6.25l.55 8.2c.06.77.7 1.35 1.47 1.35h3.76c.77 0 1.41-.58 1.47-1.35l.55-8.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Brand profiles index: header Create on the right, 3-column cards.
 * last_active is not shown here. Chat picks a profile in the modal.
 */
export default function BrandProfilesListClient() {
  const { t } = useI18n();
  const router = useRouter();
  const auth = useAuthSession();

  const [profiles, setProfiles] = useState<BrandProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.ready) {
      return;
    }
    if (auth.envMissing) {
      setLoading(false);
      setError(t("authEnvMissing"));
      return;
    }
    if (auth.user === null) {
      setLoading(false);
      router.replace(`/auth?next=${encodeURIComponent("/brand-profiles")}`);
      return;
    }

    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      const listResult = await fetchBrandProfiles();
      if (cancelled) {
        return;
      }
      if (!listResult.ok) {
        if (listResult.status === 401) {
          router.replace(`/auth?next=${encodeURIComponent("/brand-profiles")}`);
          return;
        }
        setError(listResult.error);
        setLoading(false);
        return;
      }
      setProfiles(listResult.profiles);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [auth.ready, auth.envMissing, auth.user, router, t]);

  /**
   * Confirms, deletes one profile, then retargets last_active for the picker only.
   */
  async function handleDelete(profile: BrandProfileSummary): Promise<void> {
    const confirmed: boolean = window.confirm(
      t("bpDeleteConfirm", { name: profile.name }),
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(profile.id);
    setError(null);
    const result = await deleteBrandProfile(profile.id);
    if (!result.ok) {
      setDeletingId(null);
      setError(result.error);
      return;
    }

    const remaining: BrandProfileSummary[] = profiles.filter(
      (item) => item.id !== profile.id,
    );
    setProfiles(remaining);

    const prefResult = await fetchUserPreferences();
    const lastActiveId: string | null = prefResult.ok
      ? prefResult.preferences.lastActiveProfileId
      : null;
    const retarget = await retargetLastActiveAfterDelete(
      profile.id,
      remaining,
      lastActiveId,
    );
    if (!retarget.ok) {
      setDeletingId(null);
      setError(retarget.error);
      return;
    }
    setDeletingId(null);
  }

  return (
    <div className="shell shell-studio shell-studio-bp shell-studio-bp-list">
      <header className="header header-create">
        <AppNav active="brandProfiles" />
        <div className="bp-page-head">
          <div className="bp-page-head-copy">
            <h1 className="studio-title">{t("bpListTitle")}</h1>
            <p className="studio-subtitle bp-list-subtitle">{t("bpListSubtitle")}</p>
          </div>
          <Link href="/brand-profiles/new" className="send bp-page-head-create">
            {t("bpCreateCta")}
          </Link>
        </div>
      </header>

      <main className="studio-main bp-list-main-air">
        {error !== null ? <p className="error">{error}</p> : null}

        {loading ? <p className="account-muted">{t("bpLoading")}</p> : null}

        {!loading && auth.user !== null && profiles.length === 0 ? (
          <section className="bp-list-empty" aria-labelledby="bp-empty-title">
            <h2 id="bp-empty-title" className="bp-list-empty-title">
              {t("bpEmptyTitle")}
            </h2>
            <p className="account-muted">{t("bpEmptyBody")}</p>
          </section>
        ) : null}

        {!loading && auth.user !== null && profiles.length > 0 ? (
          <ul className="bp-card-grid">
            {profiles.map((profile) => {
              const editHref: string = `/brand-profiles/${profile.id}`;
              return (
                <li key={profile.id} className="bp-card">
                  <div className="bp-card-head">
                    <Link href={editHref} className="bp-card-name-link">
                      <h2 className="bp-card-name">{profile.name}</h2>
                    </Link>
                    <div className="bp-card-actions">
                      <Link
                        href={editHref}
                        className="bp-card-icon-btn bp-card-edit"
                        aria-label={t("bpOpenEdit")}
                        title={t("bpOpenEdit")}
                      >
                        <CardIconEdit />
                      </Link>
                      <button
                        type="button"
                        className="bp-card-icon-btn bp-list-delete"
                        aria-label={
                          deletingId === profile.id
                            ? t("bpDeleting")
                            : t("bpDeleteShort")
                        }
                        title={
                          deletingId === profile.id
                            ? t("bpDeleting")
                            : t("bpDeleteShort")
                        }
                        disabled={deletingId !== null}
                        onClick={() => {
                          void handleDelete(profile);
                        }}
                      >
                        <CardIconDelete />
                      </button>
                    </div>
                  </div>
                  <Link href={editHref} className="bp-card-main">
                    <dl className="bp-card-fields">
                      {CARD_PREVIEW_FIELDS.map((field) => {
                        const raw: string = profile.structured[field.key];
                        const filled: boolean = raw.trim().length > 0;
                        return (
                          <div key={field.key} className="bp-card-field">
                            <dt>{t(field.labelKey)}</dt>
                            <dd
                              className={
                                filled ? "bp-card-field-value" : "bp-card-field-empty"
                              }
                            >
                              {filled ? truncatePreview(raw) : t("bpCardEmpty")}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </main>
    </div>
  );
}
