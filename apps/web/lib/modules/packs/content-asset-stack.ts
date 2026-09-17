import type { ModulePack } from "@/lib/modules/types";

/**
 * Content Asset Stack / 内容资产堆叠 (D1 p015 METHOD 02).
 * One job: map how content moves people along 看见→记住→相信→询问→成交.
 * Not the four asset types (that is content-asset-planner).
 */
export const CONTENT_ASSET_STACK_PACK: ModulePack = {
  moduleId: "content-asset-stack",
  intakeFields: [
    {
      id: "piece",
      label: "Content piece or idea",
      placeholder: "Draft caption, script summary, or topic you plan to film",
      required: true,
      multiline: true,
    },
    {
      id: "audience",
      label: "Who this is for",
      placeholder: "The person who should move along the stack",
      required: true,
    },
    {
      id: "currentStep",
      label: "Where they are now on the stack",
      placeholder: "看见 / 记住 / 相信 / 询问 / 成交 (best guess)",
      required: true,
    },
    {
      id: "desiredStep",
      label: "Where you want them next",
      placeholder: "Usually one step further on the stack",
      required: true,
    },
  ],
  probeHints: [
    "Content Asset Stack",
    "内容资产堆叠",
    "看见",
    "记住",
    "相信",
    "询问",
    "成交",
    "信任证据",
    "content asset",
    "not ads",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.content-asset-stack",
    "pr.exposure-trust-conversion",
    "tm.content-asset",
    "cl.content-not-ads",
    "pr.direction-beats-volume",
  ],
  starterPrompt:
    "Using my intake, map this content on Content Asset Stack / 内容资产堆叠: 看见 → 记住 → 相信 → 询问 → 成交, and say how it moves people one step.",
  chatOpener:
    "I will map your content on Content Asset Stack / 内容资产堆叠: 看见 → 记住 → 相信 → 询问 → 成交 (not the four asset types). Paste the piece or idea, and who it is for.",
  systemOverlay: [
    "## Module mode: Content Asset Stack / 内容资产堆叠",
    "You are running the Content Asset Stack tool for this user.",
    "Exact Jeff slide title (AUG-D1 p015 METHOD 02): Content Asset Stack | 内容资产堆叠.",
    "One job: map how content moves people along the stack path: 看见 → 记住 → 相信 → 询问 → 成交.",
    "Slide framing: 内容不是发出去就结束，而是一步一步堆成信任证据.",
    "Do NOT classify into 四种内容资产 (曝光/认知/信任/成交) here; that is a separate module (content-asset-planner).",
    "",
    "### Stack steps (from slides)",
    "1. 看见: 被内容吸引, 产生初步关注",
    "2. 记住: 内容被记住, 形成品牌印象",
    "3. 相信: 通过内容验证, 建立信任认知",
    "4. 询问: 主动产生疑问, 寻求更多信息",
    "5. 成交: 信任驱动决策, 完成购买转化",
    "",
    "### Conversational collect",
    "Need: piece/idea, audience, current stack step, desired next step.",
    "Ask 1 to 2 per turn.",
    "",
    "### Output shape",
    "1. Current step diagnosis on the stack.",
    "2. What this piece actually moves (one step at a time is fine).",
    "3. Rewrite or beat notes so the piece stacks trust evidence toward the desired step.",
    "4. What not to force (e.g. hard 成交 before 相信).",
    "",
    "### Hard bans",
    "Assets not ads. No overnight-fame. Prefer fw.content-asset-stack, pr.exposure-trust-conversion, tm.content-asset, cl.content-not-ads.",
    "ANTI-GENERIC: ban a generic funnel with no Jeff stack wording.",
    "",
    "### After",
    "Which stack step will they film for first?",
  ].join("\n"),
};
