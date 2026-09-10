import type { ModulePack } from "@/lib/modules/types";

/**
 * Advice vs Ego Coach: pre-shoot checklist for viewer-serving delivery.
 */
export const ADVICE_VS_EGO_COACH_PACK: ModulePack = {
  moduleId: "advice-vs-ego-coach",
  intakeFields: [
    {
      id: "plan",
      label: "What you plan to say",
      placeholder: "Outline or key lines before you film",
      required: true,
      multiline: true,
    },
    {
      id: "viewerWhy",
      label: "Why it matters to them",
      placeholder: "The viewer outcome, not your resume",
      required: true,
      multiline: true,
    },
    {
      id: "flexLines",
      label: "Flex lines you are tempted to keep",
      placeholder: "Brags, status drops, or \"look at me\" beats",
      required: false,
      multiline: true,
    },
    {
      id: "format",
      label: "Format",
      placeholder: "Reel, story, live, long video…",
      required: false,
    },
  ],
  probeHints: [
    "advice vs ego",
    "on camera",
    "standpoint",
    "personal IP",
    "content asset",
    "judgment",
    "建议 vs 自我",
    "立场",
    "不要外包判断",
    "probe_jeff",
  ],
  boundNodeIds: [
    "pr.advice-vs-ego",
    "pr.standpoint-or-invisible",
    "rj.outsource-judgment-to-gpt",
    "cl.content-not-ads",
  ],
  starterPrompt:
    "Using my intake, give a go / fix pre-shoot checklist: lines to cut or reframe so I show up as advice for the viewer, not ego for myself.",
  chatOpener:
    "I will give a go / fix pre-shoot checklist so you show up as advice for the viewer, not ego for yourself. What do you plan to say on camera?",
  systemOverlay: [
    "## Module mode: Advice vs Ego Coach",
    "You are running the Advice vs Ego Coach tool for this user.",
    "Job: pre-shoot go / fix checklist: advice for the viewer, not ego for the speaker.",
    "",
    "### Jeff pivots (must show)",
    "Separate advice from ego on camera. Standpoint serves the viewer. Do not outsource final judgment to the model.",
    "Failures and corrections can be content; flex lines that serve status get cut or reframed.",
    "ANTI-GENERIC: ban vague \"be authentic\" tips. Quote → rewrite concrete lines.",
    "",
    "### Conversational collect",
    "Need: what they plan to say, why it matters to the viewer; flex lines and format optional.",
    "Ask plan-to-say first if missing.",
    "",
    "### Output shape",
    "1. Go: what already serves the viewer.",
    "2. Fix: quote → rewrite.",
    "3. Ego traps named.",
    "4. On-camera reminder: actor for the IP.",
    "5. Judgment note: fundamentals stay theirs.",
    "",
    "### Hard bans",
    "Prefer pr.advice-vs-ego, pr.standpoint-or-invisible, rj.outsource-judgment-to-gpt, cl.content-not-ads.",
    "Thin: Generally → Jeff → steer.",
    "",
    "### After",
    "Which fixed line do they film first?",
  ].join("\n"),
};
