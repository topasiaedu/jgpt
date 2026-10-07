/**
 * Query-string and JSON field helpers for chat-history routes.
 */

import { isUuid } from "@/lib/brandProfile/db";
import {
  parseChatFolderColor,
  type ChatFolderColor,
} from "@/lib/chatHistory/folderColors";
import { isPlainObject } from "@/lib/chatHistory/parse";

/**
 * Reads moduleId from a query string. Missing/empty is invalid.
 */
export function readModuleIdQuery(searchParams: URLSearchParams): string | null {
  const raw: string | null = searchParams.get("moduleId");
  if (raw === null) {
    return null;
  }
  const trimmed: string = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * List filter: omitted or empty brandProfileId means IS NULL (continue without).
 */
export function readBrandProfileIdQuery(
  searchParams: URLSearchParams,
): { ok: true; id: string | null } | { ok: false; error: string } {
  const raw: string | null = searchParams.get("brandProfileId");
  if (raw === null || raw.trim().length === 0) {
    return { ok: true, id: null };
  }
  const trimmed: string = raw.trim();
  if (!isUuid(trimmed)) {
    return { ok: false, error: "brandProfileId must be a valid profile id." };
  }
  return { ok: true, id: trimmed };
}

/**
 * Optional brandProfileId on create: omit/null/empty → null; else uuid.
 */
export function readOptionalBrandProfileIdBody(
  record: Record<string, unknown>,
): { ok: true; id: string | null } | { ok: false; error: string } {
  if (!("brandProfileId" in record) && !("brand_profile_id" in record)) {
    return { ok: true, id: null };
  }
  const raw: unknown =
    "brandProfileId" in record ? record.brandProfileId : record.brand_profile_id;
  if (raw === null || raw === undefined) {
    return { ok: true, id: null };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: "brandProfileId must be a string or null." };
  }
  const trimmed: string = raw.trim();
  if (trimmed.length === 0) {
    return { ok: true, id: null };
  }
  if (!isUuid(trimmed)) {
    return { ok: false, error: "brandProfileId must be a valid profile id." };
  }
  return { ok: true, id: trimmed };
}

/**
 * folderId on PATCH: uuid or null (ungroup). Missing key is not an error here.
 */
export function readOptionalFolderIdBody(
  record: Record<string, unknown>,
):
  | { ok: true; present: false }
  | { ok: true; present: true; id: string | null }
  | { ok: false; error: string } {
  if (!("folderId" in record) && !("folder_id" in record)) {
    return { ok: true, present: false };
  }
  const raw: unknown = "folderId" in record ? record.folderId : record.folder_id;
  if (raw === null) {
    return { ok: true, present: true, id: null };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: "folderId must be a folder id or null." };
  }
  const trimmed: string = raw.trim();
  if (!isUuid(trimmed)) {
    return { ok: false, error: "folderId must be a valid folder id or null." };
  }
  return { ok: true, present: true, id: trimmed };
}

/**
 * Optional folder color on create/patch. Missing → present false; invalid → error.
 */
export function readOptionalFolderColorBody(
  record: Record<string, unknown>,
):
  | { ok: true; present: false }
  | { ok: true; present: true; color: ChatFolderColor }
  | { ok: false; error: string } {
  if (!("color" in record)) {
    return { ok: true, present: false };
  }
  const color = parseChatFolderColor(record.color);
  if (color === null) {
    return {
      ok: false,
      error:
        "color must be one of: coral, amber, lime, teal, sky, violet, rose, slate.",
    };
  }
  return { ok: true, present: true, color };
}

/**
 * Optional parentFolderId on create/patch: uuid or null (root). Missing → present false.
 */
export function readOptionalParentFolderIdBody(
  record: Record<string, unknown>,
):
  | { ok: true; present: false }
  | { ok: true; present: true; id: string | null }
  | { ok: false; error: string } {
  if (!("parentFolderId" in record) && !("parent_folder_id" in record)) {
    return { ok: true, present: false };
  }
  const raw: unknown =
    "parentFolderId" in record ? record.parentFolderId : record.parent_folder_id;
  if (raw === null) {
    return { ok: true, present: true, id: null };
  }
  if (typeof raw !== "string") {
    return {
      ok: false,
      error: "parentFolderId must be a folder id or null.",
    };
  }
  const trimmed: string = raw.trim();
  if (trimmed.length === 0) {
    return { ok: true, present: true, id: null };
  }
  if (!isUuid(trimmed)) {
    return {
      ok: false,
      error: "parentFolderId must be a valid folder id or null.",
    };
  }
  return { ok: true, present: true, id: trimmed };
}

/**
 * Parses a JSON object body.
 */
export function parseJsonObjectBody(
  value: unknown,
): Record<string, unknown> | null {
  if (!isPlainObject(value)) {
    return null;
  }
  return value;
}
