import type { ModulePack } from "@/lib/modules/types";

/**
 * 定位一句话：三行地图 (D1 p038).
 * Module id kept as who-i-serve for stable routes.
 * Deliverable locked to three OCR lines; stitch extras demoted.
 */
export const WHO_I_SERVE_PACK: ModulePack = {
  moduleId: "who-i-serve",
  intakeFields: [
    {
      id: "whoAmI",
      label: "我是谁",
      placeholder: "Identity, industry, experience, role (concrete, not vague)",
      required: true,
      multiline: true,
    },
    {
      id: "whoIHelp",
      label: "我帮谁",
      placeholder: "Who you serve: role, situation, or life stage (not everyone)",
      required: true,
    },
    {
      id: "whatISolve",
      label: "解决什么",
      placeholder: "The problem or change the market buys (not only your bio)",
      required: true,
      multiline: true,
    },
  ],
  probeHints: [
    "定位一句话",
    "三行地图",
    "我是谁",
    "我帮谁",
    "解决什么",
    "buy people not product",
    "ideal customer",
    "personal IP",
    "买人",
    "谁是客户",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.positioning-three-line-map",
    "cl.buy-people-not-product",
    "pr.standpoint-or-invisible",
    "pr.founder-face-printshop",
  ],
  starterPrompt:
    "Using my intake, write only the 定位一句话：三行地图 lines (我是谁 / 我帮谁 / 解决什么). Pass OCR acceptance: positioning helps the market understand who you help, not a long self-intro.",
  chatOpener:
    "I will build Jeff's 定位一句话：三行地图: 我是谁, 我帮谁, 解决什么. Start with 我是谁: identity, industry, experience, role in plain words.",
  chatOpenerZh:
    "我会按「定位一句话：三行地图」写满三行：我是谁 / 我帮谁 / 解决什么。先用白话说「我是谁」：身份、行业、经验、角色？",
  systemOverlay: [
    "## Module mode: 定位一句话：三行地图",
    "You are running the 定位一句话：三行地图 tool (catalog id who-i-serve) for this user.",
    "Exact Jeff slide title (AUG-D1 p038). Bind fw.positioning-three-line-map.",
    "Primary deliverable: the three OCR lines only. Do not invent a different Jeff brand name.",
    "",
    "### OCR acceptance checks (hard)",
    "Slide framing: 定位不是介绍自己，而是让市场最快理解你能帮谁.",
    "Required lines (exact labels): 我是谁 / 我帮谁 / 解决什么.",
    "Refuse to treat a long bio as done if 我帮谁 or 解决什么 is missing or vague.",
    "If 我是谁 reads as self-intro theater without who they help, push back and tighten 我帮谁.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "Collect 我是谁, 我帮谁, 解决什么 only.",
    "When enough is known, or the user says just write it, deliver the three lines and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. 我是谁: identity, industry, experience, role (concrete).",
    "2. 我帮谁: who they serve; clear enough that content will not scatter.",
    "3. 解决什么: what the market buys (problem solved / change), not only who they are.",
    "Optional extras (demoted; only if the user asks after the three lines): a stitch one-liner, or one people-first content angle.",
    "Do not lead with stitch one-liner, content angle, or see/trust/convert framing as the job.",
    "",
    "### Jeff distinctiveness (hard)",
    "People buy people. Positioning serves the market understanding who you help.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "Bind to fw.positioning-three-line-map and buy-people-not-product when evidence hits. No overnight-fame. Never invent Jeff niche case studies as doctrine.",
    "Niche facts come from the conversation.",
    "",
    "### Evidence binding",
    "Prefer: fw.positioning-three-line-map, cl.buy-people-not-product, pr.standpoint-or-invisible, pr.founder-face-printshop when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the map",
    "End with one direct question that tightens which of the three lines needs the most sharpening.",
  ].join("\n"),
};
