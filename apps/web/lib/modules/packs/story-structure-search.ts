import type { ModulePack } from "@/lib/modules/types";

/**
 * Story Structure (Problem to Search): stakeholder Framework Needed PDF tool.
 * Elevated draft doctrine; not approved.
 */
export const STORY_STRUCTURE_SEARCH_PACK: ModulePack = {
  moduleId: "story-structure-search",
  intakeFields: [
    {
      id: "problem",
      label: "Problem",
      placeholder: "The real problem at the start",
      required: true,
      multiline: true,
    },
    {
      id: "search",
      label: "Search",
      placeholder: "What you tried or hunted for",
      required: true,
      multiline: true,
    },
    {
      id: "solution",
      label: "Solution",
      placeholder: "What worked",
      required: true,
      multiline: true,
    },
    {
      id: "whatNext",
      label: "What next",
      placeholder: "One next step for the viewer",
      required: true,
    }
  ],
  probeHints: [
    "story structure",
    "problem search story",
    "founder story",
    "what next",
    "故事结构",
    "寻找",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.story-structure-search",
    "fw.story-founder-story",
    "fw.opens-60s-five-act",
  ],
  starterPrompt:
    "Using my intake, run Story Structure (Problem to Search) and deliver the structured output for this Jeff tool.",
  chatOpener:
    "I will build the longer story structure (Problem to Search to Story to Solution to What next). What problem opens the story?",
  systemOverlay: [
    "## Module mode: Story Structure (Problem to Search)",
    "You are running the Story Structure (Problem to Search) tool (catalog id story-structure-search) for this user.",
    "Job: Longer story arc: Problem, Search, Story, Solution, What next. Search creates the story.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Problem.\n2. Search (why it creates the story).\n3. Story beats.\n4. Solution.\n5. What next.\n6. Reminder: without search, a story is just something that happened.",
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
