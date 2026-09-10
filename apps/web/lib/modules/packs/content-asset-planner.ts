import type { ModulePack } from "@/lib/modules/types";

/**
 * Content Asset Planner: week plan tagged see / trust / convert.
 */
export const CONTENT_ASSET_PLANNER_PACK: ModulePack = {
  moduleId: "content-asset-planner",
  intakeFields: [
    {
      id: "stage",
      label: "Your stage",
      placeholder: "Unseen, building trust, or converting",
      required: true,
    },
    {
      id: "slots",
      label: "Available filming slots this week",
      placeholder: "e.g. 2 evenings, Sunday morning, lunch breaks",
      required: true,
    },
    {
      id: "themes",
      label: "Themes you can cover without research theater",
      placeholder: "Topics you already know well enough to teach",
      required: true,
      multiline: true,
    },
    {
      id: "platform",
      label: "Primary platform this week",
      placeholder: "IG Reels, TikTok, LinkedIn, etc.",
      required: false,
    },
  ],
  probeHints: [
    "content asset",
    "exposure trust conversion",
    "week plan",
    "not ads",
    "direction beats volume",
    "personal IP",
    "内容资产",
    "曝光信任成交",
    "方向大于数量",
    "不是广告",
    "probe_jeff",
  ],
  boundNodeIds: [
    "pr.exposure-trust-conversion",
    "tm.content-asset",
    "cl.content-not-ads",
    "pr.direction-beats-volume",
  ],
  starterPrompt:
    "Using my intake, build a simple weekly content-asset slate tagged see / trust / convert, sized to my filming slots.",
  chatOpener:
    "I will build a weekly content-asset slate tagged see / trust / convert, sized to real filming slots. Are you mainly unseen, building trust, or converting?",
  systemOverlay: [
    "## Module mode: Content Asset Planner",
    "You are running the Content Asset Planner tool for this user.",
    "Job: week plan of content assets tagged see / trust / convert, not random volume.",
    "",
    "### Jeff pivots (must show)",
    "Every slot is a content asset on the exposure → trust → deal chain. Assets are not ads. Direction beats volume.",
    "Stage mix: unseen leans see; trust gap leans teaching/proof; convert leans soft invite after value.",
    "ANTI-GENERIC: ban a generic content calendar with no Jeff tags or asset-vs-ad distinction.",
    "",
    "### Conversational collect",
    "Need: stage, filming slots, themes they already know, platform optional.",
    "Ask 1 to 2 per turn. Prefer stage + slots first.",
    "",
    "### Output shape",
    "1. Priority mix for their stage.",
    "2. Day-by-slot: title/angle, see|trust|convert tag, format hint.",
    "3. Reminder: assets beat ad spam; volume without direction is waste.",
    "Size to real slots only.",
    "",
    "### Hard bans",
    "Reject posting-more monetization. Prefer pr.exposure-trust-conversion, tm.content-asset, cl.content-not-ads, pr.direction-beats-volume.",
    "Thin weekly-planning KB: Generally → Jeff → steer.",
    "",
    "### After",
    "Which asset do they film first?",
  ].join("\n"),
};
