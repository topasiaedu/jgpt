/**
 * Brand asset row shapes and serializers (user uploads / pastes).
 */

import {
  isBrandAssetKind,
  isBrandAssetStatus,
  type BrandAssetKind,
  type BrandAssetStatus,
} from "@/lib/brandProfile/types";

/** brand_assets row as returned by PostgREST. */
export type BrandAssetRow = {
  id: string;
  profile_id: string;
  kind: BrandAssetKind;
  file_name: string | null;
  storage_path: string | null;
  status: BrandAssetStatus;
  error_message: string | null;
  created_at: string;
};

/** Public asset DTO for Documents UI. */
export type BrandAssetDto = {
  id: string;
  profileId: string;
  kind: BrandAssetKind;
  fileName: string | null;
  storagePath: string | null;
  status: BrandAssetStatus;
  errorMessage: string | null;
  createdAt: string;
};

/**
 * Storage object path: {userId}/{profileId}/{assetId}
 */
export function buildBrandAssetStoragePath(
  userId: string,
  profileId: string,
  assetId: string,
): string {
  return `${userId}/${profileId}/${assetId}`;
}

/**
 * Maps a DB row to the Documents UI DTO.
 */
export function toBrandAssetDto(row: BrandAssetRow): BrandAssetDto {
  return {
    id: row.id,
    profileId: row.profile_id,
    kind: row.kind,
    fileName: row.file_name,
    storagePath: row.storage_path,
    status: row.status,
    errorMessage: row.error_message,
    createdAt: row.created_at,
  };
}

/**
 * Narrows a PostgREST row into BrandAssetRow, or null when shape is wrong.
 */
export function parseBrandAssetRow(value: unknown): BrandAssetRow | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const record: Record<string, unknown> = Object.fromEntries(
    Object.entries(value),
  );
  if (
    typeof record.id !== "string" ||
    typeof record.profile_id !== "string" ||
    typeof record.kind !== "string" ||
    typeof record.status !== "string" ||
    typeof record.created_at !== "string" ||
    !isBrandAssetKind(record.kind) ||
    !isBrandAssetStatus(record.status)
  ) {
    return null;
  }
  const fileName: unknown = record.file_name;
  const storagePath: unknown = record.storage_path;
  const errorMessage: unknown = record.error_message;
  if (fileName !== null && typeof fileName !== "string") {
    return null;
  }
  if (storagePath !== null && typeof storagePath !== "string") {
    return null;
  }
  if (errorMessage !== null && typeof errorMessage !== "string") {
    return null;
  }
  return {
    id: record.id,
    profile_id: record.profile_id,
    kind: record.kind,
    file_name: fileName,
    storage_path: storagePath,
    status: record.status,
    error_message: errorMessage,
    created_at: record.created_at,
  };
}

/**
 * Narrows a BrandAssetDto from API JSON.
 */
export function parseBrandAssetDto(value: unknown): BrandAssetDto | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const record: Record<string, unknown> = Object.fromEntries(
    Object.entries(value),
  );
  if (
    typeof record.id !== "string" ||
    typeof record.profileId !== "string" ||
    typeof record.kind !== "string" ||
    typeof record.status !== "string" ||
    typeof record.createdAt !== "string" ||
    !isBrandAssetKind(record.kind) ||
    !isBrandAssetStatus(record.status)
  ) {
    return null;
  }
  const fileName: unknown = record.fileName;
  const storagePath: unknown = record.storagePath;
  const errorMessage: unknown = record.errorMessage;
  if (fileName !== null && typeof fileName !== "string") {
    return null;
  }
  if (storagePath !== null && typeof storagePath !== "string") {
    return null;
  }
  if (errorMessage !== null && typeof errorMessage !== "string") {
    return null;
  }
  return {
    id: record.id,
    profileId: record.profileId,
    kind: record.kind,
    fileName: fileName,
    storagePath: storagePath,
    status: record.status,
    errorMessage: errorMessage,
    createdAt: record.createdAt,
  };
}
