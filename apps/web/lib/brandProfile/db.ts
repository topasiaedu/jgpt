/**
 * DB row shapes and serializers for Brand profiles (user data, not Jeff doctrine).
 */

import {
  ACTIVE_BRIEF_MAX_CHARS,
  EMPTY_BRAND_PROFILE_STRUCTURED,
  normalizeBrandProfileStructured,
  type BrandProfileStructured,
} from "@/lib/brandProfile/types";

/** UUID shape accepted for profile / preference ids. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** brand_profiles row as returned by PostgREST. */
export type BrandProfileRow = {
  id: string;
  owner_user_id: string;
  name: string;
  structured: unknown;
  active_brief: string;
  created_at: string;
  updated_at: string;
};

/** List card / API summary (no large brief payload required). */
export type BrandProfileSummary = {
  id: string;
  name: string;
  structured: BrandProfileStructured;
  createdAt: string;
  updatedAt: string;
};

/** Full profile for edit UI and GET-by-id. */
export type BrandProfileDetail = {
  id: string;
  name: string;
  structured: BrandProfileStructured;
  activeBrief: string;
  createdAt: string;
  updatedAt: string;
};

/** user_preferences row. */
export type UserPreferencesRow = {
  user_id: string;
  last_active_profile_id: string | null;
};

/** Public preferences DTO. */
export type UserPreferencesDto = {
  lastActiveProfileId: string | null;
};

/**
 * True when value looks like a UUID the DB will accept.
 */
export function isUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

/**
 * Maps a DB row to a list summary.
 */
export function toBrandProfileSummary(row: BrandProfileRow): BrandProfileSummary {
  return {
    id: row.id,
    name: row.name,
    structured: normalizeBrandProfileStructured(row.structured),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Maps a DB row to the edit/detail DTO with normalized structured fields.
 */
export function toBrandProfileDetail(row: BrandProfileRow): BrandProfileDetail {
  return {
    id: row.id,
    name: row.name,
    structured: normalizeBrandProfileStructured(row.structured),
    activeBrief: typeof row.active_brief === "string" ? row.active_brief : "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Trims and validates a profile display name. Returns null when invalid.
 */
export function normalizeProfileName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const name: string = value.trim().replace(/\s+/g, " ");
  if (name.length === 0 || name.length > 120) {
    return null;
  }
  return name;
}

/**
 * Caps and normalizes active_brief for writes.
 */
export function normalizeActiveBrief(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const brief: string = value.trim();
  if (brief.length > ACTIVE_BRIEF_MAX_CHARS) {
    return null;
  }
  return brief;
}

/**
 * Accepts a full structured object (all keys optional strings) and normalizes.
 */
export function parseStructuredInput(value: unknown): BrandProfileStructured | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return normalizeBrandProfileStructured(value);
}

/**
 * Empty structured payload for inserts.
 */
export function emptyStructuredJson(): BrandProfileStructured {
  return { ...EMPTY_BRAND_PROFILE_STRUCTURED };
}

/**
 * Maps preferences row to DTO; missing row means no preference yet.
 */
export function toUserPreferencesDto(
  row: UserPreferencesRow | null,
): UserPreferencesDto {
  return {
    lastActiveProfileId: row?.last_active_profile_id ?? null,
  };
}

/**
 * Narrows a PostgREST row into BrandProfileRow, or null when shape is wrong.
 */
export function parseBrandProfileRow(value: unknown): BrandProfileRow | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const record: Record<string, unknown> = Object.fromEntries(
    Object.entries(value),
  );
  if (
    typeof record.id !== "string" ||
    typeof record.owner_user_id !== "string" ||
    typeof record.name !== "string" ||
    typeof record.active_brief !== "string" ||
    typeof record.created_at !== "string" ||
    typeof record.updated_at !== "string"
  ) {
    return null;
  }
  return {
    id: record.id,
    owner_user_id: record.owner_user_id,
    name: record.name,
    structured: record.structured,
    active_brief: record.active_brief,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

/**
 * Narrows a PostgREST preferences row, or null when shape is wrong.
 */
export function parseUserPreferencesRow(
  value: unknown,
): UserPreferencesRow | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const record: Record<string, unknown> = Object.fromEntries(
    Object.entries(value),
  );
  if (typeof record.user_id !== "string") {
    return null;
  }
  const lastActive: unknown = record.last_active_profile_id;
  if (lastActive !== null && typeof lastActive !== "string") {
    return null;
  }
  return {
    user_id: record.user_id,
    last_active_profile_id: lastActive,
  };
}

/**
 * Narrows a Brand profile summary DTO from API JSON.
 */
export function parseBrandProfileSummary(
  value: unknown,
): BrandProfileSummary | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const record: Record<string, unknown> = Object.fromEntries(
    Object.entries(value),
  );
  if (
    typeof record.id !== "string" ||
    typeof record.name !== "string" ||
    typeof record.createdAt !== "string" ||
    typeof record.updatedAt !== "string"
  ) {
    return null;
  }
  return {
    id: record.id,
    name: record.name,
    structured: normalizeBrandProfileStructured(record.structured),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

/**
 * Narrows a Brand profile detail DTO from API JSON.
 */
export function parseBrandProfileDetail(
  value: unknown,
): BrandProfileDetail | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const record: Record<string, unknown> = Object.fromEntries(
    Object.entries(value),
  );
  if (
    typeof record.id !== "string" ||
    typeof record.name !== "string" ||
    typeof record.activeBrief !== "string" ||
    typeof record.createdAt !== "string" ||
    typeof record.updatedAt !== "string"
  ) {
    return null;
  }
  return {
    id: record.id,
    name: record.name,
    structured: normalizeBrandProfileStructured(record.structured),
    activeBrief: record.activeBrief,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

/**
 * Narrows preferences DTO from API JSON.
 */
export function parseUserPreferencesDto(
  value: unknown,
): UserPreferencesDto | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const record: Record<string, unknown> = Object.fromEntries(
    Object.entries(value),
  );
  const lastActive: unknown = record.lastActiveProfileId;
  if (lastActive !== null && typeof lastActive !== "string") {
    return null;
  }
  return { lastActiveProfileId: lastActive };
}
