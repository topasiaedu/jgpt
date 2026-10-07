"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import AppNav from "@/components/AppNav";
import {
  persistLocaleChoice,
  readPersistedLocale,
} from "@/lib/i18n/localePersistence";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { readSupabasePublicEnv } from "@/lib/supabase/env";
import { safeNextPath, withLocaleQuery } from "@/lib/supabase/safeNextPath";
import { persistChromeHint, useAuthSession } from "@/lib/supabase/useAuthSession";

type AuthMode = "signIn" | "signUp" | "forgot";

const REFERRAL_CODE_MAX_LENGTH = 64;
const REFERRAL_CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

type ReferralParseResult =
  | { ok: true; value: string | null }
  | { ok: false };

type SignUpUserMetadata = {
  referral_code: string;
};

/**
 * Sign-in-first email/password auth with forgot-password request.
 * Sign up sits as a bottom link (no top mode toggle).
 */
export default function AuthPageClient() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const auth = useAuthSession();

  const [mode, setMode] = useState<AuthMode>(() =>
    parseAuthMode(searchParams.get("mode")),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(() =>
    mapQueryError(searchParams.get("error"), t),
  );
  const [info, setInfo] = useState<string | null>(null);

  const nextPath: string = safeNextPath(searchParams.get("next"));

  useEffect(() => {
    if (auth.ready && auth.user !== null && mode !== "forgot") {
      leaveAuthPage(nextPath);
    }
  }, [auth.ready, auth.user, mode, nextPath]);

  /**
   * Switches mode and clears transient form feedback.
   */
  function switchMode(nextMode: AuthMode): void {
    setMode(nextMode);
    setError(null);
    setInfo(null);
    setPassword("");
    setConfirmPassword("");
    setReferralCode("");
  }

  /**
   * Submits sign in, sign up, or forgot-password against Supabase Auth.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (readSupabasePublicEnv() === null) {
      setError(t("authEnvMissing"));
      return;
    }

    const trimmedEmail: string = email.trim().toLowerCase();
    if (trimmedEmail.length === 0 || !trimmedEmail.includes("@")) {
      setError(t("authEmailInvalid"));
      return;
    }

    if (mode !== "forgot" && password.length < 6) {
      setError(t("authPasswordShort"));
      return;
    }

    let referralValue: string | null = null;
    if (mode === "signUp") {
      if (password !== confirmPassword) {
        setError(t("authPasswordMismatch"));
        return;
      }
      const referralParsed: ReferralParseResult = parseReferralCode(referralCode);
      if (referralParsed.ok === false) {
        setError(t("authReferralInvalid"));
        return;
      }
      referralValue = referralParsed.value;
    }

    setBusy(true);
    try {
      const supabase = createBrowserSupabaseClient();

      if (mode === "forgot") {
        const redirectTo: string = buildRecoveryRedirectTo();
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          trimmedEmail,
          { redirectTo },
        );
        if (resetError !== null) {
          setError(mapAuthError(resetError.message, t("authForgotFailed")));
          return;
        }
        setInfo(t("authForgotSent"));
        return;
      }

      if (mode === "signIn") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (signInError !== null) {
          setError(mapAuthError(signInError.message, t("authSignInFailed")));
          return;
        }
        leaveAuthPage(nextPath);
        return;
      }

      const signUpMetadata: SignUpUserMetadata | undefined =
        referralValue === null
          ? undefined
          : { referral_code: referralValue };
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options:
          signUpMetadata === undefined ? undefined : { data: signUpMetadata },
      });
      if (signUpError !== null) {
        setError(mapAuthError(signUpError.message, t("authSignUpFailed")));
        return;
      }

      if (data.session !== null) {
        leaveAuthPage(nextPath);
        return;
      }

      // Email confirmation may be required in the dashboard.
      setInfo(t("authConfirmEmail"));
      switchMode("signIn");
    } catch (caught) {
      const message: string =
        caught instanceof Error ? caught.message : t("authSignInFailed");
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  const title: string =
    mode === "forgot"
      ? t("authForgotTitle")
      : mode === "signUp"
        ? t("authSignUpTitle")
        : t("authTitle");
  const subtitle: string =
    mode === "forgot"
      ? t("authForgotSubtitle")
      : mode === "signUp"
        ? t("authSignUpSubtitle")
        : t("authSubtitle");

  return (
    <div className="shell shell-studio shell-auth">
      <header className="header header-create">
        <AppNav active="auth" />
      </header>

      <main className="studio-main">
        <div className="auth-surface empty-state-enter">
          <h1 className="create-ask">{title}</h1>
          <p className="create-tip">{subtitle}</p>

          {auth.envMissing ? <p className="error">{t("authEnvMissing")}</p> : null}

          {!auth.envMissing && auth.ready && auth.user !== null && mode !== "forgot" ? (
            <p className="account-muted">{t("authAlreadySignedIn")}</p>
          ) : null}

          {!auth.envMissing && (auth.user === null || !auth.ready || mode === "forgot") ? (
            <section className="auth-panel" aria-labelledby="auth-form-title">
              <h2 id="auth-form-title" className="sr-only">
                {title}
              </h2>

              <form
                className="account-form auth-form"
                onSubmit={(event) => void handleSubmit(event)}
              >
                <div className="auth-field">
                  <label className="account-label" htmlFor="auth-email">
                    {t("authEmail")}
                  </label>
                  <input
                    id="auth-email"
                    className="input account-input"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                    }}
                    disabled={busy}
                    required
                  />
                </div>

                {mode !== "forgot" ? (
                  <div className="auth-field">
                    <label className="account-label" htmlFor="auth-password">
                      {t("authPassword")}
                    </label>
                    <input
                      id="auth-password"
                      className="input account-input"
                      type="password"
                      autoComplete={
                        mode === "signIn" ? "current-password" : "new-password"
                      }
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                      }}
                      disabled={busy}
                      required
                      minLength={6}
                    />
                  </div>
                ) : null}

                {mode === "signUp" ? (
                  <div className="auth-field">
                    <label className="account-label" htmlFor="auth-confirm-password">
                      {t("authConfirmPassword")}
                    </label>
                    <input
                      id="auth-confirm-password"
                      className="input account-input"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                      }}
                      disabled={busy}
                      required
                      minLength={6}
                    />
                  </div>
                ) : null}

                {mode === "signUp" ? (
                  <div className="auth-field auth-field-optional">
                    <label className="account-label" htmlFor="auth-referral-code">
                      {t("authReferralCode")}
                    </label>
                    <input
                      id="auth-referral-code"
                      className="input account-input"
                      type="text"
                      autoComplete="off"
                      spellCheck={false}
                      value={referralCode}
                      onChange={(event) => {
                        setReferralCode(event.target.value);
                      }}
                      disabled={busy}
                      maxLength={REFERRAL_CODE_MAX_LENGTH}
                    />
                  </div>
                ) : null}

                {mode === "signIn" ? (
                  <button
                    type="button"
                    className="auth-text-link auth-forgot-link"
                    onClick={() => {
                      switchMode("forgot");
                    }}
                    disabled={busy}
                  >
                    {t("authForgotLink")}
                  </button>
                ) : null}

                {error !== null ? <p className="error">{error}</p> : null}
                {info !== null ? <p className="account-info">{info}</p> : null}

                <button type="submit" className="send account-submit" disabled={busy}>
                  {busy
                    ? t("authWorking")
                    : mode === "forgot"
                      ? t("authForgotSubmit")
                      : mode === "signIn"
                        ? t("authSignIn")
                        : t("authSignUp")}
                </button>
              </form>

              <div className="auth-switch">
                {mode === "signIn" ? (
                  <p className="auth-switch-row">
                    <span className="account-muted">{t("authSwitchToSignUpBefore")}</span>{" "}
                    <button
                      type="button"
                      className="auth-text-link"
                      onClick={() => {
                        switchMode("signUp");
                      }}
                      disabled={busy}
                    >
                      {t("authSwitchToSignUpAction")}
                    </button>
                  </p>
                ) : null}

                {mode === "signUp" ? (
                  <p className="auth-switch-row">
                    <span className="account-muted">{t("authSwitchToSignInBefore")}</span>{" "}
                    <button
                      type="button"
                      className="auth-text-link"
                      onClick={() => {
                        switchMode("signIn");
                      }}
                      disabled={busy}
                    >
                      {t("authSwitchToSignInAction")}
                    </button>
                  </p>
                ) : null}

                {mode === "forgot" ? (
                  <p className="auth-switch-row">
                    <button
                      type="button"
                      className="auth-text-link"
                      onClick={() => {
                        switchMode("signIn");
                      }}
                      disabled={busy}
                    >
                      {t("authBackToSignIn")}
                    </button>
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}

/**
 * Leaves /auth with a document navigation so App Router cannot no-op
 * `router.replace` when `next` is already this page.
 * Re-writes the locale cookie from storage (not React state) so a signed-in
 * effect cannot replace home before LocaleProvider hydrates, flashing zh.
 */
function leaveAuthPage(nextPath: string): void {
  persistChromeHint("signed_in");
  const storedLocale = readPersistedLocale();
  const safePath: string = safeNextPath(nextPath);
  if (storedLocale !== null) {
    persistLocaleChoice(storedLocale);
    window.location.replace(withLocaleQuery(safePath, storedLocale));
    return;
  }
  window.location.replace(safePath);
}

/**
 * Builds the recovery redirect URL for resetPasswordForEmail (PKCE callback).
 */
function buildRecoveryRedirectTo(): string {
  const origin: string = window.location.origin;
  const next: string = encodeURIComponent("/auth/reset");
  return `${origin}/auth/callback?next=${next}`;
}

/**
 * Reads initial auth view from ?mode=.
 */
function parseAuthMode(raw: string | null): AuthMode {
  if (raw === "signUp" || raw === "forgot") {
    return raw;
  }
  return "signIn";
}

/**
 * Maps callback/confirm error query params to student-facing copy.
 */
function mapQueryError(
  raw: string | null,
  t: (key: "authLinkInvalid" | "authEnvMissing") => string,
): string | null {
  if (raw === "link") {
    return t("authLinkInvalid");
  }
  if (raw === "env") {
    return t("authEnvMissing");
  }
  return null;
}

/**
 * Softens common Supabase Auth error strings for the UI.
 */
function mapAuthError(message: string, fallback: string): string {
  const trimmed: string = message.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

/**
 * Trims an optional referral code. Empty is valid. Rejects oversized or messy input.
 */
function parseReferralCode(raw: string): ReferralParseResult {
  const trimmed: string = raw.trim();
  if (trimmed.length === 0) {
    return { ok: true, value: null };
  }
  if (trimmed.length > REFERRAL_CODE_MAX_LENGTH) {
    return { ok: false };
  }
  if (REFERRAL_CODE_PATTERN.test(trimmed) === false) {
    return { ok: false };
  }
  return { ok: true, value: trimmed };
}
