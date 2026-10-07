"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/messages";
import { buildAuthHref } from "@/lib/modules/homeHandoff";
import { signOutBrowser, useAuthSession } from "@/lib/supabase/useAuthSession";

export type AppNavActive =
  | "home"
  | "tools"
  | "brandProfiles"
  | "account"
  | "auth";

export type AppNavPlacement = "top" | "rail";

type AppNavProps = {
  active: AppNavActive;
  /**
   * `top`: page header chrome (hidden when signed-in history rail owns nav).
   * `rail`: brand + account controls inside ChatHistoryShell.
   */
  placement?: AppNavPlacement;
  /**
   * Optional control rendered as the first row inside the signed-in rail nav
   * (e.g. New chat) before All Tools / Brand profile / Account / Sign out.
   */
  railInsertAfterBrand?: ReactNode;
};

/**
 * Derives the active nav key from the current pathname for the history rail.
 */
export function appNavActiveFromPath(pathname: string): AppNavActive {
  if (pathname === "/auth" || pathname.startsWith("/auth/")) {
    return "auth";
  }
  if (
    pathname === "/brand-profiles" ||
    pathname.startsWith("/brand-profiles/")
  ) {
    return "brandProfiles";
  }
  if (pathname === "/account" || pathname.startsWith("/account/")) {
    return "account";
  }
  // Only the All Tools index: /tools/[moduleId] must not light the nav item.
  if (pathname === "/tools" || pathname === "/tools/") {
    return "tools";
  }
  return "home";
}

/**
 * 中文 | EN control shared by top nav and the signed-in rail footer.
 */
export function AppNavLocaleToggle() {
  const { locale, setLocale, t } = useI18n();

  /**
   * Sets chrome locale from the language control.
   */
  function handleLocaleChange(next: Locale): void {
    setLocale(next);
  }

  return (
    <div className="locale-toggle" role="group" aria-label={t("localeToggleLabel")}>
      <button
        type="button"
        className={
          locale === "zh" ? "locale-toggle-btn locale-toggle-btn-active" : "locale-toggle-btn"
        }
        aria-pressed={locale === "zh"}
        onClick={() => {
          handleLocaleChange("zh");
        }}
      >
        {t("localeToggleZh")}
      </button>
      <button
        type="button"
        className={
          locale === "en" ? "locale-toggle-btn locale-toggle-btn-active" : "locale-toggle-btn"
        }
        aria-pressed={locale === "en"}
        onClick={() => {
          handleLocaleChange("en");
        }}
      >
        {t("localeToggleEn")}
      </button>
    </div>
  );
}

/**
 * Thin-line rail icon: grid for All Tools.
 */
