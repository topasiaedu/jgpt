import type {
  HookStudioCard,
  HookStudioFormulaLegs,
  HookStudioMode,
  HookStudioParseResult,
} from "@/lib/hookStudio/types";

export type ParseHookStudioOptions = {
  /**
   * When `from-idea` / `competitor` / `repeat`, drop cards missing any of the four formula legs.
   * When `rewrite`, keep opens with hook_text; legs optional.
   * When omitted, accept any card with hook_text (legacy / unknown).
   */
  mode?: HookStudioMode;
};

/**
 * Modes that require complete Hook Formula legs on every card.
 */
function requiresCompleteLegs(mode: HookStudioMode | undefined): boolean {
  return mode === "from-idea" || mode === "competitor" || mode === "repeat";
}

/**
 * Best-effort parse of a Hook Studio batch assistant reply into cards.
 * Accepts raw JSON, fenced ```json blocks, or embedded object with hooks[].
 * Trailing prose after a JSON object is ignored once a balanced object is found.
 * When no valid hooks array is found, falls back to plain text (never fakes cards).
 */
export function parseHookStudioReply(
  content: string,
  options?: ParseHookStudioOptions,
): HookStudioParseResult {
  const trimmed: string = content.trim();
  if (trimmed.length === 0) {
    return { kind: "empty" };
  }

  const mode: HookStudioMode | undefined = options?.mode;
  const candidates: string[] = collectJsonCandidates(trimmed);
  for (const candidate of candidates) {
    const cards: HookStudioCard[] | null = tryParseHooksJson(candidate, mode);
    if (cards !== null && cards.length > 0) {
      return { kind: "cards", cards: normalizeFilmFirst(cards) };
    }
  }

  return { kind: "fallback", text: trimmed };
}

/**
 * Collects likely JSON substrings: whole body, fenced blocks, first {…} span.
 * Also tries each fenced block's inner balanced object when fences wrap prose + JSON.
 */
function collectJsonCandidates(text: string): string[] {
  const out: string[] = [];
  out.push(text);

  const fencePattern = /```(?:json)?\s*([\s\S]*?)```/gi;
  let fenceMatch: RegExpExecArray | null = fencePattern.exec(text);
  while (fenceMatch !== null) {
    const inner: string | undefined = fenceMatch[1];
    if (typeof inner === "string" && inner.trim().length > 0) {
      const fenceInner: string = inner.trim();
      out.push(fenceInner);
      const nestedObject: string | null = extractBalancedObject(fenceInner);
      if (nestedObject !== null && nestedObject !== fenceInner) {
        out.push(nestedObject);
      }
    }
    fenceMatch = fencePattern.exec(text);
  }

  const objectSpan: string | null = extractBalancedObject(text);
  if (objectSpan !== null) {
    out.push(objectSpan);
  }

  // Array-only payloads: [{ ... }, ...]
  const arraySpan: string | null = extractBalancedArray(text);
  if (arraySpan !== null) {
    out.push(arraySpan);
  }

  return out;
}

/**
 * Finds the first top-level `{` … matching `}` span (best-effort, string-aware).
 */
function extractBalancedObject(text: string): string | null {
  return extractBalanced(text, "{", "}");
}

/**
 * Finds the first top-level `[` … matching `]` span (best-effort, string-aware).
 */
function extractBalancedArray(text: string): string | null {
  return extractBalanced(text, "[", "]");
}

/**
 * Generic balanced-bracket extractor that respects JSON string escapes.
 */
function extractBalanced(
  text: string,
  openChar: string,
  closeChar: string,
): string | null {
  const start: number = text.indexOf(openChar);
  if (start < 0) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let i = start; i < text.length; i += 1) {
    const ch: string = text.charAt(i);

    if (inString) {
      if (escaping) {
        escaping = false;
        continue;
      }
      if (ch === "\\") {
        escaping = true;
        continue;
      }
      if (ch === "\"") {
        inString = false;
      }
      continue;
    }

    if (ch === "\"") {
      inString = true;
      continue;
    }
    if (ch === openChar) {
      depth += 1;
      continue;
    }
    if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}

/**
 * Parses a JSON string and returns validated hook cards, or null if unusable.
 */
