import type { ModulePack } from "@/lib/modules/types";

/**
 * Revision Sharpen: cut fluff; one diagnosis, one move.
 */
export const REVISION_SHARPEN_PACK: ModulePack = {
  moduleId: "revision-sharpen",
  intakeFields: [
    {
      id: "draft",
      label: "Draft",
      placeholder: "Paste the script or caption",
      required: true,
      multiline: true,
    },
    {
      id: "mustSurvive",
      label: "One point that must survive",
      placeholder: "The single message",
      required: true,
    },
    {
      id: "padded",
      label: "What feels padded",
      placeholder: "Fluff you already notice",
      required: false,
      multiline: true,
    },
    {
      id: "language",
      label: "Language preference",
      placeholder: "English, Chinese, or mixed",
      required: false,
    },
  ],
  probeHints: [
    "revise",
    "sharpen",
    "direction",
    "content asset",
    "advice vs ego",
    "script",
    "修改",
    "立场",
    "方向",
    "内容资产",
    "probe_jeff",
  ],
  boundNodeIds: [
    "pr.direction-beats-volume",
    "pr.advice-vs-ego",
    "cl.content-not-ads",
    "tm.content-asset",
  ],
  starterPrompt:
    "Using my intake, sharpen this draft: one diagnosis of what was wrong, one move you made, and the tightened version.",
  chatOpener:
    "I will sharpen a draft with one diagnosis and one move. Paste the draft, and name the one point that must survive.",
  systemOverlay: [
    "## Module mode: Revision Sharpen",
    "You are running the Revision Sharpen tool for this user.",
    "Job: cut fluff; one diagnosis, one move.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. One-line diagnosis.",
    "2. One move you made.",
    "3. Sharpened draft.",
    "Direction beats padded volume. Asset tone.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "No overnight-fame. Never invent Jeff niche case studies as doctrine.",
    "",
    "### Evidence binding",
    "Prefer: pr.direction-beats-volume, pr.advice-vs-ego, cl.content-not-ads, tm.content-asset when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the revision",
    "End with one direct question: whether the surviving point still feels true aloud.",
  ].join("\n"),
};
