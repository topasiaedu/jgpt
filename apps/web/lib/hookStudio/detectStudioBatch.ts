import {
  HOOK_STUDIO_MARKER_COMPETITOR,
  HOOK_STUDIO_MARKER_FROM_IDEA,
  HOOK_STUDIO_MARKER_REPEAT,
  HOOK_STUDIO_MARKER_REWRITE,
} from "@/lib/hookStudio/composeUserMessage";
import type { HookStudioMode } from "@/lib/hookStudio/types";

/**
 * Detects a Hook Studio batch turn from the stable message markers.
 * Returns null for normal conversational turns (prose overlay stays).
 */
export function detectHookStudioBatchMode(
  latestUserMessage: string,
): HookStudioMode | null {
  const trimmed: string = latestUserMessage.trim();
  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.includes(HOOK_STUDIO_MARKER_FROM_IDEA)) {
    return "from-idea";
  }
  if (trimmed.includes(HOOK_STUDIO_MARKER_REWRITE)) {
    return "rewrite";
  }
  if (trimmed.includes(HOOK_STUDIO_MARKER_COMPETITOR)) {
    return "competitor";
  }
  if (trimmed.includes(HOOK_STUDIO_MARKER_REPEAT)) {
    return "repeat";
  }
  return null;
}
