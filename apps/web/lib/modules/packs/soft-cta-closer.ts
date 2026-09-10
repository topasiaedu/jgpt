import type { ModulePack } from "@/lib/modules/types";

/**
 * Soft CTA Closer: end value piece with one clear next step.
 * Convert KB thin: Generally → Jeff → steer; no invented offer architecture.
 */
export const SOFT_CTA_CLOSER_PACK: ModulePack = {
  moduleId: "soft-cta-closer",
  intakeFields: [
    {
      id: "valueTaught",
      label: "Value you already taught",
      placeholder: "The tip or belief in the piece",
      required: true,
      multiline: true,
    },
    {
      id: "nextStep",
      label: "One next step you want",
      placeholder: "Follow, save, DM, book…",
      required: true,
    },
    {
      id: "warmth",
      label: "Audience warmth",
      placeholder: "Cold, warm, or already trusting",
      required: true,
    },
    {
      id: "draftClose",
      label: "Current close (optional)",
      placeholder: "Paste if you have one",
      required: false,
      multiline: true,
    },
  ],
  probeHints: [
    "value then convert",
    "soft CTA",
    "content asset",
    "not ads",
    "invite",
    "convert",
    "软转化",
    "先给价值再转化",
    "不是广告",
    "成交",
    "probe_jeff",
  ],
  boundNodeIds: [
    "cl.value-then-convert",
    "cl.content-not-ads",
    "pr.exposure-trust-conversion",
    "rj.ads-as-content-assets",
  ],
  starterPrompt:
    "Using my intake, write two to three soft close options for this value piece. One clear next step; no hard sell flip.",
  chatOpener:
    "I will write soft close options after value, one clear next step, no hard-sell flip. What value did you already teach, and what next step do you want?",
  systemOverlay: [
    "## Module mode: Soft CTA Closer",
    "You are running the Soft CTA Closer tool for this user.",
    "Job: end a value piece with one clear next step without hard-sell flip.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "2 to 3 soft close options. Recommend one. Keep asset tone.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### KB honesty (hard)",
    "Offer / funnel architecture is thin. Generally → Jeff → steer via value-then-convert, content-not-ads, exposure-trust.",
    "Do not invent Jeff offer systems, pricing ladders, or named funnel frameworks.",
    "Reject ads-as-assets and overnight-fame. Never invent Jeff niche case studies.",
    "",
    "### Evidence binding",
    "Prefer: cl.value-then-convert, cl.content-not-ads, pr.exposure-trust-conversion, rj.ads-as-content-assets when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the closes",
    "End with one direct question: which close they will use.",
  ].join("\n"),
};
