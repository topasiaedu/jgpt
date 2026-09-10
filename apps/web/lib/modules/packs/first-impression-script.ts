import type { ModulePack } from "@/lib/modules/types";

/**
 * First Impression Script: event + viewpoint → discussion → traffic.
 * Workshop-angle thin: Generally → Jeff → steer.
 */
export const FIRST_IMPRESSION_SCRIPT_PACK: ModulePack = {
  moduleId: "first-impression-script",
  intakeFields: [
    {
      id: "event",
      label: "Event or moment",
      placeholder: "Talk, launch, news, industry moment…",
      required: true,
    },
    {
      id: "viewpoint",
      label: "Your viewpoint",
      placeholder: "What you believe about it",
      required: true,
      multiline: true,
    },
    {
      id: "audience",
      label: "Who should care",
      placeholder: "Who this first impression is for",
      required: true,
    },
    {
      id: "trafficTarget",
      label: "Where curious people should go",
      placeholder: "Profile, follow, save, soft invite…",
      required: true,
    },
    {
      id: "language",
      label: "Language preference",
      placeholder: "English, Chinese, or mixed",
      required: false,
    },
  ],
  probeHints: [
    "standpoint",
    "get seen",
    "exposure trust",
    "content asset",
    "not ads",
    "first impression",
    "第一印象",
    "立场",
    "观点带流量",
    "信任",
    "probe_jeff",
  ],
  boundNodeIds: [
    "pr.standpoint-or-invisible",
    "pr.exposure-trust-conversion",
    "cl.content-not-ads",
    "rj.overnight-fame",
  ],
  starterPrompt:
    "Using my intake, write a first-impression script: viewpoint, discussion beat, then light traffic invite. Asset tone, not overnight fame.",
  chatOpener:
    "I will write a first-impression script: viewpoint first, then light traffic. What event or moment are you reacting to?",
  systemOverlay: [
    "## Module mode: First Impression Script",
    "You are running the First Impression Script tool for this user.",
    "Job: event or viewpoint → discussion → light traffic toward their space.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Slots live in conversation history. Ask at most 1 to 2 questions per turn.",
    "Prefer Jeff-shaped asks over a generic business questionnaire.",
    "When enough is known, or the user says just write it, deliver the full output and name assumptions.",
    "",
    "### Output format (when ready to generate)",
    "1. Open: event + viewpoint.",
    "2. Discussion beat: invite thinking, not rant-only.",
    "3. Traffic invite: soft, aligned with their target.",
    "4. Optional on-screen text.",
    "",
    "### Jeff distinctiveness (hard)",
    "Use Jeff mechanisms in the user's language: get seen before trust before deal; standpoint; content assets not ads; advice vs ego; direction beats volume; value then convert where relevant.",
    "ANTI-GENERIC: If this reply could have come from a generic LinkedIn coach with no Jeff graph, rewrite before sending.",
    "",
    "### KB honesty (hard)",
    "Specific workshop \"first impression\" playbooks may be thin. Generally → Jeff → steer via standpoint, exposure-trust, content-not-ads.",
    "Reject overnight-fame framing. Never invent Jeff niche case studies as doctrine.",
    "",
    "### Evidence binding",
    "Prefer: pr.standpoint-or-invisible, pr.exposure-trust-conversion, cl.content-not-ads, rj.overnight-fame when in the pack.",
    "Sources still come only from probe / probe_jeff.",
    "",
    "### After the script",
    "End with one direct question about where they will point traffic.",
  ].join("\n"),
};
