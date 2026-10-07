"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { readSupabasePublicEnv } from "@/lib/supabase/env";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

/** Survives full-page leave from /auth so chrome can keep last known signed-in/out. */
const AUTH_CHROME_HINT_KEY = "influence-engine.auth-chrome";

export type AuthChromeHint = "unknown" | "signed_in" | "signed_out";

export type AuthSessionState = {
  /** False until the first getSession / env check finishes. */
  ready: boolean;
  /** True when NEXT_PUBLIC Supabase env is missing. */
  envMissing: boolean;
  session: Session | null;
  user: User | null;
  /**
   * Last known chrome for nav while `ready` is false.
   * Shared with home so Profile / Sign out do not wait on a second getSession.
   */
  chromeHint: AuthChromeHint;
};

const INITIAL_STATE: AuthSessionState = {
  ready: false,
  envMissing: false,
  session: null,
  user: null,
  chromeHint: "unknown",
};

const AuthSessionContext = createContext<AuthSessionState | null>(null);

type AuthSessionProviderProps = {
  children: ReactNode;
};

/**
 * Maps a session to the chrome hint used by AppNav.
 */
function hintFromSession(session: Session | null): AuthChromeHint {
  return session !== null ? "signed_in" : "signed_out";
}

/**
 * Writes last-known signed-in/out so a document navigation can restore chrome.
 */
export function persistChromeHint(hint: AuthChromeHint): void {
  if (hint === "unknown") {
    return;
  }
  try {
    window.sessionStorage.setItem(AUTH_CHROME_HINT_KEY, hint);
  } catch {
    // Quota or private mode: chrome falls back to a reserved slot until ready.
  }
}

/**
 * Reads last-known chrome from this tab. Missing or junk values are unknown.
 */
function readPersistedChromeHint(): AuthChromeHint {
  try {
    const raw: string | null = window.sessionStorage.getItem(AUTH_CHROME_HINT_KEY);
    if (raw === "signed_in" || raw === "signed_out") {
      return raw;
    }
  } catch {
    // sessionStorage unavailable.
  }
  return "unknown";
}

/**
 * Builds a ready session snapshot and persists chrome for the next page load.
 */
function stateFromSession(session: Session | null): AuthSessionState {
  const chromeHint: AuthChromeHint = hintFromSession(session);
  persistChromeHint(chromeHint);
  const user: User | null = session === null ? null : session.user;
  return {
    ready: true,
    envMissing: false,
    session,
    user,
    chromeHint,
  };
}

/**
 * One browser Auth subscription for the whole tree (nav, home gate, tools).
 * Independent `useAuthSession` state per component used to miss the session in AppNav.
 */
export function AuthSessionProvider({ children }: AuthSessionProviderProps): ReactElement {
  const [state, setState] = useState<AuthSessionState>(INITIAL_STATE);

  useEffect(() => {
    const persisted: AuthChromeHint = readPersistedChromeHint();
    if (persisted !== "unknown") {
      setState((current) => {
        if (current.ready) {
          return current;
        }
        return { ...current, chromeHint: persisted };
      });
    }

    if (readSupabasePublicEnv() === null) {
      setState({
        ready: true,
        envMissing: true,
        session: null,
        user: null,
        chromeHint: "unknown",
      });
      return;
    }

    let cancelled = false;
    let getSessionSettled = false;
    const supabase = createBrowserSupabaseClient();

    void supabase.auth.getSession().then(({ data }) => {
      getSessionSettled = true;
      if (cancelled) {
        return;
      }
      setState(stateFromSession(data.session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) {
        return;
      }
      /**
       * INITIAL_SESSION can emit null before cookie hydration.
       * Ignoring that null avoids a fake signed-out chrome while getSession runs.
       */
      if (event === "INITIAL_SESSION" && !getSessionSettled && session === null) {
        return;
      }
      setState(stateFromSession(session));
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return createElement(AuthSessionContext.Provider, { value: state }, children);
}

/**
 * Shared Supabase Auth session. Must run under AuthSessionProvider.
 */
export function useAuthSession(): AuthSessionState {
  const ctx = useContext(AuthSessionContext);
  if (ctx === null) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }
  return ctx;
}

/**
 * Signs out via the browser client. Returns an error message on failure.
 */
export async function signOutBrowser(): Promise<string | null> {
  if (readSupabasePublicEnv() === null) {
    return "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/web/.env.local.";
  }
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error !== null) {
    return error.message;
  }
  persistChromeHint("signed_out");
  return null;
}
