import type { ModulePack } from "@/lib/modules/types";

/**
 * Story Trust Script: personal/client story into belief.
 * Stories illustrate; do not invent Jeff case studies as doctrine.
 */
export const STORY_TRUST_SCRIPT_PACK: ModulePack = {
  moduleId: "story-trust-script",
  intakeFields: [
    {
      id: "story",
      label: "The story",
      placeholder: "Yours or a client story you may paraphrase",
      required: true,
      multiline: true,
    },
    {
      id: "belief",
      label: "Belief the viewer should take",
      placeholder: "The standpoint or truth the story lands",
      required: true,
    },
    {
      id: "private",
      label: "What stays private",
      placeholder: "Names, details, or medical facts to omit",
      required: false,
      multiline: true,
    },
    {
      id: "format",
      label: "Format",
      placeholder: "Reel, long video, caption story…",
      required: false,
    },
  ],
  probeHints: [
    "story",
    "trust",
    "standpoint",
    "advice vs ego",
    "content asset",
    "personal IP",
    "故事",
    "信任",
    "建议 vs 自我",
    "立场",
    "probe_jeff",
  ],
  boundNodeIds: [
    "pr.exposure-trust-conversion",
    "pr.standpoint-or-invisible",
    "pr.advice-vs-ego",
    "cl.content-not-ads",
  ],
  starterPrompt:
    "Using my intake, write a story trust script: setup, turn, belief land. Illustrative for MY practice; do not invent Jeff case studies.",
  chatOpener:
    "I will shape a story trust script for YOUR practice (not invented Jeff cases). What story are you willing to tell, and what belief should land?",
  systemOverlay: [
    "## Module mode: Story Trust Script",
    "You are running the Story Trust Script tool for this user.",
    "Job: turn their personal or client story into a belief-building script.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Setup.",
    "2. Turn.",
    "3. Belief land (standpoint).",
    "4. Soft close optional.",
    "Respect what stays private from what they told you in chat.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "Stories illustrate. Never invent Jeff patient scripts, clinic anecdotes, or workshop case studies as Jeff teaching.",
    "Label the output as structure for THEIR story. Advice not ego. No overnight-fame.",
    "",
    "### Evidence binding",
    "Prefer: pr.exposure-trust-conversion, pr.standpoint-or-invisible, pr.advice-vs-ego, cl.content-not-ads when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the script",
    "End with one direct question about which detail they will keep private on camera.",
  ].join("\n"),
};
