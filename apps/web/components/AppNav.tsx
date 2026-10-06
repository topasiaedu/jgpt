"use client";

import Image from "next/image";
import Link from "next/link";

import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/messages";

export type AppNavActive = "home" | "tools";

type AppNavProps = {
  active: AppNavActive;
};

/**
 * Top product nav: brand mark (home) + All Tools + locale toggle.
 */
export default function AppNav({ active }: AppNavProps) {
  const { locale, setLocale, t } = useI18n();

  /**
   * Sets chrome locale from the language control.
   */
  function handleLocaleChange(next: Locale): void {
    setLocale(next);
  }

  return (
    <div className="app-nav-bar">
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
          <span className="app-nav-tagline">{t("productTagline")}</span>
        </span>
      </Link>
      <div className="app-nav-actions">
        <nav className="app-nav" aria-label="Primary">
          <Link
            href="/tools"
            className={active === "tools" ? "app-nav-link app-nav-link-active" : "app-nav-link"}
            aria-current={active === "tools" ? "page" : undefined}
          >
            {t("navTools")}
          </Link>
        </nav>
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
      </div>
    </div>
  );
}
