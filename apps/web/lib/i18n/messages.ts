/**
 * Chrome copy for Influence Engine Coach.
 * Default locale is zh. Chat model replies still follow Jeff language-match rules.
 */

import type { ModuleCategory } from "@/lib/modules/types";

export type Locale = "zh" | "en";

export type MessageKey =
  | "productName"
  | "productTagline"
  | "navAsk"
  | "navTools"
  | "homeAsk"
  | "homePromise"
  | "pathStart"
  | "pathAsk"
  | "pathTools"
  | "pathJumpReel"
  | "pathJumpStandpoint"
  | "emptyHint"
  | "recommendTitle"
  | "recommendOpen"
  | "example1"
  | "example2"
  | "example3"
  | "composerLabel"
  | "composerPlaceholder"
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
  | "toolsSearchPlaceholder"
  | "toolsEmpty"
  | "toolsFeaturedTitle"
  | "toolsRailsTitle"
  | "toolsBadgeReady"
  | "toolsBadgeSoon"
  | "catIpFoundation"
  | "catGetSeen"
  | "catEarnTrust"
  | "catContentAsset"
  | "catOnCamera"
  | "catConvert"
  | "catPolish"
  | "introJobLabel"
  | "introBringLabel"
  | "introGetLabel"
  | "introStart"
  | "introClose"
  | "introSkip"
  | "introComingSoon"
  | "moduleChatHint"
  | "moduleShowIntro"
  | "moduleLoading"
  | "moduleSoonTitle"
  | "moduleSoonBody"
  | "moduleStartFromIntro"
  | "moduleOpenIntro"
  | "moduleComposerPlaceholder"
  | "footerDisclaimer"
  | "footerWebinar"
  | "localeToggleZh"
  | "localeToggleEn"
  | "localeToggleLabel"
  | "errorNetwork"
  | "errorTimeout"
  | "errorGeneric"
  | "brandMomentTitle"
  | "brandMomentBody"
  | "brandMomentContinue"
  | "brandMomentDismiss";

type MessageTable = Record<MessageKey, string>;

const zh: MessageTable = {
  productName: "Influence Engine Coach",
  productTagline: "个人 IP 教练",
  navAsk: "问 Jeff",
  navTools: "全部工具",
  homeAsk: "今天要做什么 IP 内容？",
  homePromise: "说清楚你今天想做的内容，我会推荐 2 到 4 个合适工具。",
  pathStart: "不确定阶段时再诊断",
  pathAsk: "直接提问",
  pathTools: "浏览全部工具",
  pathJumpReel: "写一条 Reel",
  pathJumpStandpoint: "立一个立场",
  emptyHint: "也可以直接点一个方向：",
  recommendTitle: "推荐工具",
  recommendOpen: "打开工具",
  example1: "我想写一条 IG Reel，讲我怎么帮客户成交。",
  example2: "我想立一个清晰立场，让对的人一眼认出我。",
  example3: "我想把一条长视频改成能建立信任的脚本。",
  composerLabel: "消息",
  composerPlaceholder: "今天要做什么 IP 内容？",
  send: "发送",
  sending: "发送中…",
  thinking: "思考中…",
  roleYou: "你",
  roleJeff: "Jeff",
  sourcesTitle: "引用依据",
  sourcesShow: "展开",
  sourcesHide: "收起",
  sourcesEmpty: "发一条消息后，这里会列出这次回答用到的教学依据。每条 Jeff 回复右上角也有来源芯片。",
  sourcesNoneLabel: "无图谱来源",
  sourcesNoneBody: "这次用的是 Jeff 的方法框架做通用引导，没有点名具体图谱节点。可以换个问法，或去「工具」里选一个命名任务。",
  sourcesChipEmpty: "无图谱来源",
  sourcesChipOne: "1 条依据",
  sourcesChipMany: "{n} 条依据",
  sourcesChipEmptyDetail: "无图谱来源。这次是通用引导：用了 Jeff 的方法框架，该细分主张未点名图谱节点。",
  toolsTitle: "全部工具",
  toolsSubtitle: "按分类浏览命名工具，或直接搜索。自由对话仍在「问 Jeff」。",
  toolsBack: "全部工具",
  toolsSearchPlaceholder: "搜索工具…",
  toolsEmpty: "没有匹配的工具。试试换个关键词，或清空搜索看全部。",
  toolsFeaturedTitle: "常用",
  toolsRailsTitle: "全部分类",
  toolsBadgeReady: "可用",
  toolsBadgeSoon: "即将上线",
  catIpFoundation: "基础定位",
  catGetSeen: "被看见",
  catEarnTrust: "建信任",
  catContentAsset: "内容资产",
  catOnCamera: "上镜教练",
  catConvert: "成交转化",
  catPolish: "打磨润色",
  introJobLabel: "这个工具做什么",
  introBringLabel: "你需要带什么",
  introGetLabel: "你会得到什么",
  introStart: "开始",
  introClose: "关闭",
  introSkip: "下次直接进入，不再显示此介绍",
  introComingSoon: "即将上线",
  moduleChatHint: "在对话里完成。回答 Jeff 的问题即可。",
  moduleShowIntro: "再看介绍",
  moduleLoading: "加载工具…",
  moduleSoonTitle: "即将上线",
  moduleSoonBody: "这个工具已列入菜单，引导对话尚未接通。",
  moduleStartFromIntro: "从介绍开始",
  moduleOpenIntro: "打开介绍",
  moduleComposerPlaceholder: "在这里回复，或说「直接写一版」让我先交稿…",
  footerDisclaimer: "草稿教学图谱，尚未覆盖完整 Jeff 语料。仅供内部试用。",
  footerWebinar: "线上学完整系统",
  localeToggleZh: "中文",
  localeToggleEn: "EN",
  localeToggleLabel: "界面语言",
  errorNetwork: "暂时连不上教练。请检查网络后重试。",
  errorTimeout: "这次回复超时了。请稍后再试，或把问题写短一点。",
  errorGeneric: "这次没能完成回答。请稍后再试。若一直失败，把你的问题和时间告诉搭建方。",
  brandMomentTitle: "Influence Engine Coach",
  brandMomentBody: "把个人 IP 做成市场位置。先说今天要做什么内容，再打开合适工具。",
  brandMomentContinue: "开始",
  brandMomentDismiss: "关闭",
};

