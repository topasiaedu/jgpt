import type { ModulePack } from "@/lib/modules/types";

/**
 * Six Caption Angles: stakeholder Framework Needed PDF tool.
 * Elevated draft doctrine; not approved.
 */
export const SIX_CAPTION_ANGLES_PACK: ModulePack = {
  moduleId: "six-caption-angles",
  intakeFields: [
    {
      id: "videoPoint",
      label: "What the video already does",
      placeholder: "Core point of the video",
      required: true,
      multiline: true,
    },
    {
      id: "audienceFeeling",
      label: "Unspoken audience feeling",
      placeholder: "What they will not say out loud",
      required: true,
      multiline: true,
    }
  ],
  probeHints: [
    "six caption angles",
    "one line caption",
    "sore point",
    "myth",
    "caption",
    "字幕",
    "一句话",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.six-caption-angles",
  ],
  starterPrompt:
    "Using my intake, run Six Caption Angles and deliver the structured output for this Jeff tool.",
  chatOpener:
    "I will write Six Caption Angles as one-liners under the video. What does the video already do, in one breath?",
  systemOverlay: [
    "## Module mode: Six Caption Angles",
    "You are running the Six Caption Angles tool (catalog id six-caption-angles) for this user.",
    "Job: Write one-line captions in six angles. Video does the work; captions do not compete.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Six one-line captions (sore point, argument, myth, flat statement, turn, plain account).\n2. Mark the strongest for unspoken feeling.\n3. Ban long caption essays.",
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
