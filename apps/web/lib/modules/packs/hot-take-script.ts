import type { ModulePack } from "@/lib/modules/types";

/**
 * Hot Take Script: sharp standpoint on camera as advice, not ego.
 */
export const HOT_TAKE_SCRIPT_PACK: ModulePack = {
  moduleId: "hot-take-script",
  intakeFields: [
    {
      id: "claim",
      label: "The claim you want to make",
      placeholder: "One sharp sentence you are willing to own",
      required: true,
      multiline: true,
    },
    {
      id: "challenges",
      label: "Who or what it challenges",
      placeholder: "Common advice, habit, or soft consensus in your niche",
      required: true,
    },
    {
      id: "truth",
      label: "Practical truth behind the heat",
      placeholder: "Why this helps the viewer, not why it makes you look bold",
      required: true,
      multiline: true,
    },
    {
      id: "language",
      label: "Language preference",
      placeholder: "English, Chinese, or mixed",
      required: false,
    },
  ],
  probeHints: [
    "standpoint",
    "hot take",
    "advice vs ego",
    "criticism",
    "personal IP",
    "content asset",
    "立场",
    "热观点",
    "建议 vs 自我",
    "批评不是失败",
    "probe_jeff",
  ],
  boundNodeIds: [
    "pr.standpoint-or-invisible",
    "pr.advice-vs-ego",
    "cl.criticism-not-failure",
    "tm.lichang",
  ],
  starterPrompt:
    "Using my intake, write a short hot-take script with stance, reason, and a landing that protects relationship with the viewer. Keep it advice, not ego.",
  chatOpener:
    "I will turn a sharp standpoint into a hot-take script that lands as advice, not flex. What claim are you willing to own in one sentence?",
  systemOverlay: [
    "## Module mode: Hot Take Script",
    "You are running the Hot Take Script tool for this user.",
    "Job: sharp standpoint as on-camera hot take that reads as advice, not ego performance.",
    "",
    "### Jeff pivots (must show)",
    "Standpoint or invisible. Heat without service is ego. Criticism can come with visibility; quitting is the failure mode.",
    "Land the practical truth for the viewer; protect relationship.",
    "ANTI-GENERIC: ban outrage bait with no teachable land. Force advice-vs-ego check.",
    "",
    "### Conversational collect",
    "Need: claim, who/what it challenges, practical truth; language optional.",
    "Ask the claim first.",
    "",
    "### Output shape",
    "1. Stance open.",
    "2. Reason beats (2 to 4).",
    "3. Landing that protects relationship.",
    "4. Advice vs ego note: what to cut if flex sneaks in.",
    "",
    "### Hard bans",
    "Prefer pr.standpoint-or-invisible, pr.advice-vs-ego, cl.criticism-not-failure, tm.lichang.",
    "Thin: Generally → Jeff → steer.",
    "",
    "### After",
    "Soften which line without losing edge?",
  ].join("\n"),
};
