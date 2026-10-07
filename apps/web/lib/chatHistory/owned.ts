/**
 * Ownership checks for chat folders (same user as conversation owner).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns true when the signed-in user owns the folder.
 */
export async function userOwnsChatFolder(
  supabase: SupabaseClient,
  userId: string,
  folderId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("chat_folders")
    .select("id")
    .eq("id", folderId)
    .eq("owner_user_id", userId)
    .maybeSingle();

  return error === null && data !== null;
}
