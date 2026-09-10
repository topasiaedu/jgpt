"use client";

import Image from "next/image";
import Link from "next/link";

import { useI18n } from "@/lib/i18n/LocaleProvider";

export type AppNavActive = "ask" | "tools";

type AppNavProps = {
  active: AppNavActive;
};

/**
 * Top product nav: Influence Engine Coach wordmark + Ask / All Tools (ZH default).
 */
export default function AppNav({ active }: AppNavProps) {
  const { t } = useI18n();

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
      <nav className="app-nav" aria-label="Primary">
        <Link
          href="/"
          className={active === "ask" ? "app-nav-link app-nav-link-active" : "app-nav-link"}
          aria-current={active === "ask" ? "page" : undefined}
        >
          {t("navAsk")}
        </Link>
        <span className="app-nav-sep" aria-hidden="true">
          ·
        </span>
        <Link
          href="/tools"
          className={active === "tools" ? "app-nav-link app-nav-link-active" : "app-nav-link"}
          aria-current={active === "tools" ? "page" : undefined}
        >
          {t("navTools")}
        </Link>
      </nav>
    </div>
  );
}
