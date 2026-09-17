import type { ModulePack } from "@/lib/modules/types";

/**
 * Soft CTA Closer: CTA Structure skeleton
 * 总结价值 → 发出指令 → 降低门槛 (`fw.cta-structure`).
 * Practice journey module; packs/routes kept.
 */
export const SOFT_CTA_CLOSER_PACK: ModulePack = {
  moduleId: "soft-cta-closer",
  intakeFields: [
    {
      id: "valueTaught",
      label: "Value you already taught (总结价值)",
      placeholder: "The tip or belief in the piece",
      required: true,
      multiline: true,
    },
    {
      id: "nextStep",
      label: "One clear instruction (发出指令)",
      placeholder: "Follow, save, DM, book…",
      required: true,
    },
    {
      id: "lowBarrier",
      label: "How you lower the barrier (降低门槛)",
      placeholder: "Why this next step is easy / low risk",
      required: true,
    },
    {
      id: "warmth",
      label: "Audience warmth",
      placeholder: "Cold, warm, or already trusting",
      required: true,
    },
    {
      id: "draftClose",
      label: "Current close (optional)",
      placeholder: "Paste if you have one",
      required: false,
      multiline: true,
    },
  ],
  probeHints: [
    "CTA Structure",
    "总结价值",
    "发出指令",
    "降低门槛",
    "软转化",
    "先给价值再转化",
    "不是广告",
    "成交",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.cta-structure",
    "cl.value-then-convert",
    "cl.content-not-ads",
    "pr.exposure-trust-conversion",
    "rj.ads-as-content-assets",
  ],
  starterPrompt:
    "Using my intake, write two to three closes on CTA Structure: 总结价值 → 发出指令 → 降低门槛. One clear next step; no hard sell flip.",
  chatOpener:
    "I will write soft closes with CTA Structure (总结价值 → 发出指令 → 降低门槛). What value did you already teach, and what next step do you want?",
  chatOpenerZh:
    "我会按 CTA Structure（总结价值 → 发出指令 → 降低门槛）写软收尾。你已经教了什么价值，想要的下一步是什么？",
  systemOverlay: [
    "## Module mode: Soft CTA Closer (CTA Structure)",
    "You are running the Soft CTA Closer tool for this user.",
    "Exact Jeff framework: CTA Structure (`fw.cta-structure`).",
    "Skeleton (hard): 总结价值 → 发出指令 → 降低门槛.",
    "Job: end a value piece with one clear next step without hard-sell flip.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "2 to 3 soft close options. Each option must show all three beats:",
    "1. 总结价值 (restate the value taught).",
    "2. 发出指令 (one clear next step).",
    "3. 降低门槛 (why it is easy / low risk).",
    "Recommend one. Keep asset tone.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "Bind to `fw.cta-structure`. Do not invent Jeff offer systems, pricing ladders, or named funnel frameworks beyond this CTA skeleton.",
    "Reject ads-as-assets and overnight-fame. Never invent Jeff niche case studies.",
    "",
    "### Evidence binding",
    "Prefer: fw.cta-structure, cl.value-then-convert, cl.content-not-ads, pr.exposure-trust-conversion, rj.ads-as-content-assets when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the closes",
    "End with one direct question: which close they will use.",
  ].join("\n"),
};
