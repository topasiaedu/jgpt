import type { ModulePack } from "@/lib/modules/types";

/**
 * Value Teaching Reel: teach one tip openly; light next step.
 */
export const VALUE_TEACHING_REEL_PACK: ModulePack = {
  moduleId: "value-teaching-reel",
  intakeFields: [
    {
      id: "tip",
      label: "The one tip you can teach in under a minute",
      placeholder: "Concrete tip, not a vague theme",
      required: true,
      multiline: true,
    },
    {
      id: "whoHelps",
      label: "Who it helps",
      placeholder: "Audience this tip is for",
      required: true,
    },
    {
      id: "nextStep",
      label: "Gentle next step",
      placeholder: "Follow, save, DM keyword, or light booking invite",
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
    "value then convert",
    "teach openly",
    "content asset",
    "not ads",
    "short video",
    "trust",
    "先给价值再转化",
    "内容资产",
    "不是广告",
    "短视频",
    "probe_jeff",
  ],
  boundNodeIds: [
    "cl.value-then-convert",
    "cl.content-not-ads",
    "pr.exposure-trust-conversion",
    "cl.short-vs-long-video",
  ],
  starterPrompt:
    "Using my intake, script a value-led Reel that teaches one tip openly, then adds a light next step. Keep convert soft.",
  chatOpener:
    "I will script a value-led Reel that teaches one tip openly, then a light next step. What is the one tip you can teach in under a minute?",
  systemOverlay: [
    "## Module mode: Value Teaching Reel",
    "You are running the Value Teaching Reel tool for this user.",
    "Job: Reel that teaches one tip openly, then a light next step. Value first; soft convert later.",
    "",
    "### Jeff pivots (must show)",
    "Lead with open valuable content (先给价值再转化). Do not hoard the tip behind a pitch. Content assets are not ads.",
    "Close is invite after value, not a hard sell flip in second one.",
    "ANTI-GENERIC: if it reads like a sales Reel with a tip glued on, invert: tip full, convert soft.",
    "",
    "### Conversational collect",
    "Need: tip, who it helps, gentle next step, language optional.",
    "Ask tip first when missing.",
    "",
    "### Output shape",
    "1. Hook that promises the tip without hard pitch.",
    "2. Teaching beat: speakable steps.",
    "3. Light invite.",
    "4. Optional on-screen text.",
    "",
    "### Hard bans",
    "Prefer cl.value-then-convert, cl.content-not-ads, pr.exposure-trust-conversion, cl.short-vs-long-video.",
    "No overnight-fame. No invented Jeff cases. Thin: Generally → Jeff → steer.",
    "",
    "### After",
    "One question to film or tighten the tip.",
  ].join("\n"),
};
