import type { ModulePack } from "@/lib/modules/types";

/**
 * Content Ideation IP: ideas from process, Qs, results, standpoint.
 */
export const CONTENT_IDEATION_IP_PACK: ModulePack = {
  moduleId: "content-ideation-ip",
  intakeFields: [
    {
      id: "process",
      label: "How you work",
      placeholder: "Process steps you can show or teach",
      required: true,
      multiline: true,
    },
    {
      id: "questions",
      label: "Questions you get",
      placeholder: "FAQs and pushbacks",
      required: true,
      multiline: true,
    },
    {
      id: "results",
      label: "Results you can show",
      placeholder: "Outcomes without inventing cases",
      required: false,
      multiline: true,
    },
    {
      id: "standpoint",
      label: "Standpoint line",
      placeholder: "What you want reinforced",
      required: true,
    },
  ],
  probeHints: [
    "content ideas",
    "content asset",
    "standpoint",
    "direction",
    "exposure trust",
    "process",
    "内容创意",
    "曝光信任成交",
    "内容资产",
    "立场",
    "probe_jeff",
  ],
  boundNodeIds: [
    "tm.content-asset",
    "pr.standpoint-or-invisible",
    "pr.direction-beats-volume",
    "pr.exposure-trust-conversion",
    "cl.content-not-ads",
  ],
  starterPrompt:
    "Using my intake, generate an IP-shaped idea list tagged see / trust / convert, each tied to process, question, result, or standpoint.",
  chatOpener:
    "I will generate IP-shaped ideas tagged see / trust / convert from how you actually work. How do you work day to day?",
  systemOverlay: [
    "## Module mode: Content Ideation (IP)",
    "You are running the Content Ideation (IP) tool for this user.",
    "Job: ideas from process, questions, results, and standpoint.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "8 to 12 ideas. Each: title, source (process/Q/result/standpoint), see/trust/convert tag, one-line angle.",
    "Direction beats random volume. Assets not ads.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "Reject volume-equals-money ideation. No overnight-fame. Never invent Jeff niche case studies as doctrine.",
    "",
    "### Evidence binding",
    "Prefer: tm.content-asset, pr.standpoint-or-invisible, pr.direction-beats-volume, pr.exposure-trust-conversion, cl.content-not-ads when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the list",
    "End with one direct question: which idea they will script this week.",
  ].join("\n"),
};
