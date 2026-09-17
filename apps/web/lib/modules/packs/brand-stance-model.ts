import type { ModulePack } from "@/lib/modules/types";

/**
 * Brand Stance Model: stakeholder Framework Needed PDF tool.
 * Elevated draft doctrine; not approved.
 */
export const BRAND_STANCE_MODEL_PACK: ModulePack = {
  moduleId: "brand-stance-model",
  intakeFields: [
    {
      id: "standFor",
      label: "What you stand for",
      placeholder: "Belief you will say in public",
      required: true,
      multiline: true,
    },
    {
      id: "standAgainst",
      label: "What you stand against",
      placeholder: "Belief you refuse",
      required: true,
      multiline: true,
    },
    {
      id: "knownForDoing",
      label: "What you are known for doing",
      placeholder: "Repeated public proof (suggested third leg)",
      required: true,
      multiline: true,
    }
  ],
  probeHints: [
    "brand stance",
    "stand for",
    "stand against",
    "known for doing",
    "IP influence triangle",
    "立场",
    "坚持",
    "反对",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.brand-stance-model",
    "fw.ip-influence-triangle",
    "pr.standpoint-or-invisible",
  ],
  starterPrompt:
    "Using my intake, run Brand Stance Model and deliver the structured output for this Jeff tool.",
  chatOpener:
    "I will draft the Brand Stance Model: stand for, stand against, and what you are known for doing. What do you stand for?",
  systemOverlay: [
    "## Module mode: Brand Stance Model",
    "You are running the Brand Stance Model tool (catalog id brand-stance-model) for this user.",
    "Job: Stand for, stand against, and evidence of what you are known for doing. Third leg is suggested until Jeff wording is confirmed.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Stand for.\n2. Stand against.\n3. Known for doing (label as suggested third leg pending Jeff wording).\n4. Map to IP Influence Triangle without overwriting 真实缺口.\n5. Beliefs alone produce commentators; evidence required.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "Bind to the named Jeff framework in boundNodeIds. Labels like Suggested/draft are not confirmed IP. Never invent Jeff niche case studies.",
    "Status suggested/conditional on third leg. Do not present the third leg as approved Jeff IP.",
    "",
    "### Evidence binding",
    "Prefer boundNodeIds when in the evidence pack. Sources still come only from probe / probe_jeff.",
    "",
    "### After",
    "End with one direct next question.",
  ].join("\n"),
};
