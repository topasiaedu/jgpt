/**
 * Client hook: auth + Brand profile list + last-active preference for the tool picker modal.
 */

import { useCallback, useEffect, useState } from "react";

import {
  createBrandProfile,
  fetchBrandProfiles,
  fetchUserPreferences,
  saveLastActiveProfileId,
} from "@/lib/brandProfile/clientApi";
import type { BrandProfileSummary } from "@/lib/brandProfile/db";
import { useAuthSession } from "@/lib/supabase/useAuthSession";

export type BrandProfileGateState =
  | { kind: "loading" }
  | { kind: "env_missing" }
  | { kind: "signed_out" }
  | { kind: "error"; message: string }
  | { kind: "no_profiles" }
  | {
      kind: "ready";
      profiles: BrandProfileSummary[];
      lastActiveProfileId: string | null;
      saving: boolean;
    };

export type BrandProfileGateResult = {
  state: BrandProfileGateState;
  /** Preference save failure; picker stays usable. */
  actionError: string | null;
  /** True while a new profile is being created in the picker. */
  creating: boolean;
  /**
   * Persists last_active_profile_id. No-op when the list is not ready.
   */
  selectProfile: (profileId: string) => Promise<void>;
  /**
   * Creates a Brand profile, marks it last-active, and returns the new id.
   */
  createProfile: (name: string) => Promise<string | null>;
};

/**
 * Returns last_active when it is still in the list; otherwise null.
 * Does not invent a default. The modal can continue without a profile.
 */
function pickLastActiveProfileId(
  profiles: BrandProfileSummary[],
  lastActiveId: string | null,
): string | null {
  if (lastActiveId === null) {
    return null;
  }
  const match = profiles.find((entry) => entry.id === lastActiveId);
  if (match === undefined) {
    return null;
  }
  return match.id;
}

/**
 * Loads Brand profiles and last-active preference after auth is ready.
 * last_active is used only to preselect in the tool picker, never to block entry.
 */
export function useBrandProfileGate(): BrandProfileGateResult {
  const auth = useAuthSession();
  const [state, setState] = useState<BrandProfileGateState>({ kind: "loading" });
  const [actionError, setActionError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!auth.ready) {
      setState({ kind: "loading" });
      setActionError(null);
      return;
    }
    if (auth.envMissing) {
      setState({ kind: "env_missing" });
      setActionError(null);
      return;
    }
    if (auth.user === null) {
      setState({ kind: "signed_out" });
      setActionError(null);
      return;
    }

    let cancelled = false;

    async function load(): Promise<void> {
      setActionError(null);
      setState({ kind: "loading" });
      const [listResult, prefResult] = await Promise.all([
        fetchBrandProfiles(),
        fetchUserPreferences(),
      ]);
      if (cancelled) {
        return;
      }
      if (!listResult.ok) {
        if (listResult.status === 401) {
          setState({ kind: "signed_out" });
          return;
        }
        setState({ kind: "error", message: listResult.error });
        return;
      }
      if (listResult.profiles.length === 0) {
        setState({ kind: "no_profiles" });
        return;
      }

      const lastActiveId: string | null = prefResult.ok
        ? prefResult.preferences.lastActiveProfileId
        : null;
      const picked: string | null = pickLastActiveProfileId(
        listResult.profiles,
        lastActiveId,
      );

      setState({
        kind: "ready",
        profiles: listResult.profiles,
        lastActiveProfileId: picked,
        saving: false,
      });
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [auth.ready, auth.envMissing, auth.user]);

  /**
   * Creates a profile, sets last_active, and returns the new id (or null on failure).
   */
  const createProfile = useCallback(async (name: string): Promise<string | null> => {
    const trimmed: string = name.trim();
    if (trimmed.length === 0) {
      return null;
    }
    setActionError(null);
    setCreating(true);
    const created = await createBrandProfile(trimmed);
    if (!created.ok) {
      setCreating(false);
      setActionError(created.error);
      return null;
    }
    const saved = await saveLastActiveProfileId(created.profile.id);
    setCreating(false);
    if (!saved.ok) {
      setActionError(saved.error);
    }
    setState((current) => {
      const prior: BrandProfileSummary[] =
        current.kind === "ready" ? current.profiles : [];
      const nextProfiles: BrandProfileSummary[] = [
        created.profile,
        ...prior.filter((entry) => entry.id !== created.profile.id),
      ];
      return {
        kind: "ready",
        profiles: nextProfiles,
        lastActiveProfileId: created.profile.id,
        saving: false,
      };
    });
    return created.profile.id;
  }, []);

  const selectProfile = useCallback(async (profileId: string): Promise<void> => {
    setActionError(null);
    setState((current) => {
      if (current.kind !== "ready") {
        return current;
      }
      return { ...current, saving: true };
    });

    const result = await saveLastActiveProfileId(profileId);
    setState((current) => {
      if (current.kind !== "ready") {
        return current;
      }
      if (!result.ok) {
        return { ...current, saving: false };
      }
      return {
        ...current,
        lastActiveProfileId: profileId,
        saving: false,
      };
    });
    if (!result.ok) {
      setActionError(result.error);
    }
  }, []);

  return { state, actionError, creating, selectProfile, createProfile };
}

/**
 * Profiles shown in the tool picker. Empty until the list is ready.
 */
export function gateProfileList(
  state: BrandProfileGateState,
): BrandProfileSummary[] {
  if (state.kind !== "ready") {
    return [];
  }
  return state.profiles;
}

/**
 * last_active id when it still belongs to the user. Null means no preselect.
 */
export function gateLastActiveProfileId(
  state: BrandProfileGateState,
): string | null {
  if (state.kind !== "ready") {
    return null;
  }
  return state.lastActiveProfileId;
}
