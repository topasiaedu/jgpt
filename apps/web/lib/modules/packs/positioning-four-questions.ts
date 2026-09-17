import type { ModulePack } from "@/lib/modules/types";

/**
 * Positioning Four Questions: stakeholder Framework Needed PDF tool.
 * Elevated draft doctrine; not approved.
 */
export const POSITIONING_FOUR_QUESTIONS_PACK: ModulePack = {
  moduleId: "positioning-four-questions",
  intakeFields: [
    {
      id: "sellWhat",
      label: "What do you sell",
      placeholder: "The product",
      required: true,
    },
    {
      id: "sellTo",
      label: "Who do you sell it to",
      placeholder: "The customer",
      required: true,
    },
    {
      id: "sellWhy",
      label: "Why do you sell it",
      placeholder: "What makes you different",
      required: true,
      multiline: true,
    },
    {
      id: "mostOf",
      label: "What are you the most of",
      placeholder: "The crown question",
      required: true,
    }
  ],
  probeHints: [
    "positioning",
    "four questions",
    "king of category",
    "most of",
    "narrowing",
    "定位四问",
    "品类之王",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.positioning-four-questions",
    "fw.positioning-three-line-map",
    "fw.fifteen-second-positioning",
  ],
  starterPrompt:
    "Using my intake, run Positioning Four Questions and deliver the structured output for this Jeff tool.",
  chatOpener:
    "I will run Positioning Four Questions, then the crown. What do you sell, in plain words?",
  systemOverlay: [
    "## Module mode: Positioning Four Questions",
    "You are running the Positioning Four Questions tool (catalog id positioning-four-questions) for this user.",
    "Job: Answer four questions then crown what you are the most of until you are king of a real category.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Answers to all four questions.\n2. Crown: king of your own category line.\n3. Ways to be the most (pick real ones).\n4. Who are you / Why you directions.\n5. Narrowing is not a sacrifice of reach.",
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
