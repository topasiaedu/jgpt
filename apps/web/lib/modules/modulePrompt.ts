import type { Locale } from "@/lib/i18n/messages";
import type { IntakeField, ModulePack } from "@/lib/modules/types";
import type { GraphNode } from "@/lib/graphTypes";
import { loadTeachingGraph } from "@/lib/probe";

/** Cap bound-node briefs so module prompts stay denser than free chat without dumping the wiki. */
const MAX_BOUND_NODE_BRIEFS: number = 6;
const MAX_BOUND_SUMMARY_CHARS: number = 140;

/**
 * Formats optional leftover intake answers (legacy clients) into a short block.
 * Chat-first flow usually leaves this empty; conversation history carries answers.
 */
export function formatIntakeForPrompt(
  intake: Record<string, string> | undefined,
  fields: IntakeField[],
): string {
  if (intake === undefined) {
    return "None (chat-first: answers live in the conversation).";
  }

  const lines: string[] = [];
  for (const field of fields) {
    const raw: string | undefined = intake[field.id];
    const value: string = typeof raw === "string" ? raw.trim() : "";
    if (value.length === 0) {
      continue;
    }
    lines.push(`${field.label}: ${value}`);
  }

  for (const [key, raw] of Object.entries(intake)) {
    if (fields.some((field) => field.id === key)) {
      continue;
    }
    const value: string = typeof raw === "string" ? raw.trim() : "";
    if (value.length > 0) {
      lines.push(`${key}: ${value}`);
    }
  }

  return lines.length > 0
    ? lines.join("\n")
    : "None (chat-first: answers live in the conversation).";
}

/**
 * Builds a compact intake summary for blending into the probe query.
 */
export function summarizeIntakeForProbe(
  intake: Record<string, string> | undefined,
  fields: IntakeField[],
): string {
  if (intake === undefined) {
    return "";
  }

  const parts: string[] = [];
  for (const field of fields) {
    const raw: string | undefined = intake[field.id];
    if (typeof raw !== "string") {
      continue;
    }
    const value: string = raw.trim();
    if (value.length === 0) {
      continue;
    }
    parts.push(value.slice(0, 120));
  }

  return parts.join(" ");
}

/**
 * Formats intakeFields as an internal slot checklist for the overlay.
 */
export function formatSlotChecklist(fields: IntakeField[]): string {
  if (fields.length === 0) {
    return "(no named slots; ask only what this module job requires)";
  }

  return fields
    .map((field) => {
      const need: string = field.required === true ? "need before full deliverable" : "optional";
      return `- ${field.label} [${need}]`;
    })
    .join("\n");
}

/**
 * Loads short title/summary lines for pack boundNodeIds from jeff-graph.
 * Soft-fails to empty string if the graph cannot be read.
 */
export function formatBoundNodeBriefs(boundNodeIds: string[] | undefined): string {
  if (boundNodeIds === undefined || boundNodeIds.length === 0) {
    return "";
  }

  let nodes: GraphNode[];
  try {
    nodes = loadTeachingGraph().nodes;
  } catch {
    return "";
  }

  const byId: Map<string, GraphNode> = new Map(nodes.map((node) => [node.id, node]));
  const lines: string[] = [];

  for (const id of boundNodeIds.slice(0, MAX_BOUND_NODE_BRIEFS)) {
    const node: GraphNode | undefined = byId.get(id);
    if (node === undefined) {
      lines.push(`- ${id}: (id listed; not found in nodes.json this deploy)`);
      continue;
    }
    const summary: string =
      node.summary.length > MAX_BOUND_SUMMARY_CHARS
        ? `${node.summary.slice(0, MAX_BOUND_SUMMARY_CHARS)}…`
        : node.summary;
    lines.push(`- ${node.id}: ${node.title}. ${summary}`);
  }

  return lines.join("\n");
}

/**
 * Shared chat-first + Jeff-distinctiveness rules injected for every module pack.
 */
export function buildSharedModuleRules(pack: ModulePack): string {
  const slotBlock: string = formatSlotChecklist(pack.intakeFields);
  const boundBriefs: string = formatBoundNodeBriefs(pack.boundNodeIds);
  const boundSection: string =
    boundBriefs.length > 0
      ? [
          "",
          "## Preferred graph anchors (dense module grounding)",
          "These bound nodes are preference targets for this tool. Use their mechanisms when probe evidence includes them.",
          "Citations still come only from probe / probe_jeff. Do not invent a source id that is not in this turn's evidence pack.",
          boundBriefs,
        ].join("\n")
      : "";

  return [
    "## Module conversation mode (hard; Artemo-style chat-first)",
    "There is no intake form. Collect what you need through conversation.",
    "Clarify then deliver in this same tool chat:",
    "Ask at most 1 to 2 clarifying questions per turn. Never dump a form-like list or interrogate.",
    "Internal slots to gather before the full deliverable:",
    slotBlock,
    "When slots are filled enough for a useful deliverable, produce the full module output in that same turn.",
    "If the user already answered enough on home or in prior turns, do not re-ask everything. Ask only what this tool still needs, then deliver.",
    "If the user says \"just write it\" / \"直接写一版\", skip remaining questions, do best effort, name assumptions clearly, then deliver.",
    "Do not wait for a form object. Conversation history (and optional home intent hint) is the source of answers.",
    "",
    "## Jeff distinctiveness (hard; rewrite if violated)",
    "You are Jeff's aide on personal IP, not a generic personal-brand GPT.",
    "Use Jeff teaching moves by name or mechanism in the locked UI locale language (English gloss OK when locale is en):",
    "get seen before trust before deal (曝光→信任→成交); standpoint or invisible (立场);",
    "content assets are not ads; founder face / boss is the brand; advice vs ego;",
    "direction beats volume; value then convert; relevant rejects (volume≠money, overnight fame,",
    "ads-as-content, outsourcing judgment to GPT).",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending until Jeff mechanisms are visible and concrete.",
    "Never invent Jeff case studies, patient stories, or named frameworks as confirmed doctrine.",
    "If evidence is thin: Generally → Jeff → steer. Still sound like Jeff's aide (diagnostic + one next move), not a bland coach.",
    "",
    "## Answer variance (hard)",
    "Ground every deliverable in the user's concrete answers this turn (their niche, stuck point, words, constraints).",
    "Output shape is a scaffold, not a canned script. If two different answers would produce the same diagnosis, bullets, and next move, rewrite until the reply tracks their facts.",
    boundSection,
  ].join("\n");
}

