"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AppFooter from "@/components/AppFooter";
import AppNav from "@/components/AppNav";
import ModuleChatShell from "@/components/tools/ModuleChatShell";
import ModuleIntroModal, {
  readSkipIntro,
  writeSkipIntro,
} from "@/components/tools/ModuleIntroModal";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { categoryMessageKey } from "@/lib/i18n/messages";
import { getModuleStatus } from "@/lib/modules/catalog";
import {
  buildToolChatOpener,
  parseHomeHandoffSearchParams,
} from "@/lib/modules/homeHandoff";
import { getModuleDisplay } from "@/lib/modules/moduleDisplay";
import { getModulePack } from "@/lib/modules/packs";
import { defaultChatOpener, getPackChatOpener } from "@/lib/modules/packLocale";
import type { ModuleDefinition } from "@/lib/modules/types";

type ModuleWorkspaceProps = {
  module: ModuleDefinition;
  /** Raw Next.js searchParams for optional `?from=home&q=` handoff. */
  searchParams?: {
    from?: string | string[];
    q?: string | string[];
  };
};

/**
 * Module route body: land straight in chat with seeded opener.
 * Intro modal is on demand only (never auto-shown on land).
 * Optional home intent via `?from=home&q=` (not a form).
 */
export default function ModuleWorkspace({
  module,
  searchParams,
}: ModuleWorkspaceProps) {
  const { t, locale } = useI18n();
  const status = getModuleStatus(module);
  const isReady = status === "ready";
  const pack = getModulePack(module.id);
  const hasPack = pack !== undefined;
  const display = getModuleDisplay(module, locale);

  const handoff = parseHomeHandoffSearchParams(searchParams ?? {});
  const homeIntent: string | undefined = handoff.intentQ;

  const [hydrated, setHydrated] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [skipChecked, setSkipChecked] = useState(false);
  /** Bumps on each module open so soft nav cannot reuse an old chat thread. */
  const [threadKey, setThreadKey] = useState(0);

  useEffect(() => {
    setHydrated(true);
    setThreadKey((current) => current + 1);
    // Never auto-open intro, regardless of localStorage skip preference.
    setIntroOpen(false);
  }, [module.id, isReady, hasPack, homeIntent]);

  function handleStartFromIntro(): void {
    writeSkipIntro(module.id, skipChecked);
    setIntroOpen(false);
    if (isReady && hasPack) {
      setThreadKey((current) => current + 1);
    }
  }

  function handleCloseIntro(): void {
    setIntroOpen(false);
  }

  function handleShowIntroAgain(): void {
    setSkipChecked(readSkipIntro(module.id));
    setIntroOpen(true);
  }

  const packOpener: string =
    pack !== undefined ? getPackChatOpener(pack, locale) : defaultChatOpener(locale);
  const chatOpener: string = buildToolChatOpener(packOpener, homeIntent, locale);

  /** Stable remount key: module + locale + home intent + thread bump. */
  const chatMountKey: string = [
    module.id,
    locale,
    homeIntent ?? "direct",
    String(threadKey),
  ].join(":");

  const showChat: boolean = hydrated && isReady && pack !== undefined;

  return (
    <div className="shell">
      <header className="header header-brand">
        <AppNav active="tools" />
        <p className="tools-back">
          <Link href="/tools" className="tools-back-link">
            {t("toolsBack")}
          </Link>
        </p>
        <div className="module-workspace-heading">
          <span className="module-workspace-chip">{display.title}</span>
          <p className="subtitle">{t(categoryMessageKey(module.category))}</p>
        </div>
      </header>

      {!hydrated ? (
        <p className="tools-loading">{t("moduleLoading")}</p>
      ) : showChat ? (
        <ModuleChatShell
          key={chatMountKey}
          moduleId={module.id}
          moduleTitle={display.title}
          chatOpener={chatOpener}
          homeIntent={homeIntent}
          onShowIntroAgain={handleShowIntroAgain}
        />
      ) : (
        <section className="module-placeholder" aria-label={t("moduleSoonTitle")}>
          <h2 className="module-placeholder-title">{t("moduleSoonTitle")}</h2>
          <p className="module-placeholder-body">{t("moduleSoonBody")}</p>
          <button type="button" className="module-intro-start" onClick={handleShowIntroAgain}>
            {t("moduleShowIntro")}
          </button>
        </section>
      )}

      <ModuleIntroModal
        module={module}
        open={introOpen}
        skipChecked={skipChecked}
        onSkipCheckedChange={setSkipChecked}
        onClose={handleCloseIntro}
        onStart={handleStartFromIntro}
      />

      <AppFooter />
    </div>
  );
}
