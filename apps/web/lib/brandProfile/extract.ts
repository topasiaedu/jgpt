/**
 * Text extraction for Brand assets (PDF by page, PPTX by slide, plain text as-is).
 * User data only. Never writes into jeff-wiki / jeff-graph / raw/jeff.
 */

import JSZip from "jszip";
import { extractText } from "unpdf";

import { ocrPdfBrandAsset } from "@/lib/brandProfile/ocrPdf";
import type { BrandAssetKind } from "@/lib/brandProfile/types";

/** One labeled unit of extracted text (page, slide, or whole paste). */
export type ExtractUnit = {
  sourceLabel: string;
  text: string;
};

export type ExtractResult = {
  units: ExtractUnit[];
  totalChars: number;
};

/**
 * Decodes a few common XML entities in PPTX text runs.
 */
function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'");
}

/**
 * Pulls visible text from PPTX slide XML (`a:t` runs).
 */
function stripXmlToText(xml: string): string {
  const parts: string[] = [];
  const pattern = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;
  let match: RegExpExecArray | null = pattern.exec(xml);
  while (match !== null) {
    const run: string = decodeXmlEntities(match[1] ?? "").trim();
    if (run.length > 0) {
      parts.push(run);
    }
    match = pattern.exec(xml);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Extracts text from a PDF buffer, one unit per page.
 */
async function extractPdfUnits(bytes: Uint8Array): Promise<ExtractUnit[]> {
  // unpdf/pdfjs detaches the ArrayBuffer it is given. Copy so the caller can
  // still run OCR on the original bytes when native text is empty.
  const forNative: Uint8Array = bytes.slice();
  const result = await extractText(forNative, { mergePages: false });
  const pages: string[] = Array.isArray(result.text)
    ? result.text
    : [result.text];
  const units: ExtractUnit[] = [];
  for (let index = 0; index < pages.length; index += 1) {
    const pageText: string = pages[index]?.trim() ?? "";
    if (pageText.length === 0) {
      continue;
    }
    units.push({
      sourceLabel: `page ${index + 1}`,
      text: pageText,
    });
  }
  return units;
}

/**
 * Extracts text from a PPTX buffer, one unit per slide XML part.
 */
async function extractPptxUnits(bytes: Uint8Array): Promise<ExtractUnit[]> {
  const zip = await JSZip.loadAsync(bytes);
  const slidePaths: string[] = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path))
    .sort((a, b) => {
      const numA: number = Number(a.match(/slide(\d+)\.xml/i)?.[1] ?? "0");
      const numB: number = Number(b.match(/slide(\d+)\.xml/i)?.[1] ?? "0");
      return numA - numB;
    });

  const units: ExtractUnit[] = [];
  for (const path of slidePaths) {
    const file = zip.file(path);
    if (file === null) {
      continue;
    }
    const xml: string = await file.async("string");
    const text: string = stripXmlToText(xml);
    if (text.length === 0) {
      continue;
    }
    const slideNum: number = Number(path.match(/slide(\d+)\.xml/i)?.[1] ?? units.length + 1);
    units.push({
      sourceLabel: `slide ${slideNum}`,
      text,
    });
  }
  return units;
}

/**
 * True when UTF-8 decodes to nothing but whitespace (empty companion .txt files).
 */
export function plainTextBytesAreEmpty(bytes: Uint8Array): boolean {
  const text: string = new TextDecoder("utf-8").decode(bytes).trim();
  return text.length === 0;
}

/**
 * Treats UTF-8 bytes as a single plain-text / markdown / paste unit.
 */
function extractPlainUnits(bytes: Uint8Array, label: string): ExtractUnit[] {
  const text: string = new TextDecoder("utf-8").decode(bytes).trim();
  if (text.length === 0) {
    return [];
  }
  return [{ sourceLabel: label, text }];
}

/**
 * Runs the extractor for a Brand asset kind.
 * For PDFs with no native text layer, falls back to OpenAI PDF OCR (page-capped).
 */
export async function extractBrandAssetText(
  kind: BrandAssetKind,
  bytes: Uint8Array,
): Promise<ExtractResult> {
  let units: ExtractUnit[];
  switch (kind) {
    case "pdf":
      units = await extractPdfUnits(bytes);
      break;
    case "pptx":
      units = await extractPptxUnits(bytes);
      break;
    case "text":
      units = extractPlainUnits(bytes, "text");
      break;
    case "md":
      units = extractPlainUnits(bytes, "markdown");
      break;
    case "paste":
      units = extractPlainUnits(bytes, "paste");
      break;
    default: {
      const exhaustive: never = kind;
      throw new Error(`Unsupported Brand asset kind: ${String(exhaustive)}`);
    }
  }

  let totalChars: number = units.reduce(
    (sum, unit) => sum + unit.text.length,
    0,
  );

  // Image-heavy slide PDFs often have zero native text (e.g. AUG workshop decks).
  if (kind === "pdf" && (units.length === 0 || totalChars === 0)) {
    try {
      const ocr = await ocrPdfBrandAsset(bytes);
      units = ocr.units;
      totalChars = ocr.totalChars;
    } catch (error) {
      const message: string =
        error instanceof Error
          ? error.message
          : "Could not OCR this PDF.";
      throw new Error(message);
    }
  }

  return { units, totalChars };
}

/**
 * Infers BrandAssetKind from a filename and optional MIME type.
 * Returns null when the type is not supported.
 */
export function inferBrandAssetKind(
  fileName: string,
  mimeType: string,
): BrandAssetKind | null {
  const lowerName: string = fileName.trim().toLowerCase();
  const lowerMime: string = mimeType.trim().toLowerCase();

  if (lowerName.endsWith(".pdf") || lowerMime === "application/pdf") {
    return "pdf";
  }
  if (
    lowerName.endsWith(".pptx") ||
    lowerMime ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    lowerMime === "application/vnd.ms-powerpoint"
  ) {
    return "pptx";
  }
  if (lowerName.endsWith(".md") || lowerMime === "text/markdown") {
    return "md";
  }
  if (
    lowerName.endsWith(".txt") ||
    lowerMime === "text/plain" ||
    lowerMime.startsWith("text/")
  ) {
    return "text";
  }
  return null;
}
