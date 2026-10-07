/**
 * Browser fetch helpers for Brand profile + preferences APIs.
 */

import {
  parseBrandAssetDto,
  type BrandAssetDto,
} from "@/lib/brandProfile/assetsDb";
import {
  parseBrandProfileDetail,
  parseBrandProfileSummary,
  parseUserPreferencesDto,
  type BrandProfileDetail,
  type BrandProfileSummary,
  type UserPreferencesDto,
} from "@/lib/brandProfile/db";
import {
  normalizeBrandProfileStructured,
  type BrandProfileStructured,
} from "@/lib/brandProfile/types";

export type ClientApiError = {
  ok: false;
  status: number;
  error: string;
};

/**
 * Reads { error } from a failed API response, with a fallback message.
 */
async function readApiError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string" &&
      body.error.trim().length > 0
    ) {
      return body.error;
    }
  } catch {
    // Non-JSON error body.
  }
  return fallback;
}

/**
 * GET /api/brand-profiles
 */
export async function fetchBrandProfiles(): Promise<
  { ok: true; profiles: BrandProfileSummary[] } | ClientApiError
> {
  try {
    const response: Response = await fetch("/api/brand-profiles", {
      method: "GET",
      credentials: "same-origin",
    });
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not load Brand profiles."),
      };
    }
    const body: unknown = await response.json();
    if (
      typeof body !== "object" ||
      body === null ||
      !("profiles" in body) ||
      !Array.isArray(body.profiles)
    ) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected Brand profiles list response.",
      };
    }
    const profiles: BrandProfileSummary[] = [];
    for (const item of body.profiles) {
      const summary = parseBrandProfileSummary(item);
      if (summary !== null) {
        profiles.push(summary);
      }
    }
    return { ok: true, profiles };
  } catch {
    return { ok: false, status: 0, error: "Network error loading Brand profiles." };
  }
}

export type BrandProfileCreateExtra = {
  structured?: BrandProfileStructured;
  activeBrief?: string;
};

/**
 * POST /api/brand-profiles
 */
export async function createBrandProfile(
  name: string,
  extra?: BrandProfileCreateExtra,
): Promise<{ ok: true; profile: BrandProfileSummary } | ClientApiError> {
  try {
    const payload: {
      name: string;
      structured?: BrandProfileStructured;
      activeBrief?: string;
    } = { name };
    if (extra !== undefined && extra.structured !== undefined) {
      payload.structured = extra.structured;
    }
    if (extra !== undefined && extra.activeBrief !== undefined) {
      payload.activeBrief = extra.activeBrief;
    }
    const response: Response = await fetch("/api/brand-profiles", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not create Brand profile."),
      };
    }
    const body: unknown = await response.json();
    if (typeof body !== "object" || body === null || !("profile" in body)) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected create Brand profile response.",
      };
    }
    const profile = parseBrandProfileSummary(body.profile);
    if (profile === null) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected create Brand profile response.",
      };
    }
    return { ok: true, profile };
  } catch {
    return { ok: false, status: 0, error: "Network error creating Brand profile." };
  }
}

/**
 * GET /api/brand-profiles/[id]
 */
export async function fetchBrandProfile(
  id: string,
): Promise<{ ok: true; profile: BrandProfileDetail } | ClientApiError> {
  try {
    const response: Response = await fetch(
      `/api/brand-profiles/${encodeURIComponent(id)}`,
      {
        method: "GET",
        credentials: "same-origin",
      },
    );
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not load Brand profile."),
      };
    }
    const body: unknown = await response.json();
    if (typeof body !== "object" || body === null || !("profile" in body)) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected Brand profile response.",
      };
    }
    const profile = parseBrandProfileDetail(body.profile);
    if (profile === null) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected Brand profile response.",
      };
    }
    return { ok: true, profile };
  } catch {
    return { ok: false, status: 0, error: "Network error loading Brand profile." };
  }
}

export type BrandProfileUpdateInput = {
  name?: string;
  structured?: BrandProfileStructured;
  activeBrief?: string;
};

/**
 * PATCH /api/brand-profiles/[id]
 */
