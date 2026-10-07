/**
 * Maps persisted history rows onto in-memory ChatMessage turns.
 */

import type { ChatHistoryMessage } from "@/lib/chatHistory/types";
import type { ChatMessage } from "@/lib/chatTypes";

/**
 * Converts DB messages (any ordinal order) into UI ChatMessage turns.
 * Keeps sources/brandSources on assistant rows for a later chip UI; module chat may hide them.
 */
export function historyMessagesToChat(
  messages: ChatHistoryMessage[],
): ChatMessage[] {
  const sorted: ChatHistoryMessage[] = [...messages].sort((left, right) => {
    return left.ordinal - right.ordinal;
  });
  return sorted.map((row) => {
    const next: ChatMessage = {
      role: row.role,
      content: row.content,
    };
    if (row.sources !== null && row.sources.length > 0) {
      next.sources = row.sources;
    }
    if (row.brandSources !== null && row.brandSources.length > 0) {
      next.brandSources = row.brandSources;
    }
    return next;
  });
}
