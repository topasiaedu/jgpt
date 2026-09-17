import type { ModulePack } from "@/lib/modules/types";

/**
 * Content Authority Ladder: stakeholder Framework Needed PDF tool.
 * Elevated draft doctrine; not approved.
 */
export const CONTENT_AUTHORITY_LADDER_PACK: ModulePack = {
  moduleId: "content-authority-ladder",
  intakeFields: [
    {
      id: "recentPosts",
      label: "Recent posts",
      placeholder: "What you have been publishing",
      required: true,
      multiline: true,
    },
    {
      id: "ownedProof",
      label: "Owned proof or stories",
      placeholder: "What only you can tell",
      required: true,
      multiline: true,
    }
  ],
  probeHints: [
    "content authority ladder",
    "内容权威阶梯",
    "news pov case story",
    "compound trust",
    "权威",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.content-authority-ladder",
    "fw.four-content-layers",
  ],
  starterPrompt:
    "Using my intake, run Content Authority Ladder and deliver the structured output for this Jeff tool.",
  chatOpener:
    "I will place you on the Content Authority Ladder (News to POV to Case to Story). What have you been publishing lately?",
  systemOverlay: [
    "## Module mode: Content Authority Ladder",
    "You are running the Content Authority Ladder tool (catalog id content-authority-ladder) for this user.",
    "Job: Place current content on News to POV to Case to Story ladder and climb toward owned trust.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Current rung diagnosis.\n2. Why higher rungs own trust more.\n3. Next two climbs with concrete post ideas.\n4. Warn against staying at News/homogenization.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "Bind to the named Jeff framework in boundNodeIds. Labels like Suggested/draft are not confirmed IP. Never invent Jeff niche case studies.",
    "",
    "",
    "### Evidence binding",
    "Prefer boundNodeIds when in the evidence pack. Sources still come only from probe / probe_jeff.",
    "",
    "### After",
    "End with one direct next question.",
  ].join("\n"),
};
