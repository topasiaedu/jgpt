import type { ModulePack } from "@/lib/modules/types";

/**
 * Memory Hook / 记忆钩子 (金句一句话 job).
 * Module id kept as soundbite-one-liner for stable routes.
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
    "memory hook",
    "记忆钩子",
    "金句",
    "standpoint",
    "soundbite",
    "one liner",
    "advice vs ego",
    "lichang",
    "personal IP",
    "立场",
    "建议 vs 自我",
    "内容资产",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.memory-hook",
    "pr.standpoint-or-invisible",
    "tm.lichang",
    "pr.advice-vs-ego",
    "cl.content-not-ads",
  ],
  starterPrompt:
    "Using my intake, craft Memory Hook candidates: one retellable line plus optional scene and result, in MY niche voice, with advice vs ego notes.",
  chatOpener:
    "I will craft a Memory Hook / 记忆钩子: one line people can retell (then scene and result). What belief should people remember about how you work?",
  systemOverlay: [
    "## Module mode: Memory Hook / 记忆钩子",
    "You are running the Memory Hook tool (catalog id soundbite-one-liner) for this user.",
    "Job: Jeff Memory Hook structure: 一句话, then 一个场景, then 一个结果 when ready. Niche voice, not slogan spam.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "6 to 10 memory-hook lines (一句话). For the top 2 to 3, also sketch 一个场景 and 一个结果.",
    "Mark each line: advice-fit or ego-risk.",
    "Use their words; avoid fake list. Optional caption/on-screen variants.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "Bind to fw.memory-hook. Standpoint over slogan spam. No overnight-fame. Never invent Jeff niche case studies as doctrine.",
    "",
    "### Evidence binding",
    "Prefer: fw.memory-hook, pr.standpoint-or-invisible, tm.lichang, pr.advice-vs-ego, cl.content-not-ads when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the lines",
    "End with one direct question: which line they will put on screen first.",
  ].join("\n"),
};