const en: MessageTable = {
  productName: "Influence Engine Coach",
  productTagline: "Personal IP coach",
  navAsk: "Ask Jeff",
  navTools: "All Tools",
  homeAsk: "What IP content do you want to make today?",
  homePromise: "Tell me what you want to create today. I will recommend 2 to 4 fitting tools.",
  pathStart: "Stage check if you are stuck",
  pathAsk: "Ask Jeff",
  pathTools: "Browse all tools",
  pathJumpReel: "Write a Reel",
  pathJumpStandpoint: "Build a standpoint",
  emptyHint: "Or try one of these directions:",
  recommendTitle: "Recommended tools",
  recommendOpen: "Open tool",
  example1: "I want an IG Reel about how I help clients close deals.",
  example2: "I want a clear standpoint so the right people recognize me.",
  example3: "I want to turn a long video into a trust-building script.",
  composerLabel: "Message",
  composerPlaceholder: "What IP content do you want to make today?",
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
  toolsSubtitle: "Browse named tools by category, or search. Free chat stays on Ask Jeff.",
  toolsBack: "All Tools",
  toolsSearchPlaceholder: "Search tools…",
  toolsEmpty: "No matching tools. Try another keyword, or clear search to see all.",
  toolsFeaturedTitle: "Popular",
  toolsRailsTitle: "All categories",
  toolsBadgeReady: "Ready",
  toolsBadgeSoon: "Soon",
  catIpFoundation: "Foundation",
  catGetSeen: "Get Seen",
  catEarnTrust: "Earn Trust",
  catContentAsset: "Content Assets",
  catOnCamera: "On-Camera",
  catConvert: "Convert",
  catPolish: "Polish",
  introJobLabel: "What it does",
  introBringLabel: "Bring this",
  introGetLabel: "You get this",
  introStart: "Start",
  introClose: "Close",
  introSkip: "Do not show this again for this tool",
  introComingSoon: "Coming soon",
  moduleChatHint: "Finish in conversation. Answer Jeff's questions as they come.",
  moduleShowIntro: "Show intro",
  moduleLoading: "Loading tool…",
  moduleSoonTitle: "Coming soon",
  moduleSoonBody: "This tool is listed for the menu. Guided chat is not wired yet.",
  moduleStartFromIntro: "Start from the intro",
  moduleOpenIntro: "Open intro",
  moduleComposerPlaceholder: "Reply here, or say just write it if you want a best-effort draft…",
  footerDisclaimer: "Draft teaching graph; not the full Jeff corpus yet. Internal trial only.",
  footerWebinar: "Learn the system live",
  localeToggleZh: "中文",
  localeToggleEn: "EN",
  localeToggleLabel: "UI language",
  errorNetwork: "Could not reach the coach. Check your connection and try again.",
  errorTimeout: "That reply timed out. Wait a moment and try again, or shorten the question.",
  errorGeneric:
    "Could not finish that reply. Try again in a moment. If it keeps failing, send builders your question and the time.",
  brandMomentTitle: "Influence Engine Coach",
  brandMomentBody:
    "Turn personal IP into market position. Say what you want to make today, then open a fitting tool.",
  brandMomentContinue: "Continue",
  brandMomentDismiss: "Close",
};

const TABLES: Record<Locale, MessageTable> = { zh, en };

export const DEFAULT_LOCALE: Locale = "zh";

export const LOCALE_STORAGE_KEY = "ie-coach-locale";

const CATEGORY_KEYS: Record<ModuleCategory, MessageKey> = {
  "IP Foundation": "catIpFoundation",
  "Get Seen": "catGetSeen",
  "Earn Trust": "catEarnTrust",
  "Content Asset System": "catContentAsset",
  "On-Camera Coach": "catOnCamera",
  Convert: "catConvert",
  Polish: "catPolish",
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
