/**
 * OCR fallback for image-heavy Brand PDFs when native text extract is empty.
 * Uses OpenAI vision-capable chat with PDF file input (Vercel-friendly; no canvas).
 * Caps pages via pdf-lib before upload to stay within serverless time/cost limits.
 */

import OpenAI from "openai";
import { PDFDocument } from "pdf-lib";

import {
  BRAND_ASSET_MAX_EXTRACT_CHARS,
  BRAND_OCR_MAX_PAGES,
} from "@/lib/brandProfile/types";
import { getOpenAIConfig } from "@/lib/openai";

/** One OCR page unit (same shape as extract ExtractUnit). */
export type OcrExtractUnit = {
  sourceLabel: string;
  text: string;
};

export type OcrExtractResult = {
  units: OcrExtractUnit[];
  totalChars: number;
};

/**
 * Builds a PDF containing only the first maxPages pages (1-indexed order preserved).
 */
export async function truncatePdfToMaxPages(
  bytes: Uint8Array,
  maxPages: number,
): Promise<{ bytes: Uint8Array; pageCount: number; truncated: boolean }> {
  if (maxPages < 1) {
    throw new Error("OCR page cap must be at least 1.");
  }

  const source = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
  });
  const totalPages: number = source.getPageCount();
  if (totalPages <= maxPages) {
    return { bytes, pageCount: totalPages, truncated: false };
  }

  const output = await PDFDocument.create();
  const indices: number[] = [];
  for (let index = 0; index < maxPages; index += 1) {
    indices.push(index);
  }
  const copied = await output.copyPages(source, indices);
  for (const page of copied) {
    output.addPage(page);
  }
  const saved = await output.save();
  return {
    bytes: new Uint8Array(saved),
    pageCount: maxPages,
    truncated: true,
  };
}

/**
 * Parses model JSON into page units. Tolerates missing/invalid pages.
 */
export function parseOcrPagesJson(raw: string): OcrExtractUnit[] {
  const trimmed: string = raw.trim();
  if (trimmed.length === 0) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed) as unknown;
  } catch {
    // Model sometimes wraps JSON in fences; strip once and retry.
    const fenced: string = trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    try {
      parsed = JSON.parse(fenced) as unknown;
    } catch {
      return [];
    }
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return [];
  }

  const record: Record<string, unknown> = Object.fromEntries(
    Object.entries(parsed),
  );
  const pagesRaw: unknown = record.pages;
  if (!Array.isArray(pagesRaw)) {
    return [];
  }

  const units: OcrExtractUnit[] = [];
  for (const item of pagesRaw) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      continue;
    }
    const pageRecord: Record<string, unknown> = Object.fromEntries(
      Object.entries(item),
    );
    const pageNum: unknown = pageRecord.page;
    const textRaw: unknown = pageRecord.text;
    if (typeof textRaw !== "string") {
      continue;
    }
    const text: string = textRaw.trim();
    if (text.length === 0) {
      continue;
    }
    const pageLabel: number =
      typeof pageNum === "number" && Number.isFinite(pageNum) && pageNum >= 1
        ? Math.floor(pageNum)
        : units.length + 1;
    units.push({
      sourceLabel: `page ${pageLabel}`,
      text,
    });
  }
  return units;
}

/**
 * Caps total OCR chars the same way native extract quotas expect.
 */
function capUnits(units: OcrExtractUnit[]): OcrExtractUnit[] {
  const capped: OcrExtractUnit[] = [];
  let used = 0;
  for (const unit of units) {
    if (used >= BRAND_ASSET_MAX_EXTRACT_CHARS) {
      break;
    }
    const remaining: number = BRAND_ASSET_MAX_EXTRACT_CHARS - used;
    const text: string =
      unit.text.length > remaining ? unit.text.slice(0, remaining) : unit.text;
    if (text.trim().length === 0) {
      continue;
    }
    capped.push({ sourceLabel: unit.sourceLabel, text });
    used += text.length;
  }
  return capped;
}

/**
 * Runs OpenAI PDF OCR on (at most) the first BRAND_OCR_MAX_PAGES pages.
 */
export async function ocrPdfBrandAsset(
  pdfBytes: Uint8Array,
): Promise<OcrExtractResult> {
  const { apiKey, model } = getOpenAIConfig();
  if (apiKey === null) {
    throw new Error("OPENAI_API_KEY is required to read scanned PDFs.");
  }

  const prepared = await truncatePdfToMaxPages(pdfBytes, BRAND_OCR_MAX_PAGES);
  if (prepared.pageCount === 0) {
    return { units: [], totalChars: 0 };
  }

  const base64: string = Buffer.from(prepared.bytes).toString("base64");
  const fileData: string = `data:application/pdf;base64,${base64}`;

  const client = new OpenAI({ apiKey });
  const pageHint: string = prepared.truncated
    ? `Only the first ${String(prepared.pageCount)} pages are included.`
    : `This PDF has ${String(prepared.pageCount)} page(s).`;

  const completion = await client.chat.completions.create({
    model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You OCR brand / pitch / slide PDFs for a product ingest pipeline.",
          "Return JSON only: {\"pages\":[{\"page\":1,\"text\":\"...\"},...]}",
          "page is 1-based. text is readable text from that page (EN/ZH/mixed OK).",
          "Skip blank pages. Do not invent content that is not visible.",
          "Preserve headings and bullet lines; collapse excess whitespace.",
        ].join(" "),
      },
      {
        role: "user",
        content: [
          {
            type: "file",
            file: {
              filename: "brand-material.pdf",
              file_data: fileData,
            },
          },
          {
            type: "text",
            text: [
              "Read every included page and return OCR text as JSON.",
              pageHint,
            ].join(" "),
          },
        ],
      },
    ],
  });

  const content: string | null | undefined =
    completion.choices[0]?.message?.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    return { units: [], totalChars: 0 };
  }

  const units = capUnits(parseOcrPagesJson(content));
  const totalChars: number = units.reduce(
    (sum, unit) => sum + unit.text.length,
    0,
  );
  return { units, totalChars };
}
