import type { ModulePack } from "@/lib/modules/types";

/**
 * IP Stage Check: diagnose unseen / no trust / not converting; point to next module.
 */
export const IP_STAGE_CHECK_PACK: ModulePack = {
  moduleId: "ip-stage-check",
  intakeFields: [
    {
      id: "niche",
      label: "Niche or industry",
      placeholder: "e.g. boutique fitness, family law, B2B SaaS",
      required: true,
    },
    {
      id: "knownFor",
      label: "What you sell or want to be known for",
      placeholder: "Offer, expertise, or reputation you are building",
      required: true,
    },
    {
      id: "showUp",
      label: "How often you show up on camera or in content",
      placeholder: "e.g. never, once a month, a few times a week",
      required: true,
    },
    {
      id: "stuck",
      label: "What feels stuck",
      placeholder: "Views, trust, DMs, bookings, or unclear next move",
      required: true,
      multiline: true,
    },
  ],
  probeHints: [
    "exposure trust conversion",
    "get seen",
    "direction beats volume",
    "personal IP",
    "content asset",
    "not posting more",
    "曝光信任成交",
    "方向大于数量",
    "不是多发",
    "内容资产",
    "probe_jeff",
  ],
  boundNodeIds: [
    "pr.exposure-trust-conversion",
    "pr.direction-beats-volume",
    "rj.volume-equals-money",
    "cl.content-not-ads",
  ],
  starterPrompt:
    "Using my intake, diagnose my IP stage (unseen, trust gap, or convert gap), name one priority focus, and recommend the next tool from this wall.",
  chatOpener:
    "I will diagnose where you are stuck on get seen → trust → deal, then point you to one next tool. What feels stuck right now: views, trust, DMs, bookings, or unclear direction?",
  systemOverlay: [
    "## Module mode: IP Stage Check",
    "You are running the IP Stage Check tool for this user.",
    "Job: diagnose stuck point on see → trust → convert, one priority focus, one next module on this wall.",
    "",
    "### Jeff pivots (must show)",
    "Use the exposure → trust → deal chain by name. Direction beats volume; posting more is not the fix.",
    "Separate unseen (get seen / founder face), trust gap (assets, standpoint, advice not ego), convert gap (value then convert, soft invite).",
    "ANTI-GENERIC: ban \"post consistently and engage\" as the whole answer. Force a stage label + Jeff mechanism + one tool.",
    "",
    "### Conversational collect",
    "Need: niche, known-for, show-up rhythm, what feels stuck.",
    "Ask 1 to 2 questions per turn. Prefer \"what feels stuck\" and show-up rhythm first.",
    "",
    "### Output shape",
    "1. Stage label: unseen / trust gap / convert gap / mixed (name dominant).",
    "2. Evidence from their answers (2 to 4 bullets).",
    "3. One priority for 1 to 2 weeks.",
    "4. Next module: Standpoint Builder, Boss Brand Brief, Lean IP Setup, IG Reel Script, Scroll-Stop Hook, Value Teaching Reel, Hot Take Script, Content Asset Planner, Direction Fixer, Value → Convert Ladder, Ad vs Asset Checker, Advice vs Ego Coach, Criticism Armor, or Script Humanizer; say why.",
    "",
    "### Hard bans",
    "No overnight-fame. No inventing niche Jeff cases. Prefer pr.exposure-trust-conversion, pr.direction-beats-volume, rj.volume-equals-money, cl.content-not-ads.",
    "Thin: Generally → Jeff → steer.",
    "",
    "### After",
    "One question that locks the priority or the next tool.",
  ].join("\n"),
};
