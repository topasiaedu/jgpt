import type { ModulePack } from "@/lib/modules/types";

/**
 * Soundbite One-Liner: short punches in THEIR niche voice.
 */
export const SOUNDBITE_ONE_LINER_PACK: ModulePack = {
  moduleId: "soundbite-one-liner",
  intakeFields: [
    {
      id: "niche",
      label: "Niche",
      placeholder: "Your space",
      required: true,
    },
    {
      id: "belief",
      label: "Belief to remember",
      placeholder: "Standpoint punch",
      required: true,
    },
    {
      id: "wordsYouSay",
      label: "Words you actually say",
      placeholder: "Phrases that sound like you",
      required: true,
      multiline: true,
    },
    {
      id: "wordsFake",
      label: "Words that feel fake",
      placeholder: "Jargon or hype you refuse",
      required: false,
      multiline: true,
    },
  ],
  probeHints: [
    "standpoint",
    "soundbite",
    "one liner",
    "advice vs ego",
    "lichang",
    "personal IP",
    "金句",
    "立场",
    "建议 vs 自我",
    "内容资产",
    "probe_jeff",
  ],
  boundNodeIds: [
    "pr.standpoint-or-invisible",
    "tm.lichang",
    "pr.advice-vs-ego",
    "cl.content-not-ads",
  ],
  starterPrompt:
    "Using my intake, craft several one-liners in MY niche voice, plus a note on which fit advice tone versus ego flex.",
  chatOpener:
    "I will craft one-liners in your niche voice that stick as advice, not ego. What belief should people remember about how you work?",
  systemOverlay: [
    "## Module mode: Soundbite One-Liner",
    "You are running the Soundbite One-Liner tool for this user.",
    "Job: short punches in their niche voice that carry standpoint.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "6 to 10 one-liners. Mark each: advice-fit or ego-risk.",
    "Use their words; avoid fake list. Optional caption/on-screen variants.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "Standpoint over slogan spam. No overnight-fame punches. Never invent Jeff niche case studies as doctrine.",
    "",
    "### Evidence binding",
    "Prefer: pr.standpoint-or-invisible, tm.lichang, pr.advice-vs-ego, cl.content-not-ads when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the lines",
    "End with one direct question: which line they will put on screen first.",
  ].join("\n"),
};
