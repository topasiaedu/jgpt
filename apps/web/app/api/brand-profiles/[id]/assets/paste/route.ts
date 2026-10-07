import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { jsonError, requireAuthedApi } from "@/lib/brandProfile/apiAuth";
import {
  buildBrandAssetStoragePath,
  parseBrandAssetRow,
  toBrandAssetDto,
  type BrandAssetDto,
} from "@/lib/brandProfile/assetsDb";
import { isUuid } from "@/lib/brandProfile/db";
import { userOwnsBrandProfile } from "@/lib/brandProfile/ownedProfile";
import {
  assertAssetCountWithinQuota,
  assertPasteWithinCharQuota,
} from "@/lib/brandProfile/quotas";
import { BRAND_ASSETS_BUCKET } from "@/lib/brandProfile/types";
import { readSupabaseServiceRoleEnv } from "@/lib/supabase/env";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/serviceRole";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export type BrandAssetPasteResponse = {
  asset: BrandAssetDto;
};

/**
 * POST /api/brand-profiles/[id]/assets/paste: store pasted text as a paste asset.
 */
export async function POST(
  request: Request,
  context: RouteParams,
): Promise<NextResponse<BrandAssetPasteResponse | { error: string }>> {
  const auth = await requireAuthedApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { id: rawId } = await context.params;
  const profileId: string = rawId.trim();
  if (!isUuid(profileId)) {
    return jsonError(400, "Invalid Brand profile id.");
  }

  const { supabase, user } = auth.ctx;
  const owned = await userOwnsBrandProfile(supabase, user.id, profileId);
  if (!owned) {
    return jsonError(404, "Brand profile not found.");
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
  const textRaw: unknown = record.text;
  if (typeof textRaw !== "string") {
    return jsonError(400, "text must be a string.");
  }
  const text: string = textRaw.trim();
  const pasteCheck = assertPasteWithinCharQuota(text.length);
  if (!pasteCheck.ok) {
    return jsonError(400, pasteCheck.error);
  }

  const fileNameRaw: unknown = record.fileName;
  const fileName: string =
    typeof fileNameRaw === "string" && fileNameRaw.trim().length > 0
      ? fileNameRaw.trim().slice(0, 180)
      : "paste.txt";

  const { count, error: countError } = await supabase
    .from("brand_assets")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId);

  if (countError !== null) {
    return jsonError(500, countError.message);
  }

  const countCheck = assertAssetCountWithinQuota(count ?? 0);
  if (!countCheck.ok) {
    return jsonError(400, countCheck.error);
  }

  const assetId: string = randomUUID();
  const storagePath: string = buildBrandAssetStoragePath(
    user.id,
    profileId,
    assetId,
  );

  const { data: inserted, error: insertError } = await supabase
    .from("brand_assets")
    .insert({
      id: assetId,
      profile_id: profileId,
      kind: "paste",
      file_name: fileName,
      storage_path: storagePath,
      status: "pending",
      error_message: null,
    })
    .select(
      "id, profile_id, kind, file_name, storage_path, status, error_message, created_at",
    )
    .maybeSingle();

  if (insertError !== null) {
    return jsonError(500, insertError.message);
  }

  const insertedRow = parseBrandAssetRow(inserted);
  if (insertedRow === null) {
    return jsonError(500, "Could not create paste asset row.");
  }

  const bytes = new TextEncoder().encode(text);
  const uploader =
    readSupabaseServiceRoleEnv() !== null
      ? createServiceRoleSupabaseClient()
      : supabase;

  const upload = await uploader.storage
    .from(BRAND_ASSETS_BUCKET)
    .upload(storagePath, bytes, {
      contentType: "text/plain; charset=utf-8",
      upsert: false,
    });

  if (upload.error !== null) {
    await supabase.from("brand_assets").delete().eq("id", assetId);
    return jsonError(500, upload.error.message);
  }

  return NextResponse.json({ asset: toBrandAssetDto(insertedRow) });
}
