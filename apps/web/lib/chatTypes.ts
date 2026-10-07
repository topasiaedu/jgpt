/**
 * Shared chat types for the Jeff IP test UI and API.
 * Free chat omits moduleId; module mode sends moduleId (optional legacy intake).
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
  /**
   * Home recommend mode: catalog module ids to deep-link as tool cards.
   * Present on assistant messages only when the model suggested tools.
   */
  recommendedModuleIds?: string[];
  /**
   * Brand-profile excerpts used this turn. Separate from Jeff graph sources.
   * Present on assistant messages only; never uses jeff-graph node ids.
   */
  brandSources?: BrandChatSource[];
};

/** Graph node reference shown in the Sources used panel. */
export type ChatSource = {
  id: string;
  title: string;
  type: string;
};

/**
 * User Brand material chip. Ids are always `brand:<chunkUuid>`, never graph ids.
 */
export type BrandChatSource = {
  id: string;
  title: string;
  kind: "brand";
};

/** POST /api/chat request body. */
export type ChatRequestBody = {
  messages: ChatMessage[];
  /**
   * Chosen UI locale. Sole authority for assistant reply language.
   * Defaults to zh when omitted (matches app default).
   */
  locale?: "zh" | "en";
  /** When set, runs a named IP module pack (system overlay + conversational slots). */
  moduleId?: string;
  /**
   * Optional legacy slot map. Chat-first modules usually omit this;
   * answers live in messages instead.
   */
  intake?: Record<string, string>;
  /**
   * Optional home → tool intent (from `?from=home&q=`). Silent system hint only; not a form.
   */
  homeIntent?: string;
  /**
   * Optional Brand profile id from tool handoff (`?profile=`).
   * When set, server verifies auth + ownership and injects USER_BRAND_FACTS.
   * When omitted, chat continues without brand facts or probe_brand.
   */
  brandProfileId?: string;
};

/** POST /api/chat success response. */
export type ChatResponseBody = {
  reply: string;
  sources: ChatSource[];
  /**
   * Home free chat only: validated catalog ids (2 to 4) for tool deep links.
   * Omitted or empty when module mode, or when no clear recommend.
   */
  recommendedModuleIds?: string[];
  /**
   * Brand-profile excerpts used this turn. Omitted or empty when unused.
   * Separate from `sources` (Jeff graph only).
   */
  brandSources?: BrandChatSource[];
};

/** POST /api/chat error response. */
export type ChatErrorBody = {
  error: string;
};
