/**
 * Server-side Brand profile resolution for tool workspace entry.
 * Profile is optional. Missing query means continue without. Unsigned users go to /auth.
 */

import { isUuid } from "@/lib/brandProfile/db";
import {
  hasInvalidProfileQueryParam,
  parseProfileSearchParam,
} from "@/lib/modules/homeHandoff";
import { readSupabasePublicEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ToolBrandProfileResolution =
  | { ok: true; profileId: string | undefined }
  | { ok: false; reason: "need_sign_in" };

type ToolSearchParams = {
  profile?: string | string[];
};

/**
 * Resolves an optional Brand profile for a tool page.
 * Query `profile` is used only when it is a UUID the user owns.
 * Omitted, invalid, or unowned ids open the tool with no profile.
 * Missing auth redirects to /auth.
 */
export async function resolveToolBrandProfile(
  searchParams: ToolSearchParams,
): Promise<ToolBrandProfileResolution> {
  if (readSupabasePublicEnv() === null) {
    return { ok: false, reason: "need_sign_in" };
  }

  let supabase: SupabaseClient;
  try {
    supabase = await createServerSupabaseClient();
  } catch {
    return { ok: false, reason: "need_sign_in" };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError !== null || userData.user === null) {
    return { ok: false, reason: "need_sign_in" };
  }

  const userId: string = userData.user.id;
  if (hasInvalidProfileQueryParam(searchParams)) {
    return { ok: true, profileId: undefined };
  }

  const fromQuery: string | undefined = parseProfileSearchParam(searchParams);
  if (fromQuery === undefined) {
    return { ok: true, profileId: undefined };
  }

  const ownedFromQuery: boolean = await isOwnedBrandProfile(
    supabase,
    userId,
    fromQuery,
  );
  if (!ownedFromQuery) {
    return { ok: true, profileId: undefined };
  }

  await persistLastActiveIfChanged(supabase, userId, fromQuery);
  return { ok: true, profileId: fromQuery };
}

/**
 * True when the Brand profile exists and is owned by userId (RLS + explicit owner check).
 */
async function isOwnedBrandProfile(
  supabase: SupabaseClient,
  userId: string,
  profileId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("brand_profiles")
    .select("id")
    .eq("id", profileId)
    .eq("owner_user_id", userId)
    .maybeSingle();

  return error === null && data !== null;
}

/**
 * Reads last_active_profile_id for the signed-in user.
 */
async function readLastActiveProfileId(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("last_active_profile_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error !== null || data === null) {
    return null;
  }

  if (typeof data !== "object" || !("last_active_profile_id" in data)) {
    return null;
  }

  const raw: unknown = data.last_active_profile_id;
  if (typeof raw !== "string") {
    return null;
  }
  const trimmed: string = raw.trim();
  if (!isUuid(trimmed)) {
    return null;
  }
  return trimmed;
}

/**
 * Keeps last_active in sync when a valid URL profile is used.
 * Failures are ignored so tool entry is not blocked.
 */
async function persistLastActiveIfChanged(
  supabase: SupabaseClient,
  userId: string,
  profileId: string,
): Promise<void> {
  const current: string | null = await readLastActiveProfileId(supabase, userId);
  if (current === profileId) {
    return;
  }

  await supabase.from("user_preferences").upsert(
    {
      user_id: userId,
      last_active_profile_id: profileId,
    },
    { onConflict: "user_id" },
  );
}
