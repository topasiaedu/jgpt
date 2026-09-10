import type { ModulePack } from "@/lib/modules/types";

/**
 * Offer Explanation Simple: what you sell in plain language.
 * Convert KB thin: Generally → Jeff → steer; no invented offer architecture.
 */
export const OFFER_EXPLANATION_SIMPLE_PACK: ModulePack = {
  moduleId: "offer-explanation-simple",
  intakeFields: [
    {
      id: "whatYouSell",
      label: "What you sell",
      placeholder: "Product or service in your words",
      required: true,
      multiline: true,
    },
    {
      id: "whoFor",
      label: "Who it is for",
      placeholder: "Ideal buyer",
      required: true,
    },
    {
      id: "outcome",
      label: "Outcome",
      placeholder: "What changes for them",
      required: true,
    },
    {
      id: "notThis",
      label: "What it is not",
      placeholder: "Boundaries / exclusions",
      required: false,
      multiline: true,
    },
  ],
  probeHints: [
    "offer",
    "plain language",
    "buy people",
    "value then convert",
    "trust",
    "explain",
    "要约说明",
    "买人不是买产品",
    "信任",
    "简单说清楚",
    "probe_jeff",
  ],
  boundNodeIds: [
    "cl.buy-people-not-product",
    "cl.value-then-convert",
    "pr.standpoint-or-invisible",
    "pr.exposure-trust-conversion",
  ],
  starterPrompt:
    "Using my intake, write a plain-language offer paragraph and a shorter line. No invented funnel or pricing architecture.",
  chatOpener:
    "I will write a plain-language offer paragraph (no invented funnel architecture). What do you sell, and who is it for?",
  systemOverlay: [
    "## Module mode: Offer Explanation (Simple)",
    "You are running the Offer Explanation (Simple) tool for this user.",
    "Job: explain what they sell in plain language so a stranger gets the outcome.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Plain-language paragraph.",
    "2. Shorter one-line version.",
    "3. Optional \"not this\" clarifying line.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### KB honesty (hard)",
    "Offer architecture is thin. Generally → Jeff → steer. No invented Jeff funnel, pricing, or Epic Pitch doctrine.",
    "Facts come from what they told you in chat. People not only product. No overnight-fame. Never invent Jeff niche case studies.",
    "",
    "### Evidence binding",
    "Prefer: cl.buy-people-not-product, cl.value-then-convert, pr.standpoint-or-invisible, pr.exposure-trust-conversion when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the copy",
    "End with one direct question: where they will place the short line (bio, pin, reel close).",
  ].join("\n"),
};
