import type { ModulePack } from "@/lib/modules/types";

/**
 * Boss Brand Brief: founder face as brand; filmable situations for lean personal IP.
 */
export const BOSS_BRAND_BRIEF_PACK: ModulePack = {
  moduleId: "boss-brand-brief",
  intakeFields: [
    {
      id: "role",
      label: "Your role",
      placeholder: "Founder, expert, operator, consultant…",
      required: true,
    },
    {
      id: "audience",
      label: "Audience",
      placeholder: "Who should recognize and trust your face",
      required: true,
    },
    {
      id: "proof",
      label: "One proof point you are willing to show",
      placeholder: "A result, story beat, or craft detail you can film honestly",
      required: true,
      multiline: true,
    },
    {
      id: "topics",
      label: "Topics you can teach without a script team",
      placeholder: "2 to 4 topics you already know cold",
      required: true,
      multiline: true,
    },
  ],
  probeHints: [
    "founder face",
    "boss brand",
    "buy people not product",
    "content asset",
    "personal IP",
    "not ads",
    "老板就是品牌",
    "创始人出镜",
    "买人不是买产品",
    "内容资产",
    "probe_jeff",
  ],
  boundNodeIds: [
    "pr.founder-face-printshop",
    "cl.buy-people-not-product",
    "cl.content-not-ads",
    "pr.advice-vs-ego",
  ],
  starterPrompt:
    "Using my intake, write a short Boss Brand brief: positioning angle, filmable situations, and a simple do / don't list for looking like a brand without looking like an ad.",
  chatOpener:
    "I will write a short Boss Brand brief: founder face as the brand, filmable scenes, do / don't without sliding into ads. What is your role, and who should recognize your face?",
  systemOverlay: [
    "## Module mode: Boss Brand Brief",
    "You are running the Boss Brand Brief tool for this user.",
    "Job: founder face as the brand for lean personal IP, not a big agency campaign.",
    "",
    "### Jeff pivots (must show)",
    "Boss is the brand / founder face. People buy people they trust, not best-product theater.",
    "Content assets are not ads. Advice vs ego on what they show.",
    "ANTI-GENERIC: ban corporate brand-kit fluff. Force filmable situations tied to their face and proof.",
    "",
    "### Conversational collect",
    "Need: role, audience, proof point, teachable topics.",
    "Ask role + audience together if both empty; else proof.",
    "",
    "### Output shape",
    "1. Positioning angle (one paragraph).",
    "2. Filmable situations (4 to 6).",
    "3. Do / don't: brand presence without ad spam or ego flex.",
    "4. Optional sample Reel angle labeled practice draft.",
    "",
    "### Hard bans",
    "Prefer pr.founder-face-printshop, cl.buy-people-not-product, cl.content-not-ads, pr.advice-vs-ego.",
    "Thin industry KB: Generally → Jeff → steer to founder-face / trust / assets.",
    "",
    "### After",
    "Which filmable situation first?",
  ].join("\n"),
};
