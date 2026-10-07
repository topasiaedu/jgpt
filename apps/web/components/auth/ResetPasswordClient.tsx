"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import AppNav from "@/components/AppNav";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { readSupabasePublicEnv } from "@/lib/supabase/env";
import { safeNextPath } from "@/lib/supabase/safeNextPath";
import { useAuthSession } from "@/lib/supabase/useAuthSession";

/**
 * Sets a new password after a recovery email session is established.
 */
export default function ResetPasswordClient() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuthSession();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [recoveryReady, setRecoveryReady] = useState(false);

  const nextPath: string = safeNextPath(searchParams.get("next"));

  useEffect(() => {
    if (readSupabasePublicEnv() === null) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setRecoveryReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (auth.ready && auth.user !== null) {
      setRecoveryReady(true);
    }
  }, [auth.ready, auth.user]);

  /**
   * Updates the signed-in recovery user's password.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (readSupabasePublicEnv() === null) {
      setError(t("authEnvMissing"));
      return;
    }

    if (!auth.ready || auth.user === null) {
      setError(t("authResetNeedSession"));
      return;
    }

    if (password.length < 6) {
      setError(t("authPasswordShort"));
      return;
    }

    if (password !== confirm) {
      setError(t("authResetMismatch"));
      return;
    }

    setBusy(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError !== null) {
        const message: string = updateError.message.trim();
        setError(message.length > 0 ? message : t("authResetFailed"));
        return;
      }
      setInfo(t("authResetSuccess"));
      router.replace(nextPath);
    } catch (caught) {
      const message: string =
        caught instanceof Error ? caught.message : t("authResetFailed");
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  const showForm: boolean =
    !auth.envMissing && auth.ready && (recoveryReady || auth.user !== null);
  const showNeedSession: boolean =
    !auth.envMissing && auth.ready && auth.user === null && !recoveryReady;

  return (
    <div className="shell shell-studio shell-auth">
      <header className="header header-create">
        <AppNav active="auth" />
      </header>

      <main className="studio-main">
        <div className="auth-surface empty-state-enter">
          <h1 className="create-ask">{t("authResetTitle")}</h1>
          <p className="create-tip">{t("authResetSubtitle")}</p>

          {auth.envMissing ? <p className="error">{t("authEnvMissing")}</p> : null}

          {showNeedSession ? (
            <section className="auth-panel">
              <p className="error">{t("authResetNeedSession")}</p>
              <div className="auth-switch">
                <Link className="auth-text-link" href="/auth?mode=forgot">
                  {t("authForgotLink")}
                </Link>
              </div>
            </section>
          ) : null}

          {showForm ? (
            <section className="auth-panel" aria-labelledby="reset-form-title">
              <h2 id="reset-form-title" className="sr-only">
                {t("authResetTitle")}
              </h2>

              <form
                className="account-form auth-form"
                onSubmit={(event) => void handleSubmit(event)}
              >
                <div className="auth-field">
                  <label className="account-label" htmlFor="reset-password">
                    {t("authResetPassword")}
                  </label>
                  <input
                    id="reset-password"
                    className="input account-input"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                    }}
                    disabled={busy}
                    required
                    minLength={6}
                  />
                </div>

                <div className="auth-field">
                  <label className="account-label" htmlFor="reset-confirm">
                    {t("authResetConfirm")}
                  </label>
                  <input
                    id="reset-confirm"
                    className="input account-input"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(event) => {
                      setConfirm(event.target.value);
                    }}
                    disabled={busy}
                    required
                    minLength={6}
                  />
                </div>

                {error !== null ? <p className="error">{error}</p> : null}
                {info !== null ? <p className="account-info">{info}</p> : null}

                <button type="submit" className="send account-submit" disabled={busy}>
                  {busy ? t("authWorking") : t("authResetSubmit")}
                </button>
              </form>

              <div className="auth-switch">
                <Link className="auth-text-link" href="/auth">
                  {t("authBackToSignIn")}
                </Link>
              </div>
            </section>
          ) : null}

          {!auth.envMissing && !auth.ready ? (
            <p className="account-muted">{t("authWorking")}</p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
