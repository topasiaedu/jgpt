"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import type { BrandAssetDto } from "@/lib/brandProfile/assetsDb";
import {
  deleteBrandAsset,
  fetchBrandAssets,
  fetchBrandProfile,
  processBrandAsset,
  resummarizeBrandProfileClient,
  uploadBrandAsset,
} from "@/lib/brandProfile/clientApi";
import type { BrandProfileStructured } from "@/lib/brandProfile/types";
import {
  BRAND_ASSET_EMPTY_PLAIN_TEXT_ERROR,
  BRAND_ASSET_EMPTY_PLAIN_TEXT_UPLOAD_ERROR,
  BRAND_ASSET_MAX_BYTES,
  BRAND_ASSET_NO_TEXT_ERROR,
  BRAND_PROFILE_MAX_ASSETS,
} from "@/lib/brandProfile/types";
import { useI18n } from "@/lib/i18n/LocaleProvider";

/**
 * Maps known server ingest errors to locale copy. Falls back to the raw string.
 */
function localizeDocsError(
  message: string,
  translate: (
    key:
      | "bpDocsNoTextError"
      | "bpDocsEmptyPlainTextError"
      | "bpDocsEmptyPlainTextUploadError",
  ) => string,
): string {
  const trimmed: string = message.trim();
  if (trimmed === BRAND_ASSET_EMPTY_PLAIN_TEXT_UPLOAD_ERROR) {
    return translate("bpDocsEmptyPlainTextUploadError");
  }
  if (trimmed === BRAND_ASSET_EMPTY_PLAIN_TEXT_ERROR) {
    return translate("bpDocsEmptyPlainTextError");
  }
  if (
    trimmed === BRAND_ASSET_NO_TEXT_ERROR ||
    trimmed === "No text could be extracted from this document." ||
    trimmed === "Document produced no chunks after extraction."
  ) {
    return translate("bpDocsNoTextError");
  }
  return message;
}

type BrandDocumentsPanelProps = {
  /** Null on create: queue files locally until the parent flushes after save. */
  profileId: string | null;
  onProfileUpdated: (update: {
    activeBrief: string;
    structured: BrandProfileStructured;
  }) => void;
  /** Disables pickers while the parent is creating/saving. */
  disabled?: boolean;
};

