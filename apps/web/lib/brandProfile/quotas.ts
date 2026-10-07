/**
 * Quota helpers for Brand asset ingest (user data only).
 */

import {
  BRAND_ASSET_MAX_BYTES,
  BRAND_ASSET_MAX_EXTRACT_CHARS,
  BRAND_PASTE_MAX_CHARS,
  BRAND_PROFILE_MAX_ASSETS,
  BRAND_PROFILE_MAX_EXTRACT_CHARS,
} from "@/lib/brandProfile/types";

export type QuotaFailure = {
  ok: false;
  error: string;
};

export type QuotaOk = { ok: true };

/**
 * Rejects uploads larger than the per-file byte cap.
 */
export function assertFileWithinByteQuota(byteLength: number): QuotaOk | QuotaFailure {
  if (!Number.isFinite(byteLength) || byteLength <= 0) {
    return { ok: false, error: "File is empty or invalid." };
  }
  if (byteLength > BRAND_ASSET_MAX_BYTES) {
    return {
      ok: false,
      error: `File exceeds the ${Math.floor(BRAND_ASSET_MAX_BYTES / (1024 * 1024))}MB limit.`,
    };
  }
  return { ok: true };
}

/**
 * Rejects paste bodies over the paste character cap.
 */
export function assertPasteWithinCharQuota(charLength: number): QuotaOk | QuotaFailure {
  if (!Number.isFinite(charLength) || charLength <= 0) {
    return { ok: false, error: "Paste text is empty." };
  }
  if (charLength > BRAND_PASTE_MAX_CHARS) {
    return {
      ok: false,
      error: `Paste exceeds the ${BRAND_PASTE_MAX_CHARS} character limit.`,
    };
  }
  return { ok: true };
}

/**
 * Rejects when the profile already has too many assets.
 */
export function assertAssetCountWithinQuota(
  currentCount: number,
): QuotaOk | QuotaFailure {
  if (currentCount >= BRAND_PROFILE_MAX_ASSETS) {
    return {
      ok: false,
      error: `This Brand profile already has ${BRAND_PROFILE_MAX_ASSETS} documents. Delete one before uploading.`,
    };
  }
  return { ok: true };
}

/**
 * Rejects when one asset's extract is too large.
 */
export function assertAssetExtractWithinQuota(
  extractChars: number,
): QuotaOk | QuotaFailure {
  if (extractChars > BRAND_ASSET_MAX_EXTRACT_CHARS) {
    return {
      ok: false,
      error: `Extracted text exceeds the ${BRAND_ASSET_MAX_EXTRACT_CHARS} character limit for one document.`,
    };
  }
  return { ok: true };
}

/**
 * Rejects when profile-wide extract characters would exceed the cap.
 * otherExtractChars should exclude the asset being (re)processed.
 */
export function assertProfileExtractWithinQuota(
  otherExtractChars: number,
  thisExtractChars: number,
): QuotaOk | QuotaFailure {
  const total: number = otherExtractChars + thisExtractChars;
  if (total > BRAND_PROFILE_MAX_EXTRACT_CHARS) {
    return {
      ok: false,
      error: `Profile extract budget exceeded (${BRAND_PROFILE_MAX_EXTRACT_CHARS} characters max across documents).`,
    };
  }
  return { ok: true };
}
