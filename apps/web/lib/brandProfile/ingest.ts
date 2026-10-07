/**
 * Brand asset ingest orchestration: extract → chunk → embed → summarize.
 * User data only. Never dumps full extracts into chat prompts (Agent E).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  parseBrandAssetRow,
  type BrandAssetDto,
  toBrandAssetDto,
} from "@/lib/brandProfile/assetsDb";
import { chunkExtractUnits } from "@/lib/brandProfile/chunk";
import {
  embedBrandChunkTexts,
  formatEmbeddingForPg,
} from "@/lib/brandProfile/embed";
import {
  extractBrandAssetText,
  inferBrandAssetKind,
  plainTextBytesAreEmpty,
} from "@/lib/brandProfile/extract";
import {
  assertAssetExtractWithinQuota,
  assertProfileExtractWithinQuota,
} from "@/lib/brandProfile/quotas";
import {
  alignFileNameWithKind,
  resolveBrandAssetKind,
} from "@/lib/brandProfile/sniffKind";
import { summarizeBrandProfile } from "@/lib/brandProfile/summarize";
import {
  BRAND_ASSET_EMPTY_PLAIN_TEXT_ERROR,
  BRAND_ASSET_NO_TEXT_ERROR,
  BRAND_ASSETS_BUCKET,
  normalizeBrandProfileStructured,
  type BrandAssetKind,
  type BrandProfileStructured,
} from "@/lib/brandProfile/types";

export type IngestProcessResult =
  | { ok: true; asset: BrandAssetDto }
  | { ok: false; error: string; asset: BrandAssetDto | null };

type ChunkRowForSample = {
  chunk_text: string;
  asset_id: string;
};

/**
 * Marks an asset failed with a clear error_message.
 */
async function markAssetFailed(
  admin: SupabaseClient,
  assetId: string,
  errorMessage: string,
): Promise<BrandAssetDto | null> {
  const { data, error } = await admin
    .from("brand_assets")
    .update({
      status: "failed",
      error_message: errorMessage.slice(0, 1000),
    })
    .eq("id", assetId)
    .select(
      "id, profile_id, kind, file_name, storage_path, status, error_message, created_at",
    )
    .maybeSingle();

  if (error !== null) {
    return null;
  }
  const row = parseBrandAssetRow(data);
  return row === null ? null : toBrandAssetDto(row);
}

/**
 * Sums chunk_text lengths for a profile, optionally excluding one asset.
 */
async function sumProfileExtractChars(
  admin: SupabaseClient,
  profileId: string,
  excludeAssetId: string | null,
): Promise<number> {
  let query = admin
    .from("brand_chunks")
    .select("chunk_text, asset_id")
    .eq("profile_id", profileId);

  if (excludeAssetId !== null) {
    query = query.neq("asset_id", excludeAssetId);
  }

  const { data, error } = await query;
  if (error !== null || data === null) {
    return 0;
  }

  let total = 0;
  for (const item of data) {
    if (
      typeof item === "object" &&
      item !== null &&
      "chunk_text" in item &&
      typeof item.chunk_text === "string"
    ) {
      total += item.chunk_text.length;
    }
  }
  return total;
}

/**
 * Loads chunk texts for summarize (ready assets + optional new asset).
 */
async function loadSampleChunkTexts(
  admin: SupabaseClient,
  profileId: string,
  preferAssetId: string | null,
): Promise<string[]> {
  const { data, error } = await admin
    .from("brand_chunks")
    .select("chunk_text, asset_id, ordinal")
    .eq("profile_id", profileId)
    .order("ordinal", { ascending: true })
    .limit(80);

  if (error !== null || data === null) {
    return [];
  }

  const rows: ChunkRowForSample[] = [];
  for (const item of data) {
    if (
      typeof item === "object" &&
      item !== null &&
      "chunk_text" in item &&
      typeof item.chunk_text === "string" &&
      "asset_id" in item &&
      typeof item.asset_id === "string"
    ) {
      rows.push({
        chunk_text: item.chunk_text,
        asset_id: item.asset_id,
      });
    }
  }

  if (preferAssetId !== null) {
    const preferred = rows.filter((row) => row.asset_id === preferAssetId);
    const others = rows.filter((row) => row.asset_id !== preferAssetId);
    return [...preferred, ...others].map((row) => row.chunk_text);
  }
  return rows.map((row) => row.chunk_text);
}

/**
 * User-facing message when extract (+ PDF OCR) produced no usable text.
 */
function noExtractTextMessage(
  kind: BrandAssetKind,
  bytes: Uint8Array,
): string {
  if (
    (kind === "text" || kind === "md" || kind === "paste") &&
    plainTextBytesAreEmpty(bytes)
  ) {
    return BRAND_ASSET_EMPTY_PLAIN_TEXT_ERROR;
  }
  return BRAND_ASSET_NO_TEXT_ERROR;
}

