/**
 * OpenAI embeddings for Brand chunks (pgvector 1536 dims).
 * Reuses OPENAI_API_KEY via getOpenAIConfig. Never used for Jeff doctrine.
 */

import OpenAI from "openai";

import {
  BRAND_EMBEDDING_DIMS,
  BRAND_EMBEDDING_MODEL,
} from "@/lib/brandProfile/types";
import { getOpenAIConfig } from "@/lib/openai";

const EMBED_BATCH_SIZE = 32;

/**
 * Embeds chunk texts with text-embedding-3-small. Preserves input order.
 */
export async function embedBrandChunkTexts(
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const { apiKey } = getOpenAIConfig();
  if (apiKey === null) {
    throw new Error("OPENAI_API_KEY is required to embed Brand document chunks.");
  }

  const client = new OpenAI({ apiKey });
  const vectors: number[][] = [];

  for (let offset = 0; offset < texts.length; offset += EMBED_BATCH_SIZE) {
    const batch: string[] = texts.slice(offset, offset + EMBED_BATCH_SIZE);
    const response = await client.embeddings.create({
      model: BRAND_EMBEDDING_MODEL,
      input: batch,
    });

    const ordered = [...response.data].sort((a, b) => a.index - b.index);
    for (const item of ordered) {
      const embedding: number[] = item.embedding;
      if (embedding.length !== BRAND_EMBEDDING_DIMS) {
        throw new Error(
          `Unexpected embedding length ${embedding.length}; expected ${BRAND_EMBEDDING_DIMS}.`,
        );
      }
      vectors.push(embedding);
    }
  }

  if (vectors.length !== texts.length) {
    throw new Error("Embedding count does not match chunk count.");
  }

  return vectors;
}

/**
 * Formats a vector for PostgREST / pgvector insert.
 */
export function formatEmbeddingForPg(vector: number[]): string {
  return `[${vector.join(",")}]`;
}
