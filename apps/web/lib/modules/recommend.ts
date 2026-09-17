/**
 * Home recommend-mode helpers: catalog menu for the model + id validation.
 * Builder product UX only. Not doctrine for jeff-wiki ingest.
 */

import type { Locale } from "@/lib/i18n/messages";
import { MODULE_CATALOG, getModuleStatus } from "@/lib/modules/catalog";
import { hasModulePack } from "@/lib/modules/packs";
import type { ModuleDefinition } from "@/lib/modules/types";

/** Soft floor for how many tools to suggest on a clear intent. */
export const RECOMMEND_MIN = 2;

/** Soft ceiling for home tool suggestions. */
export const RECOMMEND_MAX = 4;

/**
 * Ready catalog modules that have a wired pack (safe deep links).
 */
export function listRecommendableModules(): ModuleDefinition[] {
  return MODULE_CATALOG.filter(
    (entry) => getModuleStatus(entry) === "ready" && hasModulePack(entry.id),
  );
}

/**
 * Compact menu text for the home recommend system overlay.
 */
export function formatRecommendCatalogForPrompt(): string {
  return listRecommendableModules()
    .map((module) => `- ${module.id}: ${module.title} (${module.category})`)
    .join("\n");
}

/**
 * Filters unknown / unwired ids, dedupes, and clamps to 2 to 4.
 * Returns [] when the model suggested nothing usable.
 */
export function validateRecommendedModuleIds(rawIds: string[]): string[] {
  const seen = new Set<string>();
  const validated: string[] = [];

  for (const raw of rawIds) {
    if (typeof raw !== "string") {
      continue;
    }
    const id: string = raw.trim();
    if (id.length === 0 || seen.has(id)) {
      continue;
    }
    if (!hasModulePack(id)) {
      continue;
    }
    const catalogEntry = MODULE_CATALOG.find((entry) => entry.id === id);
    if (catalogEntry === undefined || getModuleStatus(catalogEntry) !== "ready") {
      continue;
    }
    seen.add(id);
    validated.push(id);
    if (validated.length >= RECOMMEND_MAX) {
      break;
    }
  }

  if (validated.length < RECOMMEND_MIN) {
    return [];
  }

  return validated;
}

/**
 * Locale-locked language rules for home recommend coaching replies.
 */
function recommendLanguageLock(locale: Locale): string {
  if (locale === "zh") {
    return [
      "## Language lock in home recommend mode (hard; highest priority)",
      "UI locale is Chinese (zh). Coaching reply MUST be mainly Chinese.",
      "Do NOT detect language from the latest USER message. An English ask still gets a Chinese reply.",
      "This English overlay, English catalog titles, English tool ids, and English evidence must NOT decide reply language.",
      "Keep tool titles as given; coach speech stays Chinese.",
      "Self-check before send: if your draft is mainly English, rewrite the coaching reply in Chinese.",
    ].join("\n");
  }

  return [
    "## Language lock in home recommend mode (hard; highest priority)",
    "UI locale is English (en). Coaching reply MUST be full English only.",
    "Do NOT detect language from the latest USER message. A Chinese ask still gets a full English reply.",
    "No Chinese sprinkle. ASCII quotes \" and ' only (never 「」『』 or fullwidth ＂).",
    "Self-check before send: if your draft has Chinese or CJK quotes, rewrite fully in English with ASCII quotes.",
  ].join("\n");
}

/**
 * Appends home recommend-mode instructions after the base Jeff system prompt.
 * Only for free chat (no moduleId).
 */
export function appendHomeRecommendOverlay(
  baseSystemPrompt: string,
  locale: Locale,
): string {
  const catalogLines: string = formatRecommendCatalogForPrompt();

  return [
    baseSystemPrompt,
    "",
    "## Home recommend mode (Influence Engine Coach dashboard)",
    "The user is on the home free chat. They are answering: what IP content do they want to make today.",
    "Your job: coach briefly, then recommend 2 to 4 real tools from the catalog below when the intent is clear enough.",
    "When you recommend, you MUST call the recommend_modules tool with catalog module ids only (never invent ids).",
    "Pick tools that match the create intent (Reel, standpoint, trust script, caption, etc.). Do not force ip-stage-check unless the user is stuck on stage or asks where to start.",
    "After recommend_modules returns, give a short 1-on-1 coaching reply. Mention the tools by title in plain speech; the UI will also show clickable cards.",
    "If the message is too vague to pick tools, ask one sharp clarifying question and do NOT call recommend_modules yet.",
    "Do not dump a curriculum. Do not pretend you opened a tool chat. Deep work happens after they click a tool.",
    "",
    recommendLanguageLock(locale),
    "",
    "## Recommendable tools (id: title)",
    catalogLines,
  ].join("\n");
}
