import type { ChatMessage } from "@/lib/chatTypes";

/** Max dialogue turns (user + assistant) sent to the model each request. */
export const MAX_DIALOGUE_MESSAGES = 16;

/**
 * Keeps only role + content for the last N messages.
 * Drops sources and any other metadata so prior-turn evidence never re-enters the prompt.
 */
export function toDialogueOnly(
  messages: ChatMessage[],
  maxMessages: number = MAX_DIALOGUE_MESSAGES,
): ChatMessage[] {
  const capped: ChatMessage[] = messages.slice(-Math.max(1, maxMessages));
  return capped.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

/**
 * Builds the primary probe query from the latest user ask.
 * Optionally blends a short prior user line when the latest ask is brief (pronoun / follow-up).
 * Scoring still centers on the latest ask text (placed last).
 */
export function buildProbeQuery(messages: ChatMessage[]): string {
  const lastUserIndex: number = findLastIndex(messages, (message) => message.role === "user");
  if (lastUserIndex < 0) {
    return "";
  }

  const latest: string = messages[lastUserIndex].content.trim();
  if (latest.length === 0) {
    return "";
  }

  const priorUser: ChatMessage | undefined = [...messages.slice(0, lastUserIndex)]
    .reverse()
    .find((message) => message.role === "user");

  // Blend only for pronoun / ultra-short follow-ups, not for a full topic-shift ask.
  const looksLikeFollowUp: boolean =
    latest.length < 28 ||
    /\b(it|that|this|those|these|them|he|she|they|there|more|also|again)\b/i.test(latest);

  if (
    looksLikeFollowUp &&
    priorUser !== undefined &&
    priorUser.content.trim().length > 0 &&
    priorUser.content.trim() !== latest
  ) {
    const priorClip: string = priorUser.content.trim().slice(0, 160);
    return `${priorClip}\n${latest}`;
  }

  return latest;
}

/**
 * Finds the last index matching a predicate, or -1.
 */
function findLastIndex<T>(items: T[], predicate: (item: T) => boolean): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index])) {
      return index;
    }
  }
  return -1;
}
