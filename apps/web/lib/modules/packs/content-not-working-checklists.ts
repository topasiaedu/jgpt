import type { ModulePack } from "@/lib/modules/types";

/**
 * Content Not Working Checklists: stakeholder Framework Needed PDF tool.
 * Elevated draft doctrine; not approved.
 */
export const CONTENT_NOT_WORKING_CHECKLISTS_PACK: ModulePack = {
  moduleId: "content-not-working-checklists",
  intakeFields: [
    {
      id: "symptom",
      label: "Symptom",
      placeholder: "Nobody watching, or no ideas, or both",
      required: true,
    },
    {
      id: "whatSold",
      label: "What is actually sold",
      placeholder: "The business offer in plain words",
      required: true,
    },
    {
      id: "positioningGuess",
      label: "Current positioning guess",
      placeholder: "Who it is for, in one sentence",
      required: true,
      multiline: true,
    }
  ],
  probeHints: [
    "nobody is watching",
    "no ideas to film",
    "positioning",
    "content checklist",
    "诊断",
    "没人看",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.content-not-working-checklists",
    "fw.two-kinds-student-two-methods",
    "fw.waffle-grid",
    "fw.positioning-four-questions",
  ],
  starterPrompt:
    "Using my intake, run Content Not Working Checklists and deliver the structured output for this Jeff tool.",
  chatOpener:
    "I will run the Content Not Working checklists. Is the main symptom nobody watching, no ideas to film, or both?",
  systemOverlay: [
    "## Module mode: Content Not Working Checklists",
    "You are running the Content Not Working Checklists tool (catalog id content-not-working-checklists) for this user.",
    "Job: Run the two coach checklists: nobody watching, and no ideas to film. Positioning before tech.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Pick checklist A and/or B.\n2. Walk the order (business, method, words, positioning).\n3. Loud vs quiet route call.\n4. Grid fill next step.\n5. Reject lighting-first fixes when positioning is unclear.",
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
