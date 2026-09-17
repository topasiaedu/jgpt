import type { ModulePack } from "@/lib/modules/types";

/**
 * The 4 Content Layers: stakeholder Framework Needed PDF tool.
 * Elevated draft doctrine; not approved.
 */
export const FOUR_CONTENT_LAYERS_PACK: ModulePack = {
  moduleId: "four-content-layers",
  intakeFields: [
    {
      id: "whoYouServe",
      label: "Who you serve",
      placeholder: "Audience",
      required: true,
    },
    {
      id: "proofAvailable",
      label: "Proof you can show",
      placeholder: "Cases, results, stories you actually have",
      required: true,
      multiline: true,
    },
    {
      id: "weekGoal",
      label: "This week goal",
      placeholder: "Mix of layers you need",
      required: false,
    }
  ],
  probeHints: [
    "4 content layers",
    "story case pov news",
    "content layers",
    "四种内容层",
    "故事",
    "案例",
    "观点",
    "新闻",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.four-content-layers",
    "fw.content-authority-ladder",
  ],
  starterPrompt:
    "Using my intake, run The 4 Content Layers and deliver the structured output for this Jeff tool.",
  chatOpener:
    "I will plan The 4 Content Layers (Story, Case, POV, News). Who do you serve?",
  systemOverlay: [
    "## Module mode: The 4 Content Layers",
    "You are running the The 4 Content Layers tool (catalog id four-content-layers) for this user.",
    "Job: Plan posts across Story, Case, POV, News. Not the same as 四种内容资产 (曝光/认知/信任/成交).",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Story ideas.\n2. Case ideas.\n3. POV ideas.\n4. News/relevance ideas.\n5. Line: Lead with Story. Prove with Case. Differentiate with POV. Borrow attention from News.\n6. Explicitly not 四种内容资产.",
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
