/**
 * Chrome copy for Influence Engine Coach.
 * Default locale is zh. Assistant replies follow the chosen UI locale (hard lock).
 */

import type { ModuleCategory } from "@/lib/modules/types";

export type Locale = "zh" | "en";

export type MessageKey =
  | "productName"
  | "productTagline"
  | "navTools"
  | "homeAsk"
  | "homePromise"
  | "pathStart"
  | "pathTools"
  | "pathJumpReel"
  | "pathJumpStandpoint"
  | "emptyHint"
  | "recommendTitle"
  | "recommendOpen"
  | "recommendTipVague"
  | "recommendLoading"
  | "recommendError"
  | "recommendTipTooShort"
  | "homeComposerTip"
  | "example1"
  | "example2"
  | "example3"
  | "composerLabel"
  | "composerPlaceholder"
  | "composerPlaceholderCreate"
  | "composerPrefix"
  | "send"
  | "sending"
  | "thinking"
  | "roleYou"
  | "roleJeff"
  | "sourcesTitle"
  | "sourcesShow"
  | "sourcesHide"
  | "sourcesEmpty"
  | "sourcesNoneLabel"
  | "sourcesNoneBody"
  | "sourcesChipEmpty"
  | "sourcesChipOne"
  | "sourcesChipMany"
  | "sourcesChipEmptyDetail"
  | "toolsTitle"
  | "toolsSubtitle"
  | "toolsBack"
  | "toolsBadgeReady"
  | "toolsBadgeSoon"
  | "catIdeation"
  | "catIpPositioning"
  | "catContent"
  | "catTrust"
  | "catConvert"
  | "stageBlurbIdeation"
  | "stageBlurbIpPositioning"
  | "stageBlurbContent"
  | "stageBlurbTrust"
  | "stageBlurbConvert"
  | "introJobLabel"
  | "introBringLabel"
  | "introGetLabel"
  | "introStart"
  | "introClose"
  | "introSkip"
  | "introComingSoon"
  | "moduleShowIntro"
  | "moduleLoading"
  | "moduleSoonTitle"
  | "moduleSoonBody"
  | "moduleStartFromIntro"
  | "moduleOpenIntro"
  | "moduleComposerPlaceholder"
  | "localeToggleZh"
  | "localeToggleEn"
  | "localeToggleLabel"
  | "errorNetwork"
  | "errorTimeout"
  | "errorGeneric";

type MessageTable = Record<MessageKey, string>;

