import type { ModulePack } from "@/lib/modules/types";

/**
 * 四种内容资产 (D1 p016): classify/plan posts by type.
 * Module id kept as content-asset-planner. One job only; Stack is a separate module.
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
    "四种内容资产",
    "曝光资产",
    "认知资产",
    "信任资产",
    "成交资产",
    "曝光",
    "认知",
    "信任",
    "成交",
    "content asset",
    "week plan",
    "not ads",
    "direction beats volume",
    "内容资产",
    "方向大于数量",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.four-content-assets",
    "pr.exposure-trust-conversion",
    "tm.content-asset",
    "cl.content-not-ads",
    "pr.direction-beats-volume",
  ],
  starterPrompt:
    "Using my intake, classify and plan posts using 四种内容资产 only (曝光 / 认知 / 信任 / 成交), sized to my filming slots.",
  chatOpener:
    "I will classify and plan with 四种内容资产 only: 曝光 / 认知 / 信任 / 成交 (not the Stack funnel). Are you mainly unseen, building trust, or converting?",
  systemOverlay: [
    "## Module mode: 四种内容资产",
    "You are running the 四种内容资产 tool (catalog id content-asset-planner) for this user.",
    "Exact Jeff slide title (AUG-D1 p016). One job: classify and plan posts by asset *type*: 曝光, 认知, 信任, 成交.",
    "Do NOT run Content Asset Stack / 内容资产堆叠 (看见→记住→相信→询问→成交) here; that is a separate module.",
    "Slide line: 每一支内容，都应该知道自己在资产堆叠里的位置.",
    "",
    "### Jeff pivots (must show)",
    "Every slot gets exactly one of 四种内容资产. Assets are not ads. Direction beats volume.",
    "Stage mix: unseen leans 曝光/认知; trust gap leans 信任; convert leans 成交 after value.",
    "ANTI-GENERIC: ban a generic content calendar with no Jeff type tags.",
    "",
    "### Conversational collect",
    "Need: stage, filming slots, themes they already know, platform optional.",
    "Ask 1 to 2 per turn. Prefer stage + slots first.",
    "",
    "### Output shape",
    "1. Priority mix for their stage across 曝光 / 认知 / 信任 / 成交.",
    "2. Day-by-slot: title/angle, one asset type, format hint.",
    "3. Reminder: assets beat ad spam; volume without direction is waste.",
    "Size to real slots only.",
    "",
    "### Hard bans",
    "Reject posting-more monetization. Prefer fw.four-content-assets, pr.exposure-trust-conversion, tm.content-asset, cl.content-not-ads, pr.direction-beats-volume.",
    "Thin weekly-planning KB: Generally → Jeff → steer.",
    "",
    "### After",
    "Which typed asset do they film first?",
  ].join("\n"),
};
