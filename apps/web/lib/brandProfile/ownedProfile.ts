/**
 * Ownership helpers for Brand profile API routes.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns true when the signed-in user owns the Brand profile.
 */
export async function userOwnsBrandProfile(
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