const zh: MessageTable = {
  productName: "Influence Engine Coach",
  productTagline: "个人 IP 教练",
  navTools: "全部工具",
  homeAsk: "今天想创造什么？",
  homePromise: "在下面说出今天要做的内容，合适工具会出现在输入框下方。",
  pathStart: "不确定阶段时再诊断",
  pathTools: "浏览全部工具",
  pathJumpReel: "写一条 Reel",
  pathJumpStandpoint: "立一个立场",
  emptyHint: "也可以点一句话填进输入框：",
  recommendTitle: "推荐工具",
  recommendOpen: "打开工具",
  recommendTipVague: "再说具体一点你要做什么内容，我再给你合适的工具。",
  recommendLoading: "正在匹配工具…",
  recommendError: "现在匹配不到工具。请检查网络后点发送再试一次。",
  recommendTipTooShort: "再多写几个字，说清楚你想做什么内容。",
  homeComposerTip: "提示：说得越具体，下方推荐越准。例如：「一条讲成交的 IG Reel 脚本」",
  example1: "我想写一条 IG Reel，讲我怎么帮客户成交。",
  example2: "我想立一个清晰立场，让对的人一眼认出我。",
  example3: "我想把一条长视频改成能建立信任的脚本。",
  composerLabel: "消息",
  composerPlaceholder: "接着说，或换一个内容任务…",
  composerPlaceholderCreate: "一条 IG 脚本…",
  composerPrefix: "我想做",
  send: "发送",
  sending: "发送中…",
  thinking: "想一下…",
  roleYou: "你",
  roleJeff: "Jeff",
  sourcesTitle: "这次依据",
  sourcesShow: "展开",
  sourcesHide: "收起",
  sourcesEmpty: "发一条消息后，这里会列出这次回答用到的教学依据。每条 Jeff 回复右上角也有来源芯片。",
  sourcesNoneLabel: "没有点名图谱",
  sourcesNoneBody: "这次用的是 Jeff 的方法框架做通用引导，没有点到具体图谱节点。可以换个问法，或去「工具」里选一个具体任务。",
  sourcesChipEmpty: "没有点名图谱",
  sourcesChipOne: "1 条依据",
  sourcesChipMany: "{n} 条依据",
  sourcesChipEmptyDetail: "没有点名图谱。这次是通用引导：用了 Jeff 的方法框架，细分主张没点到具体节点。",
  toolsTitle: "全部工具",
  toolsSubtitle: "按五步旅程挑工具。每个工具都有名字，打开就能开聊。",
  toolsBack: "返回全部工具",
  toolsBadgeReady: "可用",
  toolsBadgeSoon: "快上线",
  catIdeation: "选题构思",
  catIpPositioning: "IP 定位",
  catContent: "内容",
  catTrust: "信任",
  catConvert: "成交",
  stageBlurbIdeation: "先看卡在哪，再长出能拍的选题。",
  stageBlurbIpPositioning: "说清帮谁、你的立场，以及长期教什么。",
  stageBlurbContent: "排资产、写钩子、建内容库，再写出能拍的主片。",
  stageBlurbTrust: "打磨记忆钩子、评论怎么回，以及更长的信任内容。",
  stageBlurbConvert: "信任起来之后，做软邀请，并把报价说清楚。",
  introJobLabel: "这个工具干什么",
  introBringLabel: "你要准备什么",
  introGetLabel: "你会拿到什么",
  introStart: "开始",
  introClose: "关闭",
  introSkip: "下次直接进聊天，不再显示介绍",
  introComingSoon: "快上线",
  moduleShowIntro: "再看介绍",
  moduleLoading: "工具加载中…",
  moduleSoonTitle: "快上线",
  moduleSoonBody: "这个工具已经在菜单里，聊天引导还没接通。",
  moduleStartFromIntro: "从介绍开始",
  moduleOpenIntro: "看介绍",
  moduleComposerPlaceholder: "在这里回我，或直接说「先写一版」…",
  localeToggleZh: "中文",
  localeToggleEn: "EN",
  localeToggleLabel: "界面语言",
  errorNetwork: "教练暂时连不上。检查一下网络，再试一次。",
  errorTimeout: "这次回复超时了。稍后再试，或把问题写短一点。",
  errorGeneric: "这次没答出来。稍后再试。要是一直失败，把问题和大概时间告诉搭建方。",
};

