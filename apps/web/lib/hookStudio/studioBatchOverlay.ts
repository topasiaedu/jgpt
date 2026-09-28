import {
  HOOK_STUDIO_MARKER_COMPETITOR,
  HOOK_STUDIO_MARKER_FROM_IDEA,
  HOOK_STUDIO_MARKER_REPEAT,
  HOOK_STUDIO_MARKER_REWRITE,
} from "@/lib/hookStudio/composeUserMessage";
import { detectHookStudioBatchMode } from "@/lib/hookStudio/detectStudioBatch";
import {
  buildCompetitorModeOverlay,
  buildRepeatModeOverlay,
} from "@/lib/hookStudio/modeOverlays";
import type { HookStudioMode } from "@/lib/hookStudio/types";
import { HOOK_REWRITER_PACK } from "@/lib/modules/packs/hook-rewriter";
import type { ModulePack } from "@/lib/modules/types";

/**
 * Resolves which pack brain to use for a module chat turn when Hook Studio
 * may have sent a batch Generate.
 *
 * Choice (H2): stay on page moduleId `scroll-stop-hook`. When the latest user
 * turn carries `[Hook Studio · rewrite]`, swap systemOverlay / probeHints /
 * boundNodeIds to Hook Rewriter doctrine for that turn only.
 *
 * H3 competitor / repeat: keep Hook Formula pack; thin mode overlays append
 * via buildHookStudioBatchContract (not pack swaps).
 */
export function resolvePackForHookStudioBatch(options: {
  pack: ModulePack;
  latestUserMessage: string;
}): {
  pack: ModulePack;
  studioMode: HookStudioMode | null;
} {
  const studioMode: HookStudioMode | null = detectHookStudioBatchMode(
    options.latestUserMessage,
  );

  if (options.pack.moduleId !== "scroll-stop-hook" || studioMode === null) {
    return { pack: options.pack, studioMode };
  }

  if (studioMode === "rewrite") {
    return {
      studioMode,
      pack: {
        ...options.pack,
        systemOverlay: HOOK_REWRITER_PACK.systemOverlay,
        probeHints: HOOK_REWRITER_PACK.probeHints,
        boundNodeIds: HOOK_REWRITER_PACK.boundNodeIds,
        intakeFields: HOOK_REWRITER_PACK.intakeFields,
      },
    };
  }

  return { pack: options.pack, studioMode };
}

/**
 * Shared JSON shape block used by modes that require full formula_legs.
 */
function formulaLegsJsonShapeBlock(): string {
  return [
    "Shape:",
    "{",
    '  "hooks": [',
    "    {",
    '      "hook_text": "...",',
    '      "why_it_works": "Jeff reason grounded in Hook Formula legs",',
    '      "formula_legs": {',
    '        "audience": "...",',
    '        "pain": "...",',
    '        "contrast_or_result": "...",',
    '        "curiosity": "..."',
    "      },",
    '      "film_first": false',
    "    }",
    "  ]",
    "}",
  ].join("\n");
}

/**
 * Hard JSON output contract appended only for Hook Studio batch turns.
 * Overrides pack prose "Output shape" for that turn. No viral-guarantee /
 * Maria principle / overnight-fame framing.
 *
 * H3 competitor / repeat also prepend thin mode doctrine overlays.
 */
