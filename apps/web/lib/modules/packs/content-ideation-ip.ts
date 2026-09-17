import type { ModulePack } from "@/lib/modules/types";

/**
 * 九宫格 / Topic Bingo ideation.
 * Module id kept as content-ideation-ip for stable routes.
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
    "九宫格",
    "topic bingo",
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
    "fw.jiugongge-topic-bingo",
    "fw.waffle-grid",
    "tm.content-asset",
    "pr.standpoint-or-invisible",
    "pr.direction-beats-volume",
    "pr.exposure-trust-conversion",
    "cl.content-not-ads",
  ],
  starterPrompt:
    "Using my intake, fill a 九宫格 / Topic Bingo: nine filmable topic cells tagged see / trust / convert, each tied to process, question, result, or standpoint.",
  chatOpener:
    "I will fill a 九宫格 / Topic Bingo from how you actually work. How do you work day to day?",
  systemOverlay: [
    "## Module mode: 九宫格 Topic Bingo",
    "You are running the 九宫格 / Topic Bingo tool (catalog id content-ideation-ip) for this user.",
    "Job: nine filmable topic cells from process, questions, results, and standpoint. Not random volume ideation.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "A 3x3 九宫格 (nine cells). Each cell: short title, source (process/Q/result/standpoint), see/trust/convert tag, one-line angle.",
    "Direction beats random volume. Assets not ads.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "Bind to fw.jiugongge-topic-bingo. Reject volume-equals-money ideation. No overnight-fame. Never invent Jeff niche case studies as doctrine.",
    "",
    "### Evidence binding",
    "Prefer: fw.jiugongge-topic-bingo, tm.content-asset, pr.standpoint-or-invisible, pr.direction-beats-volume, pr.exposure-trust-conversion, cl.content-not-ads when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the grid",
    "End with one direct question: which cell they will script this week.",
  ].join("\n"),
};
