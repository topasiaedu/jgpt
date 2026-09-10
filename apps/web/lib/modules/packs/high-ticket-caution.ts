import type { ModulePack } from "@/lib/modules/types";

/**
 * High-Ticket Caution: when NOT to film weakness.
 * Conditional workshop angle; KB may be thin: Generally → Jeff → steer.
 */
export const HIGH_TICKET_CAUTION_PACK: ModulePack = {
  moduleId: "high-ticket-caution",
  intakeFields: [
    {
      id: "offer",
      label: "What you sell",
      placeholder: "Offer and trust bar (high-ticket / high-trust?)",
      required: true,
      multiline: true,
    },
    {
      id: "aboutToFilm",
      label: "What you were about to film",
      placeholder: "The vulnerable or messy beat",
      required: true,
      multiline: true,
    },
    {
      id: "risk",
      label: "Risk that worries you",
      placeholder: "Client confidence, brand trust, timing…",
      required: true,
      multiline: true,
    },
    {
      id: "audienceWarmth",
      label: "Audience warmth",
      placeholder: "Cold strangers vs warm followers",
      required: false,
    },
  ],
  probeHints: [
    "trust",
    "vulnerability",
    "high ticket",
    "advice vs ego",
    "exposure trust",
    "caution",
    "高客单",
    "信任时机",
    "先给价值",
    "成交",
    "probe_jeff",
  ],
  boundNodeIds: [
    "pr.exposure-trust-conversion",
    "pr.advice-vs-ego",
    "cl.value-then-convert",
    "cl.buy-people-not-product",
  ],
  starterPrompt:
    "Using my intake, give a caution call: film / don't film / film differently, with reasons grounded in trust timing.",
  chatOpener:
    "I will give a film / don't film / film differently call for high-ticket timing. What were you about to film, and how warm is the audience?",
  systemOverlay: [
    "## Module mode: High-Ticket Caution",
    "You are running the High-Ticket Caution tool for this user.",
    "Job: decide when NOT to film weakness if premature vulnerability would hurt high-trust offers.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Caution call: film / don't film / film differently.",
    "2. Why (trust timing).",
    "3. Safer alternative beat if don't-film.",
    "No fake scarcity theater. No overnight-fame.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### KB honesty (hard)",
    "Conditional high-ticket filming rules may be thin. Generally → Jeff → steer via exposure-trust, advice-vs-ego, value-then-convert.",
    "Do not invent a confirmed Jeff high-ticket vulnerability framework. Never invent Jeff niche case studies.",
    "",
    "### Evidence binding",
    "Prefer: pr.exposure-trust-conversion, pr.advice-vs-ego, cl.value-then-convert, cl.buy-people-not-product when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the call",
    "End with one direct question: which safer beat they will film instead if needed.",
  ].join("\n"),
};