export async function updateBrandProfile(
  id: string,
  input: BrandProfileUpdateInput,
): Promise<{ ok: true; profile: BrandProfileDetail } | ClientApiError> {
  try {
    const response: Response = await fetch(
      `/api/brand-profiles/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    );
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not save Brand profile."),
      };
    }
    const body: unknown = await response.json();
    if (typeof body !== "object" || body === null || !("profile" in body)) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected save Brand profile response.",
      };
    }
    const profile = parseBrandProfileDetail(body.profile);
    if (profile === null) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected save Brand profile response.",
      };
    }
    return { ok: true, profile };
  } catch {
    return { ok: false, status: 0, error: "Network error saving Brand profile." };
  }
}

/**
 * DELETE /api/brand-profiles/[id]
 */
export async function deleteBrandProfile(
  id: string,
): Promise<{ ok: true } | ClientApiError> {
  try {
    const response: Response = await fetch(
      `/api/brand-profiles/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        credentials: "same-origin",
      },
    );
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not delete Brand profile."),
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      status: 0,
      error: "Network error deleting Brand profile.",
    };
  }
}

/**
 * If the deleted profile was last_active, point at another owned profile
 * or clear the preference when none remain.
 */
export async function retargetLastActiveAfterDelete(
  deletedId: string,
  remaining: BrandProfileSummary[],
  lastActiveId: string | null,
): Promise<{ ok: true; lastActiveProfileId: string | null } | ClientApiError> {
  if (lastActiveId !== deletedId) {
    return { ok: true, lastActiveProfileId: lastActiveId };
  }
  const firstRemaining: BrandProfileSummary | undefined = remaining[0];
  const nextId: string | null =
    firstRemaining === undefined ? null : firstRemaining.id;
  const pref = await saveLastActiveProfileId(nextId);
  if (!pref.ok) {
    return pref;
  }
  return { ok: true, lastActiveProfileId: pref.preferences.lastActiveProfileId };
}

/**
 * GET /api/user-preferences
 */
export async function fetchUserPreferences(): Promise<
  { ok: true; preferences: UserPreferencesDto } | ClientApiError
> {
  try {
    const response: Response = await fetch("/api/user-preferences", {
      method: "GET",
      credentials: "same-origin",
    });
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not load preferences."),
      };
    }
    const body: unknown = await response.json();
    if (
      typeof body !== "object" ||
      body === null ||
      !("preferences" in body)
    ) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected preferences response.",
      };
    }
    const preferences = parseUserPreferencesDto(body.preferences);
    if (preferences === null) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected preferences response.",
      };
    }
    return { ok: true, preferences };
  } catch {
    return { ok: false, status: 0, error: "Network error loading preferences." };
  }
}

/**
 * PUT /api/user-preferences
 */
export async function saveLastActiveProfileId(
  lastActiveProfileId: string | null,
): Promise<{ ok: true; preferences: UserPreferencesDto } | ClientApiError> {
  try {
    const response: Response = await fetch("/api/user-preferences", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastActiveProfileId }),
    });
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not save active Brand profile."),
      };
    }
    const body: unknown = await response.json();
    if (
      typeof body !== "object" ||
      body === null ||
      !("preferences" in body)
    ) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected save preferences response.",
      };
    }
    const preferences = parseUserPreferencesDto(body.preferences);
    if (preferences === null) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected save preferences response.",
      };
    }
    return { ok: true, preferences };
  } catch {
    return {
      ok: false,
      status: 0,
      error: "Network error saving active Brand profile.",
    };
  }
}

/**
 * Parses a single asset object from an API JSON body under key "asset".
 */
function readAssetFromBody(
  body: unknown,
): BrandAssetDto | null {
  if (typeof body !== "object" || body === null || !("asset" in body)) {
    return null;
  }
  return parseBrandAssetDto(body.asset);
}

/**
 * GET /api/brand-profiles/[id]/assets
 */
export async function fetchBrandAssets(
  profileId: string,
): Promise<{ ok: true; assets: BrandAssetDto[] } | ClientApiError> {
  try {
    const response: Response = await fetch(
      `/api/brand-profiles/${encodeURIComponent(profileId)}/assets`,
      {
        method: "GET",
        credentials: "same-origin",
      },
    );
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not load documents."),
      };
    }
    const body: unknown = await response.json();
    if (
      typeof body !== "object" ||
      body === null ||
      !("assets" in body) ||
      !Array.isArray(body.assets)
    ) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected documents list response.",
      };
    }
    const assets: BrandAssetDto[] = [];
    for (const item of body.assets) {
      const asset = parseBrandAssetDto(item);
      if (asset !== null) {
        assets.push(asset);
      }
    }
    return { ok: true, assets };
  } catch {
    return { ok: false, status: 0, error: "Network error loading documents." };
  }
}

