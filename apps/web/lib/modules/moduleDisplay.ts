import type { Locale } from "@/lib/i18n/messages";
import { MODULE_CATALOG } from "@/lib/modules/catalog";
import { MODULE_ZH_COPY } from "@/lib/modules/catalogZh";
import type { ModuleDefinition } from "@/lib/modules/types";

/** Locale-resolved title and intro description for UI surfaces. */
export type ModuleDisplay = {
  title: string;
  description: string;
};

/**
 * Returns title + description for the active UI locale.
 * Ids stay English. Chat openers use packLocale / packChatOpenersZh.
 * Missing ZH catalog entries fall back to English definition copy.
 */
export function getModuleDisplay(
  definition: ModuleDefinition,
  locale: Locale,
): ModuleDisplay {
  if (locale === "zh") {
    const zh = MODULE_ZH_COPY[definition.id];
    if (zh !== undefined) {
      return { title: zh.title, description: zh.description };
    }
  }
  return { title: definition.title, description: definition.description };
}

/**
 * Optional coverage check for MODULE_ZH_COPY.
 * Not run at import time so openers/UI can ship while catalog ZH is still filling in.
 */
export function assertModuleZhCoverage(): void {
  const missing: string[] = [];
  for (const entry of MODULE_CATALOG) {
    if (MODULE_ZH_COPY[entry.id] === undefined) {
      missing.push(entry.id);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing MODULE_ZH_COPY for: ${missing.join(", ")}`);
  }
}

/**
 * Short card teaser from the first "what it does" paragraph.
 * Strips EN or ZH job labels used in catalog descriptions.
 */
export function moduleCardBlurb(description: string): string {
  const first = description.split("\n\n")[0] ?? description;
  const withoutLabel = first
    .replace(/^What it does:\s*/i, "")
    .replace(/^做什么[：:]\s*/, "");
  if (withoutLabel.length <= 140) {
    return withoutLabel;
  }
  return `${withoutLabel.slice(0, 137).trimEnd()}…`;
}

/**
 * Pulls job / bring / get sections from EN or ZH catalog description paragraphs.
 */
export function parseIntroSections(description: string): {
  job: string;
  bring: string;
  get: string;
} {
  const paragraphs = description
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  let job = "";
  let bring = "";
  let get = "";

  for (const paragraph of paragraphs) {
    if (/^What it does:/i.test(paragraph) || /^做什么[：:]/.test(paragraph)) {
      job = paragraph
        .replace(/^What it does:\s*/i, "")
        .replace(/^做什么[：:]\s*/, "");
    } else if (/^What to input:/i.test(paragraph) || /^需要准备[：:]/.test(paragraph)) {
      bring = paragraph
        .replace(/^What to input:\s*/i, "")
        .replace(/^需要准备[：:]\s*/, "");
    } else if (/^What you get:/i.test(paragraph) || /^你会得到[：:]/.test(paragraph)) {
      get = paragraph
        .replace(/^What you get:\s*/i, "")
        .replace(/^你会得到[：:]\s*/, "");
    }
  }

  if (job.length === 0 && paragraphs[0] !== undefined) {
    job = paragraphs[0]
      .replace(/^What it does:\s*/i, "")
      .replace(/^做什么[：:]\s*/, "");
  }
  if (bring.length === 0 && paragraphs[1] !== undefined) {
    bring = paragraphs[1]
      .replace(/^What to input:\s*/i, "")
      .replace(/^需要准备[：:]\s*/, "");
  }
  if (get.length === 0) {
    const last = paragraphs[paragraphs.length - 1];
    if (last !== undefined) {
      get = last
        .replace(/^What you get:\s*/i, "")
        .replace(/^你会得到[：:]\s*/, "");
    }
  }

  return { job, bring, get };
}
