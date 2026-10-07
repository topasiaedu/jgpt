"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import AppNav from "@/components/AppNav";
import {
  createBrandProfile,
  deleteBrandProfile,
  fetchBrandProfile,
  fetchBrandProfiles,
  fetchUserPreferences,
  retargetLastActiveAfterDelete,
  saveLastActiveProfileId,
  updateBrandProfile,
} from "@/lib/brandProfile/clientApi";
import {
  ACTIVE_BRIEF_MAX_CHARS,
  EMPTY_BRAND_PROFILE_STRUCTURED,
  type BrandProfileStructured,
} from "@/lib/brandProfile/types";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n/messages";
import { useAuthSession } from "@/lib/supabase/useAuthSession";

/** Docs panel (upload/paste) loads only on edit routes after the form shell paints. */
const BrandDocumentsPanel = dynamic(
  () => import("@/components/brandProfiles/BrandDocumentsPanel"),
  {
    ssr: false,
    loading: () => (
      <div className="bp-docs-panel bp-docs-panel-loading" aria-busy="true" />
    ),
  },
);

export type BrandProfileFormProps =
  | { mode: "create" }
  | { mode: "edit"; profileId: string };

type StructuredFieldKey = keyof BrandProfileStructured;

const STRUCTURED_FIELDS: Array<{
  key: StructuredFieldKey;
  labelKey: MessageKey;
  hintKey: MessageKey;
}> = [
  { key: "businessName", labelKey: "bpFieldBusinessName", hintKey: "bpHintBusinessName" },
  { key: "whatTheySell", labelKey: "bpFieldWhatTheySell", hintKey: "bpHintWhatTheySell" },
  { key: "whoTheyServe", labelKey: "bpFieldWhoTheyServe", hintKey: "bpHintWhoTheyServe" },
  {
    key: "founderRoleFace",
    labelKey: "bpFieldFounderRoleFace",
    hintKey: "bpHintFounderRoleFace",
  },
  { key: "stance", labelKey: "bpFieldStance", hintKey: "bpHintStance" },
  {
    key: "proofCredentials",
    labelKey: "bpFieldProofCredentials",
    hintKey: "bpHintProofCredentials",
  },
  { key: "offerCta", labelKey: "bpFieldOfferCta", hintKey: "bpHintOfferCta" },
  { key: "toneNotes", labelKey: "bpFieldToneNotes", hintKey: "bpHintToneNotes" },
  { key: "doNotSay", labelKey: "bpFieldDoNotSay", hintKey: "bpHintDoNotSay" },
];

/**
 * Create or edit one Brand profile: name, structured fields, active brief.
 * Documents stay on edit only, because upload needs a saved id.
 */
