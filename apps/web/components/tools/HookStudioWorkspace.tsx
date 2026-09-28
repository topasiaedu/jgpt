"use client";

import Link from "next/link";

import AppNav from "@/components/AppNav";
import HookStudioPanel from "@/components/tools/HookStudioPanel";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { ModuleDefinition } from "@/lib/modules/types";

type HookStudioWorkspaceProps = {
  module: ModuleDefinition;
};

/**
 * Top-nav Hook Studio page: batch profile + modes + cards only.
 * Chat refine lives on Hook Formula via "Refine in chat" on each card.
 */
export default function HookStudioWorkspace({ module }: HookStudioWorkspaceProps) {
  const { t } = useI18n();

  return (
    <div className="shell">
      <header className="header header-brand">
        <AppNav active="studio" />
        <div className="module-workspace-heading">
          <span className="module-workspace-chip">{t("hookStudioTitle")}</span>
          <p className="subtitle">{t("hookStudioPageSubtitle")}</p>
        </div>
        <p className="hook-studio-page-switch">
          <Link href={`/tools/${module.id}`} className="hook-studio-switch-link">
            {t("hookStudioOpenChat")}
          </Link>
        </p>
      </header>

      <div className="module-workspace-body hook-studio-page-body">
        <HookStudioPanel moduleId={module.id} />
      </div>
    </div>
  );
}
