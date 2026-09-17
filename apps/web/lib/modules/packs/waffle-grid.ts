import type { ModulePack } from "@/lib/modules/types";

/**
 * The Waffle: stakeholder Framework Needed PDF tool.
 * Elevated draft doctrine; not approved.
 */
export const WAFFLE_GRID_PACK: ModulePack = {
  moduleId: "waffle-grid",
  intakeFields: [
    {
      id: "whoYouAre",
      label: "Who you are and who you serve",
      placeholder: "Centre square",
      required: true,
      multiline: true,
    },
    {
      id: "themes",
      label: "Themes you already own",
      placeholder: "Up to eight theme seeds",
      required: true,
      multiline: true,
    },
    {
      id: "formats",
      label: "Formats you will use",
      placeholder: "story, vlog, challenge, talking to camera, advert (or your set)",
      required: false,
    }
  ],
  probeHints: [
    "waffle",
    "3x3",
    "九宫格",
    "topic bingo",
    "themes",
    "formats",
    "100 videos",
    "华夫饼",
    "选题",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.waffle-grid",
    "fw.jiugongge-topic-bingo",
    "fw.crossing-lines",
  ],
  starterPrompt:
    "Using my intake, run The Waffle and deliver the structured output for this Jeff tool.",
  chatOpener:
    "I will fill The Waffle (3x3 idea grid). Centre first: who you are and who you serve, in plain words.",
  systemOverlay: [
    "## Module mode: The Waffle",
    "You are running the The Waffle tool (catalog id waffle-grid) for this user.",
    "Job: Fill the 3x3 waffle: centre who you are and who you serve; eight owned themes; multiply by formats toward ~100 videos.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Centre cell.\n2. Eight theme cells tied to centre.\n3. Multiplication: formats x themes toward ~100 videos.\n4. Note overlap with 九宫格 / Topic Bingo; do not invent a third grid name.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "Bind to the named Jeff framework in boundNodeIds. Labels like Suggested/draft are not confirmed IP. Never invent Jeff niche case studies.",
    "",
    "",
    "### Evidence binding",
    "Prefer boundNodeIds when in the evidence pack. Sources still come only from probe / probe_jeff.",
    "",
    "### After",
    "End with one direct next question.",
  ].join("\n"),
};
