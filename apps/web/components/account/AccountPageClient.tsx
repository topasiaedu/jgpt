"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";

import AppNav from "@/components/AppNav";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { readSupabasePublicEnv } from "@/lib/supabase/env";
import { useAuthSession } from "@/lib/supabase/useAuthSession";

/**
 * Signed-in account settings: email (read-only) and password change.
 */
export default function AccountPageClient() {
  const { t } = useI18n();
  const router = useRouter();
  const auth = useAuthSession();

  const currentPasswordId: string = useId();
  const newPasswordId: string = useId();
  const confirmPasswordId: string = useId();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordInfo, setPasswordInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.ready) {
      return;
    }
    if (auth.envMissing) {
      return;
    }
    if (auth.user === null) {
      router.replace(`/auth?next=${encodeURIComponent("/account")}`);
    }
  }, [auth.ready, auth.envMissing, auth.user, router]);

  /**
   * Re-checks the current password, then updates to the new one.
   */
  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setPasswordError(null);
    setPasswordInfo(null);

    if (readSupabasePublicEnv() === null) {
      setPasswordError(t("authEnvMissing"));
      return;
    }
    if (!auth.ready || auth.user === null) {
      setPasswordError(t("accountNeedSignIn"));
      return;
    }

    const email: string | undefined = auth.user.email;
    if (email === undefined || email.trim().length === 0) {
      setPasswordError(t("accountPasswordNeedEmail"));
      return;
    }

    if (currentPassword.length < 1) {
      setPasswordError(t("accountCurrentPasswordRequired"));
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(t("authPasswordShort"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t("authPasswordMismatch"));
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError(t("accountPasswordUnchanged"));
      return;
    }

    setPasswordBusy(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (reauthError !== null) {
        setPasswordError(t("accountCurrentPasswordWrong"));
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError !== null) {
        const message: string = updateError.message.trim();
        setPasswordError(
          message.length > 0 ? message : t("accountPasswordFailed"),
        );
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordInfo(t("accountPasswordSaved"));
    } catch (caught) {
      const message: string =
        caught instanceof Error ? caught.message : t("accountPasswordFailed");
      setPasswordError(message);
    } finally {
      setPasswordBusy(false);
    }
  }

  const email: string =
    auth.user !== null &&
    typeof auth.user.email === "string" &&
    auth.user.email.trim().length > 0
      ? auth.user.email
      : t("accountEmailMissing");

  return (
    <div className="shell shell-studio shell-account">
      <header className="header header-create">
        <AppNav active="account" />
        <h1 className="studio-title">{t("accountTitle")}</h1>
        <p className="studio-subtitle">{t("accountSubtitle")}</p>
      </header>

      <main className="studio-main account-main">
        {auth.envMissing ? <p className="error">{t("authEnvMissing")}</p> : null}

        {!auth.envMissing && !auth.ready ? (
          <p className="account-muted">{t("authWorking")}</p>
        ) : null}

        {!auth.envMissing && auth.ready && auth.user !== null ? (
          <>
            <section className="account-panel" aria-labelledby="account-email-title">
              <h2 id="account-email-title" className="account-panel-title">
                {t("accountEmailLabel")}
              </h2>
              <p className="account-muted">{email}</p>
            </section>

            <section
              className="account-panel"
              aria-labelledby="account-password-title"
            >
              <h2 id="account-password-title" className="account-panel-title">
                {t("accountPasswordTitle")}
              </h2>
              <p className="account-muted">{t("accountPasswordHint")}</p>
              <form
                className="account-form"
                onSubmit={(event) => void handlePasswordSubmit(event)}
              >
                <div className="account-form-row">
                  <label className="account-label" htmlFor={currentPasswordId}>
                    {t("accountCurrentPassword")}
                  </label>
                  <input
                    id={currentPasswordId}
                    className="input account-input"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) => {
                      setCurrentPassword(event.target.value);
                      setPasswordError(null);
                      setPasswordInfo(null);
                    }}
                    disabled={passwordBusy}
                    required
                  />
                </div>
                <div className="account-form-row">
                  <label className="account-label" htmlFor={newPasswordId}>
                    {t("accountNewPassword")}
                  </label>
                  <input
                    id={newPasswordId}
                    className="input account-input"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                      setPasswordError(null);
                      setPasswordInfo(null);
                    }}
                    disabled={passwordBusy}
                    required
                    minLength={6}
                  />
                </div>
                <div className="account-form-row">
                  <label className="account-label" htmlFor={confirmPasswordId}>
                    {t("accountConfirmPassword")}
                  </label>
                  <input
                    id={confirmPasswordId}
                    className="input account-input"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setPasswordError(null);
                      setPasswordInfo(null);
                    }}
                    disabled={passwordBusy}
                    required
                    minLength={6}
                  />
                </div>
                {passwordError !== null ? (
                  <p className="error">{passwordError}</p>
                ) : null}
                {passwordInfo !== null ? (
                  <p className="account-info">{passwordInfo}</p>
                ) : null}
                <button
                  type="submit"
                  className="send account-submit"
                  disabled={passwordBusy}
                >
                  {passwordBusy ? t("authWorking") : t("accountPasswordSave")}
                </button>
              </form>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