function tryParseHooksJson(
  raw: string,
  mode: HookStudioMode | undefined,
): HookStudioCard[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const hooksUnknown: unknown[] | null = extractHooksArray(parsed);
  if (hooksUnknown === null) {
    return null;
  }

  const cards: HookStudioCard[] = [];
  for (const entry of hooksUnknown) {
    const card: HookStudioCard | null = normalizeCard(entry, mode);
    if (card !== null) {
      cards.push(card);
    }
  }

  return cards.length > 0 ? cards : null;
}

/**
 * Pulls a hooks array from either `{ hooks: [...] }` or a bare array.
 */
function extractHooksArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "object" && value !== null && "hooks" in value) {
    const hooks = (value as { hooks: unknown }).hooks;
    if (Array.isArray(hooks)) {
      return hooks;
    }
  }
  return null;
}

/**
 * Narrows one unknown hook object. Requires non-empty hook_text.
 * From idea / competitor / repeat drop incomplete four-leg cards.
 */
function normalizeCard(
  value: unknown,
  mode: HookStudioMode | undefined,
): HookStudioCard | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const hookText: string =
    typeof record.hook_text === "string"
      ? record.hook_text.trim()
      : typeof record.hookText === "string"
        ? record.hookText.trim()
        : "";

  if (hookText.length === 0) {
    return null;
  }

  const why: string =
    typeof record.why_it_works === "string"
      ? record.why_it_works.trim()
      : typeof record.whyItWorks === "string"
        ? record.whyItWorks.trim()
        : "";

  const formulaLegs: HookStudioFormulaLegs | null = normalizeLegs(
    record.formula_legs ?? record.formulaLegs,
  );
  const rewriteNote: string | null =
    typeof record.rewrite_note === "string" && record.rewrite_note.trim().length > 0
      ? record.rewrite_note.trim()
      : typeof record.rewriteNote === "string" && record.rewriteNote.trim().length > 0
        ? record.rewriteNote.trim()
        : null;

  const filmFirst: boolean =
    record.film_first === true || record.filmFirst === true;

  if (requiresCompleteLegs(mode)) {
    if (formulaLegs === null || !hasCompleteLegs(formulaLegs)) {
      return null;
    }
  }

  if (mode === "rewrite" && formulaLegs === null && rewriteNote === null && why.length === 0) {
    // Still allow bare opens; UI can show hook_text alone.
  }

  return {
    hook_text: hookText,
    why_it_works: why,
    formula_legs: formulaLegs,
    rewrite_note: rewriteNote,
    film_first: filmFirst,
  };
}

/**
 * True when all four Hook Formula legs are non-empty.
 */
function hasCompleteLegs(legs: HookStudioFormulaLegs): boolean {
  return (
    legs.audience.length > 0 &&
    legs.pain.length > 0 &&
    legs.contrast_or_result.length > 0 &&
    legs.curiosity.length > 0
  );
}

/**
 * Ensures exactly one film_first marker. If the model marked none, mark the first card.
 * If multiple, keep the first true and clear the rest.
 */
function normalizeFilmFirst(cards: HookStudioCard[]): HookStudioCard[] {
  if (cards.length === 0) {
    return cards;
  }

  const firstTrueIndex: number = cards.findIndex((card) => card.film_first === true);
  if (firstTrueIndex < 0) {
    return cards.map((card, index) =>
      index === 0 ? { ...card, film_first: true } : { ...card, film_first: false },
    );
  }

  return cards.map((card, index) =>
    index === firstTrueIndex
      ? { ...card, film_first: true }
      : { ...card, film_first: false },
  );
}

/**
 * Narrows formula_legs when present. Partial legs return null for from-idea filtering
 * only after hasCompleteLegs; here we still build the object if any field is set.
 */
function normalizeLegs(value: unknown): HookStudioFormulaLegs | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const audience: string = stringField(record, "audience", "对象");
  const pain: string = stringField(record, "pain", "痛点");
  const contrast: string = stringField(
    record,
    "contrast_or_result",
    "contrastOrResult",
    "contrast",
    "反差",
    "反差或结果",
  );
  const curiosity: string = stringField(record, "curiosity", "好奇");

  if (
    audience.length === 0 &&
    pain.length === 0 &&
    contrast.length === 0 &&
    curiosity.length === 0
  ) {
    return null;
  }

  return {
    audience,
    pain,
    contrast_or_result: contrast,
    curiosity,
  };
}

/**
 * Returns the first matching string field among the given keys.
 */
function stringField(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value: unknown = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
}
