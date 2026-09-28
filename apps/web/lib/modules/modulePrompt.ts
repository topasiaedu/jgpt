import type { Locale } from "@/lib/i18n/messages";
import { getModuleById } from "@/lib/modules/catalog";
import type { IntakeField, ModulePack } from "@/lib/modules/types";
import type { GraphNode } from "@/lib/graphTypes";
import { loadTeachingGraph } from "@/lib/probe";
import type { ChatMessage } from "@/lib/chatTypes";
import {
  buildQualityRuntimeInjection,
  formatQualitySlotChecklist,
  isQualityRuntimeEnabled,
  resolveQualitySlots,
} from "@/lib/modules/qualityRuntime";

/** Cap bound-node briefs so module prompts stay denser than free chat without dumping the wiki. */
const MAX_BOUND_NODE_BRIEFS: number = 6;
/**
 * Bound-node summary truncation for the preferred-anchors block.
 * 280 keeps slide-style Framework steps readable; Framework nodes get a bit more headroom.
 * Full wiki still arrives via probe excerpts, not this brief.
 */
const MAX_BOUND_SUMMARY_CHARS: number = 280;
const MAX_BOUND_FRAMEWORK_SUMMARY_CHARS: number = 400;

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
    const maxChars: number =
      node.type === "Framework" || node.id.startsWith("fw.")
        ? MAX_BOUND_FRAMEWORK_SUMMARY_CHARS
        : MAX_BOUND_SUMMARY_CHARS;
    const summary: string =
      node.summary.length > maxChars ? `${node.summary.slice(0, maxChars)}…` : node.summary;
    lines.push(`- ${node.id}: ${node.title}. ${summary}`);
  }

  return lines.join("\n");
}

/**
 * Shared chat-first + Jeff-distinctiveness rules injected for every module pack.
 * When qualityRuntime is on, soft "just write it when enough" is replaced by the
 * hard Collect → Confirm → Deliver → Refine block from qualityRuntime injection.
 */