/**
 * Short reminder so module overlays cannot override the UI locale lock.
 */
function moduleLocaleLockReminder(locale: Locale): string {
  if (locale === "zh") {
    return [
      "## Module output language (hard)",
      "UI locale is Chinese. Whole reply (questions + deliverables) in Chinese.",
      "Ignore any pack line that says match the latest user message language.",
    ].join("\n");
  }

  return [
    "## Module output language (hard)",
    "UI locale is English. Whole reply (questions + deliverables) in full English only.",
    "ASCII quotes \" and ' only. Never 「」『』 or fullwidth ＂.",
    "Ignore any pack line that says match the latest user message language.",
  ].join("\n");
}

/** Meta tokens that must never enter lexical probe scoring. */
const PROBE_HINT_BLOCKLIST: Set<string> = new Set(["probe_jeff"]);
/** Cap hint flood so pack keywords cannot pin the same top sources every turn. */
const MAX_MODULE_PROBE_HINTS: number = 4;

/**
 * Light hint blend for module probes: drop meta tokens, cap count.
 * Bound node ids are NOT dumped here (they soft-merge after probe instead).
 */
export function selectModuleProbeHints(probeHints: string[]): string[] {
  const selected: string[] = [];
  for (const raw of probeHints) {
    const hint: string = raw.trim();
    if (hint.length === 0) {
      continue;
    }
    if (PROBE_HINT_BLOCKLIST.has(hint.toLowerCase())) {
      continue;
    }
    selected.push(hint);
    if (selected.length >= MAX_MODULE_PROBE_HINTS) {
      break;
    }
  }
  return selected;
}

/**
 * Merges dialogue probe query with a light hint blend and optional intake summary.
 * Keeps the latest user ask last so lexical scoring centers on what they said.
 * Does not inject boundNodeIds into the query string (see mergeBoundNodesIntoProbe).
 */
export function buildModuleProbeQuery(options: {
  baseQuery: string;
  pack: ModulePack;
  intake: Record<string, string> | undefined;
}): string {
  const intakeSummary: string = summarizeIntakeForProbe(options.intake, options.pack.intakeFields);
  const hints: string = selectModuleProbeHints(options.pack.probeHints).join(" ");

  const prefixParts: string[] = [];
  if (hints.length > 0) {
    prefixParts.push(hints);
  }
  if (intakeSummary.length > 0) {
    prefixParts.push(intakeSummary);
  }

  const prefix: string = prefixParts.join(" ").trim();
  const base: string = options.baseQuery.trim();

  if (prefix.length === 0) {
    return base;
  }
  if (base.length === 0) {
    return prefix;
  }
  return `${prefix}\n${base}`;
}

/**
 * Formats optional home → tool intent as a silent hint (not a form).
 */
export function formatHomeIntentHint(homeIntent: string | undefined): string {
  if (homeIntent === undefined) {
    return "";
  }

  const trimmed: string = homeIntent.trim();
  if (trimmed.length === 0) {
    return "";
  }

  return [
    "## PRIOR HOME INTENT (optional handoff; not a form)",
    "The user arrived from home Ask with this intent summary:",
    trimmed,
    "Treat it as context for your first clarifying questions.",
    "Do not ask them to fill a form. Confirm or refine only what this tool still needs, then deliver.",
  ].join("\n");
}

/**
 * Appends module overlay + shared Jeff/chat rules after the base Jeff system prompt.
 */
export function appendModuleSystemOverlay(options: {
  baseSystemPrompt: string;
  pack: ModulePack;
  intake: Record<string, string> | undefined;
  homeIntent?: string;
  locale: Locale;
}): string {
  const intakeBlock: string = formatIntakeForPrompt(options.intake, options.pack.intakeFields);
  const shared: string = buildSharedModuleRules(options.pack);
  const homeHint: string = formatHomeIntentHint(options.homeIntent);
  const localeLock: string = moduleLocaleLockReminder(options.locale);

  return [
    options.baseSystemPrompt,
    "",
    localeLock,
    "",
    options.pack.systemOverlay,
    "",
    shared,
    ...(homeHint.length > 0 ? ["", homeHint] : []),
    "",
    "## OPTIONAL SESSION NOTES (legacy intake map; usually empty)",
    intakeBlock,
  ].join("\n");
}
