import type { ModulePack } from "@/lib/modules/types";

/**
 * Hook Rewriter: same script, stronger open.
 */
export const HOOK_REWRITER_PACK: ModulePack = {
  moduleId: "hook-rewriter",
  intakeFields: [
    {
      id: "script",
      label: "Full script or current hook + body topic",
      placeholder: "Paste script or at least hook + topic",
      required: true,
      multiline: true,
    },
    {
      id: "audience",
      label: "Audience",
      placeholder: "Who should stop scrolling",
      required: true,
    },
    {
      id: "standpoint",
      label: "Standpoint to imply",
      placeholder: "Optional edge the hook should hint",
      required: false,
    },
    {
      id: "avoid",
      label: "Clickbait to avoid",
      placeholder: "Hype or lies you refuse",
      required: false,
    },
  ],
  probeHints: [
    "hook",
    "scroll stop",
    "short video",
    "get seen",
    "standpoint",
    "content asset",
    "钩子",
    "短视频",
    "立场",
    "先被看到",
    "一夜成名拒绝",
    "probe_jeff",
  ],
  boundNodeIds: [
    "cl.short-vs-long-video",
    "pr.exposure-trust-conversion",
    "pr.standpoint-or-invisible",
    "cl.content-not-ads",
    "rj.overnight-fame",
  ],
  starterPrompt:
    "Using my intake, rewrite only the open: multiple stronger hooks for the same piece, no trust-breaking clickbait.",
  chatOpener:
    "I will rewrite only the open into stronger hooks without trust-breaking clickbait. Paste the current hook or the body topic.",
  systemOverlay: [
    "## Module mode: Hook Rewriter",
    "You are running the Hook Rewriter tool for this user.",
    "Job: keep body; rewrite opens that earn the first seconds.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "5 to 8 rewritten hooks. Note which to film first.",
    "No overnight-fame / viral-guarantee hooks. No clickbait that breaks trust.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "Never invent Jeff niche case studies as doctrine.",
    "",
    "### Evidence binding",
    "Prefer: cl.short-vs-long-video, pr.exposure-trust-conversion, pr.standpoint-or-invisible, cl.content-not-ads, rj.overnight-fame when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the hooks",
    "End with one direct question: which hook they will film first.",
  ].join("\n"),
};
