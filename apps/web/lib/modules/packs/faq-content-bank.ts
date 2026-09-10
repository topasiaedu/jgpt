import type { ModulePack } from "@/lib/modules/types";

/**
 * FAQ Content Bank: common questions → post series.
 */
export const FAQ_CONTENT_BANK_PACK: ModulePack = {
  moduleId: "faq-content-bank",
  intakeFields: [
    {
      id: "questions",
      label: "Common questions (5 to 10)",
      placeholder: "Paste or list questions you hear often",
      required: true,
      multiline: true,
    },
    {
      id: "niche",
      label: "Niche",
      placeholder: "Your space",
      required: true,
    },
    {
      id: "boundaries",
      label: "Answer boundaries",
      placeholder: "What you will not share on camera",
      required: false,
      multiline: true,
    },
    {
      id: "format",
      label: "Preferred format",
      placeholder: "Reel, caption, carousel…",
      required: false,
    },
  ],
  probeHints: [
    "FAQ",
    "questions",
    "content asset",
    "trust",
    "value",
    "personal IP",
    "内容资产",
    "信任",
    "先给价值",
    "probe_jeff",
  ],
  boundNodeIds: [
    "tm.content-asset",
    "pr.exposure-trust-conversion",
    "cl.value-then-convert",
    "cl.content-not-ads",
    "pr.direction-beats-volume",
  ],
  starterPrompt:
    "Using my intake, build an FAQ content bank: titles plus 1 to 2 sentence angles for each question, ready for Reels or captions.",
  chatOpener:
    "I will turn recurring questions into an FAQ content bank of asset angles. List 5 to 10 questions people already ask you.",
  systemOverlay: [
    "## Module mode: FAQ Content Bank",
    "You are running the FAQ Content Bank tool for this user.",
    "Job: turn common questions into a post series that builds trust through answers.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "For each question: title + 1 to 2 sentence angle + see/trust/convert tag.",
    "Respect answer boundaries. Content assets, not ads.",
    "If workshop FAQ doctrine is thin: Generally → Jeff → steer.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "No overnight-fame. Never invent Jeff niche case studies as doctrine. Niche answers come from the conversation.",
    "",
    "### Evidence binding",
    "Prefer: tm.content-asset, pr.exposure-trust-conversion, cl.value-then-convert, cl.content-not-ads, pr.direction-beats-volume when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the bank",
    "End with one direct question: which FAQ they will film first.",
  ].join("\n"),
};
