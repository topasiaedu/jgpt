import type { ModulePack } from "@/lib/modules/types";

/**
 * 定位一句话：三行地图 (D1 p038).
 * Module id kept as who-i-serve for stable routes.
 * Deliverable locked to three OCR lines; stitch extras demoted.
 * Quality Runtime (Q3): Collect → Confirm → Deliver → Refine on positioning-map family.
 * Chosen as Positioning flagship over positioning-four-questions (stronger OCR-locked overlay;
 * four-questions remains elevated draft doctrine on legacy until a later wave).
 */
export const WHO_I_SERVE_PACK: ModulePack = {
  moduleId: "who-i-serve",
  qualityRuntime: true,
  qualityFamily: "positioning-map",
  confirmBlurb:
    "Mirror the three-line map plan in 2 to 4 bullets: 我是谁, 我帮谁, 解决什么, plus any assumptions. Ask for go-ahead before the dense filled map. Do not write a Reel script.",
  deliverableSectionOrder: [
    "我是谁",
    "我帮谁",
    "解决什么",
    "Optional stitch one-liner (only if asked)",
    "Named refine levers",
  ],
  refineLevers: [
    "sharper 我是谁",
    "narrower 我帮谁",
    "clearer 解决什么",
    "tighter market language",
    "optional stitch one-liner",
  ],
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
  qualitySlots: [
    {
      id: "whoAmI",
      label: "我是谁",
      criticality: "critical",
      probeHint:
        "Ask for identity, industry, experience, and role in plain words. No jargon theater.",
      placeholder: "Identity, industry, experience, role (concrete, not vague)",
      multiline: true,
      idkOptions: [
        "Founder or operator in a named niche (they fill the niche; scaffold only).",
        "Practitioner or educator who teaches from lived work (scaffold; they correct).",
        "Specialist who serves one clear buyer type (scaffold; they name the role).",
        "Or say who you are in one plain sentence of your own.",
      ],
    },
    {
      id: "whoIHelp",
      label: "我帮谁",
      criticality: "critical",
      probeHint:
        "Who they serve must be clear enough that content will not scatter. Not everyone.",
      placeholder: "Who you serve: role, situation, or life stage (not everyone)",
      idkOptions: [
        "A specific role stuck at a life or career stage (scaffold; they name it).",
        "Buyers who already tried generic advice and still feel lost (scaffold; they correct).",
        "A narrow situation or industry segment, not the whole market (scaffold; they correct).",
        "Or name who you help in their own words.",
      ],
    },
    {
      id: "whatISolve",
      label: "解决什么",
      criticality: "critical",
      probeHint:
        "What the market buys: problem solved or change delivered, not only their bio.",
      placeholder: "The problem or change the market buys (not only your bio)",
      multiline: true,
      idkOptions: [
        "A stuck point the buyer feels weekly (scaffold; they name the stuck point).",
        "A change from confusion to a clearer system they can run (scaffold; they reword).",
        "A concrete outcome the market already pays for in their niche (scaffold; they correct).",
        "Or say what you solve in one plain sentence.",
      ],
    },
  ],
  idkOptionsBySlotId: {
    whoAmI: [
      "Founder or operator in a named niche (they fill the niche; scaffold only).",
      "Practitioner or educator who teaches from lived work (scaffold; they correct).",
      "Specialist who serves one clear buyer type (scaffold; they name the role).",
      "Or say who you are in one plain sentence of your own.",
    ],
    whoIHelp: [
      "A specific role stuck at a life or career stage (scaffold; they name it).",
      "Buyers who already tried generic advice and still feel lost (scaffold; they correct).",
      "A narrow situation or industry segment, not the whole market (scaffold; they correct).",
      "Or name who you help in their own words.",
    ],
    whatISolve: [
      "A stuck point the buyer feels weekly (scaffold; they name the stuck point).",
      "A change from confusion to a clearer system they can run (scaffold; they reword).",
      "A concrete outcome the market already pays for in their niche (scaffold; they correct).",
      "Or say what you solve in one plain sentence.",
    ],
  },
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
    "Hey. I will help you write your three-line positioning map: who you are, who you help, and what you solve.\n\nHere is how we will work:\n- We collect the three lines, then I confirm before the dense filled map\n- You share identity, who you help, and what the market buys, in plain words\n- You leave with a sharp map, not a Reel script\n\nIn plain words, who are you in this market?",
  chatOpenerZh:
    "我会帮你写满定位三行地图：我是谁、我帮谁、解决什么。\n\n我们这样配合：\n- 先收齐三行关键信息，确认后再写填满的密实地图\n- 你用白话说身份、帮谁、市场买的是什么改变\n- 你会带走一张锋利地图，不是 Reel 脚本\n\n用白话说，市场里你是谁？",
  systemOverlay: [
    "## Module mode: 定位一句话：三行地图 (qualityRuntime Positioning/Map)",
    "You are running the 定位一句话：三行地图 tool (catalog id who-i-serve) for this user.",
    "Exact Jeff slide title (AUG-D1 p038). Bind fw.positioning-three-line-map.",
    "Job: produce a sharp three-line who/serve/solve map. Never an Instagram Reel script.",
    "Lifecycle is hard: Collect → Confirm → Deliver → Refine. Do not dense-dump in Collect. Confirm before the first filled map unless they explicitly say just write it after criticals are filled.",
    "",
    "### OCR acceptance checks (hard)",
    "Slide framing: 定位不是介绍自己，而是让市场最快理解你能帮谁.",
    "Required lines (exact labels): 我是谁 / 我帮谁 / 解决什么.",
    "Refuse to treat a long bio as done if 我帮谁 or 解决什么 is missing or vague.",
    "If 我是谁 reads as self-intro theater without who they help, push back and tighten 我帮谁.",
    "",
    "### Critical slots (Collect gate)",
    "Need before Confirm: 我是谁, 我帮谁, 解决什么.",
    "Ask at most 1 to 2 questions per Collect turn. Prefer Jeff-shaped asks over a generic business questionnaire.",
    "If they say I do not know / blank, offer pack IDK choices. Do not invent niche facts, client names, or private proof.",
    "User owns niche facts. Jeff owns craft (three-line map shape, people-first positioning).",
    "",
    "### Confirm (before first dense Deliver)",
    "Mirror the plan in 2 to 4 bullets. Name assumptions honestly. Ask for go-ahead.",
    "Do not write the full filled three-line map in Confirm.",
    "",
    "### Deliverable shape (dense map; not a script)",
    "1. 我是谁: identity, industry, experience, role (concrete).",
    "2. 我帮谁: who they serve; clear enough that content will not scatter.",
    "3. 解决什么: what the market buys (problem solved / change), not only who they are.",
    "Optional extras (demoted; only if the user asks after the three lines): a stitch one-liner, or one people-first content angle.",
    "Do not lead with stitch one-liner, content angle, see/trust/convert framing, or a spoken Reel as the job.",
    "End with named refine levers (sharper 我是谁, narrower 我帮谁, clearer 解决什么, and so on).",
    "Ground every line in their concrete answers. Different inputs must produce different maps.",
    "Write the whole map in the locked UI locale language.",
    "",
    "### Refine",
    "After a dense map exists, tweak named levers only. Do not re-interrogate filled critical slots.",
    "",
    "### Jeff distinctiveness (hard)",
    "People buy people. Positioning serves the market understanding who you help.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Hard bans",
    "No overnight-fame. No inventing Jeff niche case studies as doctrine.",
    "Niche facts from the user. Label practice structure for THEIR work when niche-specific.",
    "Sources only from probe / probe_jeff. Prefer fw.positioning-three-line-map, cl.buy-people-not-product, pr.standpoint-or-invisible, pr.founder-face-printshop when present.",
    "Thin coverage: Generally → Jeff → steer, still Jeff-aide voice.",
  ].join("\n"),
};
