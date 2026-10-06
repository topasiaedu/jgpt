/**
 * Shared spoken-duration calibration for Script/Spoken family packs.
 * Prevents overstated timestamps on thin stubs (EN word underfill, ZH char underfill).
 */

/**
 * Hard timing band injected into lifecycle + family density notes.
 * Avoid dash punctuation in these strings (student-facing and model prompts).
 */
export const SCRIPT_SPOKEN_TIMING_CALIBRATION: string = [
  "### Spoken duration calibration (hard; Script/Spoken)",
  "When you claim a runtime (beat timestamps, \"about 60 seconds\", \"2 minutes\", \"3 minutes\"), the SPOKEN lines must fill that time at on-camera pace.",
  "English: target about 130 to 160 words per minute of claimed runtime. Example: ~2 minutes needs about 260 to 320 spoken words, not a 60 to 90 word stub.",
  "Chinese: target about 220 to 280 characters per minute of claimed runtime (count Han characters in spoken lines only; ignore headings and labels). Example: ~3 minutes needs about 660 to 840 characters, not ~400.",
  "If the spoken body is thinner than the band, either write more speakable lines or shorten the claimed timestamps. Never label a thin stub as a multi-minute cut.",
  "Silent reading is faster than speaking: if someone can finish reading the spoken lines in under half the claimed time, rewrite denser or cut the claim.",
].join("\n");

/**
 * Compact density note for the family deliverable contract.
 */
export const SCRIPT_SPOKEN_DENSITY_NOTE: string =
  "Dense speakable beats (~60s+ default unless the pack sets a longer band). Match claimed runtime: EN ~130 to 160 WPM; ZH ~220 to 280 CPM (spoken lines only). Confirm before first full script.";
