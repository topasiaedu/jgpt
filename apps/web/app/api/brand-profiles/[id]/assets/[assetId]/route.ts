import { NextResponse } from "next/server";

import { jsonError, requireAuthedApi } from "@/lib/brandProfile/apiAuth";
import {
  parseBrandAssetRow,
  toBrandAssetDto,
  type BrandAssetDto,
} from "@/lib/brandProfile/assetsDb";
import { isUuid } from "@/lib/brandProfile/db";
import { userOwnsBrandProfile } from "@/lib/brandProfile/ownedProfile";
import { BRAND_ASSETS_BUCKET } from "@/lib/brandProfile/types";
import { readSupabaseServiceRoleEnv } from "@/lib/supabase/env";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/serviceRole";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ id: string; assetId: string }>;
};

/**
 * DELETE /api/brand-profiles/[id]/assets/[assetId]
 * Removes Storage object, chunks (cascade), and the asset row.
 */
export async function DELETE(
  _request: Request,
  context: RouteParams,
): Promise<NextResponse<{ ok: true; asset: BrandAssetDto } | { error: string }>> {
  const auth = await requireAuthedApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { id: rawProfileId, assetId: rawAssetId } = await context.params;
  const profileId: string = rawProfileId.trim();
  const assetId: string = rawAssetId.trim();
  if (!isUuid(profileId) || !isUuid(assetId)) {
    return jsonError(400, "Invalid Brand profile or asset id.");
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
    .eq("id", assetId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error !== null) {
    return jsonError(500, error.message);
  }

  const row = parseBrandAssetRow(data);
  if (row === null) {
    return jsonError(404, "Brand asset not found.");
  }

  if (row.storage_path !== null && row.storage_path.length > 0) {
    const storageClient =
      readSupabaseServiceRoleEnv() !== null
        ? createServiceRoleSupabaseClient()
        : supabase;
    await storageClient.storage
      .from(BRAND_ASSETS_BUCKET)
      .remove([row.storage_path]);
  }

  const { error: deleteError } = await supabase
    .from("brand_assets")
    .delete()
    .eq("id", assetId)
    .eq("profile_id", profileId);

  if (deleteError !== null) {
    return jsonError(500, deleteError.message);
  }

  return NextResponse.json({ ok: true, asset: toBrandAssetDto(row) });
}
