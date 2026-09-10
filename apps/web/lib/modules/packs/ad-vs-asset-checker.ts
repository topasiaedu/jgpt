import type { ModulePack } from "@/lib/modules/types";

/**
 * Ad vs Asset Checker: verdict + rewrite toward content asset.
 */
export const AD_VS_ASSET_CHECKER_PACK: ModulePack = {
  moduleId: "ad-vs-asset-checker",
  intakeFields: [
    {
      id: "draft",
      label: "Paste your draft",
      placeholder: "Caption, script, or outline to review",
      required: true,
      multiline: true,
    },
    {
      id: "audience",
      label: "Audience",
      placeholder: "Who this post is for",
      required: true,
    },
    {
      id: "goal",
      label: "Honest goal of the post",
      placeholder: "Get seen, teach, invite a DM, book a call…",
      required: true,
    },
    {
      id: "mustKeep",
      label: "Must-keep facts or offers",
      placeholder: "Optional: prices, dates, or proof you cannot drop",
      required: false,
      multiline: true,
    },
  ],
  probeHints: [
    "content not ads",
    "content asset",
    "ads as content",
    "value then convert",
    "personal IP",
    "内容不是广告",
    "广告当内容",
    "先给价值",
    "内容资产",
    "probe_jeff",
  ],
  boundNodeIds: [
    "cl.content-not-ads",
    "rj.ads-as-content-assets",
    "tm.content-asset",
    "cl.value-then-convert",
  ],
  starterPrompt:
    "Using my intake, judge whether my draft reads like a sales ad or a content asset. Explain why, then rewrite toward asset while keeping the point.",
  chatOpener:
    "I will judge whether your draft reads like a sales ad or a content asset, then rewrite toward asset. Paste the draft you want checked.",
  systemOverlay: [
    "## Module mode: Ad vs Asset Checker",
    "You are running the Ad vs Asset Checker tool for this user.",
    "Job: verdict ad vs content asset vs mixed, then rewrite toward asset.",
    "",
    "### Jeff pivots (must show)",
    "Do not mistake advertising for content assets. Reject ads-as-content thinking. Value then convert lightly.",
    "Name salesy tells (pitch-first, feature dump, hard CTA) vs asset tells (teach, standpoint, process, soft invite).",
    "ANTI-GENERIC: \"make it more engaging\" is not enough. Force ad/asset verdict using Jeff language.",
    "",
    "### Conversational collect",
    "Need: draft, audience, goal; must-keep optional.",
    "If draft missing, ask for paste first.",
    "",
    "### Output shape",
    "1. Verdict: Ad | Asset | Mixed.",
    "2. Why: 2 to 4 bullets.",
    "3. Full rewrite keeping must-keep facts.",
    "4. Optional soft convert line if goal needs invite.",
    "",
    "### Hard bans",
    "Prefer cl.content-not-ads, rj.ads-as-content-assets, tm.content-asset, cl.value-then-convert.",
    "User judgment stays primary. Thin: Generally → Jeff → steer.",
    "",
    "### After",
    "What still feels pushy when read aloud?",
  ].join("\n"),
};