export default function BrandProfileEditClient(props: BrandProfileFormProps) {
  const isCreate: boolean = props.mode === "create";
  const profileId: string | null = props.mode === "edit" ? props.profileId : null;
  const authNextPath: string =
    profileId === null
      ? "/brand-profiles/new"
      : `/brand-profiles/${profileId}`;

  const { t } = useI18n();
  const router = useRouter();
  const auth = useAuthSession();

  const [name, setName] = useState("");
  const [structured, setStructured] = useState<BrandProfileStructured>({
    ...EMPTY_BRAND_PROFILE_STRUCTURED,
  });
  const [activeBrief, setActiveBrief] = useState("");
  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);

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
      router.replace(`/auth?next=${encodeURIComponent(authNextPath)}`);
      return;
    }

    if (isCreate || profileId === null) {
      setLoading(false);
      return;
    }

    const editId: string = profileId;
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      const result = await fetchBrandProfile(editId);
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        if (result.status === 401) {
          router.replace(`/auth?next=${encodeURIComponent(authNextPath)}`);
          return;
        }
        setError(result.error);
        setLoading(false);
        return;
      }
      setName(result.profile.name);
      setStructured(result.profile.structured);
      setActiveBrief(result.profile.activeBrief);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [auth.ready, auth.envMissing, auth.user, authNextPath, isCreate, profileId, router, t]);

  /**
   * Create: POST name + structured + brief, then open the saved profile.
   * Edit: PATCH the same fields.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setSavedNote(null);

    const trimmedName: string = name.trim();
    if (trimmedName.length === 0) {
      setError(t("bpNameRequired"));
      return;
    }
    if (activeBrief.trim().length > ACTIVE_BRIEF_MAX_CHARS) {
      setError(t("bpBriefTooLong"));
      return;
    }

    setSaving(true);

    if (isCreate || profileId === null) {
      const created = await createBrandProfile(trimmedName, {
        structured,
        activeBrief: activeBrief.trim(),
      });
      setSaving(false);
      if (!created.ok) {
        if (created.status === 401) {
          router.replace(`/auth?next=${encodeURIComponent(authNextPath)}`);
          return;
        }
        setError(created.error);
        return;
      }
      await saveLastActiveProfileId(created.profile.id);
      router.push(`/brand-profiles/${created.profile.id}`);
      return;
    }

    const result = await updateBrandProfile(profileId, {
      name: trimmedName,
      structured,
      activeBrief: activeBrief.trim(),
    });
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setName(result.profile.name);
    setStructured(result.profile.structured);
    setActiveBrief(result.profile.activeBrief);
    setSavedNote(t("bpSaved"));
  }

  /**
   * Deletes the profile after named confirm, retargets last_active, then
   * returns to the list (empty list is valid).
   */
  async function handleDelete(): Promise<void> {
    if (profileId === null) {
      return;
    }
    const confirmName: string = name.trim();
    const confirmed: boolean = window.confirm(
      t("bpDeleteConfirm", {
        name: confirmName.length > 0 ? confirmName : t("bpEditTitle"),
      }),
    );
    if (!confirmed) {
      return;
    }
    setDeleting(true);
    setError(null);

    const prefResult = await fetchUserPreferences();
    const lastActiveId: string | null = prefResult.ok
      ? prefResult.preferences.lastActiveProfileId
      : null;

    const result = await deleteBrandProfile(profileId);
    if (!result.ok) {
      setDeleting(false);
      setError(result.error);
      return;
    }

    const listResult = await fetchBrandProfiles();
    if (listResult.ok) {
      await retargetLastActiveAfterDelete(
        profileId,
        listResult.profiles,
        lastActiveId,
      );
    }

    router.replace("/brand-profiles");
  }

  /**
   * Updates one structured field in local form state.
   */
  function updateStructuredField(
    key: StructuredFieldKey,
    value: string,
  ): void {
    setStructured((prev) => ({ ...prev, [key]: value }));
  }

  const nameFieldId: string = isCreate ? "bp-create-name" : "bp-edit-name";
  const briefFieldId: string = isCreate ? "bp-create-brief" : "bp-active-brief";

  return (
    <div className="shell shell-studio shell-studio-bp">
      <header className="header header-create">
        <AppNav active="brandProfiles" />
        <p className="tools-back bp-form-back">
          <Link href="/brand-profiles" className="tools-back-link">
            {t("bpBackToList")}
          </Link>
        </p>
        <h1 className="studio-title">
          {isCreate ? t("bpCreateTitle") : t("bpEditTitle")}
        </h1>
        <p className="studio-subtitle bp-list-subtitle">
          {isCreate ? t("bpCreatePageSubtitle") : t("bpEditSubtitle")}
        </p>
      </header>

      <main className="studio-main">
        {error !== null ? <p className="error">{error}</p> : null}
        {savedNote !== null ? <p className="account-info">{savedNote}</p> : null}
        {loading ? <p className="account-muted">{t("bpLoading")}</p> : null}

        {!loading && auth.user !== null ? (
          <form
            className="account-form bp-edit-form"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <section className="account-panel">
              <label className="account-label" htmlFor={nameFieldId}>
                {t("bpNameLabel")}
              </label>
              <input
                id={nameFieldId}
                className="input account-input"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                }}
                placeholder={t("bpNamePlaceholder")}
                maxLength={120}
                required
              />
              {!isCreate ? (
                <div className="bp-edit-toolbar">
                  <button
                    type="button"
                    className="account-danger-btn"
                    disabled={deleting}
                    onClick={() => {
                      void handleDelete();
                    }}
                  >
                    {deleting ? t("bpDeleting") : t("bpDelete")}
                  </button>
                </div>
              ) : null}
            </section>

            <section className="account-panel" aria-labelledby="bp-structured-title">
              <h2 id="bp-structured-title" className="account-panel-title">
                {t("bpStructuredTitle")}
              </h2>
              <p className="account-muted">{t("bpStructuredHint")}</p>
              <div className="bp-field-grid">
                {STRUCTURED_FIELDS.map((field) => (
                  <div key={field.key} className="bp-field">
                    <label className="account-label" htmlFor={`bp-field-${field.key}`}>
                      {t(field.labelKey)}
                    </label>
                    <p className="bp-field-hint">{t(field.hintKey)}</p>
                    <textarea
                      id={`bp-field-${field.key}`}
                      className="input account-textarea"
                      rows={field.key === "doNotSay" || field.key === "toneNotes" ? 3 : 2}
                      value={structured[field.key]}
                      onChange={(event) => {
                        updateStructuredField(field.key, event.target.value);
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="account-panel" aria-labelledby="bp-brief-title">
              <h2 id="bp-brief-title" className="account-panel-title">
                {t("bpBriefTitle")}
              </h2>
              <p className="account-muted">{t("bpBriefHint")}</p>
              <textarea
                id={briefFieldId}
                className="input account-textarea"
                rows={8}
                value={activeBrief}
                maxLength={ACTIVE_BRIEF_MAX_CHARS}
                onChange={(event) => {
                  setActiveBrief(event.target.value);
                }}
              />
              <p className="account-muted">
                {t("bpBriefCount", { n: activeBrief.trim().length })}
              </p>
            </section>

            {!isCreate && profileId !== null ? (
              <BrandDocumentsPanel
                profileId={profileId}
                onProfileUpdated={(update) => {
                  setStructured(update.structured);
                  setActiveBrief(update.activeBrief);
                  setSavedNote(t("bpDocsBriefUpdated"));
                }}
              />
            ) : null}

            {isCreate ? (
              <p className="account-muted">{t("bpCreateDocsLater")}</p>
            ) : null}

            <button type="submit" className="send account-submit" disabled={saving}>
              {isCreate
                ? saving
                  ? t("bpCreating")
                  : t("bpCreateSubmit")
                : saving
                  ? t("bpSaving")
                  : t("bpSave")}
            </button>
          </form>
        ) : null}
      </main>
    </div>
  );
}
