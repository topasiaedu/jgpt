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
  | "navStudio"
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
  | "errorGeneric"
  | "brandMomentTitle"
  | "brandMomentBody"
  | "brandMomentContinue"
  | "brandMomentDismiss"
  | "hookStudioTitle"
  | "hookStudioBlurb"
  | "hookStudioProfileLegend"
  | "hookStudioNicheLabel"
  | "hookStudioNichePlaceholder"
  | "hookStudioProofLabel"
  | "hookStudioProofPlaceholder"
  | "hookStudioTopicsLabel"
  | "hookStudioTopicsPlaceholder"
  | "hookStudioModesLabel"
  | "hookStudioModeFromIdea"
  | "hookStudioModeRewrite"
  | "hookStudioModeCompetitor"
  | "hookStudioModeRepeat"
  | "hookStudioIdeaLabel"
  | "hookStudioIdeaPlaceholder"
  | "hookStudioRewriteLabel"
  | "hookStudioRewritePlaceholder"
  | "hookStudioCompetitorLabel"
  | "hookStudioCompetitorPlaceholder"
  | "hookStudioCompetitorHint"
  | "hookStudioRepeatLabel"
  | "hookStudioRepeatPlaceholder"
  | "hookStudioRepeatHint"
  | "hookStudioGenerate"
  | "hookStudioGenerating"
  | "hookStudioTipMissingPrefix"
  | "hookStudioTipMissingJoin"
  | "hookStudioTipMissingSuffix"
  | "hookStudioTipCompetitorMin"
  | "hookStudioTipCompetitorMax"
  | "hookStudioTipRepeatMin"
  | "hookStudioTipRepeatMax"
  | "hookStudioResultsTitle"
  | "hookStudioFallbackTitle"
  | "hookStudioWhyLabel"
  | "hookStudioLegAudience"
  | "hookStudioLegPain"
  | "hookStudioLegContrast"
  | "hookStudioLegCuriosity"
  | "hookStudioRewriteNoteLabel"
  | "hookStudioFilmFirst"
  | "hookStudioCopy"
  | "hookStudioCopied"
  | "hookStudioEmptyHint"
  | "hookStudioErrorGeneric"
  | "hookStudioParseEmpty"
  | "hookStudioOpenStudio"
  | "hookStudioOpenChat"
  | "hookStudioRefineInChat"
  | "hookStudioPageSubtitle";

type MessageTable = Record<MessageKey, string>;

