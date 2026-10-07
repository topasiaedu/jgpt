/**
 * Local smoke for Brand PDF OCR helpers + magic-byte kind sniff.
 * Run: npx --yes tsx scripts/test-brand-ocr-sniff.ts
 */

import { readFileSync } from "fs";
import path from "path";

import {
  parseOcrPagesJson,
  truncatePdfToMaxPages,
} from "../lib/brandProfile/ocrPdf";
import {
  alignFileNameWithKind,
  bytesLookLikePdf,
  resolveBrandAssetKind,
} from "../lib/brandProfile/sniffKind";
import { BRAND_OCR_MAX_PAGES } from "../lib/brandProfile/types";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const sampleJson = JSON.stringify({
  pages: [
    { page: 1, text: "Hello brand" },
    { page: 2, text: "  " },
    { page: 3, text: "More copy" },
  ],
});
const units = parseOcrPagesJson(sampleJson);
assert(units.length === 2, "parseOcrPagesJson should skip blank pages");
assert(units[0]?.sourceLabel === "page 1", "first unit label");
assert(units[1]?.text === "More copy", "second unit text");

const pdfPath = path.resolve(
  __dirname,
  "../../../raw/jeff/slides/[AUG-D1] Jeff Offline IP Workshop.pdf",
);
const pdfBytes = new Uint8Array(readFileSync(pdfPath));
assert(bytesLookLikePdf(pdfBytes), "AUG-D1 should sniff as PDF");

const mislabeled = resolveBrandAssetKind(
  "[AUG-D1] Jeff Offline IP Workshop.txt",
  "text/plain",
  pdfBytes,
  "text",
);
assert(mislabeled === "pdf", "PDF bytes misnamed .txt should resolve to pdf");
assert(
  alignFileNameWithKind("[AUG-D1] Jeff Offline IP Workshop.txt", "pdf") ===
    "[AUG-D1] Jeff Offline IP Workshop.pdf",
  "filename should align to .pdf",
);

async function main(): Promise<void> {
  const truncated = await truncatePdfToMaxPages(pdfBytes, BRAND_OCR_MAX_PAGES);
  assert(truncated.truncated === true, "80-page deck should truncate");
  assert(
    truncated.pageCount === BRAND_OCR_MAX_PAGES,
    "truncated page count should match cap",
  );

  const emptyTxt = new TextEncoder().encode("\n\n\n");
  assert(
    resolveBrandAssetKind("notes.txt", "text/plain", emptyTxt, "text") ===
      "text",
    "real empty text should stay text",
  );

  console.log("test-brand-ocr-sniff: ok");
}

void main();