export function buildSharedModuleRules(pack: ModulePack): string {
  const qualityOn: boolean = isQualityRuntimeEnabled(pack);
  const slotBlock: string = qualityOn
    ? formatQualitySlotChecklist(resolveQualitySlots(pack))
    : formatSlotChecklist(pack.intakeFields);
  const boundBriefs: string = formatBoundNodeBriefs(pack.boundNodeIds);
  const catalogTitle: string | undefined = getModuleById(pack.moduleId)?.title;
  const toolLabel: string =
    catalogTitle !== undefined && catalogTitle.trim().length > 0
      ? `${catalogTitle.trim()} (${pack.moduleId})`
      : pack.moduleId;
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

  const collectRules: string[] = qualityOn
    ? [
        "## Module conversation mode (hard; qualityRuntime chat-first)",
        "There is no intake form. Collect what you need through conversation.",
        "Lifecycle is enforced below: Collect → Confirm → Deliver → Refine.",
        "Ask at most 1 to 2 clarifying questions per Collect/Confirm turn. Never dump an interrogation wall (3+ questions / intake form).",
        "If you ask two clarifying questions in one turn, format them as a markdown bullet or numbered list (not a prose row).",
        "Typed slots (critical vs optional):",
        slotBlock,
        "Do not skip Confirm when the family contract requires it, unless the user explicitly says just write it / 直接写一版 after critical slots are filled (then deliver with named assumptions).",
        "Do not wait for a form object. Conversation history (and optional home intent hint) is the source of answers.",
      ]
    : [
        "## Module conversation mode (hard; Artemo-style chat-first)",
        "There is no intake form. Collect what you need through conversation.",
        "Clarify then deliver in this same tool chat:",
        "Ask at most 1 to 2 clarifying questions per turn. Never dump an interrogation wall (3+ questions / intake form).",
        "If you ask two clarifying questions in one turn, format them as a markdown bullet or numbered list (not a prose row). Short clarifying-question bullets are allowed.",
        "Internal slots to gather before the full deliverable:",
        slotBlock,
        "When slots are filled enough for a useful deliverable, produce the full module output in that same turn.",
        "If the user already answered enough on home or in prior turns, do not re-ask everything. Ask only what this tool still needs, then deliver.",
        "If the user says \"just write it\" / \"直接写一版\" and you already have enough to draft, skip remaining questions, do best effort, name assumptions clearly, then deliver.",
        "Do not wait for a form object. Conversation history (and optional home intent hint) is the source of answers.",
      ];

  return [
    ...collectRules,
    "",
    "## Stay on this tool's job (hard; redirect drift)",
    `This chat is bound to tool ${toolLabel}. "Back" means this pack's overlay deliverable and the clarifying slots above, not a new topic.`,
    "If the user asks something irrelevant or drifts far off (example: IG Reel script chat → marathon prep, unrelated life advice, a different curriculum):",
    "Acknowledge in one short line if needed, then steer back to this tool's deliverable or the next clarifying slot.",
    "Do not answer the off-topic ask in depth. Do not become a general life coach on that rabbit hole.",
    "Light related asides that serve this job are OK (example: energy for filming). A new curriculum or deep dive on the aside is not.",
    "Firm and warm, spoken, not fierce. One clear redirect plus one ask toward this tool's job.",
    "",
    "## Stuck / avoidance in tool chat (firm but warm; not fierce)",
    "If they say \"I don't know\" / \"不知道\", or ask for a safe word-for-word script before giving the real content this tool needs (story, lesson, who they help, standpoint):",
    qualityOn
      ? "Name the gap plainly. Use the I-don't-know option engine (concrete choices / micro-examples that do not invent niche facts). Push for ONE real detail."
      : "Name the gap plainly. Push for ONE real detail. Do not paper over with a generic safe draft.",
    "Warm teacher's pet of Jeff: firm, clear, kind. No scolding, no humiliation, no fierce energy.",
    "Short spoken punches. One clear ask. Still max 1 to 2 clarifying questions; bullets if two.",
    "",
    "## Apply pack steps; do not teach the framework (hard)",
    "Run the pack overlay steps to produce the deliverable. Do not open with \"Framework X is…\" or a curriculum dump of what OPENS / Brand Pillars / etc. means.",
    "Prefer draft, diagnosis, or next move over definition. Naming a Jeff move lightly once is fine; lecturing the whole model is not.",
    "",
    "## Jeff distinctiveness (hard; rewrite if violated)",
    "You are Jeff's aide on personal IP, not a generic personal-brand GPT.",
    "Pack overlay owns the job-relevant Jeff moves for this tool. Do not recite a universal Jeff slogan list.",
    "Use only mechanisms named in this pack's overlay and/or present in this turn's bound evidence. Do not sprinkle unrelated Jeff slogans.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite until the pack's Jeff mechanisms are visible and concrete.",
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
 * Short generic English tokens that flood lexical scoring without Jeff-specific signal.
 * Prefer Chinese terms and framework / node-id style hints instead.
 */
const GENERIC_ENGLISH_PROBE_HINTS: Set<string> = new Set([
  "trust",
  "offer",
  "story",
  "hook",
  "brand",
  "content",
  "audience",
  "script",
  "caption",
  "video",
  "reel",
  "post",
  "engage",
  "growth",
  "funnel",
  "cta",
  "niche",
  "personal",
  "ip",
]);

/**
 * Ranks a probe hint for the capped blend: Jeff node ids and Chinese first,
 * generic English single words last. Higher score wins; ties keep pack order.
 */
function scoreModuleProbeHint(hint: string): number {
  const trimmed: string = hint.trim();
  if (trimmed.length === 0) {
    return -Infinity;
  }

  let score = 0;
  if (/[\u3400-\u9fff]/.test(trimmed)) {
    score += 40;
  }
  if (/^(fw|pr|cl|tm|rj|src)\.[a-z0-9._-]+$/i.test(trimmed)) {
    score += 35;
  }
  if (/\b(fw|pr|cl|tm|rj)\.[a-z0-9._-]+/i.test(trimmed)) {
    score += 20;
  }

  const lower: string = trimmed.toLowerCase();
  const words: string[] = lower.match(/[a-z0-9_]+/g) ?? [];
  if (words.length === 1 && GENERIC_ENGLISH_PROBE_HINTS.has(words[0] ?? "")) {
    score -= 25;
  } else if (
    words.length > 0 &&
    words.every((word) => GENERIC_ENGLISH_PROBE_HINTS.has(word))
  ) {
    score -= 15;
  }

  // Slight preference for multi-token Jeff phrases over lone generics.
  if (words.length >= 2 || /[\u3400-\u9fff]{2,}/.test(trimmed)) {
    score += 5;
  }

  return score;
}

/**
 * Light hint blend for module probes: drop meta tokens, prefer Jeff/CJK tokens, cap count.
 * Bound node ids are NOT dumped here (they soft-merge after probe instead).
 */
export function selectModuleProbeHints(probeHints: string[]): string[] {
  const scored: Array<{ hint: string; score: number; order: number }> = [];

  for (let order = 0; order < probeHints.length; order += 1) {
    const hint: string = probeHints[order]?.trim() ?? "";
    if (hint.length === 0) {
      continue;
    }
    if (PROBE_HINT_BLOCKLIST.has(hint.toLowerCase())) {
      continue;
    }
    scored.push({ hint, score: scoreModuleProbeHint(hint), order });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.order - b.order;
  });

  return scored.slice(0, MAX_MODULE_PROBE_HINTS).map((item) => item.hint);
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
 * When pack.qualityRuntime is true, also injects Collect → Confirm → Deliver → Refine,
 * mode-aware budgets, and the IDK option stub (messages required for mode detection).
 */
export function appendModuleSystemOverlay(options: {
  baseSystemPrompt: string;
  pack: ModulePack;
  intake: Record<string, string> | undefined;
  homeIntent?: string;
  locale: Locale;
  /**
   * Dialogue for qualityRuntime mode detection.
   * Ignored when qualityRuntime is off (legacy path unchanged).
   */
  messages?: ChatMessage[];
}): string {
  const intakeBlock: string = formatIntakeForPrompt(options.intake, options.pack.intakeFields);
  const shared: string = buildSharedModuleRules(options.pack);
  const homeHint: string = formatHomeIntentHint(options.homeIntent);
  const localeLock: string = moduleLocaleLockReminder(options.locale);

  const qualityBlock: string = (() => {
    if (!isQualityRuntimeEnabled(options.pack)) {
      return "";
    }
    const messages: ChatMessage[] = options.messages ?? [];
    const injection = buildQualityRuntimeInjection({
      pack: options.pack,
      messages,
      intake: options.intake,
    });
    return injection.promptBlock;
  })();

  return [
    options.baseSystemPrompt,
    "",
    localeLock,
    "",
    options.pack.systemOverlay,
    "",
    shared,
    ...(qualityBlock.length > 0 ? ["", qualityBlock] : []),
    ...(homeHint.length > 0 ? ["", homeHint] : []),
    "",
    "## OPTIONAL SESSION NOTES (legacy intake map; usually empty)",
    intakeBlock,
  ].join("\n");
}