function RailIconTools() {
  return (
    <svg
      className="app-nav-rail-icon"
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.25" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.25" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.25" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.25" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/**
 * Thin-line rail icon: folder/brief for Brand profile (not account settings).
 */
function RailIconBrandProfile() {
  return (
    <svg
      className="app-nav-rail-icon"
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 6.25A1.75 1.75 0 0 1 5.25 4.5h3.1c.3 0 .58.12.79.33l.9.9c.2.21.48.33.79.33h3.92A1.75 1.75 0 0 1 16.5 7.8v6.95A1.75 1.75 0 0 1 14.75 16.5H5.25A1.75 1.75 0 0 1 3.5 14.75V6.25Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Thin-line rail icon: user for Account settings (password).
 */
function RailIconAccount() {
  return (
    <svg
      className="app-nav-rail-icon"
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4.5 16c1.2-2.4 3-3.6 5.5-3.6s4.3 1.2 5.5 3.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Thin-line rail icon: door/arrow for Sign out.
 */
function RailIconSignOut() {
  return (
    <svg
      className="app-nav-rail-icon"
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8.5 4.5H5.25A1.75 1.75 0 0 0 3.5 6.25v7.5c0 .97.78 1.75 1.75 1.75H8.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M11 6.5 14.5 10 11 13.5M14.25 10H8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Product nav: brand mark (home), tools, Brand profile, Account, sign out, locale.
 * Signed-in routes render this in the history rail; signed-out and auth keep the top bar.
 */
export default function AppNav({
  active,
  placement = "top",
  railInsertAfterBrand = null,
}: AppNavProps) {
  const { t } = useI18n();
  const auth = useAuthSession();
  const pathname = usePathname();
  const router = useRouter();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const signedIn: boolean =
    auth.user !== null || (!auth.ready && auth.chromeHint === "signed_in");
  const signedOut: boolean =
    (auth.ready && auth.user === null && !auth.envMissing) ||
    (!auth.ready && auth.chromeHint === "signed_out");
  const authPending: boolean =
    !auth.ready && auth.chromeHint === "unknown" && !auth.envMissing;
  const onAuthSurface: boolean =
    active === "auth" ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/");
  const isRail: boolean = placement === "rail";

  /**
   * Signed-in product pages hide the top bar; ChatHistoryShell owns brand and actions.
   * Auth surfaces keep top chrome even when a session exists.
   */
  if (placement === "top" && signedIn && !onAuthSurface) {
    return null;
  }

  /**
   * Signs out and sends the visitor to /auth. Never leaves them unsigned on home.
   */
  async function handleSignOut(): Promise<void> {
    setSignOutError(null);
    setSigningOut(true);
    const error = await signOutBrowser();
    setSigningOut(false);
    if (error !== null) {
      setSignOutError(error);
      return;
    }
    router.replace(signInHref(pathname));
  }

  const barClassName: string =
    isRail ? "app-nav-bar app-nav-bar-rail" : "app-nav-bar";
  const showSignedInChrome: boolean = signedIn || isRail;

  return (
    <div className={barClassName}>
      <Link href="/" className="app-nav-brand" aria-label={t("productName")}>
        <Image
          src="/brand/influence-engine-mark.png"
          alt=""
          width={40}
          height={47}
          className="app-nav-mark"
          priority
        />
        <span className="app-nav-wordmark">
          <span className="app-nav-product">{t("productName")}</span>
          {isRail ? null : (
            <span className="app-nav-tagline">{t("productTagline")}</span>
          )}
        </span>
      </Link>
      <div className="app-nav-actions">
        <nav className="app-nav" aria-label={t("navPrimaryLabel")}>
          {isRail && railInsertAfterBrand !== null ? railInsertAfterBrand : null}
          <Link
            href="/tools"
            className={
              active === "tools" ? "app-nav-link app-nav-link-active" : "app-nav-link"
            }
            aria-current={active === "tools" ? "page" : undefined}
          >
            {isRail ? <RailIconTools /> : null}
            <span>{t("navTools")}</span>
          </Link>
          {showSignedInChrome ? (
            <Link
              href="/brand-profiles"
              className={
                active === "brandProfiles"
                  ? "app-nav-link app-nav-link-active"
                  : "app-nav-link"
              }
              aria-current={active === "brandProfiles" ? "page" : undefined}
            >
              {isRail ? <RailIconBrandProfile /> : null}
              <span>{t("navBrandProfiles")}</span>
            </Link>
          ) : authPending ? (
            <span className="app-nav-auth-slot" aria-hidden="true" />
          ) : null}
          {isRail && showSignedInChrome ? (
            <Link
              href="/account"
              className={
                active === "account"
                  ? "app-nav-link app-nav-link-quiet app-nav-link-active"
                  : "app-nav-link app-nav-link-quiet"
              }
              aria-current={active === "account" ? "page" : undefined}
            >
              <RailIconAccount />
              <span>{t("navAccount")}</span>
            </Link>
          ) : null}
          {isRail && showSignedInChrome ? (
            <button
              type="button"
              className="app-nav-signout app-nav-signout-quiet"
              disabled={signingOut}
              onClick={() => {
                void handleSignOut();
              }}
            >
              <RailIconSignOut />
              <span>{signingOut ? t("authWorking") : t("navSignOut")}</span>
            </button>
          ) : null}
        </nav>
        {!isRail ? (
          <div className="app-nav-cluster">
            {signedOut && active !== "auth" && placement === "top" ? (
              <Link href={signInHref(pathname)} className="app-nav-cta">
                {t("navSignIn")}
              </Link>
            ) : null}
            {showSignedInChrome ? (
              <div className="app-nav-account" aria-label={t("navAccountLabel")}>
                <button
                  type="button"
                  className="app-nav-signout"
                  disabled={signingOut}
                  onClick={() => {
                    void handleSignOut();
                  }}
                >
                  {signingOut ? t("authWorking") : t("navSignOut")}
                </button>
              </div>
            ) : authPending ? (
              <span className="app-nav-auth-slot" aria-hidden="true" />
            ) : null}
            <span className="app-nav-rule" aria-hidden="true" />
            <AppNavLocaleToggle />
          </div>
        ) : null}
      </div>
      {signOutError !== null ? (
        <p className="error app-nav-error" role="alert">
          {signOutError}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Builds /auth?next= for the current path, same-origin relative only.
 */
function signInHref(pathname: string): string {
  const next: string =
    pathname.startsWith("/") && !pathname.startsWith("//") && pathname !== "/auth"
      ? pathname
      : "/";
  return buildAuthHref(next);
}
