"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import { useI18n } from "@/lib/i18n/LocaleProvider";
import { categoryMessageKey } from "@/lib/i18n/messages";
import {
  FEATURED_MODULE_IDS,
  MODULE_CATALOG,
  MODULE_CATEGORY_ORDER,
  getModuleById,
  getModuleStatus,
} from "@/lib/modules/catalog";
import { getModuleDisplay, moduleCardBlurb } from "@/lib/modules/moduleDisplay";
import type { ModuleCategory, ModuleDefinition } from "@/lib/modules/types";

type CategoryGroup = {
  category: ModuleCategory;
  modules: ModuleDefinition[];
};

/**
 * All Tools wall: search, category filters, optional compact featured strip, category cards.
 * Card click navigates straight to the module page (chat-first; no intro Start gate).
 */
export default function ToolsGrid() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ModuleCategory | "all">("all");

  const featuredModules: ModuleDefinition[] = useMemo(() => {
    return FEATURED_MODULE_IDS.map((id) => getModuleById(id)).filter(
      (module): module is ModuleDefinition => module !== undefined,
    );
  }, []);

  const groups: CategoryGroup[] = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered =
      normalized.length === 0
        ? MODULE_CATALOG
        : MODULE_CATALOG.filter((module) => {
            const display = getModuleDisplay(module, locale);
            return (
              module.title.toLowerCase().includes(normalized) ||
              display.title.toLowerCase().includes(normalized)
            );
          });

    return MODULE_CATEGORY_ORDER.map((category) => ({
      category,
      modules: filtered.filter((module) => module.category === category),
    })).filter((group) => group.modules.length > 0);
  }, [query, locale]);

  const visibleGroups: CategoryGroup[] = useMemo(() => {
    if (activeCategory === "all") {
      return groups;
    }
    return groups.filter((group) => group.category === activeCategory);
  }, [groups, activeCategory]);

  const isSearching = query.trim().length > 0;

  /**
   * Opens the module page immediately (chat when ready; no intro modal).
   */
  function openModule(module: ModuleDefinition): void {
    router.push(`/tools/${module.id}`);
  }

  function scrollToCategory(category: ModuleCategory): void {
    setActiveCategory(category);
    const el = document.getElementById(`cat-${category}`);
    if (el !== null) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="tools-grid-wrap">
      <div className="tools-search">
        <label className="sr-only" htmlFor="tools-search-input">
          {t("toolsSearchPlaceholder")}
        </label>
        <input
          id="tools-search-input"
          className="tools-search-input"
          type="search"
          value={query}
          placeholder={t("toolsSearchPlaceholder")}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setQuery(event.target.value);
          }}
        />
      </div>

      {!isSearching ? (
        <div className="tools-rail-nav" role="navigation" aria-label={t("toolsRailsTitle")}>
          <button
            type="button"
            className={
              activeCategory === "all"
                ? "tools-rail-chip tools-rail-chip-active"
                : "tools-rail-chip"
            }
            onClick={() => {
              setActiveCategory("all");
            }}
          >
            {t("toolsRailsTitle")}
          </button>
          {MODULE_CATEGORY_ORDER.map((category) => (
            <button
              key={category}
              type="button"
              className={
                activeCategory === category
                  ? "tools-rail-chip tools-rail-chip-active"
                  : "tools-rail-chip"
              }
              onClick={() => {
                scrollToCategory(category);
              }}
            >
              {t(categoryMessageKey(category))}
            </button>
          ))}
        </div>
      ) : null}

      {!isSearching && featuredModules.length > 0 ? (
        <section className="tools-featured tools-featured-compact" aria-labelledby="tools-featured-heading">
          <h2 id="tools-featured-heading" className="tools-section-title tools-section-title-compact">
            {t("toolsFeaturedTitle")}
          </h2>
          <ul className="tools-featured-list tools-featured-list-compact">
            {featuredModules.map((module) => {
              const status = getModuleStatus(module);
              const display = getModuleDisplay(module, locale);
              return (
                <li key={module.id}>
                  <button
                    type="button"
                    className="tools-card tools-card-featured-compact"
                    onClick={() => {
                      openModule(module);
                    }}
                  >
                    <span className="tools-card-top">
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
                    </span>
                    <span className="tools-card-blurb">{moduleCardBlurb(display.description)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {visibleGroups.length === 0 ? (
        <p className="tools-empty">{t("toolsEmpty")}</p>
      ) : (
        visibleGroups.map((group) => (
          <section
            key={group.category}
            className="tools-category"
            aria-labelledby={`cat-${group.category}`}
          >
            <h2 id={`cat-${group.category}`} className="tools-category-title">
              {t(categoryMessageKey(group.category))}
            </h2>
            <ul className="tools-card-list">
              {group.modules.map((module) => {
                const status = getModuleStatus(module);
                const display = getModuleDisplay(module, locale);
                return (
                  <li key={module.id}>
                    <button
                      type="button"
                      className="tools-card"
                      onClick={() => {
                        openModule(module);
                      }}
                    >
                      <span className="tools-card-top">
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
                      </span>
                      <span className="tools-card-blurb">{moduleCardBlurb(display.description)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
