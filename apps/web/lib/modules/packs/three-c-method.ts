import type { ModulePack } from "@/lib/modules/types";

/**
 * Three C Method: stakeholder Framework Needed PDF tool.
 * Elevated draft doctrine; not approved.
 */
export const THREE_C_METHOD_PACK: ModulePack = {
  moduleId: "three-c-method",
  intakeFields: [
    {
      id: "audience",
      label: "Who watches",
      placeholder: "Market you speak to",
      required: true,
    },
    {
      id: "controversial",
      label: "Controversial view",
      placeholder: "View most people argue with",
      required: true,
      multiline: true,
    },
    {
      id: "commonInterest",
      label: "Common interest",
      placeholder: "What the market is discussing",
      required: true,
    },
    {
      id: "conflict",
      label: "Conflict worth having",
      placeholder: "Disagreement to open in public",
      required: true,
    }
  ],
  probeHints: [
    "three C",
    "controversial",
    "common interest",
    "conflict",
    "take a side",
    "extrovert",
    "争议",
    "冲突",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.three-c-method",
    "fw.two-kinds-student-two-methods",
    "pr.standpoint-or-invisible",
  ],
  starterPrompt:
    "Using my intake, run Three C Method and deliver the structured output for this Jeff tool.",
  chatOpener:
    "I will run the Three C method for an outgoing owner. What market are you speaking to?",
  systemOverlay: [
    "## Module mode: Three C Method",
    "You are running the Three C Method tool (catalog id three-c-method) for this user.",
    "Job: Build reactive content for extroverts: Controversial, Common interest, Conflict, then take a side.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. One Controversial angle.\n2. One Common interest angle.\n3. One Conflict angle.\n4. For each: take-a-side line in plain words.\n5. Warn if heat lacks substance.",
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
