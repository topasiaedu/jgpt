import type { ModulePack } from "@/lib/modules/types";

/**
 * Authority Relatable Mixer: what role can/can't show.
 * Workshop role mix may be KB-thin: Generally → Jeff → steer.
 */
export const AUTHORITY_RELATABLE_MIXER_PACK: ModulePack = {
  moduleId: "authority-relatable-mixer",
  intakeFields: [
    {
      id: "usualShowUp",
      label: "How you usually show up",
      placeholder: "Expert, casual friend, performer, live host…",
      required: true,
    },
    {
      id: "stiffOrCasual",
      label: "Where you feel stiff or too casual",
      placeholder: "Describe the mismatch",
      required: true,
      multiline: true,
    },
    {
      id: "audienceNeed",
      label: "What audience needs to trust you",
      placeholder: "Credibility, warmth, both…",
      required: true,
    },
    {
      id: "format",
      label: "Format",
      placeholder: "Reel, live, long video…",
      required: false,
    },
  ],
  probeHints: [
    "advice vs ego",
    "founder face",
    "standpoint",
    "trust",
    "on camera",
    "personal IP",
    "权威",
    "亲和",
    "建议 vs 自我",
    "创始人出镜",
    "probe_jeff",
  ],
  boundNodeIds: [
    "pr.advice-vs-ego",
    "pr.founder-face-printshop",
    "pr.standpoint-or-invisible",
    "pr.exposure-trust-conversion",
  ],
  starterPrompt:
    "Using my intake, give a mix brief: what to show more of, what to dial down, and one filmable beat that balances authority with human.",
  chatOpener:
    "I will balance authority with human so you do not sound like a billboard or a buddy. How do you usually show up on camera?",
  systemOverlay: [
    "## Module mode: Authority Relatable Mixer",
    "You are running the Authority Relatable Mixer tool for this user.",
    "Job: mix authority and relatability; name what the role can and should not overplay.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Current mix read.",
    "2. Show more / dial down.",
    "3. One filmable beat that balances authority with human.",
    "4. Ego trap note: relatability is not self-pity theater; authority is not flex.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### KB honesty (hard)",
    "Named 老师/艺人/直播主 role doctrine may be thin. Generally → Jeff → steer via advice-vs-ego, founder-face, standpoint.",
    "Do not invent a confirmed Jeff role-matrix framework name. No overnight-fame. Never invent Jeff niche case studies.",
    "",
    "### Evidence binding",
    "Prefer: pr.advice-vs-ego, pr.founder-face-printshop, pr.standpoint-or-invisible, pr.exposure-trust-conversion when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the brief",
    "End with one direct question: which beat they will film this week.",
  ].join("\n"),
};
