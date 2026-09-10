import type { ModulePack } from "@/lib/modules/types";

/**
 * Bullet Caption Pack: supporting text under a reel.
 */
export const BULLET_CAPTION_PACK: ModulePack = {
  moduleId: "bullet-caption-pack",
  intakeFields: [
    {
      id: "topic",
      label: "Reel topic or script summary",
      placeholder: "What the video teaches",
      required: true,
      multiline: true,
    },
    {
      id: "bullets",
      label: "Key bullets to include",
      placeholder: "Must-keep points",
      required: true,
      multiline: true,
    },
    {
      id: "ctaSoftness",
      label: "CTA softness",
      placeholder: "Soft follow/save, or light invite",
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
    "caption",
    "bullets",
    "Reel",
    "content asset",
    "value then convert",
    "not ads",
    "字幕",
    "文案",
    "软转化",
    "内容资产",
    "probe_jeff",
  ],
  boundNodeIds: [
    "tm.content-asset",
    "cl.value-then-convert",
    "cl.content-not-ads",
    "pr.exposure-trust-conversion",
  ],
  starterPrompt:
    "Using my intake, write a supporting caption with short bullets, a soft close, and optional on-screen text echoes.",
  chatOpener:
    "I will write a supporting caption with short bullets and a soft close. What is the Reel topic or script summary?",
  systemOverlay: [
    "## Module mode: Bullet Caption Pack",
    "You are running the Bullet Caption Pack tool for this user.",
    "Job: supporting caption under a Reel for mute-scroll and save-later reading.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Caption with short bullets.",
    "2. Soft close.",
    "3. Optional on-screen text echoes.",
    "Asset tone; value then light convert.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "No overnight-fame. Never invent Jeff niche case studies as doctrine.",
    "",
    "### Evidence binding",
    "Prefer: tm.content-asset, cl.value-then-convert, cl.content-not-ads, pr.exposure-trust-conversion when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the caption",
    "End with one direct question: whether any bullet should move on-screen instead.",
  ].join("\n"),
};
