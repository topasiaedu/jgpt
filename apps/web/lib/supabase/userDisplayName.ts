import type { User } from "@supabase/supabase-js";

const DISPLAY_NAME_KEYS = ["full_name", "display_name", "name"] as const;

/**
 * Reads a display name from Supabase `user_metadata` without unsafe casts.
 * Prefers `full_name`, then `display_name`, then `name`.
 */
export function readUserDisplayName(user: User): string {
  const metadata: object = user.user_metadata;
  for (const key of DISPLAY_NAME_KEYS) {
    const value: unknown = Reflect.get(metadata, key);
    if (typeof value === "string") {
      return value.trim();
    }
  }
  return "";
}