/**
 * Processes one pending/failed Brand asset through the full ingest pipeline.
 * Caller must already verify the signed-in user owns the profile.
 */
export async function processBrandAssetIngest(
  admin: SupabaseClient,
  profileId: string,
  assetId: string,
): Promise<IngestProcessResult> {
  const { data: assetData, error: assetError } = await admin
    .from("brand_assets")
    .select(
      "id, profile_id, kind, file_name, storage_path, status, error_message, created_at",
    )
    .eq("id", assetId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (assetError !== null) {
    return { ok: false, error: assetError.message, asset: null };
  }

  const assetRow = parseBrandAssetRow(assetData);
  if (assetRow === null) {
    return { ok: false, error: "Brand asset not found.", asset: null };
  }

  if (assetRow.storage_path === null || assetRow.storage_path.length === 0) {
    const failed = await markAssetFailed(
      admin,
      assetId,
      "Missing storage path for this document.",
    );
    return {
      ok: false,
      error: "Missing storage path for this document.",
      asset: failed,
    };
  }

  const { data: profileData, error: profileError } = await admin
    .from("brand_profiles")
    .select("id, name, structured, active_brief")
    .eq("id", profileId)
    .maybeSingle();

  if (profileError !== null || profileData === null) {
    return { ok: false, error: "Brand profile not found.", asset: null };
  }

  const profileName: string =
    typeof profileData.name === "string" ? profileData.name : "Brand profile";
  const currentStructured = normalizeBrandProfileStructured(
    profileData.structured,
  );
  const currentBrief: string =
    typeof profileData.active_brief === "string"
      ? profileData.active_brief
      : "";

  const download = await admin.storage
    .from(BRAND_ASSETS_BUCKET)
    .download(assetRow.storage_path);

  if (download.error !== null || download.data === null) {
    const message: string =
      download.error?.message ?? "Could not download document from Storage.";
    const failed = await markAssetFailed(admin, assetId, message);
    return { ok: false, error: message, asset: failed };
  }

  const arrayBuffer: ArrayBuffer = await download.data.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Correct kind when storage holds a PDF (or PPTX) mislabeled as text/.txt.
  const nameMimeKind: BrandAssetKind | null =
    assetRow.file_name !== null
      ? inferBrandAssetKind(assetRow.file_name, "")
      : assetRow.kind;
  const resolvedKind: BrandAssetKind =
    resolveBrandAssetKind(
      assetRow.file_name ?? "",
      "",
      bytes,
      nameMimeKind ?? assetRow.kind,
    ) ?? assetRow.kind;
  const resolvedFileName: string = alignFileNameWithKind(
    assetRow.file_name ?? "upload",
    resolvedKind,
  );

  if (
    resolvedKind !== assetRow.kind ||
    resolvedFileName !== (assetRow.file_name ?? "")
  ) {
    await admin
      .from("brand_assets")
      .update({
        kind: resolvedKind,
        file_name: resolvedFileName,
      })
      .eq("id", assetId);
  }

  let extractResult;
  try {
    extractResult = await extractBrandAssetText(resolvedKind, bytes);
  } catch (error) {
    const message: string =
      error instanceof Error ? error.message : BRAND_ASSET_NO_TEXT_ERROR;
    const failed = await markAssetFailed(admin, assetId, message);
    return { ok: false, error: message, asset: failed };
  }

  if (extractResult.units.length === 0 || extractResult.totalChars === 0) {
    const message = noExtractTextMessage(resolvedKind, bytes);
    const failed = await markAssetFailed(admin, assetId, message);
    return { ok: false, error: message, asset: failed };
  }

  const assetQuota = assertAssetExtractWithinQuota(extractResult.totalChars);
  if (!assetQuota.ok) {
    const failed = await markAssetFailed(admin, assetId, assetQuota.error);
    return { ok: false, error: assetQuota.error, asset: failed };
  }

  const otherChars: number = await sumProfileExtractChars(
    admin,
    profileId,
    assetId,
  );
  const profileQuota = assertProfileExtractWithinQuota(
    otherChars,
    extractResult.totalChars,
  );
  if (!profileQuota.ok) {
    const failed = await markAssetFailed(admin, assetId, profileQuota.error);
    return { ok: false, error: profileQuota.error, asset: failed };
  }

  const chunks = chunkExtractUnits(extractResult.units);
  if (chunks.length === 0) {
    const message = noExtractTextMessage(resolvedKind, bytes);
    const failed = await markAssetFailed(admin, assetId, message);
    return { ok: false, error: message, asset: failed };
  }

  // Replace prior chunks for retries.
  const { error: deleteChunksError } = await admin
    .from("brand_chunks")
    .delete()
    .eq("asset_id", assetId);
  if (deleteChunksError !== null) {
    const failed = await markAssetFailed(
      admin,
      assetId,
      deleteChunksError.message,
    );
    return { ok: false, error: deleteChunksError.message, asset: failed };
  }

  let embeddings: number[][];
  try {
    embeddings = await embedBrandChunkTexts(
      chunks.map((chunk) => chunk.chunkText),
    );
  } catch (error) {
    const message: string =
      error instanceof Error ? error.message : "Embedding failed.";
    const failed = await markAssetFailed(admin, assetId, message);
    return { ok: false, error: message, asset: failed };
  }

  const insertRows = chunks.map((chunk, index) => {
    const vector: number[] | undefined = embeddings[index];
    if (vector === undefined) {
      throw new Error("Missing embedding for a Brand chunk.");
    }
    return {
      profile_id: profileId,
      asset_id: assetId,
      ordinal: chunk.ordinal,
      chunk_text: chunk.chunkText,
      embedding: formatEmbeddingForPg(vector),
      source_label: chunk.sourceLabel,
    };
  });

  const { error: insertError } = await admin
    .from("brand_chunks")
    .insert(insertRows);
  if (insertError !== null) {
    const failed = await markAssetFailed(admin, assetId, insertError.message);
    return { ok: false, error: insertError.message, asset: failed };
  }

  const sampleTexts = await loadSampleChunkTexts(admin, profileId, assetId);
  const summarized = await summarizeBrandProfile({
    profileName,
    currentStructured,
    currentBrief,
    sampleTexts,
  });

  const { error: profileUpdateError } = await admin
    .from("brand_profiles")
    .update({
      structured: summarized.structured,
      active_brief: summarized.activeBrief,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (profileUpdateError !== null) {
    const failed = await markAssetFailed(
      admin,
      assetId,
      `Chunks saved but brief update failed: ${profileUpdateError.message}`,
    );
    return {
      ok: false,
      error: profileUpdateError.message,
      asset: failed,
    };
  }

  const { data: readyData, error: readyError } = await admin
    .from("brand_assets")
    .update({
      status: "ready",
      error_message: null,
    })
    .eq("id", assetId)
    .select(
      "id, profile_id, kind, file_name, storage_path, status, error_message, created_at",
    )
    .maybeSingle();

  if (readyError !== null) {
    return { ok: false, error: readyError.message, asset: null };
  }

  const readyRow = parseBrandAssetRow(readyData);
  if (readyRow === null) {
    return {
      ok: false,
      error: "Asset processed but response row was invalid.",
      asset: null,
    };
  }

  return { ok: true, asset: toBrandAssetDto(readyRow) };
}

/**
 * Rebuilds active_brief (and fills empty structured fields) from ready assets.
 */
export async function resummarizeBrandProfile(
  admin: SupabaseClient,
  profileId: string,
): Promise<
  | { ok: true; activeBrief: string; structured: BrandProfileStructured }
  | { ok: false; error: string }
> {
  const { data: profileData, error: profileError } = await admin
    .from("brand_profiles")
    .select("id, name, structured, active_brief")
    .eq("id", profileId)
    .maybeSingle();

  if (profileError !== null || profileData === null) {
    return { ok: false, error: "Brand profile not found." };
  }

  const { count, error: countError } = await admin
    .from("brand_assets")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("status", "ready");

  if (countError !== null) {
    return { ok: false, error: countError.message };
  }
  if ((count ?? 0) === 0) {
    return {
      ok: false,
      error: "No ready documents yet. Upload and process a document first.",
    };
  }

  const sampleTexts = await loadSampleChunkTexts(admin, profileId, null);
  if (sampleTexts.length === 0) {
    return {
      ok: false,
      error: "Ready documents have no chunks to summarize.",
    };
  }

  const summarized = await summarizeBrandProfile({
    profileName:
      typeof profileData.name === "string" ? profileData.name : "Brand profile",
    currentStructured: normalizeBrandProfileStructured(profileData.structured),
    currentBrief:
      typeof profileData.active_brief === "string"
        ? profileData.active_brief
        : "",
    sampleTexts,
  });

  const { error: updateError } = await admin
    .from("brand_profiles")
    .update({
      structured: summarized.structured,
      active_brief: summarized.activeBrief,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (updateError !== null) {
    return { ok: false, error: updateError.message };
  }

  return {
    ok: true,
    activeBrief: summarized.activeBrief,
    structured: summarized.structured,
  };
}
