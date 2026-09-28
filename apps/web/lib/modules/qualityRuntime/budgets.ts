/**
 * Mode-aware reply budgets for Quality Runtime.
 * Clarifying (collect / confirm) stays short; deliver / refine may be dense.
 */

import type { LifecycleMode, ReplyBudgetMode } from "@/lib/modules/qualityRuntime/types";

/**
 * Maps lifecycle mode to reply budget.
 */
export function replyBudgetForMode(mode: LifecycleMode): ReplyBudgetMode {
  if (mode === "deliver" || mode === "refine") {
    return "dense";
  }
  return "clarifying";
}

/**
 * Clarifying budget: compatible with home free-chat brevity.
 */
export function buildClarifyingBudgetRules(): string {
  return [
    "## Reply budget this turn (hard; qualityRuntime clarifying)",
    "Mode is Collect or Confirm: stay short.",
    "Max ~3 short paragraphs, OR one short paragraph + a short numbered or bullet list (2 to 4 items).",
    "Ask at most 1 to 2 clarifying questions. Bullets if two.",
    "Do not dump the dense family deliverable in this turn.",
  ].join("\n");
}

/**
 * Dense budget: overrides the base system prompt Max ~3 paragraphs rule for this turn.
 */
export function buildDenseBudgetRules(): string {
  return [
    "## Reply budget this turn (hard; qualityRuntime dense OVERRIDE)",
    "Mode is Deliver or Refine: the base sound-profile \"Max ~3 short paragraphs\" rule is SUSPENDED for this turn.",
    "Produce a job-shaped dense deliverable (or a focused refine of named levers).",
    "Multi-beat structure, timed sections, maps, banks, and longer spoken scripts are allowed when the family contract requires them.",
    "Still: no dash punctuation, no framework lecture dump, no overnight-fame promises.",
    "Stay 1-on-1 and readable: blank lines between beats; lists OK.",
    "After the deliverable, end with one short refine question or named levers the student can pull next.",
  ].join("\n");
}

/**
 * Budget block for the detected mode.
 */
export function buildReplyBudgetInjection(replyBudget: ReplyBudgetMode): string {
  if (replyBudget === "dense") {
    return buildDenseBudgetRules();
  }
  return buildClarifyingBudgetRules();
}

/**
 * Formatting override string for buildSystemPrompt when qualityRuntime is active.
 * Empty string means keep the default Max ~3 paragraphs hard rule.
 */
export function systemPromptFormattingOverride(replyBudget: ReplyBudgetMode): string {
  if (replyBudget !== "dense") {
    return "";
  }

  return [
    "### Formatting override (qualityRuntime dense deliverable; wins over Max ~3 paragraphs)",
    "This module turn is Deliver or Refine with qualityRuntime on.",
    "SUSPEND \"Max ~3 short paragraphs\". Write a complete job-shaped dense deliverable (or lever refine).",
    "Multi-section structure and longer spoken scripts are allowed. Keep blank lines between beats.",
    "Clarifying-question caps still apply only when you must ask; prefer delivering or refining now.",
  ].join("\n");
}