export type BrandDocumentsPanelHandle = {
  /** True when create-mode has queued files. */
  hasDrafts: () => boolean;
  /**
   * Uploads queued drafts to a newly created profile, then processes each.
   * No-op when there is nothing queued.
   */
  flushDrafts: (
    targetProfileId: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
};

/**
 * Documents UI: upload PDF/PPTX/txt/md, list status, delete, re-summarize.
 * On create (no profileId), files stay queued until flushDrafts runs.
 */
const BrandDocumentsPanel = forwardRef<
  BrandDocumentsPanelHandle,
  BrandDocumentsPanelProps
>(function BrandDocumentsPanel(
  { profileId, onProfileUpdated, disabled = false },
  ref,
) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [assets, setAssets] = useState<BrandAssetDto[]>([]);
  const [loading, setLoading] = useState(profileId !== null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [draftFiles, setDraftFiles] = useState<File[]>([]);

  const controlsLocked: boolean = busy || disabled;
  const isDraftMode: boolean = profileId === null;

  /**
   * Loads the asset list for a saved profile.
   */
  async function reloadAssets(targetId: string): Promise<void> {
    const result = await fetchBrandAssets(targetId);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAssets(result.assets);
  }

  useEffect(() => {
    if (profileId === null) {
      setAssets([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load(activeId: string): Promise<void> {
      setLoading(true);
      setError(null);
      const result = await fetchBrandAssets(activeId);
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }
      setAssets(result.assets);
      setLoading(false);
    }

    void load(profileId);
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  useImperativeHandle(
    ref,
    () => ({
      hasDrafts: (): boolean => draftFiles.length > 0,
      flushDrafts: async (
        targetProfileId: string,
      ): Promise<{ ok: true } | { ok: false; error: string }> => {
        if (draftFiles.length === 0) {
          return { ok: true };
        }

        setBusy(true);
        setError(null);
        setNote(t("bpDocsProcessing"));

        const filesToUpload: File[] = [...draftFiles];
        let lastError: string | null = null;

        for (const file of filesToUpload) {
          const uploaded = await uploadBrandAsset(targetProfileId, file);
          if (!uploaded.ok) {
            lastError = uploaded.error;
            break;
          }
          const processed = await processBrandAsset(
            targetProfileId,
            uploaded.asset.id,
          );
          if (!processed.ok) {
            lastError = processed.error;
            break;
          }
        }

        await reloadAssets(targetProfileId);

        const profileRefresh = await fetchBrandProfile(targetProfileId);
        if (profileRefresh.ok) {
          onProfileUpdated({
            activeBrief: profileRefresh.profile.activeBrief,
            structured: profileRefresh.profile.structured,
          });
        }

        if (lastError !== null) {
          const localized: string = localizeDocsError(lastError, t);
          setError(localized);
          setNote(null);
          setBusy(false);
          return { ok: false, error: localized };
        }

        setDraftFiles([]);
        setNote(t("bpDocsReady"));
        setBusy(false);
        return { ok: true };
      },
    }),
    [draftFiles, onProfileUpdated, t],
  );

  /**
   * Creates a pending asset then runs process; refreshes list + parent brief.
   */
  async function createAndProcess(
    targetId: string,
    create: () => Promise<
      { ok: true; asset: BrandAssetDto } | { ok: false; error: string }
    >,
  ): Promise<void> {
    setBusy(true);
    setError(null);
    setNote(null);

    const created = await create();
    if (!created.ok) {
      setError(localizeDocsError(created.error, t));
      setBusy(false);
      return;
    }

    setAssets((prev) => [created.asset, ...prev]);
    setNote(t("bpDocsProcessing"));

    const processed = await processBrandAsset(targetId, created.asset.id);
    if (!processed.ok) {
      setError(localizeDocsError(processed.error, t));
      await reloadAssets(targetId);
      setBusy(false);
      return;
    }

    await reloadAssets(targetId);

    const profileRefresh = await fetchBrandProfile(targetId);
    if (profileRefresh.ok) {
      onProfileUpdated({
        activeBrief: profileRefresh.profile.activeBrief,
        structured: profileRefresh.profile.structured,
      });
    }

    setNote(t("bpDocsReady"));
    setBusy(false);
  }

  /**
   * Queues a file on create, or uploads immediately on edit.
   */
  async function handleFileSelected(
    fileList: FileList | null,
  ): Promise<void> {
    if (fileList === null || fileList.length === 0) {
      return;
    }
    const file: File | undefined = fileList[0];
    if (file === undefined) {
      return;
    }
    setError(null);
    if (file.size > BRAND_ASSET_MAX_BYTES) {
      setError(t("bpDocsFileTooLarge"));
      return;
    }

    const existingCount: number = isDraftMode
      ? draftFiles.length
      : assets.length;
    if (existingCount >= BRAND_PROFILE_MAX_ASSETS) {
      setError(t("bpDocsTooMany"));
      return;
    }

    if (isDraftMode || profileId === null) {
      setError(null);
      setNote(null);
      setDraftFiles((prev) => [...prev, file]);
      if (fileInputRef.current !== null) {
        fileInputRef.current.value = "";
      }
      return;
    }

    await createAndProcess(profileId, () => uploadBrandAsset(profileId, file));
    if (fileInputRef.current !== null) {
      fileInputRef.current.value = "";
    }
  }

  /**
   * Deletes one saved asset after confirm.
   */
  async function handleDelete(assetId: string): Promise<void> {
    if (profileId === null) {
      return;
    }
    const confirmed: boolean = window.confirm(t("bpDocsDeleteConfirm"));
    if (!confirmed) {
      return;
    }
    setBusy(true);
    setError(null);
    const result = await deleteBrandAsset(profileId, assetId);
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
    setNote(t("bpDocsDeleted"));
    setBusy(false);
  }

  /**
   * Retries process on a failed/pending asset.
   */
  async function handleRetry(assetId: string): Promise<void> {
    if (profileId === null) {
      return;
    }
    setBusy(true);
    setError(null);
    setNote(t("bpDocsProcessing"));
    const processed = await processBrandAsset(profileId, assetId);
    if (!processed.ok) {
      setError(localizeDocsError(processed.error, t));
      await reloadAssets(profileId);
      setBusy(false);
      return;
    }
    await reloadAssets(profileId);
    const profileRefresh = await fetchBrandProfile(profileId);
    if (profileRefresh.ok) {
      onProfileUpdated({
        activeBrief: profileRefresh.profile.activeBrief,
        structured: profileRefresh.profile.structured,
      });
    }
    setNote(t("bpDocsReady"));
    setBusy(false);
  }

  /**
   * Rebuilds brief from ready assets + current structured fields.
   */
  async function handleResummarize(): Promise<void> {
    if (profileId === null) {
      return;
    }
    setBusy(true);
    setError(null);
    setNote(null);
    const result = await resummarizeBrandProfileClient(profileId);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onProfileUpdated({
      activeBrief: result.result.activeBrief,
      structured: result.result.structured,
    });
    setNote(t("bpDocsResummarized"));
  }

  /**
   * Local status label for an asset row.
   */
  function statusLabel(status: BrandAssetDto["status"]): string {
    if (status === "pending") {
      return t("bpDocsStatusPending");
    }
    if (status === "ready") {
      return t("bpDocsStatusReady");
    }
    return t("bpDocsStatusFailed");
  }

  return (
    <section className="account-panel" aria-labelledby="bp-docs-title">
      <h2 id="bp-docs-title" className="account-panel-title">
        {t("bpDocsTitle")}
      </h2>
      <p className="account-muted">
        {isDraftMode ? t("bpDocsDraftHint") : t("bpDocsHint")}
      </p>

      {error !== null ? <p className="error">{error}</p> : null}
      {note !== null ? <p className="account-info">{note}</p> : null}

      <div className="bp-docs-actions">
        <label className="account-secondary-btn bp-docs-file-label">
          {busy ? t("bpDocsUploading") : t("bpDocsUploadCta")}
          <input
            ref={fileInputRef}
            className="bp-docs-file-input"
            type="file"
            accept=".pdf,.pptx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/markdown"
            disabled={controlsLocked}
            onChange={(event) => {
              void handleFileSelected(event.target.files);
            }}
          />
        </label>
        {!isDraftMode ? (
          <button
            type="button"
            className="account-secondary-btn"
            disabled={controlsLocked}
            onClick={() => {
              void handleResummarize();
            }}
          >
            {t("bpDocsResummarize")}
          </button>
        ) : null}
      </div>
      <p className="account-muted">{t("bpDocsQuotaHint")}</p>

      {isDraftMode && draftFiles.length > 0 ? (
        <ul className="bp-docs-list">
          {draftFiles.map((file, index) => (
            <li
              key={`draft-file-${file.name}-${file.size}-${index}`}
              className="bp-docs-item"
            >
              <div className="bp-docs-item-main">
                <p className="bp-docs-item-name">{file.name}</p>
                <p className="bp-docs-item-meta">{t("bpDocsDraftQueued")}</p>
              </div>
              <div className="bp-docs-item-actions">
                <button
                  type="button"
                  className="account-danger-btn"
                  disabled={controlsLocked}
                  onClick={() => {
                    setDraftFiles((prev) =>
                      prev.filter((_, fileIndex) => fileIndex !== index),
                    );
                  }}
                >
                  {t("bpDocsDraftRemove")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {!isDraftMode && loading ? (
        <p className="account-muted">{t("bpDocsLoading")}</p>
      ) : null}

      {!isDraftMode && !loading && assets.length === 0 ? (
        <p className="account-muted">{t("bpDocsEmpty")}</p>
      ) : null}

      {!isDraftMode && !loading && assets.length > 0 ? (
        <ul className="bp-docs-list">
          {assets.map((asset) => (
            <li key={asset.id} className="bp-docs-item">
              <div className="bp-docs-item-main">
                <p className="bp-docs-item-name">
                  {asset.fileName ?? t("bpDocsUntitled")}
                </p>
                <p className="bp-docs-item-meta">
                  {asset.kind} ·{" "}
                  <span
                    className={`bp-docs-status bp-docs-status-${asset.status}`}
                  >
                    {statusLabel(asset.status)}
                  </span>
                </p>
                {asset.errorMessage !== null && asset.status === "failed" ? (
                  <p className="bp-docs-item-error">
                    {localizeDocsError(asset.errorMessage, t)}
                  </p>
                ) : null}
              </div>
              <div className="bp-docs-item-actions">
                {asset.status !== "ready" ? (
                  <button
                    type="button"
                    className="account-secondary-btn"
                    disabled={controlsLocked}
                    onClick={() => {
                      void handleRetry(asset.id);
                    }}
                  >
                    {t("bpDocsRetry")}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="account-danger-btn"
                  disabled={controlsLocked}
                  onClick={() => {
                    void handleDelete(asset.id);
                  }}
                >
                  {t("bpDocsDelete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
});

export default BrandDocumentsPanel;
