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
import { inferBrandAssetKind } from "@/lib/brandProfile/extract";
import { userOwnsBrandProfile } from "@/lib/brandProfile/ownedProfile";
import {
  assertAssetCountWithinQuota,
  assertFileWithinByteQuota,
} from "@/lib/brandProfile/quotas";
import {
  BRAND_ASSETS_BUCKET,
  type BrandAssetKind,
} from "@/lib/brandProfile/types";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/serviceRole";
import { readSupabaseServiceRoleEnv } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export type BrandAssetsListResponse = {
  assets: BrandAssetDto[];
};

export type BrandAssetCreateResponse = {
  asset: BrandAssetDto;
};

/**
 * GET /api/brand-profiles/[id]/assets: list documents for an owned profile.
 */
export async function GET(
  _request: Request,
  context: RouteParams,
): Promise<NextResponse<BrandAssetsListResponse | { error: string }>> {
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

  const { data, error } = await supabase
    .from("brand_assets")
    .select(
      "id, profile_id, kind, file_name, storage_path, status, error_message, created_at",
    )
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error !== null) {
    return jsonError(500, error.message);
  }

  const assets: BrandAssetDto[] = [];
  for (const item of data ?? []) {
    const row = parseBrandAssetRow(item);
    if (row !== null) {
      assets.push(toBrandAssetDto(row));
    }
  }

  return NextResponse.json({ assets });
}

/**
 * POST /api/brand-profiles/[id]/assets: multipart file upload.
 * Creates a pending asset, stores the original in Storage, returns the asset.
 * Client should call /process next.
 */
export async function POST(
  request: Request,
  context: RouteParams,
): Promise<NextResponse<BrandAssetCreateResponse | { error: string }>> {
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

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError(400, "Expected multipart form data with a file field.");
  }

  const fileValue: FormDataEntryValue | null = formData.get("file");
  if (fileValue === null || typeof fileValue === "string") {
    return jsonError(400, "Missing file field.");
  }

  const file: File = fileValue;
  const byteLength: number = file.size;
  const sizeCheck = assertFileWithinByteQuota(byteLength);
  if (!sizeCheck.ok) {
    return jsonError(400, sizeCheck.error);
  }

  const fileName: string =
    file.name.trim().length > 0 ? file.name.trim() : "upload.bin";
  const kind: BrandAssetKind | null = inferBrandAssetKind(
    fileName,
    file.type || "",
  );
  if (kind === null) {
    return jsonError(
      400,
      "Unsupported file type. Use PDF, PPTX, .txt, or .md.",
    );
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
      kind,
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
    return jsonError(500, "Could not create Brand asset row.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType: string =
    file.type.trim().length > 0 ? file.type : "application/octet-stream";

  const uploader =
    readSupabaseServiceRoleEnv() !== null
      ? createServiceRoleSupabaseClient()
      : supabase;

  const upload = await uploader.storage
    .from(BRAND_ASSETS_BUCKET)
    .upload(storagePath, bytes, {
      contentType,
      upsert: false,
    });

  if (upload.error !== null) {
    await supabase.from("brand_assets").delete().eq("id", assetId);
    return jsonError(500, upload.error.message);
  }

  return NextResponse.json({ asset: toBrandAssetDto(insertedRow) });
}
