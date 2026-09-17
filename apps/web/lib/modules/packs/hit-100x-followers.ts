import type { ModulePack } from "@/lib/modules/types";

/**
 * What Counts as a Hit (100x): stakeholder Framework Needed PDF tool.
 * Elevated draft doctrine; not approved.
 */
export const HIT_100X_FOLLOWERS_PACK: ModulePack = {
  moduleId: "hit-100x-followers",
  intakeFields: [
    {
      id: "followers",
      label: "Follower count",
      placeholder: "Approximate followers now",
      required: true,
    },
    {
      id: "recentViews",
      label: "Recent view numbers",
      placeholder: "A few recent posts",
      required: true,
      multiline: true,
    },
    {
      id: "goal",
      label: "What you want next",
      placeholder: "More hits, diagnose misses, or turn a hit into a series",
      required: true,
    }
  ],
  probeHints: [
    "100x",
    "hit",
    "一百倍就是爆款",
    "followers",
    "views",
    "爆款",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.hit-100x-followers",
  ],
  starterPrompt:
    "Using my intake, run What Counts as a Hit (100x) and deliver the structured output for this Jeff tool.",
  chatOpener:
    "I will use the 100 times followers hit definition. About how many followers do you have right now?",
  systemOverlay: [
    "## Module mode: What Counts as a Hit (100x)",
    "You are running the What Counts as a Hit (100x) tool (catalog id hit-100x-followers) for this user.",
    "Job: Define hit as 100 times followers, diagnose if they never clear it, and plan series when one lands.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Hit threshold for their count.\n2. Which recent posts cleared or missed.\n3. Diagnose misses (opening, positioning, or other).\n4. If a hit landed: how to turn it into a series.",
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
