import type { ModulePack } from "@/lib/modules/types";

/**
 * IP Stage Check: AUG-D3 SELF DIAGNOSTIC / 自我诊断 (内容还是系统 + six yes/no).
 * Module id kept as ip-stage-check for stable routes and start module.
 * Exposure → trust → deal is secondary steer only, not a replacement for the six checks.
 */
export const IP_STAGE_CHECK_PACK: ModulePack = {
  moduleId: "ip-stage-check",
  intakeFields: [
    {
      id: "context",
      label: "What you do / niche",
      placeholder: "Business, craft, or role in plain words",
      required: true,
    },
    {
      id: "check01",
      label: "Check 01: three content types",
      placeholder: "Yes/no: do you know which three content types fit you best?",
      required: true,
    },
    {
      id: "check02",
      label: "Check 02: four weeks publish",
      placeholder: "Yes/no: stable continuous publishing for four weeks?",
      required: true,
    },
    {
      id: "check03",
      label: "Check 03: traffic / trust / deal roles",
      placeholder: "Yes/no: do you know which content owns traffic, trust, deal?",
      required: true,
    },
    {
      id: "check04",
      label: "Check 04: topic-to-publish flow",
      placeholder: "Yes/no: team (or solo) has topic → script → shoot → edit → publish flow?",
      required: true,
    },
    {
      id: "check05",
      label: "Check 05: weekly data adjust",
      placeholder: "Yes/no: can you adjust weekly from data?",
      required: true,
    },
    {
      id: "check06",
      label: "Check 06: inquire / deliver / deal",
      placeholder: "Yes/no: content already connects inquire, automated delivery, and deal?",
      required: true,
    },
  ],
  probeHints: [
    "自我诊断",
    "内容还是系统",
    "SELF DIAGNOSTIC",
    "连续发布",
    "流量信任成交",
    "选题到发布",
    "exposure trust conversion",
    "direction beats volume",
    "probe_jeff",
  ],
  boundNodeIds: [
    "fw.self-diagnostic",
    "pr.exposure-trust-conversion",
    "pr.direction-beats-volume",
    "rj.volume-equals-money",
    "cl.content-not-ads",
  ],
  starterPrompt:
    "Using my intake, run SELF DIAGNOSTIC / 自我诊断: 内容还是系统, six yes/no checks, then name the unanswered checks as the next stage to fix.",
  chatOpener:
    "I will run SELF DIAGNOSTIC / 自我诊断: do you currently own content, or a system? First check: do you know which three content types fit you best? Yes or no, and a one-line why.",
  chatOpenerZh:
    "我会跑 SELF DIAGNOSTIC / 自我诊断：你现在拥有的，是内容还是系统？第一项：你知道哪三种内容最适合自己吗？先答是或否，并用一句话说明。",
  systemOverlay: [
    "## Module mode: SELF DIAGNOSTIC / 自我诊断 (IP Stage Check)",
    "You are running the IP Stage Check tool (catalog id ip-stage-check) as AUG-D3 SELF DIAGNOSTIC for this user.",
    "Job: Answer the framing question 你现在拥有的，是内容还是系统？ then walk six yes/no checks. Unanswered checks ARE the next stage to fix.",
    "",
    "### Framing (hard)",
    "Open and return to: 内容还是系统 (content vs system readiness).",
    "Do NOT invent primary stage labels like unseen / trust gap / convert gap as the main diagnosis replacing the six checks.",
    "",
    "### Six yes/no checks (exact order; AUG-D3 p130)",
    "01. 知道哪三种内容最适合自己？",
    "02. 稳定连续发布四周？",
    "03. 知道流量/信任/成交分工？ (which content owns traffic, trust, deal)",
    "04. 团队有选题到发布流程？ (topic → script → shoot → edit → publish; solo counts if the flow exists)",
    "05. 每周能按数据调整？",
    "06. 内容已接询问/自动化交付/成交？ (inquire path, delivery automation, deal; do not invent ManyChat as required doctrine)",
    "Slide close: 答不出的地方，就是下一阶段最需要解决的问题.",
    "",
    "### Conversational collect (chat-first; no form)",
    "Need enough context to score the six checks. Ask 1 to 2 questions per turn.",
    "Prefer yes/no + one-line evidence. If they already answered a check, do not re-ask it.",
    "When enough is known, or the user says just write it, deliver the full diagnostic and name assumptions.",
    "",
    "### Output shape (scaffold; must track their answers)",
    "1. Framing call: closer to 内容 or 系统, with 1 to 2 sentences grounded in their facts.",
    "2. Scorecard: each of 01 to 06 as Yes / No / Unclear, plus a short cite of their words.",
    "3. Next stage: the unanswered (No/Unclear) checks, in priority order. That list IS the next work. Do not replace it with a canned module roulette.",
    "4. Optional secondary steer only AFTER the scorecard: if useful, map one unanswered check lightly onto get seen → trust → deal (曝光→信任→成交). Never let ETC stage labels replace the six checks.",
    "5. At most one optional next tool name, and only if it clearly helps the top unanswered check. Prefer naming the check to fix over listing many modules.",
    "",
    "### Soft next-step rule (hard)",
    "Ban spinning a random next-module roulette (Standpoint Builder, Boss Brand Brief, Lean IP Setup, IG Reel Script, …) as the default ending.",
    "Default next step = the highest-priority unanswered diagnostic check, stated as a concrete action.",
    "",
    "### Hard bans",
    "No overnight-fame. No inventing niche Jeff cases. Prefer fw.self-diagnostic; also pr.exposure-trust-conversion, pr.direction-beats-volume, rj.volume-equals-money, cl.content-not-ads when relevant.",
    "Thin: Generally → Jeff → steer.",
    "",
    "### After",
    "One question that locks the top unanswered check they will fix next.",
  ].join("\n"),
};
