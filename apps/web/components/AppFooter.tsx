"use client";

import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/messages";

const WEBINAR_URL = "https://webinar.influenceengine.co/opt-in";

/**
 * Soft footer: draft disclaimer, webinar link (no scarcity), locale toggle.
 */
export default function AppFooter() {
  const { locale, setLocale, t } = useI18n();

  /**
   * Sets chrome locale from the language control.
   */
  function handleLocaleChange(next: Locale): void {
    setLocale(next);
  }

  return (
    <footer className="app-footer">
      <p className="app-footer-disclaimer">{t("footerDisclaimer")}</p>
      <div className="app-footer-row">
        <a
          className="app-footer-webinar"
          href={WEBINAR_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("footerWebinar")}
        </a>
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
    </footer>
  );
}
