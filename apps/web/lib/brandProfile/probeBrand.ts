/**
 * Mid-chat Brand retrieval: profile-scoped chunks only.
 * Parallel to probe_jeff. Never writes into jeff-wiki / jeff-graph.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import { embedBrandChunkTexts, formatEmbeddingForPg } from "@/lib/brandProfile/embed";
import {
  BRAND_PROBE_EXCERPT_MAX_CHARS,
  BRAND_PROBE_MAX_EXCERPTS,
  BRAND_PROBE_PACK_MAX_CHARS,
} from "@/lib/brandProfile/types";
import type { BrandChatSource } from "@/lib/chatTypes";

export type BrandProbeExcerpt = {
  chunkId: string;
  sourceLabel: string;
  excerpt: string;
};

export type BrandProbeResult = {
  query: string;
  excerpts: BrandProbeExcerpt[];
  sources: BrandChatSource[];
  evidencePackText: string;
};

export type RankedChunk = {
  chunkId: string;
  sourceLabel: string;
  chunkText: string;
  score: number;
};

/**
 * Prefix so Brand ids never collide with Jeff graph node ids.
 */
export function brandSourceId(chunkId: string): string {
  return `brand:${chunkId}`;
}

/**
 * Clips one excerpt for the tool payload (no full chunk dump).
 */
export function clipBrandExcerpt(text: string, maxChars: number): string {
  const collapsed: string = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= maxChars) {
    return collapsed;
  }
  return collapsed.slice(0, maxChars).trimEnd();
}

/**
 * Picks 2 to 4 unique excerpts under the pack char budget.
 */
export function selectBrandExcerpts(ranked: RankedChunk[]): BrandProbeExcerpt[] {
  const seen: Set<string> = new Set();
  const selected: BrandProbeExcerpt[] = [];
  let usedChars = 0;

  for (const item of ranked) {
    if (selected.length >= BRAND_PROBE_MAX_EXCERPTS) {
      break;
    }
    if (seen.has(item.chunkId)) {
      continue;
    }
    const excerpt: string = clipBrandExcerpt(
      item.chunkText,
      BRAND_PROBE_EXCERPT_MAX_CHARS,
    );
    if (excerpt.length === 0) {
      continue;
    }
    if (usedChars + excerpt.length > BRAND_PROBE_PACK_MAX_CHARS && selected.length > 0) {
      break;
    }
    seen.add(item.chunkId);
    usedChars += excerpt.length;
    selected.push({
      chunkId: item.chunkId,
      sourceLabel:
        item.sourceLabel.trim().length > 0 ? item.sourceLabel.trim() : "Brand document",
      excerpt,
    });
  }

  return selected;
}

/**
 * Formats probe_brand excerpts for the model. Labeled as user brand material.
 */
export function formatBrandProbePack(
  query: string,
  excerpts: BrandProbeExcerpt[],
): string {
  if (excerpts.length === 0) {
    return [
      "USER_BRAND_EXCERPTS: none for this query.",
      `query: ${query}`,
      "No matching Brand chunks. Do not invent document details. Ask the user or stay inside USER_BRAND_FACTS.",
    ].join("\n");
  }

  const blocks: string[] = [
    "USER_BRAND_EXCERPTS (user-supplied Brand materials; NOT Jeff doctrine)",
    `query: ${query}`,
    "Use these only as this client's facts. Do not cite them as Jeff graph sources.",
  ];

  for (const excerpt of excerpts) {
    blocks.push(
      "",
      `[${brandSourceId(excerpt.chunkId)}] ${excerpt.sourceLabel}`,
      excerpt.excerpt,
    );
  }

  const pack: string = blocks.join("\n");
  if (pack.length <= BRAND_PROBE_PACK_MAX_CHARS + 400) {
    return pack;
  }
  return pack.slice(0, BRAND_PROBE_PACK_MAX_CHARS + 400).trimEnd();
}

/**
 * Maps excerpts to UI brand source chips (never Jeff graph ids).
 */
export function brandSourcesFromExcerpts(
  excerpts: BrandProbeExcerpt[],
): BrandChatSource[] {
  return excerpts.map((excerpt) => ({
    id: brandSourceId(excerpt.chunkId),
    title: excerpt.sourceLabel,
    kind: "brand",
  }));
}

/**
 * Searches brand_chunks for one owned profile: vector when possible, keyword fallback.
 */
