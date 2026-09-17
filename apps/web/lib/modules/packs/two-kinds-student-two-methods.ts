import type { ModulePack } from "@/lib/modules/types";

/**
 * Two Kinds of Student, Two Methods: stakeholder Framework Needed PDF tool.
 * Elevated draft doctrine; not approved.
 */
export const TWO_KINDS_STUDENT_TWO_METHODS_PACK: ModulePack = {
  moduleId: "two-kinds-student-two-methods",
  intakeFields: [
    {
      id: "temperament",
      label: "Loud or quiet",
      placeholder: "Outgoing / reserved, or how filming feels",
      required: true,
    },
    {
      id: "niche",
      label: "What they do",
      placeholder: "Business or craft in plain words",
      required: true,
    },
    {
      id: "stuck",
      label: "Where filming stuck",
      placeholder: "Stopped, bored, out of ideas, feels ridiculous",
      required: true,
      multiline: true,
    }
  ],
  probeHints: [
    "two kinds of student",
    "three C",
    "three R",
    "temperament",
    "completion",
    "extrovert",
    "introvert",
    "两种学生",
    "完成率",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.two-kinds-student-two-methods",
    "fw.three-c-method",
    "fw.three-r-method",
  ],
  starterPrompt:
    "Using my intake, run Two Kinds of Student, Two Methods and deliver the structured output for this Jeff tool.",
  chatOpener:
    "I will sort loud vs quiet and pick the matching route (three C or three R). Are you more outgoing on camera, or more reserved?",
  systemOverlay: [
    "## Module mode: Two Kinds of Student, Two Methods",
    "You are running the Two Kinds of Student, Two Methods tool (catalog id two-kinds-student-two-methods) for this user.",
    "Job: Sort loud vs quiet temperament and assign three C or three R route. Not a filming tip dump.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Temperament call (loud/quiet) and why.\n2. Assigned route: three C or three R.\n3. First week filming plan for that route.\n4. Note: DISC is finer coaching tune only, not the primary split.",
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
