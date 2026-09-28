import {
  HOOK_STUDIO_MARKER_COMPETITOR,
  HOOK_STUDIO_MARKER_REPEAT,
} from "@/lib/hookStudio/composeUserMessage";

/**
 * Thin Hook Studio mode doctrine overlays for H3.
 * Appended only on Studio batch turns (competitor / repeat).
 * Not catalog packs. Not Maria IP. Jeff: extract pattern → rewrite into user proof.
 */

/**
 * Competitor angle: name the scroll-stop pattern, rewrite into THIS user's niche + proof.
 */
export function buildCompetitorModeOverlay(): string {
  return [
    "## Hook Studio mode: Competitor angle",
    `This turn is marked ${HOOK_STUDIO_MARKER_COMPETITOR}.`,
    "Job: study the pasted competitor opens as PATTERN samples only. Do not clone their wording wholesale.",
    "",
    "### Doctrine (hard)",
    "1. Name what made each sample stop the scroll (audience cue, pain, contrast, curiosity mechanism).",
    "2. Rewrite into THIS user's niche, proof / credentials / story, and standpoint from the profile.",
    "3. Outputs must be Hook Formula opens: 对象 ＋ 痛点 ＋ 反差/结果 ＋ 好奇. Annotate all four formula_legs.",
    "4. Ban copying competitor phrasing line-for-line. Ban \"go viral like them.\" Ban overnight fame and viral guarantees.",
    "5. Ban Maria principle labels. Ban trust-breaking clickbait.",
    "6. why_it_works must say which pattern you extracted and how it now sits in the user's proof.",
  ].join("\n");
}

/**
 * Repeat a hit: keep the winning mechanism; vary angle and specificity.
 */
export function buildRepeatModeOverlay(): string {
  return [
    "## Hook Studio mode: Repeat a hit",
    `This turn is marked ${HOOK_STUDIO_MARKER_REPEAT}.`,
    "Job: the pasted lines are the user's OWN strong opens. Keep the winning mechanism; vary angle and specificity.",
    "",
    "### Doctrine (hard)",
    "1. Identify the mechanism that earned attention (which Hook Formula legs landed).",
    "2. Produce new opens that keep that mechanism but change angle, specificity, or proof detail. Do not paste near-duplicates.",
    "3. Annotate all four formula_legs on every output.",
    "4. Ban trust-breaking clickbait. Ban overnight fame and viral guarantees. Ban Maria principle labels.",
    "5. why_it_works must name the kept mechanism and what you varied.",
  ].join("\n");
}
