"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { useI18n } from "@/lib/i18n/LocaleProvider";

/** localStorage flag: first-visit dark brand band already dismissed. */
export const BRAND_MOMENT_STORAGE_KEY = "ie-coach-brand-moment-seen";

/**
 * Optional once-per-browser dark brand moment (#080808 + soft orange glow).
 * Dismissible; does not wallpaper every session.
 * Never shown on `/tools/[moduleId]` so tool pages land straight in chat.
 */
export default function FirstVisitBrandMoment() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  /** Tool deep-links: `/tools/ig-reel-script` etc. Not the `/tools` grid. */
  const isToolModuleRoute = /^\/tools\/[^/]+/.test(pathname);

  useEffect(() => {
    if (isToolModuleRoute) {
      return;
    }
    try {
      if (window.localStorage.getItem(BRAND_MOMENT_STORAGE_KEY) === "1") {
        return;
      }
    } catch {
      return;
    }
    setVisible(true);
  }, [isToolModuleRoute]);

  /**
   * Persists dismiss and hides the band for later visits.
   */
  function dismiss(): void {
    try {
      window.localStorage.setItem(BRAND_MOMENT_STORAGE_KEY, "1");
    } catch {
      // Ignore quota / private-mode failures; still hide for this session.
    }
    setVisible(false);
  }

  if (!visible || isToolModuleRoute) {
    return null;
  }

  return (
    <div className="brand-moment" role="dialog" aria-modal="true" aria-labelledby="brand-moment-title">
      <div className="brand-moment-glow" aria-hidden="true" />
      <div className="brand-moment-panel">
        <p id="brand-moment-title" className="brand-moment-title">
          {t("brandMomentTitle")}
        </p>
        <p className="brand-moment-body">{t("brandMomentBody")}</p>
        <div className="brand-moment-actions">
          <button type="button" className="brand-moment-continue" onClick={dismiss}>
            {t("brandMomentContinue")}
          </button>
          <button type="button" className="brand-moment-dismiss" onClick={dismiss}>
            {t("brandMomentDismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
