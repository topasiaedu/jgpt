import type { HookStudioProfile } from "@/lib/hookStudio/types";

/**
 * localStorage key for Hook Studio profile on Hook Formula (`scroll-stop-hook`).
 * Scoped to this tool only; not a backend user DB.
 */
export const HOOK_STUDIO_PROFILE_STORAGE_KEY = "ie-coach-hook-studio:scroll-stop-hook";

const EMPTY_PROFILE: HookStudioProfile = {
  niche: "",
  proof: "",
  topics: "",
};

/**
 * Reads the persisted Hook Studio profile. Returns empty fields on miss or parse failure.
 */
export function readHookStudioProfile(): HookStudioProfile {
  if (typeof window === "undefined") {
    return { ...EMPTY_PROFILE };
  }

  try {
    const raw: string | null = window.localStorage.getItem(HOOK_STUDIO_PROFILE_STORAGE_KEY);
    if (raw === null || raw.trim().length === 0) {
      return { ...EMPTY_PROFILE };
    }
    const parsed: unknown = JSON.parse(raw);
    return normalizeProfile(parsed);
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

/**
 * Persists the Hook Studio profile. Silently ignores quota / private-mode failures.
 */
export function writeHookStudioProfile(profile: HookStudioProfile): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const payload: HookStudioProfile = {
      niche: profile.niche.trim(),
      proof: profile.proof.trim(),
      topics: profile.topics.trim(),
    };
    window.localStorage.setItem(HOOK_STUDIO_PROFILE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures; form still works for the session.
  }
}

/**
 * Narrows unknown JSON into a profile object with string fields only.
 */
function normalizeProfile(value: unknown): HookStudioProfile {
  if (typeof value !== "object" || value === null) {
    return { ...EMPTY_PROFILE };
  }

  const record = value as Record<string, unknown>;
  return {
    niche: typeof record.niche === "string" ? record.niche : "",
    proof: typeof record.proof === "string" ? record.proof : "",
    topics: typeof record.topics === "string" ? record.topics : "",
  };
}