const zh: MessageTable = {
  productName: "Influence Engine Coach",
  productTagline: "个人 IP 教练",
  navTools: "全部工具",
  navStudio: "Hook Studio",
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
  composerPlaceholder: "继续说，或换一个内容任务…",
  composerPlaceholderCreate: "一条 IG 脚本…",
  composerPrefix: "我想做",
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
  toolsSubtitle: "按五步旅程浏览命名工具。",
  toolsBack: "全部工具",
  toolsBadgeReady: "可用",
  toolsBadgeSoon: "即将上线",
  catIdeation: "选题构思",
  catIpPositioning: "IP 定位",
  catContent: "内容",
  catTrust: "信任",
  catConvert: "成交",
  stageBlurbIdeation: "先诊断卡住点，再产出能拍的选题。",
  stageBlurbIpPositioning: "说清帮谁、立场，以及内容支柱。",
  stageBlurbContent: "规划资产、钩子、内容库与可拍主片。",
  stageBlurbTrust: "打磨记忆钩子、评论回应与更长信任内容。",
  stageBlurbConvert: "信任之后，做软邀请并说清报价。",
  introJobLabel: "这个工具做什么",
  introBringLabel: "你需要带什么",
  introGetLabel: "你会得到什么",
  introStart: "开始",
  introClose: "关闭",
  introSkip: "下次直接进入，不再显示此介绍",
  introComingSoon: "即将上线",
  moduleShowIntro: "再看介绍",
  moduleLoading: "加载工具…",
  moduleSoonTitle: "即将上线",
  moduleSoonBody: "这个工具已列入菜单，引导对话尚未接通。",
  moduleStartFromIntro: "从介绍开始",
  moduleOpenIntro: "打开介绍",
  moduleComposerPlaceholder: "在这里回复，或说「直接写一版」让我先交稿…",
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
  hookStudioTitle: "Hook Studio",
  hookStudioBlurb: "填一次档案，选模式，一次生成多条可复制开场。要对话打磨时，点卡片上的「去聊天打磨」。",
  hookStudioProfileLegend: "你的档案",
  hookStudioNicheLabel: "赛道 / 行业",
  hookStudioNichePlaceholder: "例如：美业教练、跨境电商卖家",
  hookStudioProofLabel: "证明 / 资历 / 故事",
  hookStudioProofPlaceholder: "真实经历或结果，不要空喊厉害",
  hookStudioTopicsLabel: "常做内容主题（可选）",
  hookStudioTopicsPlaceholder: "例如：成交、团队、客户案例",
  hookStudioModesLabel: "生成模式",
  hookStudioModeFromIdea: "从点子出发",
  hookStudioModeRewrite: "改写开场",
  hookStudioModeCompetitor: "竞品角度",
  hookStudioModeRepeat: "复用爆款",
  hookStudioIdeaLabel: "内容点子 / 要开场的主题",
  hookStudioIdeaPlaceholder: "这条视频要讲什么？用一句话说清。",
  hookStudioRewriteLabel: "当前开场（或开场 + 正文主题）",
  hookStudioRewritePlaceholder: "贴上现在的钩子；有正文主题也一并贴上。",
  hookStudioCompetitorLabel: "竞品开场样本（一行一条）",
  hookStudioCompetitorPlaceholder:
    "贴上 3 到 10 条竞品开场，一行一条。我们只学停滑机制，不照抄原文。",
  hookStudioCompetitorHint: "至少 3 条，最多 10 条。输出会改写成你的赛道与证明。",
  hookStudioRepeatLabel: "你自己的强开场（一行一条）",
  hookStudioRepeatPlaceholder: "贴上 1 到 5 条你自己用过的强开场，一行一条。保留有效机制，换角度。",
  hookStudioRepeatHint: "至少 1 条，最多 5 条。会换角度与具体度，不做近重复粘贴。",
  hookStudioGenerate: "生成开场",
  hookStudioGenerating: "生成中…",
  hookStudioTipMissingPrefix: "还差：",
  hookStudioTipMissingJoin: "、",
  hookStudioTipMissingSuffix: "。填好后再点生成。",
  hookStudioTipCompetitorMin: "竞品模式请贴至少 3 条开场（一行一条）。",
  hookStudioTipCompetitorMax: "竞品模式一次最多 10 条。请删掉多余行再生成。",
  hookStudioTipRepeatMin: "复用模式请至少贴 1 条你自己的强开场。",
  hookStudioTipRepeatMax: "复用模式一次最多 5 条。请删掉多余行再生成。",
  hookStudioResultsTitle: "本批开场",
  hookStudioFallbackTitle: "本批回复",
  hookStudioWhyLabel: "为什么有效：",
  hookStudioLegAudience: "对象：",
  hookStudioLegPain: "痛点：",
  hookStudioLegContrast: "反差/结果：",
  hookStudioLegCuriosity: "好奇：",
  hookStudioRewriteNoteLabel: "改写说明：",
  hookStudioFilmFirst: "建议先拍这条",
  hookStudioCopy: "复制开场",
  hookStudioCopied: "已复制",
  hookStudioEmptyHint: "填好档案与模式输入后点生成，卡片会出现在这里。",
  hookStudioErrorGeneric: "这次没生成出来。请稍后再试，或改短一点再生成。",
  hookStudioParseEmpty: "模型回了空内容。请再生成一次。",
  hookStudioOpenStudio: "打开 Hook Studio（批量开场）",
  hookStudioOpenChat: "去 Hook Formula 聊天打磨",
  hookStudioRefineInChat: "去聊天打磨",
  hookStudioPageSubtitle: "批量生成可复制开场。聊天打磨在 Hook Formula。",
};