export async function probeBrandChunks(options: {
  supabase: SupabaseClient;
  profileId: string;
  query: string;
}): Promise<BrandProbeResult> {
  const query: string = options.query.trim();
  if (query.length === 0) {
    return emptyBrandProbe("");
  }

  const ranked: RankedChunk[] = [];
  const vectorHits: RankedChunk[] = await searchBrandChunksVector(
    options.supabase,
    options.profileId,
    query,
  );
  ranked.push(...vectorHits);

  const keywordHits: RankedChunk[] = await searchBrandChunksKeyword(
    options.supabase,
    options.profileId,
    query,
  );
  ranked.push(...keywordHits);

  ranked.sort((a, b) => b.score - a.score);
  const excerpts: BrandProbeExcerpt[] = selectBrandExcerpts(ranked);
  return {
    query,
    excerpts,
    sources: brandSourcesFromExcerpts(excerpts),
    evidencePackText: formatBrandProbePack(query, excerpts),
  };
}

/**
 * Empty probe result when the query is blank or retrieval fails closed.
 */
function emptyBrandProbe(query: string): BrandProbeResult {
  return {
    query,
    excerpts: [],
    sources: [],
    evidencePackText: formatBrandProbePack(query, []),
  };
}

/**
 * Vector nearest-neighbor via match_brand_chunks. Soft-fails to [].
 */
async function searchBrandChunksVector(
  supabase: SupabaseClient,
  profileId: string,
  query: string,
): Promise<RankedChunk[]> {
  let embedding: number[];
  try {
    const vectors: number[][] = await embedBrandChunkTexts([query]);
    const first: number[] | undefined = vectors[0];
    if (first === undefined) {
      return [];
    }
    embedding = first;
  } catch {
    return [];
  }

  const { data, error } = await supabase.rpc("match_brand_chunks", {
    query_embedding: formatEmbeddingForPg(embedding),
    match_profile_id: profileId,
    match_count: 6,
  });

  if (error !== null || data === null || !Array.isArray(data)) {
    return [];
  }

  const hits: RankedChunk[] = [];
  for (const item of data) {
    const parsed = parseRankedChunk(item, 1);
    if (parsed !== null) {
      hits.push(parsed);
    }
  }
  return hits;
}

/**
 * Keyword ilike over chunk_text for the same profile only.
 */
async function searchBrandChunksKeyword(
  supabase: SupabaseClient,
  profileId: string,
  query: string,
): Promise<RankedChunk[]> {
  const tokens: string[] = keywordTokens(query);
  if (tokens.length === 0) {
    return [];
  }

  const hits: RankedChunk[] = [];
  for (const token of tokens.slice(0, 3)) {
    const pattern: string = `%${escapeIlike(token)}%`;
    const { data, error } = await supabase
      .from("brand_chunks")
      .select("id, chunk_text, source_label")
      .eq("profile_id", profileId)
      .ilike("chunk_text", pattern)
      .limit(8);

    if (error !== null || data === null) {
      continue;
    }

    for (const item of data) {
      const parsed = parseRankedChunk(item, 0.45);
      if (parsed !== null) {
        hits.push(parsed);
      }
    }
  }

  return hits;
}

/**
 * Extracts short keyword tokens for ilike (min 3 chars).
 */
function keywordTokens(query: string): string[] {
  const raw: string[] = query
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
  const unique: string[] = [];
  const seen: Set<string> = new Set();
  for (const token of raw) {
    const key: string = token.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(token);
    if (unique.length >= 4) {
      break;
    }
  }
  if (unique.length === 0 && query.trim().length >= 3) {
    return [query.trim().slice(0, 48)];
  }
  return unique;
}

/**
 * Escapes % and _ for PostgREST ilike patterns.
 */
function escapeIlike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/**
 * Narrows a PostgREST / RPC row into a ranked chunk, or null.
 */
function parseRankedChunk(value: unknown, defaultScore: number): RankedChunk | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const record: Record<string, unknown> = Object.fromEntries(
    Object.entries(value),
  );
  const idRaw: unknown = record.id;
  const textRaw: unknown = record.chunk_text;
  if (typeof idRaw !== "string" || typeof textRaw !== "string") {
    return null;
  }
  const labelRaw: unknown = record.source_label;
  const sourceLabel: string =
    typeof labelRaw === "string" && labelRaw.trim().length > 0
      ? labelRaw.trim()
      : "Brand document";
  const similarityRaw: unknown = record.similarity;
  const score: number =
    typeof similarityRaw === "number" && Number.isFinite(similarityRaw)
      ? similarityRaw
      : defaultScore;
  return {
    chunkId: idRaw,
    sourceLabel,
    chunkText: textRaw,
    score,
  };
}
