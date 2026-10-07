/**
 * Content-based Brand asset kind sniffing (magic bytes).
 * Fixes mislabeled uploads (e.g. PDF bytes saved with a .txt name).
 */

import type { BrandAssetKind } from "@/lib/brandProfile/types";

/**
 * True when bytes start with PDF magic (`%PDF`).
 */
export function bytesLookLikePdf(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  );
}

/**
 * True when bytes look like a ZIP (PPTX is a ZIP of XML parts).
 */
export function bytesLookLikeZip(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07) &&
    (bytes[3] === 0x04 || bytes[3] === 0x06 || bytes[3] === 0x08)
  );
}

/**
 * Prefers magic-byte kind over filename/MIME when they conflict.
 * Returns null when neither content nor name/MIME is supported.
 */
export function resolveBrandAssetKind(
  fileName: string,
  mimeType: string,
  bytes: Uint8Array,
  nameMimeKind: BrandAssetKind | null,
): BrandAssetKind | null {
  if (bytesLookLikePdf(bytes)) {
    return "pdf";
  }

  // PPTX is ZIP-based; only override when name/MIME already said pptx,
  // or when the name has no useful extension but MIME claims powerpoint.
  if (bytesLookLikeZip(bytes)) {
    if (nameMimeKind === "pptx") {
      return "pptx";
    }
    const lowerName: string = fileName.trim().toLowerCase();
    const lowerMime: string = mimeType.trim().toLowerCase();
    if (
      lowerName.endsWith(".pptx") ||
      lowerMime.includes("presentation") ||
      lowerMime.includes("powerpoint")
    ) {
      return "pptx";
    }
  }

  return nameMimeKind;
}

/**
 * Corrects a display filename when magic bytes prove a different type.
 * Example: "deck.txt" that is actually a PDF becomes "deck.pdf".
 */
export function alignFileNameWithKind(
  fileName: string,
  kind: BrandAssetKind,
): string {
  const trimmed: string = fileName.trim().length > 0 ? fileName.trim() : "upload";
  const lower: string = trimmed.toLowerCase();

  if (kind === "pdf") {
    if (lower.endsWith(".pdf")) {
      return trimmed;
    }
    if (/\.(txt|md|pptx|bin)$/i.test(trimmed)) {
      return trimmed.replace(/\.(txt|md|pptx|bin)$/i, ".pdf");
    }
    return `${trimmed}.pdf`;
  }

  if (kind === "pptx") {
    if (lower.endsWith(".pptx")) {
      return trimmed;
    }
    if (/\.(txt|md|pdf|bin)$/i.test(trimmed)) {
      return trimmed.replace(/\.(txt|md|pdf|bin)$/i, ".pptx");
    }
    return `${trimmed}.pptx`;
  }

  return trimmed;
}