const en: MessageTable = {
  productName: "Influence Engine Coach",
  productTagline: "Personal IP coach",
  navTools: "All Tools",
  homeAsk: "What do you want to create today?",
  homePromise: "Type what you want to make below. Fitting tools appear under the input.",
  pathStart: "Stage check if you are stuck",
  pathTools: "Browse all tools",
  pathJumpReel: "Write a Reel",
  pathJumpStandpoint: "Build a standpoint",
  emptyHint: "Or tap a line to fill the input:",
  recommendTitle: "Recommended tools",
  recommendOpen: "Open tool",
  recommendTipVague: "Say a bit more about what you want to make, then I can suggest tools.",
  recommendLoading: "Matching tools…",
  recommendError: "Could not match tools right now. Check your connection, then tap send to try again.",
  recommendTipTooShort: "Add a few more words about what you want to create.",
  homeComposerTip:
    "Tip: The more details you provide, the better the tools under the input. For example: \"an IG Reel script about closing deals\"",
  example1: "I want an IG Reel about how I help clients close deals.",
  example2: "I want a clear standpoint so the right people recognize me.",
  example3: "I want to turn a long video into a trust-building script.",
  composerLabel: "Message",
  composerPlaceholder: "Keep going, or name another content job…",
  composerPlaceholderCreate: "ig script…",
  composerPrefix: "I want to create a",
  send: "Send",
  sending: "Sending…",
  thinking: "Thinking…",
  roleYou: "You",
  roleJeff: "Jeff",
  sourcesTitle: "Sources used",
  sourcesShow: "Show",
  sourcesHide: "Hide",
  sourcesEmpty:
    "After you send a message, this panel lists the teaching nodes used. Each Jeff bubble also has a sources chip.",
  sourcesNoneLabel: "No graph source",
  sourcesNoneBody:
    "General steer: this reply used Jeff craft framing without naming a graph node. Try a clearer ask, or pick a named job under Tools.",
  sourcesChipEmpty: "No graph source",
  sourcesChipOne: "1 source",
  sourcesChipMany: "{n} sources",
  sourcesChipEmptyDetail:
    "No graph source. General steer: Jeff craft framing only; this niche claim is not cited from the teaching graph.",
  toolsTitle: "All Tools",
  toolsSubtitle: "Browse named tools along the five stage journey.",
  toolsBack: "All Tools",
  toolsBadgeReady: "Ready",
  toolsBadgeSoon: "Soon",
  catIdeation: "Ideation",
  catIpPositioning: "IP Positioning",
  catContent: "Content",
  catTrust: "Trust",
  catConvert: "Convert",
  stageBlurbIdeation: "Diagnose where you are stuck, then generate filmable ideas.",
  stageBlurbIpPositioning: "Clarify who you serve, your standpoint, and your pillars.",
  stageBlurbContent: "Plan assets, hooks, content banks, and a flagship Reel.",
  stageBlurbTrust: "Build memory hooks, comment replies, and longer trust scripts.",
  stageBlurbConvert: "After trust, make soft invites and clarify the offer.",
  introJobLabel: "What it does",
  introBringLabel: "Bring this",
  introGetLabel: "You get this",
  introStart: "Start",
  introClose: "Close",
  introSkip: "Do not show this again for this tool",
  introComingSoon: "Coming soon",
  moduleShowIntro: "Show intro",
  moduleLoading: "Loading tool…",
  moduleSoonTitle: "Coming soon",
  moduleSoonBody: "This tool is listed for the menu. Guided chat is not wired yet.",
  moduleStartFromIntro: "Start from the intro",
  moduleOpenIntro: "Open intro",
  moduleComposerPlaceholder: "Reply here, or say just write it if you want a best-effort draft…",
  localeToggleZh: "中文",
  localeToggleEn: "EN",
  localeToggleLabel: "UI language",
  errorNetwork: "Could not reach the coach. Check your connection and try again.",
  errorTimeout: "That reply timed out. Wait a moment and try again, or shorten the question.",
  errorGeneric:
    "Could not finish that reply. Try again in a moment. If it keeps failing, send builders your question and the time.",
};

const TABLES: Record<Locale, MessageTable> = { zh, en };

export const DEFAULT_LOCALE: Locale = "zh";

export const LOCALE_STORAGE_KEY = "ie-coach-locale";

const CATEGORY_KEYS: Record<ModuleCategory, MessageKey> = {
  Ideation: "catIdeation",
  "IP Positioning": "catIpPositioning",
  Content: "catContent",
  Trust: "catTrust",
  Convert: "catConvert",
};

/**
 * Returns chrome copy for a locale and key.
 * Supports a simple {n} placeholder for count strings.
 */
export function t(locale: Locale, key: MessageKey, vars?: { n?: number }): string {
  const raw = TABLES[locale][key];
  if (vars?.n === undefined) {
    return raw;
  }
  return raw.replace("{n}", String(vars.n));
}

/**
 * Narrows an unknown string to a supported locale.
 */
export function parseLocale(value: string | null | undefined): Locale | null {
  if (value === "zh" || value === "en") {
    return value;
  }
  return null;
}

/**
 * Maps a catalog category to its i18n message key.
 */
export function categoryMessageKey(category: ModuleCategory): MessageKey {
  return CATEGORY_KEYS[category];
}
