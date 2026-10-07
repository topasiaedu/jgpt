/**
 * Agent E smokes: USER_BRAND_FACTS budget, probe_brand excerpt cap, Collect skip.
 * Run from apps/web: npm run test:brand-chat
 */

import { EMPTY_BRAND_PROFILE_STRUCTURED } from "../lib/brandProfile/types";
import { USER_BRAND_FACTS_MAX_CHARS } from "../lib/brandProfile/types";
import {
  brandFactForSlotId,
  slotFilledByBrandProfile,
} from "../lib/brandProfile/knownSlots";
import {
  brandSourceId,
  formatBrandProbePack,
  selectBrandExcerpts,
  type RankedChunk,
} from "../lib/brandProfile/probeBrand";
import { BRAND_PROBE_MAX_EXCERPTS, BRAND_PROBE_PACK_MAX_CHARS } from "../lib/brandProfile/types";
import { buildUserBrandFactsBlock } from "../lib/brandProfile/userBrandFacts";
import { detectLifecycleMode } from "../lib/modules/qualityRuntime/lifecycle";
import { IG_REEL_SCRIPT_PACK } from "../lib/modules/packs/ig-reel-script";
import { buildSystemPrompt } from "../lib/systemPrompt";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const filled = {
  ...EMPTY_BRAND_PROFILE_STRUCTURED,
  businessName: "Acme Clinic",
  whatTheySell: "Type 1 diabetes education for newly diagnosed adults",
  whoTheyServe: "Adults newly diagnosed with Type 1 diabetes",
  founderRoleFace: "Founder educator on camera",
  stance: "Daily systems beat fear content",
  proofCredentials: "12 years teaching in clinic workshops",
  offerCta: "Book a 20 minute intro call",
};

const facts = buildUserBrandFactsBlock({
  profileName: "Client A",
  activeBrief: "Acme Clinic helps newly diagnosed adults with Type 1 education.",
  structured: filled,
});

assert(facts.includes("USER_BRAND_FACTS"), "Facts block must be labeled USER_BRAND_FACTS.");
assert(facts.includes("NOT Jeff doctrine"), "Facts block must say this is not Jeff doctrine.");
assert(facts.includes("Client A"), "Facts block must include the profile name.");
assert(facts.includes("Type 1 diabetes"), "Facts block must include the niche.");
assert(!facts.includes("wiki_excerpt"), "Facts must not look like Jeff wiki excerpts.");
assert(facts.length <= USER_BRAND_FACTS_MAX_CHARS, "Facts block must stay under the hard char budget.");

const hugeBrief: string = "x".repeat(20_000);
const clippedFacts = buildUserBrandFactsBlock({
  profileName: "Huge",
  activeBrief: hugeBrief,
  structured: filled,
});
assert(
  clippedFacts.length <= USER_BRAND_FACTS_MAX_CHARS,
  "A giant brief must not dump into USER_BRAND_FACTS.",
);
assert(
  !clippedFacts.includes(hugeBrief),
  "Full 20k extract must not appear in the prompt block.",
);
assert(clippedFacts.includes("truncated for prompt budget"), "Over-budget brief must record truncation.");

assert(slotFilledByBrandProfile("audience", filled), "audience should be known from whoTheyServe.");
assert(slotFilledByBrandProfile("niche", filled), "niche should be known from whatTheySell.");
assert(slotFilledByBrandProfile("standpoint", filled), "standpoint should be known from stance.");
assert(slotFilledByBrandProfile("whoAmI", filled), "whoAmI should be known from founder face.");
assert(!slotFilledByBrandProfile("lesson", filled), "lesson is tool-specific and must stay open.");
assert(brandFactForSlotId("audience", filled) !== null, "audience fact must be readable.");

const detection = detectLifecycleMode({
  pack: IG_REEL_SCRIPT_PACK,
  messages: [{ role: "user", content: "Write me an IG Reel." }],
  brandStructured: filled,
});
assert(
  !detection.missingCriticalSlotIds.includes("audience"),
  "Collect must not treat audience as missing when the profile has whoTheyServe.",
);
assert(
  !detection.missingCriticalSlotIds.includes("niche"),
  "Collect must not re-ask niche when whatTheySell is filled.",
);
assert(
  detection.missingCriticalSlotIds.includes("lesson"),
  "Collect should still ask for the Reel lesson gap.",
);

const ranked: RankedChunk[] = [];
for (let index = 0; index < 8; index += 1) {
  ranked.push({
    chunkId: `00000000-0000-4000-8000-00000000000${String(index)}`,
    sourceLabel: `slide ${String(index + 1)}`,
    chunkText: `Warranty clause unique to the deck ${String(index)} ${"body ".repeat(200)}`,
    score: 1 - index * 0.05,
  });
}
const excerpts = selectBrandExcerpts(ranked);
assert(excerpts.length <= BRAND_PROBE_MAX_EXCERPTS, "probe_brand must cap at 4 excerpts.");
assert(excerpts.length >= 2, "probe_brand should return at least 2 excerpts when many chunks exist.");
const packText = formatBrandProbePack("warranty", excerpts);
assert(packText.includes("NOT Jeff doctrine") || packText.includes("user-supplied"), "Brand pack label required.");
assert(packText.length <= BRAND_PROBE_PACK_MAX_CHARS + 500, "Brand pack must stay near the hard budget.");
assert(brandSourceId(excerpts[0]?.chunkId ?? "x").startsWith("brand:"), "Brand source ids must use brand: prefix.");
assert(
  excerpts.every((item) => !item.chunkId.startsWith("fw.")),
  "Brand excerpts must not use Jeff graph ids.",
);

const prompt = buildSystemPrompt({
  evidencePackText: "### fw.hook (Framework)\nwiki_excerpt:\nHook Formula steps.",
  coverage: "in",
  locale: "en",
  userBrandFacts: facts,
});
assert(prompt.includes("probe_brand"), "System prompt must document probe_brand.");
assert(prompt.includes("USER_BRAND_FACTS"), "System prompt must include USER_BRAND_FACTS.");
assert(prompt.includes("probe_jeff"), "Jeff tool must remain.");
assert(
  prompt.includes("Do NOT mix Brand excerpts into Jeff citation ids") ||
    prompt.includes("not Jeff workshop IP"),
  "Prompt must keep Brand facts off the Jeff wall.",
);

console.log("brand-chat grounding ok");
console.log(
  JSON.stringify(
    {
      factsChars: facts.length,
      clippedFactsChars: clippedFacts.length,
      missingCritical: detection.missingCriticalSlotIds,
      excerptCount: excerpts.length,
      brandIdSample: brandSourceId(excerpts[0]?.chunkId ?? ""),
    },
    null,
    2,
  ),
);
