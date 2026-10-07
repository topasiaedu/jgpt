"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type TextareaHTMLAttributes,
} from "react";

import BrandDocumentsPanel, {
  type BrandDocumentsPanelHandle,
} from "@/components/brandProfiles/BrandDocumentsPanel";
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
  EMPTY_BRAND_PROFILE_STRUCTURED,
  type BrandProfileStructured,
} from "@/lib/brandProfile/types";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n/messages";
import { useAuthSession } from "@/lib/supabase/useAuthSession";

export type BrandProfileFormProps =
  | { mode: "create" }
  | { mode: "edit"; profileId: string };

type FormFieldKey = Exclude<
  keyof BrandProfileStructured,
  "offerCta" | "founderRoleFace"
>;

const FORM_FIELDS: Array<{
  key: FormFieldKey;
  labelKey: MessageKey;
  hintKey: MessageKey;
  /** Short one-line style field (public brand name). */
  short?: boolean;
}> = [
  {
    key: "businessName",
    labelKey: "bpFieldBusinessName",
    hintKey: "bpHintBusinessName",
    short: true,
  },
  { key: "whoTheyServe", labelKey: "bpFieldWhoTheyServe", hintKey: "bpHintWhoTheyServe" },
  { key: "whatTheySell", labelKey: "bpFieldWhatTheySell", hintKey: "bpHintWhatTheySell" },
  { key: "stance", labelKey: "bpFieldStance", hintKey: "bpHintStance" },
  {
    key: "proofCredentials",
    labelKey: "bpFieldProofCredentials",
    hintKey: "bpHintProofCredentials",
  },
  { key: "toneNotes", labelKey: "bpFieldToneNotes", hintKey: "bpHintToneNotes" },
  { key: "doNotSay", labelKey: "bpFieldDoNotSay", hintKey: "bpHintDoNotSay" },
];

type AutoGrowTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "rows"
> & {
  /** Extra class for short vs long field sizing. */
  sizingClassName: string;
};

/**
 * Textarea that grows with its content so filled copy is never clipped mid-line.
 */
function AutoGrowTextarea({
  sizingClassName,
  value,
  className,
  onChange,
  ...rest
}: AutoGrowTextareaProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  /**
   * Sets height from scrollHeight after resetting to auto so shrink also works.
   */
  function syncHeight(): void {
    const el: HTMLTextAreaElement | null = ref.current;
    if (el === null) {
      return;
    }
    el.style.height = "auto";
    el.style.height = `${String(el.scrollHeight)}px`;
  }

  useEffect(() => {
    syncHeight();
  }, [value]);

  return (
    <textarea
      {...rest}
      ref={ref}
      value={value}
      rows={1}
      className={`${className ?? ""} ${sizingClassName}`.trim()}
      onChange={(event) => {
        onChange?.(event);
        requestAnimationFrame(() => {
          syncHeight();
        });
      }}
    />
  );
}

/**
 * Create or edit one Brand profile: name, brand facts, and documents on the
 * same page. Create queues files until save, then uploads in place.
 * Chat brief (active_brief) is filled by upload summarize, not a form field.
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
  const docsRef = useRef<BrandDocumentsPanelHandle | null>(null);

  const [name, setName] = useState("");
  const [structured, setStructured] = useState<BrandProfileStructured>({
    ...EMPTY_BRAND_PROFILE_STRUCTURED,
  });
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
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [auth.ready, auth.envMissing, auth.user, authNextPath, isCreate, profileId, router, t]);

  /**
   * Create: POST profile, flush queued docs on this page, then open edit URL.
   * Edit: PATCH name + facts only (active_brief stays server-side from summarize).
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

    setSaving(true);

    if (isCreate || profileId === null) {
      const created = await createBrandProfile(trimmedName, {
        structured,
      });
      if (!created.ok) {
        setSaving(false);
        if (created.status === 401) {
          router.replace(`/auth?next=${encodeURIComponent(authNextPath)}`);
          return;
        }
        setError(created.error);
        return;
      }

      await saveLastActiveProfileId(created.profile.id);

      const docsHandle: BrandDocumentsPanelHandle | null = docsRef.current;
      if (docsHandle !== null && docsHandle.hasDrafts()) {
        setSavedNote(t("bpDocsUploadingDrafts"));
        const flushed = await docsHandle.flushDrafts(created.profile.id);
        if (!flushed.ok) {
          setSaving(false);
          setError(flushed.error);
          setSavedNote(null);
          router.replace(`/brand-profiles/${created.profile.id}`);
          return;
        }
      }

      setSaving(false);
      router.replace(`/brand-profiles/${created.profile.id}`);
      return;
    }

    const result = await updateBrandProfile(profileId, {
      name: trimmedName,
      structured,
    });
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setName(result.profile.name);
    setStructured(result.profile.structured);
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
   * Updates one editable fact field in local form state.
   */
  function updateFormField(key: FormFieldKey, value: string): void {
    setStructured((prev) => ({ ...prev, [key]: value }));
  }

  const nameFieldId: string = isCreate ? "bp-create-name" : "bp-edit-name";

  return (
    <div className="shell shell-studio shell-studio-bp">
      <header className="header header-create">
        <p className="tools-back bp-form-back">
          <Link href="/brand-profiles" className="tools-back-link bp-form-back-link">
            <span className="bp-form-back-arrow" aria-hidden="true">
              ←
            </span>
            <span>{t("bpBackToList")}</span>
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
            <section className="bp-edit-identity">
              <label className="account-label" htmlFor={nameFieldId}>
                {t("bpNameLabel")}
              </label>
              <input
                id={nameFieldId}
                className="input account-input bp-edit-name-input"
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

            <section className="bp-facts-section" aria-labelledby="bp-facts-title">
              <header className="bp-section-head">
                <h2 id="bp-facts-title" className="account-panel-title">
                  {t("bpStructuredTitle")}
                </h2>
                <p className="account-muted bp-section-lede">
                  {t("bpStructuredHint")}
                </p>
              </header>
              <div className="bp-field-stack">
                {FORM_FIELDS.map((field) => (
                  <div
                    key={field.key}
                    className={
                      field.short === true ? "bp-field bp-field-short" : "bp-field"
                    }
                  >
                    <label
                      className="account-label bp-field-label"
                      htmlFor={`bp-field-${field.key}`}
                    >
                      {t(field.labelKey)}
                    </label>
                    <p className="bp-field-hint">{t(field.hintKey)}</p>
                    <AutoGrowTextarea
                      id={`bp-field-${field.key}`}
                      className="input account-textarea bp-field-textarea"
                      sizingClassName={
                        field.short === true
                          ? "bp-field-textarea-short"
                          : "bp-field-textarea-long"
                      }
                      value={structured[field.key]}
                      onChange={(event) => {
                        updateFormField(field.key, event.target.value);
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>

            <div className="bp-materials-block">
              <BrandDocumentsPanel
                ref={docsRef}
                profileId={profileId}
                disabled={saving || deleting}
                onProfileUpdated={(update) => {
                  setStructured(update.structured);
                  setSavedNote(t("bpDocsBriefUpdated"));
                }}
              />
            </div>

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
