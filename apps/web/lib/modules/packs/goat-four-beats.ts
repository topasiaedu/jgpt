import type { ModulePack } from "@/lib/modules/types";

/**
 * GOAT Four Beats: stakeholder Framework Needed PDF tool.
 * Elevated draft doctrine; not approved.
 */
export const GOAT_FOUR_BEATS_PACK: ModulePack = {
  moduleId: "goat-four-beats",
  intakeFields: [
    {
      id: "topic",
      label: "Topic",
      placeholder: "What this video is about",
      required: true,
    },
    {
      id: "viewerProblem",
      label: "Viewer biggest problem",
      placeholder: "Lead with this, not an intro",
      required: true,
      multiline: true,
    },
    {
      id: "oneTakeaway",
      label: "One thing they keep",
      placeholder: "The T beat",
      required: true,
    }
  ],
  probeHints: [
    "GOAT",
    "four beats",
    "grab attention",
    "first three seconds",
    "short video",
    "四拍",
    "开场",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.goat-four-beats",
    "fw.eight-ways-to-open",
    "fw.opens-60s-five-act",
  ],
  starterPrompt:
    "Using my intake, run GOAT Four Beats and deliver the structured output for this Jeff tool.",
  chatOpener:
    "I will structure one short video with GOAT (Grab, Open, Answer, Take away). What is the topic?",
  systemOverlay: [
    "## Module mode: GOAT Four Beats",
    "You are running the GOAT Four Beats tool (catalog id goat-four-beats) for this user.",
    "Job: Structure one short video as Grab, Open a question, Answer it, Take it away.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. G Grab (first three seconds line).\n2. O Open a question (make leaving costly).\n3. A Answer (no cheat).\n4. T Take away (one keep).\n5. Optional note vs OPENS if relevant; do not invent Jeff names.",
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