/**
 * POST /api/brand-profiles/[id]/assets (multipart file)
 */
export async function uploadBrandAsset(
  profileId: string,
  file: File,
): Promise<{ ok: true; asset: BrandAssetDto } | ClientApiError> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response: Response = await fetch(
      `/api/brand-profiles/${encodeURIComponent(profileId)}/assets`,
      {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      },
    );
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not upload document."),
      };
    }
    const body: unknown = await response.json();
    const asset = readAssetFromBody(body);
    if (asset === null) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected upload document response.",
      };
    }
    return { ok: true, asset };
  } catch {
    return { ok: false, status: 0, error: "Network error uploading document." };
  }
}

/**
 * POST /api/brand-profiles/[id]/assets/paste
 */
export async function pasteBrandAsset(
  profileId: string,
  text: string,
  fileName?: string,
): Promise<{ ok: true; asset: BrandAssetDto } | ClientApiError> {
  try {
    const response: Response = await fetch(
      `/api/brand-profiles/${encodeURIComponent(profileId)}/assets/paste`,
      {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          ...(typeof fileName === "string" ? { fileName } : {}),
        }),
      },
    );
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not save pasted text."),
      };
    }
    const body: unknown = await response.json();
    const asset = readAssetFromBody(body);
    if (asset === null) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected paste document response.",
      };
    }
    return { ok: true, asset };
  } catch {
    return { ok: false, status: 0, error: "Network error saving pasted text." };
  }
}

/**
 * POST /api/brand-profiles/[id]/assets/[assetId]/process
 */
export async function processBrandAsset(
  profileId: string,
  assetId: string,
): Promise<{ ok: true; asset: BrandAssetDto } | ClientApiError> {
  try {
    const response: Response = await fetch(
      `/api/brand-profiles/${encodeURIComponent(profileId)}/assets/${encodeURIComponent(assetId)}/process`,
      {
        method: "POST",
        credentials: "same-origin",
      },
    );
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      let errorMessage = "Could not process document.";
      if (
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof body.error === "string" &&
        body.error.trim().length > 0
      ) {
        errorMessage = body.error;
      }
      return {
        ok: false,
        status: response.status,
        error: errorMessage,
      };
    }
    const asset = readAssetFromBody(body);
    if (asset === null) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected process document response.",
      };
    }
    return { ok: true, asset };
  } catch {
    return {
      ok: false,
      status: 0,
      error: "Network error processing document.",
    };
  }
}

/**
 * DELETE /api/brand-profiles/[id]/assets/[assetId]
 */
export async function deleteBrandAsset(
  profileId: string,
  assetId: string,
): Promise<{ ok: true } | ClientApiError> {
  try {
    const response: Response = await fetch(
      `/api/brand-profiles/${encodeURIComponent(profileId)}/assets/${encodeURIComponent(assetId)}`,
      {
        method: "DELETE",
        credentials: "same-origin",
      },
    );
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not delete document."),
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, status: 0, error: "Network error deleting document." };
  }
}

export type ResummarizeResult = {
  activeBrief: string;
  structured: BrandProfileStructured;
};

/**
 * POST /api/brand-profiles/[id]/resummarize
 */
export async function resummarizeBrandProfileClient(
  profileId: string,
): Promise<{ ok: true; result: ResummarizeResult } | ClientApiError> {
  try {
    const response: Response = await fetch(
      `/api/brand-profiles/${encodeURIComponent(profileId)}/resummarize`,
      {
        method: "POST",
        credentials: "same-origin",
      },
    );
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readApiError(response, "Could not re-summarize brief."),
      };
    }
    const body: unknown = await response.json();
    if (
      typeof body !== "object" ||
      body === null ||
      !("activeBrief" in body) ||
      typeof body.activeBrief !== "string" ||
      !("structured" in body)
    ) {
      return {
        ok: false,
        status: 500,
        error: "Unexpected re-summarize response.",
      };
    }
    return {
      ok: true,
      result: {
        activeBrief: body.activeBrief,
        structured: normalizeBrandProfileStructured(body.structured),
      },
    };
  } catch {
    return {
      ok: false,
      status: 0,
      error: "Network error re-summarizing brief.",
    };
  }
}
