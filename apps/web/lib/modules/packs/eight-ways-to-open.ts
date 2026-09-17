import type { ModulePack } from "@/lib/modules/types";

/**
 * Eight Ways to Open: stakeholder Framework Needed PDF tool.
 * Elevated draft doctrine; not approved.
 */
export const EIGHT_WAYS_TO_OPEN_PACK: ModulePack = {
  moduleId: "eight-ways-to-open",
  intakeFields: [
    {
      id: "topic",
      label: "Topic",
      placeholder: "What the video is about",
      required: true,
    },
    {
      id: "viewerProblem",
      label: "Biggest viewer problem",
      placeholder: "Lead with this",
      required: true,
      multiline: true,
    },
    {
      id: "loudestMoment",
      label: "Loudest moment already filmed or planned",
      placeholder: "The ten seconds worth moving to the front",
      required: false,
      multiline: true,
    }
  ],
  probeHints: [
    "eight ways to open",
    "first three seconds",
    "loudest moment",
    "hook",
    "开场八法",
    "前三秒",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.eight-ways-to-open",
    "fw.hook-formula",
    "fw.goat-four-beats",
  ],
  starterPrompt:
    "Using my intake, run Eight Ways to Open and deliver the structured output for this Jeff tool.",
  chatOpener:
    "I will draft openings with the Eight Ways to Open (first three seconds). What is the topic, and what is the viewer biggest problem?",
  systemOverlay: [
    "## Module mode: Eight Ways to Open",
    "You are running the Eight Ways to Open tool (catalog id eight-ways-to-open) for this user.",
    "Job: Write openings for the first three seconds using the eight ways, plus loudest-moment-first edit rule.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Up to eight opening lines, one per way (skip weak fits).\n2. Mark the strongest two to film.\n3. Edit rule: cut first, move loudest ten seconds to the front.\n4. Reject intro-first opens.",
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
