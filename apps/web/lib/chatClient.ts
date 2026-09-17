import type { ChatMessage, ChatResponseBody, ChatSource } from "@/lib/chatTypes";

export type ChatApiSuccess = {
  ok: true;
  reply: string;
  sources: ChatSource[];
  recommendedModuleIds: string[];
};

export type ChatApiFailure = {
  ok: false;
  error: string;
};

export type ChatApiResult = ChatApiSuccess | ChatApiFailure;

export type PostChatOptions = {
  messages: ChatMessage[];
  /** Chosen UI locale; locks all assistant output language. */
  locale: "zh" | "en";
  moduleId?: string;
  intake?: Record<string, string>;
  /** Optional home → tool intent handoff (length-capped client-side). */
  homeIntent?: string;
};

/**
 * POSTs dialogue to /api/chat. Optionally sends moduleId for module mode.
 * Legacy intake map remains supported but chat-first tools omit it.
 * homeIntent is a silent hint when the user arrived from home recommend cards.
 * locale is the sole authority for reply language (not the user's message language).
 */
export async function postChat(options: PostChatOptions): Promise<ChatApiResult> {
  let response: Response;
  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: options.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        locale: options.locale,
        ...(typeof options.moduleId === "string" && options.moduleId.length > 0
          ? { moduleId: options.moduleId }
          : {}),
        ...(options.intake !== undefined ? { intake: options.intake } : {}),
        ...(typeof options.homeIntent === "string" && options.homeIntent.length > 0
          ? { homeIntent: options.homeIntent }
          : {}),
      }),
    });
  } catch {
    return {
      ok: false,
      error: "Could not reach the chat API (network error). Check the deployment and try again.",
    };
  }

  try {
    const rawBody: string = await response.text();
    const data: unknown = parseJsonBody(rawBody);

    if (data === null) {
      return { ok: false, error: formatNonJsonApiError(response.status, rawBody) };
    }

    if (!response.ok) {
      return { ok: false, error: extractApiErrorMessage(data, response.status) };
    }

    if (!isChatResponseBody(data)) {
      return {
        ok: false,
        error: `Unexpected response from chat API (HTTP ${String(response.status)}).`,
      };
    }

    return {
      ok: true,
      reply: data.reply,
      sources: data.sources,
      recommendedModuleIds: data.recommendedModuleIds ?? [],
    };
  } catch (error) {
    const detail: string = error instanceof Error ? error.message : "unknown error";
    return {
      ok: false,
      error: `Chat request failed while reading the response: ${detail}`,
    };
  }
}

/**
 * Parses a response body as JSON. Returns null when empty or not JSON.
 */
export function parseJsonBody(rawBody: string): unknown | null {
  const trimmed: string = rawBody.trim();
  if (trimmed.length === 0) {
    return null;
  }

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

/**
 * Builds a readable error when the API returns HTML or other non-JSON.
 */
export function formatNonJsonApiError(status: number, rawBody: string): string {
  const snippet: string = rawBody.replace(/\s+/g, " ").trim().slice(0, 180);
  if (snippet.length === 0) {
    return `Chat API HTTP ${String(status)}: empty non-JSON body (often a timeout or platform error page).`;
  }
  return `Chat API HTTP ${String(status)}: ${snippet}`;
}

/**
 * Pulls a string error from a JSON error body, including nested Vercel shapes.
 */
export function extractApiErrorMessage(data: unknown, status: number): string {
  if (typeof data === "object" && data !== null) {
    if ("error" in data) {
      const errorField: unknown = (data as { error: unknown }).error;
      if (typeof errorField === "string" && errorField.trim().length > 0) {
        return errorField;
      }
      if (
        typeof errorField === "object" &&
        errorField !== null &&
        "message" in errorField &&
        typeof (errorField as { message: unknown }).message === "string"
      ) {
        return (errorField as { message: string }).message;
      }
    }
    if ("message" in data && typeof (data as { message: unknown }).message === "string") {
      return (data as { message: string }).message;
    }
  }

  return `Chat request failed (HTTP ${String(status)}).`;
}

/**
 * Narrows unknown JSON to the expected chat response shape.
 */
export function isChatResponseBody(value: unknown): value is ChatResponseBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("reply" in value) || !("sources" in value)) {
    return false;
  }

  const reply = (value as { reply: unknown }).reply;
  const sources = (value as { sources: unknown }).sources;

  if (typeof reply !== "string" || !Array.isArray(sources)) {
    return false;
  }

  const sourcesOk = sources.every((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }
    const candidate = item as { id?: unknown; title?: unknown; type?: unknown };
    return (
      typeof candidate.id === "string" &&
      typeof candidate.title === "string" &&
      typeof candidate.type === "string"
    );
  });

  if (!sourcesOk) {
    return false;
  }

  if ("recommendedModuleIds" in value) {
    const ids = (value as { recommendedModuleIds: unknown }).recommendedModuleIds;
    if (ids !== undefined) {
      if (!Array.isArray(ids) || !ids.every((entry) => typeof entry === "string")) {
        return false;
      }
    }
  }

  return true;
}
