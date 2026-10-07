import { NextResponse } from "next/server";

import { jsonError, requireAuthedApi } from "@/lib/brandProfile/apiAuth";
import type { BrandAssetDto } from "@/lib/brandProfile/assetsDb";
import { isUuid } from "@/lib/brandProfile/db";
import { processBrandAssetIngest } from "@/lib/brandProfile/ingest";
import { userOwnsBrandProfile } from "@/lib/brandProfile/ownedProfile";
import { readSupabaseServiceRoleEnv } from "@/lib/supabase/env";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/serviceRole";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RouteParams = {
  params: Promise<{ id: string; assetId: string }>;
};

export type BrandAssetProcessResponse = {
  asset: BrandAssetDto;
};

/**
 * POST /api/brand-profiles/[id]/assets/[assetId]/process
 * Runs extract → chunk → embed → summarize for one pending/failed asset.
 */
export async function POST(
  _request: Request,
  context: RouteParams,
): Promise<NextResponse<BrandAssetProcessResponse | { error: string }>> {
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

  if (readSupabaseServiceRoleEnv() === null) {
    return jsonError(
      503,
      "SUPABASE_SERVICE_ROLE_KEY is required for document ingest. Set it in apps/web/.env.local (server-only).",
    );
  }

  const admin = createServiceRoleSupabaseClient();
  const result = await processBrandAssetIngest(admin, profileId, assetId);

  if (!result.ok) {
    if (result.asset !== null) {
      return NextResponse.json(
        { error: result.error, asset: result.asset },
        { status: 422 },
      );
    }
    return jsonError(422, result.error);
  }

  return NextResponse.json({ asset: result.asset });
}
