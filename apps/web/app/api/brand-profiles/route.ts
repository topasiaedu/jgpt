import { NextResponse } from "next/server";

import { jsonError, requireAuthedApi } from "@/lib/brandProfile/apiAuth";
import {
  emptyStructuredJson,
  normalizeActiveBrief,
  normalizeProfileName,
  parseBrandProfileRow,
  parseStructuredInput,
  toBrandProfileSummary,
  type BrandProfileSummary,
} from "@/lib/brandProfile/db";
import type { BrandProfileStructured } from "@/lib/brandProfile/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type BrandProfilesListResponse = {
  profiles: BrandProfileSummary[];
};

export type BrandProfileCreateResponse = {
  profile: BrandProfileSummary;
};

type CreateBody = {
  name: unknown;
};

/**
 * GET /api/brand-profiles: list owned Brand profiles (newest first).
 */
export async function GET(): Promise<
  NextResponse<BrandProfilesListResponse | { error: string }>
> {
  const auth = await requireAuthedApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { supabase, user } = auth.ctx;
  const { data, error } = await supabase
    .from("brand_profiles")
    .select("id, owner_user_id, name, structured, active_brief, created_at, updated_at")
    .eq("owner_user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error !== null) {
    return jsonError(500, error.message);
  }

  const profiles: BrandProfileSummary[] = [];
  if (Array.isArray(data)) {
    for (const item of data) {
      const row = parseBrandProfileRow(item);
      if (row !== null) {
        profiles.push(toBrandProfileSummary(row));
      }
    }
  }

  return NextResponse.json({ profiles });
}

/**
 * POST /api/brand-profiles: create a Brand profile (name required).
 * Optional structured + activeBrief let /brand-profiles/new save in one submit.
 */
export async function POST(
  request: Request,
): Promise<NextResponse<BrandProfileCreateResponse | { error: string }>> {
  const auth = await requireAuthedApi();
  if (!auth.ok) {
    return auth.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Request body must be JSON.");
  }

  if (!isCreateBody(body)) {
    return jsonError(400, "Body must include name: string.");
  }

  const name: string | null = normalizeProfileName(body.name);
  if (name === null) {
    return jsonError(
      400,
      "Name is required (1 to 120 characters after trim).",
    );
  }

  const record: Record<string, unknown> = Object.fromEntries(
    Object.entries(body),
  );

  let structured: BrandProfileStructured = emptyStructuredJson();
  if ("structured" in record) {
    const parsed: BrandProfileStructured | null = parseStructuredInput(
      record.structured,
    );
    if (parsed === null) {
      return jsonError(400, "structured must be an object of string fields.");
    }
    structured = parsed;
  }

  let activeBrief: string = "";
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
    activeBrief = brief;
  }

  const { supabase, user } = auth.ctx;
  const { data, error } = await supabase
    .from("brand_profiles")
    .insert({
      owner_user_id: user.id,
      name,
      structured,
      active_brief: activeBrief,
    })
    .select("id, owner_user_id, name, structured, active_brief, created_at, updated_at")
    .single();

  if (error !== null) {
    return jsonError(500, error.message);
  }

  const row = parseBrandProfileRow(data);
  if (row === null) {
    return jsonError(500, "Could not create Brand profile.");
  }

  return NextResponse.json(
    { profile: toBrandProfileSummary(row) },
    { status: 201 },
  );
}

/**
 * Narrows unknown JSON to a create body with a name field.
 */
function isCreateBody(value: unknown): value is CreateBody {
  return typeof value === "object" && value !== null && "name" in value;
}
