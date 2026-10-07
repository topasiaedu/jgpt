import { NextResponse } from "next/server";

import { jsonError, requireAuthedApi } from "@/lib/brandProfile/apiAuth";
import { isUuid } from "@/lib/brandProfile/db";
import { resummarizeBrandProfile } from "@/lib/brandProfile/ingest";
import { userOwnsBrandProfile } from "@/lib/brandProfile/ownedProfile";
import type { BrandProfileStructured } from "@/lib/brandProfile/types";
import { readSupabaseServiceRoleEnv } from "@/lib/supabase/env";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/serviceRole";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RouteParams = {
  params: Promise<{ id: string }>;
};

export type BrandResummarizeResponse = {
  activeBrief: string;
  structured: BrandProfileStructured;
};

/**
 * POST /api/brand-profiles/[id]/resummarize
 * Rebuilds active_brief from ready assets + current structured fields.
 * Fills empty structured gaps only; does not wipe user edits.
 */
export async function POST(
  _request: Request,
  context: RouteParams,
): Promise<NextResponse<BrandResummarizeResponse | { error: string }>> {
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

  if (readSupabaseServiceRoleEnv() === null) {
    return jsonError(
      503,
      "SUPABASE_SERVICE_ROLE_KEY is required for re-summarize. Set it in apps/web/.env.local (server-only).",
    );
  }

  const admin = createServiceRoleSupabaseClient();
  const result = await resummarizeBrandProfile(admin, profileId);
  if (!result.ok) {
    return jsonError(422, result.error);
  }

  return NextResponse.json({
    activeBrief: result.activeBrief,
    structured: result.structured,
  });
}
