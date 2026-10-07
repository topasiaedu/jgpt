"use client";

import { useEffect, useMemo } from "react";
import type { ReactElement } from "react";

import { useI18n } from "@/lib/i18n/LocaleProvider";
import { categoryMessageKey } from "@/lib/i18n/messages";
import {
  MODULE_CATALOG,
  getModuleStatus,
} from "@/lib/modules/catalog";
import { getModuleDisplay, moduleCardBlurb } from "@/lib/modules/moduleDisplay";
import {
  JOURNEY_STAGES,
  auditJourneyMembership,
  splitStageModules,
  stageBlurbMessageKey,
  stageRailNumber,
  stageSectionId,
} from "@/lib/modules/toolsJourney";
import type { ModuleCategory, ModuleDefinition } from "@/lib/modules/types";

type ToolsGridProps = {
  /** Opens the Brand profile picker, then navigates to the module. */
  onRequestOpen: (module: ModuleDefinition) => void;
};

type StageGroup = {
  category: ModuleCategory;
  core: ModuleDefinition[];
};

/**
 * All Tools wall: five ordered stage sections (core cards only).
 * Practice modules stay in catalog for deep links; they are not listed here.
 * Card click opens the Brand profile picker. Profile is optional.
 */
export default function ToolsGrid({ onRequestOpen }: ToolsGridProps) {
  const { t, locale } = useI18n();

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    const report = auditJourneyMembership();
    if (!report.ok) {
      console.warn("[toolsJourney] membership mismatch", report);
    }
  }, []);

  const stageGroups: StageGroup[] = useMemo(() => {
    return JOURNEY_STAGES.map((category) => {
      const inStage = MODULE_CATALOG.filter((module) => module.category === category);
      const { core } = splitStageModules(inStage);
      return { category, core };
    });
  }, []);

  /**
   * Renders one tools card button for the core list.
   */
  function renderModuleCard(module: ModuleDefinition): ReactElement {
    const status = getModuleStatus(module);
    const display = getModuleDisplay(module, locale);
    return (
      <li key={module.id} className="tools-card-item">
        <button
          type="button"
          className="tools-card"
          onClick={() => {
            onRequestOpen(module);
          }}
        >
          <span className="tools-card-title">{display.title}</span>
          <span
            className={
              status === "ready"
                ? "tools-card-badge tools-card-badge-ready"
                : "tools-card-badge"
            }
          >
            {status === "ready" ? t("toolsBadgeReady") : t("toolsBadgeSoon")}
          </span>
          <span className="tools-card-blurb">{moduleCardBlurb(display.description)}</span>
        </button>
      </li>
    );
  }

  return (
    <div className="tools-grid-wrap">
      {stageGroups.map((group) => {
        const sectionId = stageSectionId(group.category);

        return (
          <section
            key={group.category}
            id={sectionId}
            className="tools-category"
            aria-labelledby={`${sectionId}-title`}
          >
            <header className="tools-stage-band">
              <h2 id={`${sectionId}-title`} className="tools-category-title">
                <span className="tools-category-num" aria-hidden="true">
                  {stageRailNumber(group.category)}
                </span>
                <span className="tools-category-name">
                  {t(categoryMessageKey(group.category))}
                </span>
              </h2>
              <p className="tools-category-blurb">{t(stageBlurbMessageKey(group.category))}</p>
            </header>
            {group.core.length > 0 ? (
              <ul className="tools-card-list">{group.core.map(renderModuleCard)}</ul>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
