"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AppNav from "@/components/AppNav";
import {
  gateLastActiveProfileId,
  gateProfileList,
  useBrandProfileGate,
} from "@/lib/brandProfile/useBrandProfileGate";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { buildAuthHref, buildToolHrefFromHome } from "@/lib/modules/homeHandoff";
import type { ModuleDefinition } from "@/lib/modules/types";

const ToolsGrid = dynamic(() => import("@/components/tools/ToolsGrid"), {
  loading: () => (
    <div className="tools-grid tools-grid-loading" aria-busy="true" />
  ),
});

const BrandProfilePickModal = dynamic(
  () => import("@/components/brandProfiles/BrandProfilePickModal"),
  { ssr: false },
);

/**
 * All Tools page: nav chrome, then page title, then the stage card wall.
 * Module entry opens a Brand profile picker. Profile is optional.
 */
export default function ToolsPageClient() {
  const { t } = useI18n();
  const router = useRouter();
  const { state: brandGate, actionError, selectProfile } = useBrandProfileGate();
  const [pendingModule, setPendingModule] = useState<ModuleDefinition | null>(null);

  /**
   * Unsigned users go straight to /auth instead of a tools sign-in CTA panel.
   */
  useEffect(() => {
    if (brandGate.kind === "signed_out") {
      router.replace(buildAuthHref("/tools"));
    }
  }, [brandGate.kind, router]);

  /**
   * Navigates to the pending module with or without a Brand profile query.
   */
  function finishToolOpen(profileId: string | null): void {
    const pending: ModuleDefinition | null = pendingModule;
    setPendingModule(null);
    if (pending === null) {
      return;
    }
    if (profileId !== null) {
      void selectProfile(profileId);
    }
    router.push(
      buildToolHrefFromHome(
        pending.id,
        undefined,
        profileId === null ? undefined : profileId,
      ),
    );
  }

  return (
    <div className="shell shell-studio shell-tools">
      <header className="header header-create tools-chrome-header">
        <AppNav active="tools" />
      </header>
      <div className="tools-page-head">
        <h1 className="studio-title">{t("toolsTitle")}</h1>
        <p className="studio-subtitle">{t("toolsSubtitle")}</p>
      </div>
      <main className="studio-main tools-main-air">
        <ToolsGrid
          onRequestOpen={(module) => {
            setPendingModule(module);
          }}
        />
      </main>
      <BrandProfilePickModal
        open={pendingModule !== null}
        profiles={gateProfileList(brandGate)}
        lastActiveProfileId={gateLastActiveProfileId(brandGate)}
        loading={brandGate.kind === "loading"}
        actionError={actionError}
        onClose={() => {
          setPendingModule(null);
        }}
        onChoose={finishToolOpen}
      />
    </div>
  );
}
