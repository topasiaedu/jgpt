/**
 * Shared chat types for the Jeff IP test UI and API.
 * Phase B will keep this shape when replacing the stub handler.
 */

/** One turn in the chat transcript. */
export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
  /**
   * Graph nodes that grounded this assistant turn.
   * Present on assistant messages only; empty means general steer / ungrounded niche.
   */
  sources?: ChatSource[];
};

/** Graph node reference shown in the Sources used panel. */
export type ChatSource = {
  id: string;
  title: string;
  type: string;
};

/** POST /api/chat request body. */
export type ChatRequestBody = {
  messages: ChatMessage[];
};

/** POST /api/chat success response. */
export type ChatResponseBody = {
  reply: string;
  sources: ChatSource[];
};

/** POST /api/chat error response. */
export type ChatErrorBody = {
  error: string;
};
