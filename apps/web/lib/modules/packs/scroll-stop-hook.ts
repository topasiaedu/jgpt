import type { ModulePack } from "@/lib/modules/types";

/**
 * Scroll-Stop Hook: opening lines only for the first second of attention.
 */
export const SCROLL_STOP_HOOK_PACK: ModulePack = {
  moduleId: "scroll-stop-hook",
  intakeFields: [
    {
      id: "topic",
      label: "Topic",
      placeholder: "What this video is about in one line",
      required: true,
    },
    {
      id: "pain",
      label: "Audience pain or curiosity",
      placeholder: "What makes them stop mid-scroll",
      required: true,
      multiline: true,
    },
    {
      id: "standpoint",
      label: "Standpoint the hook should imply",
      placeholder: "The sharp angle behind the open, not a hard sell",
      required: true,
    },
    {
      id: "language",
      label: "Language preference",
      placeholder: "English, Chinese, or mixed",
      required: false,
    },
  ],
  probeHints: [
    "short video",
    "hook",
    "get seen",
    "standpoint",
    "scroll stop",
    "content asset",
    "短视频",
    "钩子",
    "先被看到",
    "立场",
    "一夜成名拒绝",
    "probe_jeff",
  ],
  boundNodeIds: [
    "cl.short-vs-long-video",
    "pr.standpoint-or-invisible",
    "rj.overnight-fame",
    "pr.exposure-trust-conversion",
  ],
  starterPrompt:
    "Using my intake, give me several scroll-stop opening lines for the first 1 to 3 seconds, with a short note on what makes each stop-worthy without clickbait that breaks trust.",
  chatOpener:
    "I will give you scroll-stop opening lines for the first 1 to 3 seconds only. What is the topic, and what pain or curiosity should make them stop?",
  systemOverlay: [
    "## Module mode: Scroll-Stop Hook",
    "You are running the Scroll-Stop Hook tool for this user.",
    "Job: opening lines only for the first second of attention. Not the full Reel body unless asked.",
    "",
    "### Jeff pivots (must show)",
    "Hooks serve get-seen so trust can start. Standpoint implied in the open. Reject overnight-fame / viral-as-guarantee.",
    "No hard pitch in second one.",
    "ANTI-GENERIC: ban clickbait that breaks trust. Each line needs a Jeff reason (curiosity, contrast, standpoint).",
    "",
    "### Conversational collect",
    "Need: topic, pain/curiosity, standpoint; language optional.",
    "Ask topic + pain first if both empty.",
    "",
    "### Output shape",
    "1. 5 to 8 numbered opening lines.",
    "2. One note each on why it stops without clickbait.",
    "3. Optional avoid example (viral-bait or ad-like).",
    "",
    "### Hard bans",
    "Prefer cl.short-vs-long-video, pr.standpoint-or-invisible, rj.overnight-fame, pr.exposure-trust-conversion.",
    "Thin hook craft KB: Generally → Jeff → steer; label practice drafts.",
    "",
    "### After",
    "Which line do they film today?",
  ].join("\n"),
};
