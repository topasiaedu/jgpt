import { NextResponse } from "next/server";

import { jsonError, requireAuthedApi } from "@/lib/brandProfile/apiAuth";
import {
  isUuid,
  parseUserPreferencesRow,
  toUserPreferencesDto,
  type UserPreferencesDto,
} from "@/lib/brandProfile/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type UserPreferencesResponse = {
  preferences: UserPreferencesDto;
};

/**
 * GET /api/user-preferences: last_active_profile_id for the signed-in user.
 */
export async function GET(): Promise<
  NextResponse<UserPreferencesResponse | { error: string }>
> {
  const auth = await requireAuthedApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { supabase, user } = auth.ctx;
  const { data, error } = await supabase
    .from("user_preferences")
    .select("user_id, last_active_profile_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error !== null) {
    return jsonError(500, error.message);
  }

  return NextResponse.json({
    preferences: toUserPreferencesDto(parseUserPreferencesRow(data)),
  });
}

/**
 * PUT /api/user-preferences: upsert lastActiveProfileId (null clears).
 * Profile must be owned by the caller when non-null.
 */
export async function PUT(
  request: Request,
): Promise<NextResponse<UserPreferencesResponse | { error: string }>> {
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

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return jsonError(400, "Body must be a JSON object.");
  }

  const record: Record<string, unknown> = Object.fromEntries(
    Object.entries(body),
  );
  if (!("lastActiveProfileId" in record)) {
    return jsonError(400, "Body must include lastActiveProfileId.");
  }

  const rawId: unknown = record.lastActiveProfileId;
  let lastActiveProfileId: string | null;

  if (rawId === null) {
    lastActiveProfileId = null;
  } else if (typeof rawId === "string" && isUuid(rawId)) {
    lastActiveProfileId = rawId.trim();
  } else {
    return jsonError(
      400,
      "lastActiveProfileId must be a UUID string or null.",
    );
  }

  const { supabase, user } = auth.ctx;

  if (lastActiveProfileId !== null) {
    const { data: owned, error: ownedError } = await supabase
      .from("brand_profiles")
      .select("id")
      .eq("id", lastActiveProfileId)
      .eq("owner_user_id", user.id)
      .maybeSingle();

    if (ownedError !== null) {
      return jsonError(500, ownedError.message);
    }
    if (owned === null) {
      return jsonError(
        400,
        "lastActiveProfileId must reference a Brand profile you own.",
      );
    }
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: user.id,
        last_active_profile_id: lastActiveProfileId,
      },
      { onConflict: "user_id" },
    )
    .select("user_id, last_active_profile_id")
    .single();

  if (error !== null) {
    return jsonError(500, error.message);
  }

  const row = parseUserPreferencesRow(data);
  if (row === null) {
    return jsonError(500, "Could not save user preferences.");
  }

  return NextResponse.json({
    preferences: toUserPreferencesDto(row),
  });
}
