import type { ModulePack } from "@/lib/modules/types";

/**
 * Brand Stance Model: stakeholder Framework Needed PDF tool.
 * Suggested / conditional: two legs recorded; third leg pending Jeff wording.
 * Prefer AUG IP Influence Triangle 真实缺口 when a real gap exists; do not invent known-for.
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
      id: "realGap",
      label: "真实缺口 / FLAW (optional)",
      placeholder: "If you have a real gap or human side, put it here. Do not invent known-for.",
      required: false,
      multiline: true,
      helpText: "Maps to IP Influence Triangle third leg when present. Not the Suggested known-for doing leg.",
    },
  ],
  probeHints: [
    "brand stance",
    "stand for",
    "stand against",
    "立场",
    "坚持",
    "反对",
    "真实缺口",
    "IP influence triangle",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.brand-stance-model",
    "fw.ip-influence-triangle",
    "pr.standpoint-or-invisible",
  ],
  starterPrompt:
    "Using my intake, draft Brand Stance for / against only. If I named a real gap, map it to 真实缺口. Do not invent known-for doing. Label any third-leg talk as Suggested pending Jeff.",
  chatOpener:
    "I will draft Brand Stance: what you stand for and what you stand against. The Suggested third leg (known for doing) is not confirmed Jeff IP yet. What do you stand for?",
  chatOpenerZh:
    "我会写品牌立场的两腿：坚持什么、反对什么。Suggested 第三腿（known for doing）尚未确认为 Jeff IP。你坚持什么？",
  systemOverlay: [
    "## Module mode: Brand Stance Model (Suggested / conditional)",
    "You are running the Brand Stance Model tool (catalog id brand-stance-model) for this user.",
    "Doctrine status: Suggested / conditional. Two legs are recorded: stand for, stand against.",
    "WARNING: Do NOT teach the Suggested third leg (\"known for doing\") as confirmed Jeff IP.",
    "Jeff may confirm wording later. Until then, collect only stand-for and stand-against for the core deliverable.",
    "",
    "### Third leg rule (hard)",
    "If the user offers a real gap / human side / FLAW, map it to IP Influence Triangle 真实缺口. Do not invent \"known for doing\".",
    "If they ask for known-for: label it Suggested / pending Jeff wording. Refuse to present it as workshop-endorsed doctrine.",
    "Do not overwrite AUG 真实缺口 with the stakeholder recommendation alone.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks: stand for, stand against. Optional real gap only if they have one.",
    "When enough is known, or the user says just write it, deliver the two-leg brief and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Stand for.",
    "2. Stand against.",
    "3. Optional: 真实缺口 if the user supplied a real gap (map to fw.ip-influence-triangle). Else omit.",
    "4. Explicit note: Suggested \"known for doing\" is not confirmed Jeff IP; not required for this deliverable.",
    "5. Beliefs alone produce commentators; if they want evidence later, ask for real public proof without inventing it.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: standpoint; advice vs ego; people buy people.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### Doctrine rules (hard)",
    "Bind fw.brand-stance-model as Suggested/conditional. Prefer fw.ip-influence-triangle when mapping a real gap.",
    "Labels like Suggested/draft are not confirmed IP. Never invent Jeff niche case studies.",
    "",
    "### Evidence binding",
    "Prefer boundNodeIds when in the evidence pack. Sources still come only from probe / probe_jeff.",
    "",
    "### After",
    "End with one direct next question on sharpening stand for or stand against.",
  ].join("\n"),
};
