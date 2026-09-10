"use client";

import AppFooter from "@/components/AppFooter";
import AppNav from "@/components/AppNav";
import ToolsGrid from "@/components/tools/ToolsGrid";
import { useI18n } from "@/lib/i18n/LocaleProvider";

/**
 * All Tools page: category card wall with search.
 */
export default function ToolsPageClient() {
  const { t } = useI18n();

  return (
    <div className="shell shell-tools">
      <header className="header header-brand">
        <AppNav active="tools" />
        <h1 className="title">{t("toolsTitle")}</h1>
        <p className="subtitle">{t("toolsSubtitle")}</p>
      </header>
      <ToolsGrid />
      <AppFooter />
    </div>
  );
}
