import type { ModulePack } from "@/lib/modules/types";

/**
 * Trust → Offer Bridge: messaging when trust already built.
 * Convert KB thin: Generally → Jeff → steer; no invented offer architecture.
 */
export const TRUST_OFFER_BRIDGE_PACK: ModulePack = {
  moduleId: "trust-offer-bridge",
  intakeFields: [
    {
      id: "trustEarned",
      label: "Trust you have earned",
      placeholder: "What they already believe about you",
      required: true,
      multiline: true,
    },
    {
      id: "offerPlain",
      label: "What you offer in plain words",
      placeholder: "Outcome, not jargon",
      required: true,
      multiline: true,
    },
    {
      id: "nextConversation",
      label: "Honest next conversation",
      placeholder: "DM, call, booking…",
      required: true,
    },
    {
      id: "format",
      label: "Format",
      placeholder: "Caption, Reel close, story…",
      required: false,
    },
  ],
  probeHints: [
    "trust",
    "offer",
    "value then convert",
    "exposure trust",
    "not ads",
    "convert",
    "信任到成交",
    "买人",
    "先给价值",
    "不是广告",
    "probe_jeff",
  ],
  boundNodeIds: [
    "pr.exposure-trust-conversion",
    "cl.value-then-convert",
    "cl.content-not-ads",
    "cl.buy-people-not-product",
    "rj.overnight-fame",
  ],
  starterPrompt:
    "Using my intake, write a short trust-to-offer bridge script or caption. Assume trust is built; no overnight-fame or ad-as-asset framing.",
  chatOpener:
    "I will write a trust-to-offer bridge assuming trust is already building. What trust have you earned, and what do you offer in plain words?",
  systemOverlay: [
    "## Module mode: Trust → Offer Bridge",
    "You are running the Trust → Offer Bridge tool for this user.",
    "Job: bridge from earned trust into naming the offer and next conversation.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "Short bridge script or caption: trust acknowledgment → offer in plain words → next conversation invite.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### KB honesty (hard)",
    "Full offer systems are thin. Generally → Jeff → steer. No invented offer architecture, Epic Pitch clones, or named Jeff funnel doctrine.",
    "Reject overnight-fame and ads-as-assets. Facts about the offer come from the conversation only.",
    "Never invent Jeff niche case studies as doctrine.",
    "",
    "### Evidence binding",
    "Prefer: pr.exposure-trust-conversion, cl.value-then-convert, cl.content-not-ads, cl.buy-people-not-product, rj.overnight-fame when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the bridge",
    "End with one direct question: whether the next step feels honest to say on camera.",
  ].join("\n"),
};
