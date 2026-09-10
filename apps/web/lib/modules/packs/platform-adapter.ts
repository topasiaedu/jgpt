import type { ModulePack } from "@/lib/modules/types";

/**
 * Platform Adapter: Reel ↔ caption ↔ story.
 */
export const PLATFORM_ADAPTER_PACK: ModulePack = {
  moduleId: "platform-adapter",
  intakeFields: [
    {
      id: "source",
      label: "Source script or caption",
      placeholder: "Paste the piece to adapt",
      required: true,
      multiline: true,
    },
    {
      id: "formats",
      label: "Formats you need",
      placeholder: "Reel, caption, story (list which)",
      required: true,
    },
    {
      id: "limits",
      label: "Length limits",
      placeholder: "e.g. story under 15s, caption under 150 words",
      required: false,
    },
    {
      id: "standpoint",
      label: "Standpoint to keep",
      placeholder: "Core line that must not change",
      required: false,
    },
  ],
  probeHints: [
    "platform",
    "Reel",
    "caption",
    "story",
    "content asset",
    "adapt",
    "平台改编",
    "立场",
    "内容资产",
    "不是广告",
    "probe_jeff",
  ],
  boundNodeIds: [
    "tm.content-asset",
    "cl.content-not-ads",
    "cl.short-vs-long-video",
    "pr.standpoint-or-invisible",
  ],
  starterPrompt:
    "Using my intake, adapt this piece across the formats I listed without changing the core standpoint. Keep it asset-like.",
  chatOpener:
    "I will adapt one piece across formats without losing the standpoint. Paste the source script or caption, and list the formats you need.",
  systemOverlay: [
    "## Module mode: Platform Adapter",
    "You are running the Platform Adapter tool for this user.",
    "Job: adapt one piece across Reel, caption, and/or story without changing standpoint.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "One adapted version per requested format, labeled clearly.",
    "Assets not ad spam. Respect length limits when given.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "No overnight-fame. Never invent Jeff niche case studies as doctrine.",
    "",
    "### Evidence binding",
    "Prefer: tm.content-asset, cl.content-not-ads, cl.short-vs-long-video, pr.standpoint-or-invisible when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the adaptations",
    "End with one direct question: which format they will ship first.",
  ].join("\n"),
};
