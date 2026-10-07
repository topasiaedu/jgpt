"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import type { BrandAssetDto } from "@/lib/brandProfile/assetsDb";
import {
  deleteBrandAsset,
  fetchBrandAssets,
  fetchBrandProfile,
  pasteBrandAsset,
  processBrandAsset,
  resummarizeBrandProfileClient,
  uploadBrandAsset,
} from "@/lib/brandProfile/clientApi";
import type { BrandProfileStructured } from "@/lib/brandProfile/types";
import {
  BRAND_ASSET_MAX_BYTES,
  BRAND_PASTE_MAX_CHARS,
  BRAND_PROFILE_MAX_ASSETS,
} from "@/lib/brandProfile/types";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type BrandDocumentsPanelProps = {
  profileId: string;
  onProfileUpdated: (update: {
    activeBrief: string;
    structured: BrandProfileStructured;
  }) => void;
};

/**
 * Documents UI: upload PDF/PPTX/txt/md, paste text, list status, delete, re-summarize.
 */
export default function BrandDocumentsPanel({
  profileId,
  onProfileUpdated,
}: BrandDocumentsPanelProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [assets, setAssets] = useState<BrandAssetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  /**
   * Loads the asset list for this profile.
   */
  async function reloadAssets(): Promise<void> {
    const result = await fetchBrandAssets(profileId);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAssets(result.assets);
  }

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      const result = await fetchBrandAssets(profileId);
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

    void load();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  /**
   * Creates a pending asset then runs process; refreshes list + parent brief.
   */
  async function createAndProcess(
    create: () => Promise<
      { ok: true; asset: BrandAssetDto } | { ok: false; error: string }
    >,
  ): Promise<void> {
    setBusy(true);
    setError(null);
    setNote(null);

    const created = await create();
    if (!created.ok) {
      setError(created.error);
      setBusy(false);
      return;
    }

    setAssets((prev) => [created.asset, ...prev]);
    setNote(t("bpDocsProcessing"));

    const processed = await processBrandAsset(profileId, created.asset.id);
    if (!processed.ok) {
      setError(processed.error);
      await reloadAssets();
      setBusy(false);
      return;
    }

    await reloadAssets();

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
   * Handles file input change: upload then process.
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
    if (file.size > BRAND_ASSET_MAX_BYTES) {
      setError(t("bpDocsFileTooLarge"));
      return;
    }
    if (assets.length >= BRAND_PROFILE_MAX_ASSETS) {
      setError(t("bpDocsTooMany"));
      return;
    }

    await createAndProcess(() => uploadBrandAsset(profileId, file));
    if (fileInputRef.current !== null) {
      fileInputRef.current.value = "";
    }
  }

  /**
   * Saves pasted text as a paste asset, then processes it.
   */
  async function handlePasteSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const trimmed: string = pasteText.trim();
    if (trimmed.length === 0) {
      setError(t("bpDocsPasteEmpty"));
      return;
    }
    if (trimmed.length > BRAND_PASTE_MAX_CHARS) {
      setError(t("bpDocsPasteTooLong"));
      return;
    }
    if (assets.length >= BRAND_PROFILE_MAX_ASSETS) {
      setError(t("bpDocsTooMany"));
      return;
    }

    await createAndProcess(() => pasteBrandAsset(profileId, trimmed));
    setPasteText("");
  }

  /**
   * Deletes one asset after confirm.
   */
  async function handleDelete(assetId: string): Promise<void> {
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
    setBusy(true);
    setError(null);
    setNote(t("bpDocsProcessing"));
    const processed = await processBrandAsset(profileId, assetId);
    if (!processed.ok) {
      setError(processed.error);
      await reloadAssets();
      setBusy(false);
      return;
    }
    await reloadAssets();
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
      <p className="account-muted">{t("bpDocsHint")}</p>

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
            disabled={busy}
            onChange={(event) => {
              void handleFileSelected(event.target.files);
            }}
          />
        </label>
        <button
          type="button"
          className="account-secondary-btn"
          disabled={busy}
          onClick={() => {
            void handleResummarize();
          }}
        >
          {t("bpDocsResummarize")}
        </button>
      </div>
      <p className="account-muted">{t("bpDocsQuotaHint")}</p>

      <form
        className="bp-docs-paste"
        onSubmit={(event) => {
          void handlePasteSubmit(event);
        }}
      >
        <label className="account-label" htmlFor="bp-docs-paste">
          {t("bpDocsPasteLabel")}
        </label>
        <textarea
          id="bp-docs-paste"
          className="input account-textarea"
          rows={4}
          value={pasteText}
          maxLength={BRAND_PASTE_MAX_CHARS}
          disabled={busy}
          onChange={(event) => {
            setPasteText(event.target.value);
          }}
          placeholder={t("bpDocsPastePlaceholder")}
        />
        <button type="submit" className="account-secondary-btn" disabled={busy}>
          {t("bpDocsPasteCta")}
        </button>
      </form>

      {loading ? <p className="account-muted">{t("bpDocsLoading")}</p> : null}

      {!loading && assets.length === 0 ? (
        <p className="account-muted">{t("bpDocsEmpty")}</p>
      ) : null}

      {!loading && assets.length > 0 ? (
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
                  <p className="bp-docs-item-error">{asset.errorMessage}</p>
                ) : null}
              </div>
              <div className="bp-docs-item-actions">
                {asset.status !== "ready" ? (
                  <button
                    type="button"
                    className="account-secondary-btn"
                    disabled={busy}
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
                  disabled={busy}
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
}
