/**
 * Chunk Brand extract units into brand_chunks rows (source_label preserved).
 */

import type { ExtractUnit } from "@/lib/brandProfile/extract";
import {
  BRAND_CHUNK_OVERLAP_CHARS,
  BRAND_CHUNK_TARGET_CHARS,
} from "@/lib/brandProfile/types";

/** One chunk ready to embed and insert. */
export type BrandTextChunk = {
  ordinal: number;
  chunkText: string;
  sourceLabel: string;
};

/**
 * Splits a long string into overlapping windows of about targetChars.
 */
function splitLongText(text: string, targetChars: number, overlap: number): string[] {
  const trimmed: string = text.trim();
  if (trimmed.length === 0) {
    return [];
  }
  if (trimmed.length <= targetChars) {
    return [trimmed];
  }

  const parts: string[] = [];
  let start = 0;
  while (start < trimmed.length) {
    const end: number = Math.min(start + targetChars, trimmed.length);
    const slice: string = trimmed.slice(start, end).trim();
    if (slice.length > 0) {
      parts.push(slice);
    }
    if (end >= trimmed.length) {
      break;
    }
    const nextStart: number = end - overlap;
    start = nextStart > start ? nextStart : end;
  }
  return parts;
}

/**
 * Builds ordered chunks from extract units, keeping page/slide labels.
 */
export function chunkExtractUnits(units: ExtractUnit[]): BrandTextChunk[] {
  const chunks: BrandTextChunk[] = [];
  let ordinal = 0;

  for (const unit of units) {
    const pieces: string[] = splitLongText(
      unit.text,
      BRAND_CHUNK_TARGET_CHARS,
      BRAND_CHUNK_OVERLAP_CHARS,
    );
    for (const piece of pieces) {
      chunks.push({
        ordinal,
        chunkText: piece,
        sourceLabel: unit.sourceLabel,
      });
      ordinal += 1;
    }
  }

  return chunks;
}

/**
 * Sums character lengths of chunk texts (for profile extract budget).
 */
export function sumChunkChars(chunks: BrandTextChunk[]): number {
  return chunks.reduce((sum, chunk) => sum + chunk.chunkText.length, 0);
}