const en: MessageTable = {
  productName: "Influence Engine Coach",
  productTagline: "Personal IP coach",
  navTools: "All Tools",
  navStudio: "Hook Studio",
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
  brandMomentTitle: "Influence Engine Coach",
  brandMomentBody:
    "Turn personal IP into market position. Say what you want to make today, then open a fitting tool.",
  brandMomentContinue: "Continue",
  brandMomentDismiss: "Close",
  hookStudioTitle: "Hook Studio",
  hookStudioBlurb:
    "Fill your profile once, pick a mode, generate several copyable opens. Use Refine in chat on a card when you want Jeff to coach one open.",
  hookStudioProfileLegend: "Your profile",
  hookStudioNicheLabel: "Niche / industry",
  hookStudioNichePlaceholder: "e.g. beauty coach, cross-border seller",
  hookStudioProofLabel: "Proof / credentials / story",
  hookStudioProofPlaceholder: "Real proof or story, not empty hype",
  hookStudioTopicsLabel: "Content topics (optional)",
  hookStudioTopicsPlaceholder: "e.g. closing deals, team, client stories",
  hookStudioModesLabel: "Generate mode",
  hookStudioModeFromIdea: "From idea",
  hookStudioModeRewrite: "Rewrite",
  hookStudioModeCompetitor: "Competitor angle",
  hookStudioModeRepeat: "Repeat a hit",
  hookStudioIdeaLabel: "Content idea / topic to open on",
  hookStudioIdeaPlaceholder: "What is this video about? One clear line.",
  hookStudioRewriteLabel: "Current hook (or hook + body topic)",
  hookStudioRewritePlaceholder: "Paste your current open. Include the body topic if you have it.",
  hookStudioCompetitorLabel: "Competitor sample hooks (one per line)",
  hookStudioCompetitorPlaceholder:
    "Paste 3 to 10 competitor opens, one per line. We study the stop-scroll pattern, not copy wording.",
  hookStudioCompetitorHint: "3 to 10 lines. Outputs rewrite into your niche and proof.",
  hookStudioRepeatLabel: "Your own strong hooks (one per line)",
  hookStudioRepeatPlaceholder:
    "Paste 1 to 5 of your own strong opens, one per line. Keep the mechanism, vary the angle.",
  hookStudioRepeatHint: "1 to 5 lines. We vary angle and specificity, not near-duplicate spam.",
  hookStudioGenerate: "Generate hooks",
  hookStudioGenerating: "Generating…",
  hookStudioTipMissingPrefix: "Still need: ",
  hookStudioTipMissingJoin: ", ",
  hookStudioTipMissingSuffix: ". Fill those, then generate.",
  hookStudioTipCompetitorMin: "Competitor mode needs at least 3 sample hooks (one per line).",
  hookStudioTipCompetitorMax: "Competitor mode allows at most 10 lines. Remove extras, then generate.",
  hookStudioTipRepeatMin: "Repeat mode needs at least 1 of your own strong hooks.",
  hookStudioTipRepeatMax: "Repeat mode allows at most 5 lines. Remove extras, then generate.",
  hookStudioResultsTitle: "This batch",
  hookStudioFallbackTitle: "This batch reply",
  hookStudioWhyLabel: "Why it works: ",
  hookStudioLegAudience: "Audience: ",
  hookStudioLegPain: "Pain: ",
  hookStudioLegContrast: "Contrast / result: ",
  hookStudioLegCuriosity: "Curiosity: ",
  hookStudioRewriteNoteLabel: "Rewrite note: ",
  hookStudioFilmFirst: "Film this one first",
  hookStudioCopy: "Copy hook",
  hookStudioCopied: "Copied",
  hookStudioEmptyHint: "Fill profile and mode input, then generate. Cards show up here.",
  hookStudioErrorGeneric: "That generate did not finish. Try again in a moment, or shorten the input.",
  hookStudioParseEmpty: "The model returned empty content. Generate again.",
  hookStudioOpenStudio: "Open Hook Studio (batch opens)",
  hookStudioOpenChat: "Open Hook Formula chat",
  hookStudioRefineInChat: "Refine in chat",
  hookStudioPageSubtitle: "Batch generate copyable opens. Chat refine lives on Hook Formula.",
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
