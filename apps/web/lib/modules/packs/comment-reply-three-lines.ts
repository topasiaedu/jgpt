import type { ModulePack } from "@/lib/modules/types";

/**
 * 评论回应三句法 (D1 p028). In-thread reply craft only.
 */
export const COMMENT_REPLY_THREE_LINES_PACK: ModulePack = {
  moduleId: "comment-reply-three-lines",
  intakeFields: [
    {
      id: "comment",
      label: "Comment or pushback to answer",
      placeholder: "Paste the comment, DM, or pushback",
      required: true,
      multiline: true,
    },
    {
      id: "standpoint",
      label: "Your standpoint / facts",
      placeholder: "What you believe or know to be true here",
      required: true,
      multiline: true,
    },
    {
      id: "audience",
      label: "Who this content was for",
      placeholder: "The person the original post serves",
      required: true,
    },
    {
      id: "goal",
      label: "Reply goal",
      placeholder: "Teach, clarify, invite, or set a boundary",
      required: false,
    },
  ],
  probeHints: [
    "评论回应三句法",
    "comment reply",
    "接住",
    "澄清",
    "拉回主轴",
    "advice vs ego",
    "standpoint",
    "批评",
    "立场",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.comment-reply-three-lines",
    "pr.advice-vs-ego",
    "pr.standpoint-or-invisible",
    "cl.criticism-not-failure",
  ],
  starterPrompt:
    "Using my intake, draft 评论回应三句法 replies: 接住, 澄清, 拉回主轴 (plus stop-drain / keep-publishing notes when needed).",
  chatOpener:
    "I will draft 评论回应三句法 replies so target customers see your judgment, not a fight. Paste the comment you want to answer.",
  systemOverlay: [
    "## Module mode: 评论回应三句法",
    "You are running the 评论回应三句法 tool for this user.",
    "Exact Jeff slide title (AUG-D1 p028). Job: draft in-thread replies.",
    "Framing: 回应不是为了赢网友，是为了让目标客户看见你的判断.",
    "Slide moves (title says 三句; body lists more): 接住, 澄清, 拉回主轴, 停止消耗, 继续发布.",
    "Do not invent a different formula name. Do not run B.R.E.A.K Shield here; that is a separate module.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Two to three reply drafts using 接住 → 澄清 → 拉回主轴.",
    "2. Note when to 停止消耗 (stop draining) and how to 继续发布 (next content).",
    "3. Mark each draft: teach / clarify / boundary.",
    "",
    "### Jeff distinctiveness (hard)",
    "Advice vs ego. Standpoint. Content assets not ads.",
    "ANTI-GENERIC: If this reply could have come from a generic social media coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "Bind to fw.comment-reply-three-lines. No overnight-fame. Never invent Jeff niche case studies as doctrine.",
    "",
    "### Evidence binding",
    "Prefer: fw.comment-reply-three-lines, pr.advice-vs-ego, pr.standpoint-or-invisible, cl.criticism-not-failure when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the drafts",
    "End with one direct question: which reply they will post.",
  ].join("\n"),
};
