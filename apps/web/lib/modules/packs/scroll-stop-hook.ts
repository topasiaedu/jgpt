import type { ModulePack } from "@/lib/modules/types";

/**
 * Hook Formula (AUG-D2): opening lines for the first second of attention.
 * Module id kept as scroll-stop-hook.
 * Formula: 对象 ＋ 痛点 ＋ 反差/结果 ＋ 好奇.
 */
export const SCROLL_STOP_HOOK_PACK: ModulePack = {
  moduleId: "scroll-stop-hook",
  intakeFields: [
    {
      id: "audience",
      label: "对象 (who)",
      placeholder: "Who this open speaks to",
      required: true,
    },
    {
      id: "pain",
      label: "痛点 (pain)",
      placeholder: "The pain that should stop the scroll",
      required: true,
      multiline: true,
    },
    {
      id: "contrast",
      label: "反差/结果 (contrast or result)",
      placeholder: "The contrast or result that snaps attention",
      required: true,
      multiline: true,
    },
    {
      id: "curiosity",
      label: "好奇 (curiosity)",
      placeholder: "What makes them need the next second",
      required: true,
    },
    {
      id: "topic",
      label: "Topic (optional context)",
      placeholder: "What this video is about in one line",
      required: false,
    },
    {
      id: "language",
      label: "Language preference",
      placeholder: "English, Chinese, or mixed",
      required: false,
    },
  ],
  /** First four win the probe hint cap: formula legs only. */
  probeHints: [
    "对象",
    "痛点",
    "反差",
    "好奇",
    "Hook Formula",
    "钩子",
    "short video",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.hook-formula",
    "cl.short-vs-long-video",
    "pr.standpoint-or-invisible",
    "rj.overnight-fame",
    "pr.exposure-trust-conversion",
  ],
  starterPrompt:
    "Using my intake, apply Hook Formula (对象＋痛点＋反差/结果＋好奇): several opening lines for the first 1 to 3 seconds, each annotated with all four legs.",
  chatOpener:
    "I will apply Hook Formula: 对象＋痛点＋反差/结果＋好奇, for the first 1 to 3 seconds only. Who is the 对象, and what 痛点 should stop them?",
  chatOpenerZh:
    "我会用 Hook Formula（对象＋痛点＋反差/结果＋好奇）只打磨前 1 到 3 秒。对象是谁，哪一个痛点该让他们停下来？",
  systemOverlay: [
    "## Module mode: Hook Formula",
    "You are running the Hook Formula tool (catalog id scroll-stop-hook) for this user.",
    "Job: opening lines only for the first 1 to 3 seconds of attention. Not the full Reel body unless asked.",
    "",
    "### Named doctrine (AUG-D2, must teach)",
    "Hook Formula: 对象 ＋ 痛点 ＋ 反差/结果 ＋ 好奇.",
    "Every opening line MUST carry all four legs. Annotate each line with: 对象 / 痛点 / 反差或结果 / 好奇.",
    "Reject incomplete lines (missing any leg). Do not invent a different hook recipe.",
    "Bind fw.hook-formula.",
    "",
    "### Jeff pivots (must show)",
    "Hooks serve get-seen so trust can start. Standpoint can ride inside 反差 or 好奇. Reject overnight-fame / viral-as-guarantee.",
    "No hard pitch in second one.",
    "ANTI-GENERIC: ban clickbait that breaks trust. Each line needs a Jeff reason grounded in the four legs.",
    "",
    "### Conversational collect",
    "Need: 对象, 痛点, 反差/结果, 好奇; topic and language optional.",
    "Ask 对象 + 痛点 first if both empty.",
    "",
    "### Output shape",
    "1. 5 to 8 numbered opening lines.",
    "2. Under each line: annotate 对象 / 痛点 / 反差或结果 / 好奇 (all four required).",
    "3. Drop any candidate that cannot fill all four; say why it was rejected.",
    "4. Optional avoid example (viral-bait or ad-like).",
    "",
    "### Hard bans",
    "Prefer fw.hook-formula, cl.short-vs-long-video, pr.standpoint-or-invisible, rj.overnight-fame, pr.exposure-trust-conversion.",
    "Thin hook craft KB: Generally → Jeff → steer; label practice drafts.",
    "Do not replace Hook Formula with GOAT, generic hook/body/close, or unbound scroll-stop tips.",
    "",
    "### After",
    "Which complete four-leg line do they film today?",
  ].join("\n"),
};
