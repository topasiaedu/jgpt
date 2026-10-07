import { NextResponse } from "next/server";

import { jsonError, requireAuthedApi } from "@/lib/brandProfile/apiAuth";
import {
  isUuid,
  normalizeActiveBrief,
  normalizeProfileName,
  parseBrandProfileRow,
  parseStructuredInput,
  toBrandProfileDetail,
  type BrandProfileDetail,
} from "@/lib/brandProfile/db";
import type { BrandProfileStructured } from "@/lib/brandProfile/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type BrandProfileGetResponse = {
  profile: BrandProfileDetail;
};

export type BrandProfileUpdateResponse = {
  profile: BrandProfileDetail;
};

type RouteParams = {
  params: Promise<{ id: string }>;
};

type ProfileUpdatePatch = {
  name?: string;
  structured?: BrandProfileStructured;
  active_brief?: string;
  updated_at: string;
};

/**
 * GET /api/brand-profiles/[id]: load one owned profile for edit.
 */
export async function GET(
  _request: Request,
  context: RouteParams,
): Promise<NextResponse<BrandProfileGetResponse | { error: string }>> {
  const auth = await requireAuthedApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { id: rawId } = await context.params;
  const id: string = rawId.trim();
  if (!isUuid(id)) {
    return jsonError(400, "Invalid Brand profile id.");
  }

  const { supabase, user } = auth.ctx;
  const { data, error } = await supabase
    .from("brand_profiles")
    .select("id, owner_user_id, name, structured, active_brief, created_at, updated_at")
    .eq("id", id)
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (error !== null) {
    return jsonError(500, error.message);
  }

  const row = parseBrandProfileRow(data);
  if (row === null) {
    return jsonError(404, "Brand profile not found.");
  }

  return NextResponse.json({ profile: toBrandProfileDetail(row) });
}

/**
 * PATCH /api/brand-profiles/[id]: update name, structured, and/or active_brief.
 */
export async function PATCH(
  request: Request,
  context: RouteParams,
): Promise<NextResponse<BrandProfileUpdateResponse | { error: string }>> {
  const auth = await requireAuthedApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { id: rawId } = await context.params;
  const id: string = rawId.trim();
  if (!isUuid(id)) {
    return jsonError(400, "Invalid Brand profile id.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Request body must be JSON.");
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return jsonError(400, "Body must be a JSON object.");
  }

  const record: Record<string, unknown> = Object.fromEntries(
    Object.entries(body),
  );
  const patch: ProfileUpdatePatch = {
    updated_at: new Date().toISOString(),
  };

  let hasField = false;

  if ("name" in record) {
    const name: string | null = normalizeProfileName(record.name);
    if (name === null) {
      return jsonError(
        400,
        "Name must be 1 to 120 characters after trim.",
      );
    }
    patch.name = name;
    hasField = true;
  }

  if ("structured" in record) {
    const structured: BrandProfileStructured | null = parseStructuredInput(
      record.structured,
    );
    if (structured === null) {
      return jsonError(400, "structured must be an object of string fields.");
    }
    patch.structured = structured;
    hasField = true;
  }

  if ("activeBrief" in record || "active_brief" in record) {
    const rawBrief: unknown =
      "activeBrief" in record ? record.activeBrief : record.active_brief;
    const brief: string | null = normalizeActiveBrief(rawBrief);
    if (brief === null) {
      return jsonError(
        400,
        "activeBrief must be a string of at most 2500 characters.",
      );
    }
    patch.active_brief = brief;
    hasField = true;
  }

  if (!hasField) {
    return jsonError(
      400,
      "Provide at least one of name, structured, or activeBrief.",
    );
  }

  const { supabase, user } = auth.ctx;
  const { data, error } = await supabase
    .from("brand_profiles")
    .update(patch)
    .eq("id", id)
    .eq("owner_user_id", user.id)
    .select("id, owner_user_id, name, structured, active_brief, created_at, updated_at")
    .maybeSingle();

  if (error !== null) {
    return jsonError(500, error.message);
  }

  const row = parseBrandProfileRow(data);
  if (row === null) {
    return jsonError(404, "Brand profile not found.");
  }

  return NextResponse.json({ profile: toBrandProfileDetail(row) });
}

/**
 * DELETE /api/brand-profiles/[id]: delete owned profile (assets cascade; preference SET NULL).
 */
export async function DELETE(
  _request: Request,
  context: RouteParams,
): Promise<NextResponse<{ ok: true } | { error: string }>> {
  const auth = await requireAuthedApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { id: rawId } = await context.params;
  const id: string = rawId.trim();
  if (!isUuid(id)) {
    return jsonError(400, "Invalid Brand profile id.");
  }

  const { supabase, user } = auth.ctx;
  const { data, error } = await supabase
    .from("brand_profiles")
    .delete()
    .eq("id", id)
    .eq("owner_user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error !== null) {
    return jsonError(500, error.message);
  }
  if (data === null) {
    return jsonError(404, "Brand profile not found.");
  }

  return NextResponse.json({ ok: true });
}