export function buildHookStudioBatchContract(mode: HookStudioMode): string {
  if (mode === "from-idea") {
    return [
      "## Hook Studio batch (hard; overrides Output shape above)",
      `This turn is a Hook Studio Generate marked ${HOOK_STUDIO_MARKER_FROM_IDEA}.`,
      "Do not ask clarifying questions. Deliver the batch now from profile + idea in the user message.",
      "Reply with a single JSON object only (markdown fences OK). No trailing curriculum lecture.",
      formulaLegsJsonShapeBlock(),
      "Rules:",
      "1. Return 5 to 8 hooks.",
      "2. Every hook MUST include all four formula_legs with non-empty strings. Drop incomplete candidates.",
      "3. Mark exactly one film_first true.",
      "4. Ban overnight fame, guaranteed viral, and Maria principle labels in any field.",
      "5. Hooks serve get-seen so trust can start. No trust-breaking clickbait. No hard pitch in second one.",
    ].join("\n");
  }

  if (mode === "rewrite") {
    return [
      "## Hook Studio batch (hard; overrides Output format above)",
      `This turn is a Hook Studio Generate marked ${HOOK_STUDIO_MARKER_REWRITE}.`,
      "You are applying Hook Rewriter doctrine on the Hook Formula page for this batch only.",
      "Do not ask clarifying questions. Deliver the batch now from profile + pasted hook/topic.",
      "Keep the body topic. Rewrite opens only.",
      "Reply with a single JSON object only (markdown fences OK). No trailing curriculum lecture.",
      "Shape:",
      "{",
      '  "hooks": [',
      "    {",
      '      "hook_text": "...",',
      '      "why_it_works": "Jeff reason for why this open earns the first seconds",',
      '      "rewrite_note": "what changed vs the pasted open",',
      '      "formula_legs": {',
      '        "audience": "...",',
      '        "pain": "...",',
      '        "contrast_or_result": "...",',
      '        "curiosity": "..."',
      "      },",
      '      "film_first": false',
      "    }",
      "  ]",
      "}",
      "Rules:",
      "1. Return 5 to 8 rewritten opens.",
      "2. formula_legs preferred when clear; rewrite_note required when legs are omitted.",
      "3. Mark exactly one film_first true.",
      "4. Ban overnight fame, guaranteed viral, trust-breaking clickbait, and Maria principle labels.",
      "5. Keep body topic intact. Stronger opens that earn attention, not virality promises.",
    ].join("\n");
  }

  if (mode === "competitor") {
    return [
      buildCompetitorModeOverlay(),
      "",
      "## Hook Studio batch (hard; overrides Output shape above)",
      `This turn is a Hook Studio Generate marked ${HOOK_STUDIO_MARKER_COMPETITOR}.`,
      "Do not ask clarifying questions. Deliver the batch now from profile + competitor samples.",
      "Reply with a single JSON object only (markdown fences OK). No trailing curriculum lecture.",
      formulaLegsJsonShapeBlock(),
      "Rules:",
      "1. Return 5 to 8 hooks rewritten into THIS user's niche + proof + standpoint.",
      "2. Every hook MUST include all four formula_legs with non-empty strings.",
      "3. why_it_works must name the extracted scroll-stop pattern (not \"copy them\").",
      "4. Mark exactly one film_first true.",
      "5. Ban wholesale copy of competitor wording, overnight fame, guaranteed viral, go-viral-like-them, and Maria principle labels.",
    ].join("\n");
  }

  // repeat
  return [
    buildRepeatModeOverlay(),
    "",
    "## Hook Studio batch (hard; overrides Output shape above)",
    `This turn is a Hook Studio Generate marked ${HOOK_STUDIO_MARKER_REPEAT}.`,
    "Do not ask clarifying questions. Deliver the batch now from profile + the user's own hit hooks.",
    "Reply with a single JSON object only (markdown fences OK). No trailing curriculum lecture.",
    formulaLegsJsonShapeBlock(),
    "Rules:",
    "1. Return 5 to 8 varied opens that keep the winning mechanism.",
    "2. Every hook MUST include all four formula_legs with non-empty strings.",
    "3. why_it_works must name the kept mechanism and what you varied. No near-duplicates of the paste.",
    "4. Mark exactly one film_first true.",
    "5. Ban trust-breaking clickbait, overnight fame, guaranteed viral, and Maria principle labels.",
  ].join("\n");
}

/**
 * Appends the Studio JSON contract (and H3 mode doctrine) after the normal module overlay.
 */
export function appendHookStudioBatchContract(options: {
  systemPrompt: string;
  studioMode: HookStudioMode | null;
}): string {
  if (options.studioMode === null) {
    return options.systemPrompt;
  }

  return [options.systemPrompt, "", buildHookStudioBatchContract(options.studioMode)].join(
    "\n",
  );
}
