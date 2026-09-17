import type { ModulePack } from "@/lib/modules/types";

/**
 * Three R Method: stakeholder Framework Needed PDF tool.
 * Elevated draft doctrine; not approved.
 */
export const THREE_R_METHOD_PACK: ModulePack = {
  moduleId: "three-r-method",
  intakeFields: [
    {
      id: "industry",
      label: "Industry or craft",
      placeholder: "Where you work",
      required: true,
    },
    {
      id: "readSource",
      label: "What you can read this week",
      placeholder: "News, book chapter, or industry article",
      required: true,
      multiline: true,
    },
    {
      id: "livedView",
      label: "Your lived view",
      placeholder: "What you have seen that the source misses",
      required: true,
      multiline: true,
    }
  ],
  probeHints: [
    "three R",
    "read the news",
    "read a book",
    "read an article",
    "introvert",
    "authority",
    "阅读",
    "加观点",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.three-r-method",
    "fw.two-kinds-student-two-methods",
    "cl.borrowed-content-no-authority",
  ],
  starterPrompt:
    "Using my intake, run Three R Method and deliver the structured output for this Jeff tool.",
  chatOpener:
    "I will run the Three R routine for a reserved owner. What industry or craft should the reads come from?",
  systemOverlay: [
    "## Module mode: Three R Method",
    "You are running the Three R Method tool (catalog id three-r-method) for this user.",
    "Job: Build a read-then-respond routine for reserved owners. Starting device; push lived experience by month three.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. This week: news / book / article prompts.\n2. How to add your own view + lived experience.\n3. One sample video outline.\n4. Hard limit: borrowed-only never builds authority; plan the month-three shift.",
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
