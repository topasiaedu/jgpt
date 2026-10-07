/**
 * Brand profile user-data shapes (not Jeff doctrine).
 * Stub for Agents B/D/E; no ingest or CRUD logic here.
 */

/** Allowed upload / paste kinds stored on brand_assets.kind. */
export type BrandAssetKind = "pdf" | "pptx" | "text" | "md" | "paste";

/** Ingest pipeline status on brand_assets.status. */
export type BrandAssetStatus = "pending" | "ready" | "failed";

/**
 * Structured Brand profile fields kept in brand_profiles.structured (jsonb).
 * All strings; empty string means unknown / not set yet.
 */
export type BrandProfileStructured = {
  businessName: string;
  whatTheySell: string;
  whoTheyServe: string;
  founderRoleFace: string;
  stance: string;
  proofCredentials: string;
  offerCta: string;
  toneNotes: string;
  doNotSay: string;
};

/** Empty structured defaults for create / form init. */
export const EMPTY_BRAND_PROFILE_STRUCTURED: BrandProfileStructured = {
  businessName: "",
  whatTheySell: "",
  whoTheyServe: "",
  founderRoleFace: "",
  stance: "",
  proofCredentials: "",
  offerCta: "",
  toneNotes: "",
  doNotSay: "",
};

/** Private Storage bucket id for original uploads (Agent D). */
export const BRAND_ASSETS_BUCKET = "brand-assets";

/**
 * Hard cap for brand_profiles.active_brief (~2.5k chars).
 * Chat always-on context; never dump full extracts.
 */
export const ACTIVE_BRIEF_MAX_CHARS = 2500;

/** Per-file upload quota target from the Brand profiles brief (~40MB). */
export const BRAND_ASSET_MAX_BYTES = 40 * 1024 * 1024;

/** Max source assets (uploads + pastes) per Brand profile. */
export const BRAND_PROFILE_MAX_ASSETS = 20;

/** Max extracted characters kept from one asset before chunking fails. */
export const BRAND_ASSET_MAX_EXTRACT_CHARS = 120_000;

/** Max sum of extracted characters across all assets on one profile. */
export const BRAND_PROFILE_MAX_EXTRACT_CHARS = 400_000;

/** Max characters accepted for a paste asset body. */
export const BRAND_PASTE_MAX_CHARS = 80_000;

/** OpenAI embedding model; must match brand_chunks.embedding vector(1536). */
export const BRAND_EMBEDDING_MODEL = "text-embedding-3-small";

/** Embedding vector length for brand_chunks.embedding. */
export const BRAND_EMBEDDING_DIMS = 1536;

/** Target chunk size for brand_chunks.chunk_text. */
export const BRAND_CHUNK_TARGET_CHARS = 900;

/** Overlap between successive chunks from the same page/slide. */
export const BRAND_CHUNK_OVERLAP_CHARS = 120;

/** Max chunk texts sampled into the summarize LLM prompt (not chat). */
export const BRAND_SUMMARIZE_SAMPLE_CHARS = 12_000;

/**
 * Hard cap for the USER_BRAND_FACTS system-prompt block (brief + structured).
 * Never dump full asset extracts into chat.
 */
export const USER_BRAND_FACTS_MAX_CHARS = 3200;

/** Max characters of one probe_brand excerpt returned to the model. */
export const BRAND_PROBE_EXCERPT_MAX_CHARS = 420;

/** Max characters across all probe_brand excerpts in one tool result. */
export const BRAND_PROBE_PACK_MAX_CHARS = 1600;

/** Target excerpt count for probe_brand (fewer if the profile has fewer chunks). */
export const BRAND_PROBE_MIN_EXCERPTS = 2;

/** Hard ceiling for excerpts returned from one probe_brand call. */
export const BRAND_PROBE_MAX_EXCERPTS = 4;

/** Max probe_brand tool calls per chat turn (parallel to probe_jeff). */
export const MAX_BRAND_PROBE_TOOL_CALLS = 2;

/**
 * Type guard for asset kind strings from the DB / forms.
 */
export function isBrandAssetKind(value: string): value is BrandAssetKind {
  return (
    value === "pdf" ||
    value === "pptx" ||
    value === "text" ||
    value === "md" ||
    value === "paste"
  );
}

/**
 * Type guard for asset status strings from the DB.
 */
export function isBrandAssetStatus(value: string): value is BrandAssetStatus {
  return value === "pending" || value === "ready" || value === "failed";
}

/**
 * Narrow unknown jsonb into BrandProfileStructured with safe string defaults.
 */
export function normalizeBrandProfileStructured(
  value: unknown,
): BrandProfileStructured {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ...EMPTY_BRAND_PROFILE_STRUCTURED };
  }

  const record: Record<string, unknown> = Object.fromEntries(
    Object.entries(value),
  );

  return {
    businessName: readStructuredString(record, "businessName"),
    whatTheySell: readStructuredString(record, "whatTheySell"),
    whoTheyServe: readStructuredString(record, "whoTheyServe"),
    founderRoleFace: readStructuredString(record, "founderRoleFace"),
    stance: readStructuredString(record, "stance"),
    proofCredentials: readStructuredString(record, "proofCredentials"),
    offerCta: readStructuredString(record, "offerCta"),
    toneNotes: readStructuredString(record, "toneNotes"),
    doNotSay: readStructuredString(record, "doNotSay"),
  };
}

/**
 * Reads one structured field as a trimmed string, or empty when missing/invalid.
 */
function readStructuredString(
  record: Record<string, unknown>,
  key: keyof BrandProfileStructured,
): string {
  const raw: unknown = record[key];
  if (typeof raw !== "string") {
    return "";
  }
  return raw.trim();
}
