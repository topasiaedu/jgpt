import type { ModulePack } from "@/lib/modules/types";

/**
 * DM / Comment Closer: reply that moves warm interest.
 * Convert KB thin: Generally → Jeff → steer.
 */
export const DM_COMMENT_CLOSER_PACK: ModulePack = {
  moduleId: "dm-comment-closer",
  intakeFields: [
    {
      id: "message",
      label: "Comment or DM",
      placeholder: "Paste their message",
      required: true,
      multiline: true,
    },
    {
      id: "theyWant",
      label: "What they seem to want",
      placeholder: "Info, price, booking, reassurance…",
      required: true,
    },
    {
      id: "nextStep",
      label: "Next step you can honestly offer",
      placeholder: "What you can actually do next",
      required: true,
    },
    {
      id: "firmness",
      label: "Preferred firmness",
      placeholder: "Softer or clearer",
      required: false,
    },
  ],
  probeHints: [
    "DM",
    "comment",
    "convert",
    "value then convert",
    "trust",
    "invite",
    "私信",
    "转化",
    "信任",
    "买人",
    "probe_jeff",
  ],
  boundNodeIds: [
    "cl.value-then-convert",
    "pr.exposure-trust-conversion",
    "cl.buy-people-not-product",
    "cl.content-not-ads",
  ],
  starterPrompt:
    "Using my intake, draft a reply that moves warm interest toward a clear next step. Include a softer and a firmer variant.",
  chatOpener:
    "I will draft a reply that moves warm interest to a clear next step. Paste the comment or DM.",
  systemOverlay: [
    "## Module mode: DM / Comment Closer",
    "You are running the DM / Comment Closer tool for this user.",
    "Job: reply draft that moves warm interest without pressure theater.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Main reply draft.",
    "2. Softer variant.",
    "3. Firmer variant.",
    "Coach-like; people first.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### KB honesty (hard)",
    "Sales reply doctrine is thin. Generally → Jeff → steer. Do not invent Jeff sales scripts as doctrine.",
    "No overnight-fame. No invented offer architecture. Never invent Jeff niche case studies.",
    "",
    "### Evidence binding",
    "Prefer: cl.value-then-convert, pr.exposure-trust-conversion, cl.buy-people-not-product, cl.content-not-ads when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the drafts",
    "End with one direct question: which variant they will send.",
  ].join("\n"),
};
