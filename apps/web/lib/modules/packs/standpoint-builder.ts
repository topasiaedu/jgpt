import type { ModulePack } from "@/lib/modules/types";

/**
 * Standpoint Builder: one sharp 立场 line, advice-led not ego-led.
 */
export const STANDPOINT_BUILDER_PACK: ModulePack = {
  moduleId: "standpoint-builder",
  intakeFields: [
    {
      id: "audience",
      label: "Who you serve",
      placeholder: "The people you want to be known for helping",
      required: true,
    },
    {
      id: "belief",
      label: "What you believe that others soft-pedal",
      placeholder: "A sharp belief you are willing to say on camera",
      required: true,
      multiline: true,
    },
    {
      id: "refuse",
      label: "What you refuse to do in your work",
      placeholder: "A line you will not cross for convenience or trend",
      required: true,
    },
    {
      id: "language",
      label: "Language preference",
      placeholder: "English, Chinese, or mixed",
      required: false,
    },
  ],
  probeHints: [
    "standpoint",
    "立场",
    "lichang",
    "invisible",
    "advice vs ego",
    "personal IP",
    "无立场就隐形",
    "建议 vs 自我",
    "买人",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.ip-influence-triangle",
    "pr.standpoint-or-invisible",
    "tm.lichang",
    "pr.advice-vs-ego",
    "cl.buy-people-not-product",
  ],
  starterPrompt:
    "Using my intake, write one sharp standpoint line I can say on camera, plus a short note on keeping it advice-led rather than ego-led.",
  chatOpener:
    "I will sharpen one 立场 line you can say on camera, advice-led not ego-led. Who do you serve, in one plain sentence?",
  systemOverlay: [
    "## Module mode: Standpoint Builder",
    "You are running the Standpoint Builder tool for this user.",
    "Job: one sharp 立场 (standpoint) line they can say on camera, plus an advice-vs-ego check.",
    "",
    "### Jeff pivots (must show)",
    "Without standpoint they stay invisible. Sharp is service to the viewer, not cruelty or ego flex.",
    "Use: standpoint or invisible; advice vs ego; people buy people; content without a stand is easy to skip.",
    "ANTI-GENERIC: if the line could be any LinkedIn coach slogan, sharpen until it names a refuse-line and a belief others soft-pedal.",
    "",
    "### Conversational collect",
    "Need: who they serve, belief others soft-pedal, what they refuse, language.",
    "Ask 1 to 2 Jeff-shaped questions per turn (belief / refuse), not a brand-questionnaire dump.",
    "When enough, or just write it: deliver the brief and name assumptions.",
    "",
    "### Output shape",
    "1. Standpoint line (optional 1 to 2 alternates).",
    "2. Why it cuts through (short coach paragraph).",
    "3. Advice vs ego check: keep / cut.",
    "4. Optional Reel opener that implies this standpoint.",
    "",
    "### Hard bans",
    "No overnight-fame. No invented Jeff niche cases. Prefer pr.standpoint-or-invisible, tm.lichang, pr.advice-vs-ego, cl.buy-people-not-product when in evidence.",
    "Thin KB: Generally → Jeff → steer.",
    "",
    "### After",
    "One direct question: film or tighten which line.",
  ].join("\n"),
};
