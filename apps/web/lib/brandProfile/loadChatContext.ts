/**
 * Loads an owned Brand profile for /api/chat (brief + structured only).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  parseBrandProfileRow,
  toBrandProfileDetail,
  type BrandProfileDetail,
} from "@/lib/brandProfile/db";

/**
 * Returns the owned Brand profile detail, or null when missing / not owned (RLS).
 */
export async function loadOwnedBrandProfileForChat(
  supabase: SupabaseClient,
  profileId: string,
): Promise<BrandProfileDetail | null> {
  const { data, error } = await supabase
    .from("brand_profiles")
    .select(
      "id, owner_user_id, name, structured, active_brief, created_at, updated_at",
    )
    .eq("id", profileId)
    .maybeSingle();

  if (error !== null || data === null) {
    return null;
  }

  const row = parseBrandProfileRow(data);
  if (row === null) {
    return null;
  }

  return toBrandProfileDetail(row);
}
