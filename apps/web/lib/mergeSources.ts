import type { ChatSource } from "@/lib/chatTypes";

/**
 * Unions ChatSource lists by id, preserving first-seen order.
 */
export function mergeSourcesById(...lists: ChatSource[][]): ChatSource[] {
  const byId: Map<string, ChatSource> = new Map();
  for (const list of lists) {
    for (const source of list) {
      if (!byId.has(source.id)) {
        byId.set(source.id, source);
      }
    }
  }
  return [...byId.values()];
}
