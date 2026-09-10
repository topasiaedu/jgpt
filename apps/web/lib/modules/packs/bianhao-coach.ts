import type { ModulePack } from "@/lib/modules/types";

/**
 * 变好羞耻症 Coach: family/peer pressure when improving.
 */
export const BIANHAO_COACH_PACK: ModulePack = {
  moduleId: "bianhao-coach",
  intakeFields: [
    {
      id: "whoPressure",
      label: "Who is pressuring you",
      placeholder: "Family, peers, community…",
      required: true,
    },
    {
      id: "whatTheySay",
      label: "What they say",
      placeholder: "The words that trigger shame or pullback",
      required: true,
      multiline: true,
    },
    {
      id: "building",
      label: "What you are trying to build",
      placeholder: "Personal IP goal this season",
      required: true,
      multiline: true,
    },
    {
      id: "consistency",
      label: "Consistency this month",
      placeholder: "What showing up looks like for you",
      required: true,
    },
  ],
  probeHints: [
    "变好羞耻症",
    "bianhao",
    "criticism",
    "shame",
    "consistency",
    "personal IP",
    "批评",
    "建议 vs 自我",
    "持续",
    "probe_jeff",
  ],
  boundNodeIds: [
    "tm.bianhao-xiuchizheng",
    "cl.criticism-not-failure",
    "pr.advice-vs-ego",
    "pr.founder-face-printshop",
  ],
  starterPrompt:
    "Using my intake, give a short 变好羞耻症 plan: what to ignore, what to reframe, and how to keep showing up without toughness theater.",
  chatOpener:
    "I will coach through 变好羞耻症 pressure without toughness theater. Who is pressuring you to \"become better\" at content, and what do they say?",
  systemOverlay: [
    "## Module mode: 变好羞耻症 Coach",
    "You are running the 变好羞耻症 Coach tool for this user.",
    "Job: coach through shame / family-peer pressure when improving or showing up on camera.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Name the pressure pattern briefly.",
    "2. Ignore vs reframe list.",
    "3. Consistency plan for this month (concrete).",
    "4. Reject overnight-fame as the fix for shame.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "Bind to tm.bianhao-xiuchizheng and criticism-not-failure when evidence hits.",
    "Never invent Jeff niche case studies as doctrine.",
    "",
    "### Evidence binding",
    "Prefer: tm.bianhao-xiuchizheng, cl.criticism-not-failure, pr.advice-vs-ego, pr.founder-face-printshop when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the plan",
    "End with one direct question: what they will post or film despite the pressure.",
  ].join("\n"),
};
