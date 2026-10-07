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
  | "navBrandProfiles"
  | "navAccount"
  | "navSignIn"
  | "navSignOut"
  | "navSignedInAs"
  | "navPrimaryLabel"
  | "navAccountLabel"
  | "authTitle"
  | "authSubtitle"
  | "authSignIn"
  | "authSignUp"
  | "authSwitchToSignUpBefore"
  | "authSwitchToSignUpAction"
  | "authSwitchToSignInBefore"
  | "authSwitchToSignInAction"
  | "authEmail"
  | "authPassword"
  | "authConfirmPassword"
  | "authPasswordMismatch"
  | "authReferralCode"
  | "authReferralInvalid"
  | "authWorking"
  | "authEnvMissing"
  | "authEmailInvalid"
  | "authPasswordShort"
  | "authSignInFailed"
  | "authSignUpFailed"
  | "authConfirmEmail"
  | "authAlreadySignedIn"
  | "authSignUpTitle"
  | "authSignUpSubtitle"
  | "authForgotLink"
  | "authForgotTitle"
  | "authForgotSubtitle"
  | "authForgotSubmit"
  | "authForgotSent"
  | "authForgotFailed"
  | "authBackToSignIn"
  | "authResetTitle"
  | "authResetSubtitle"
  | "authResetPassword"
  | "authResetConfirm"
  | "authResetSubmit"
  | "authResetSuccess"
  | "authResetFailed"
  | "authResetMismatch"
  | "authResetNeedSession"
  | "authLinkInvalid"
  | "accountTitle"
  | "accountSubtitle"
  | "accountEmailLabel"
  | "accountEmailMissing"
  | "accountPasswordTitle"
  | "accountPasswordHint"
  | "accountCurrentPassword"
  | "accountCurrentPasswordRequired"
  | "accountCurrentPasswordWrong"
  | "accountNewPassword"
  | "accountConfirmPassword"
  | "accountPasswordSave"
  | "accountPasswordSaved"
  | "accountPasswordFailed"
  | "accountPasswordUnchanged"
  | "accountPasswordNeedEmail"
  | "accountNeedSignIn"
  | "bpListTitle"
  | "bpListSubtitle"
  | "bpLoading"
  | "bpCreateTitle"
  | "bpNameLabel"
  | "bpNamePlaceholder"
  | "bpNameRequired"
  | "bpCreateCta"
  | "bpCreating"
  | "bpCreatePageSubtitle"
  | "bpCreateSubmit"
  | "bpCreateDocsLater"
  | "bpCardEmpty"
  | "bpEmptyTitle"
  | "bpEmptyBody"
  | "bpYourProfiles"
  | "bpActiveBadge"
  | "bpSetActive"
  | "bpSavingActive"
  | "bpOpenEdit"
  | "bpEditTitle"
  | "bpEditSubtitle"
  | "bpBackToList"
  | "bpStructuredTitle"
  | "bpStructuredHint"
  | "bpBriefTitle"
  | "bpBriefHint"
  | "bpBriefCount"
  | "bpBriefTooLong"
  | "bpSave"
  | "bpSaving"
  | "bpSaved"
  | "bpActiveSaved"
  | "bpDelete"
  | "bpDeleteShort"
  | "bpDeleting"
  | "bpDeleteConfirm"
  | "bpDocsTitle"
  | "bpDocsHint"
  | "bpDocsUploadCta"
  | "bpDocsUploading"
  | "bpDocsPasteLabel"
  | "bpDocsPastePlaceholder"
  | "bpDocsPasteCta"
  | "bpDocsPasteEmpty"
  | "bpDocsPasteTooLong"
  | "bpDocsFileTooLarge"
  | "bpDocsTooMany"
  | "bpDocsQuotaHint"
  | "bpDocsLoading"
  | "bpDocsEmpty"
  | "bpDocsUntitled"
  | "bpDocsStatusPending"
  | "bpDocsStatusReady"
  | "bpDocsStatusFailed"
  | "bpDocsProcessing"
  | "bpDocsReady"
  | "bpDocsDeleted"
  | "bpDocsDelete"
  | "bpDocsDeleteConfirm"
  | "bpDocsRetry"
  | "bpDocsResummarize"
  | "bpDocsResummarized"
  | "bpDocsBriefUpdated"
  | "bpFieldBusinessName"
  | "bpFieldWhatTheySell"
  | "bpFieldWhoTheyServe"
  | "bpFieldFounderRoleFace"
  | "bpFieldStance"
  | "bpFieldProofCredentials"
  | "bpFieldOfferCta"
  | "bpFieldToneNotes"
  | "bpFieldDoNotSay"
  | "bpHintBusinessName"
  | "bpHintWhatTheySell"
  | "bpHintWhoTheyServe"
  | "bpHintFounderRoleFace"
  | "bpHintStance"
  | "bpHintProofCredentials"
  | "bpHintOfferCta"
  | "bpHintToneNotes"
  | "bpHintDoNotSay"
  | "profileModalTitle"
  | "profileModalUse"
  | "profileModalSkip"
  | "profileModalCreate"
  | "profileModalEmpty"
  | "profileModalLoading"
  | "profileModalClose"
  | "histTitle"
  | "histNewChat"
  | "histUngrouped"
  | "histUngroup"
  | "histLoading"
  | "histError"
  | "histEmpty"
  | "histEmptyFolder"
  | "histMoveToFolder"
  | "histCreateFolder"
  | "histCreateFolderTitle"
  | "histCreateFolderSubmit"
  | "histCreateSubfolder"
  | "histCreateSubfolderTitle"
  | "histFolderNamePlaceholder"
  | "histFolderNameRequired"
  | "histRenameFolder"
  | "histDeleteFolder"
  | "histDeleteFolderConfirm"
  | "histFoldersHint"
  | "histFilterHint"
  | "histOpenHistory"
  | "histCloseHistory"
  | "histSaveFailed"
  | "histRetry"
  | "histRenameChat"
  | "histDeleteChat"
  | "histDeleteChatConfirm"
  | "histChatTitlePlaceholder"
  | "histChatTitleRequired"
  | "histCancel"
  | "histChatActions"
  | "histFolderActions"
  | "histFolderExpand"
  | "histFolderCollapse"
  | "histFolderColor"
  | "histFolderParent"
  | "histFolderParentNone"
  | "histFolderColorCoral"
  | "histFolderColorAmber"
  | "histFolderColorLime"
  | "histFolderColorTeal"
  | "histFolderColorSky"
  | "histFolderColorViolet"
  | "histFolderColorRose"
  | "histFolderColorSlate";

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
  sourcesEmpty: "发一条消息后，这里会列出这次回答用到的教学依据。",
  sourcesNoneLabel: "没有点名图谱",
  sourcesNoneBody: "这次用的是 Jeff 的方法框架做通用引导，没有点到具体图谱节点。可以换个问法，或去「工具」里选一个具体任务。",
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
  navBrandProfiles: "我的品牌",
  navAccount: "账号",
  navSignIn: "登录",
  navSignOut: "退出登录",
  navSignedInAs: "已登录",
  navPrimaryLabel: "主导航",
  navAccountLabel: "账号",
  authTitle: "登录",
  authSubtitle: "用邮箱和密码保存你的工作。",
  authSignIn: "登录",
  authSignUp: "注册",
  authSwitchToSignUpBefore: "还没有账号？",
  authSwitchToSignUpAction: "点这里注册",
  authSwitchToSignInBefore: "已经有账号了？",
  authSwitchToSignInAction: "去登录",
  authEmail: "邮箱",
  authPassword: "密码",
  authConfirmPassword: "再输入一次密码",
  authPasswordMismatch: "两次密码不一样，再对一下。",
  authReferralCode: "推荐码（选填）",
  authReferralInvalid: "推荐码太长或有奇怪字符。用字母和数字就行，也可以不填。",
  authWorking: "处理中…",
  authEnvMissing:
    "还没配好 Supabase。请在 apps/web/.env.local 填上 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY。",
  authEmailInvalid: "请先填一个有效邮箱。",
  authPasswordShort: "密码至少 6 位。",
  authSignInFailed: "登录失败。检查邮箱密码，或稍后再试。",
  authSignUpFailed: "注册失败。换个邮箱试试，或稍后再试。",
  authConfirmEmail: "注册成功。如果项目开了邮箱确认，请先去邮箱点确认，再回来登录。",
  authAlreadySignedIn: "你已经登录了，正在跳转…",
  authSignUpTitle: "注册",
  authSignUpSubtitle: "新建账号，保存你的品牌档案。",
  authForgotLink: "忘记密码？",
  authForgotTitle: "重置密码",
  authForgotSubtitle: "填邮箱，我们发一条重置链接给你。",
  authForgotSubmit: "发送重置链接",
  authForgotSent: "如果这个邮箱有账号，重置链接已经发出。去邮箱点开就行。",
  authForgotFailed: "发送失败。稍后再试，或换个邮箱。",
  authBackToSignIn: "回到登录",
  authResetTitle: "设置新密码",
  authResetSubtitle: "输入新密码，确认后再保存。",
  authResetPassword: "新密码",
  authResetConfirm: "再输入一次",
  authResetSubmit: "保存新密码",
  authResetSuccess: "密码已更新。正在带你继续…",
  authResetFailed: "更新密码失败。稍后再试，或重新申请重置链接。",
  authResetMismatch: "两次密码不一样，再对一下。",
  authResetNeedSession: "重置链接失效了，或还没点开邮件。请重新申请一条。",
  authLinkInvalid: "这个登录或重置链接无效。请重新申请，或再登录一次。",
  accountTitle: "账号",
  accountSubtitle: "改密码。要管品牌去「我的品牌」。",
  accountEmailLabel: "邮箱",
  accountEmailMissing: "未绑定邮箱",
  accountPasswordTitle: "改密码",
  accountPasswordHint: "先填当前密码，再设新密码。",
  accountCurrentPassword: "当前密码",
  accountCurrentPasswordRequired: "请先填当前密码。",
  accountCurrentPasswordWrong: "当前密码不对。再试一次。",
  accountNewPassword: "新密码",
  accountConfirmPassword: "再输入一次新密码",
  accountPasswordSave: "更新密码",
  accountPasswordSaved: "密码已更新。",
  accountPasswordFailed: "密码没改成。稍后再试。",
  accountPasswordUnchanged: "新密码要和当前密码不一样。",
  accountPasswordNeedEmail: "这个账号没有邮箱，没法在这里改密码。",
  accountNeedSignIn: "请先登录再改账号设置。",
  bpListTitle: "我的品牌",
  bpListSubtitle: "一个账号可以管多个客户档案。每次聊天在工具里选要用的那份。",
  bpLoading: "加载中…",
  bpCreateTitle: "新建品牌档案",
  bpCreatePageSubtitle: "名称、事实、简报一次填完。资料文件要等保存之后再传。",
  bpCreateSubmit: "创建这份档案",
  bpCreateDocsLater: "资料文件会在创建成功后，到编辑页再上传。",
  bpCardEmpty: "还没填",
  bpNameLabel: "档案名称",
  bpNamePlaceholder: "例如：客户 A / 自己的品牌",
  bpNameRequired: "先写一个档案名称。",
  bpCreateCta: "创建",
  bpCreating: "创建中…",
  bpEmptyTitle: "还没有品牌档案",
  bpEmptyBody: "点右边的创建，把这一页填完就行。",
  bpYourProfiles: "我的档案",
  bpActiveBadge: "当前使用",
  bpSetActive: "设为当前",
  bpSavingActive: "保存中…",
  bpOpenEdit: "改",
  bpEditTitle: "编辑品牌档案",
  bpEditSubtitle: "填客户事实、上传资料，生成可编辑的简报。",
  bpBackToList: "返回品牌档案",
  bpStructuredTitle: "结构化字段",
  bpStructuredHint: "能填的先填。空着也行，后面还能改。",
  bpBriefTitle: "当前简报",
  bpBriefHint: "聊天会一直看到这段（上限约 2500 字）。上传后可自动生成，你也能手改。",
  bpBriefCount: "已用 {n} / 2500 字",
  bpBriefTooLong: "简报太长了，请压到 2500 字以内。",
  bpSave: "保存",
  bpSaving: "保存中…",
  bpSaved: "已保存。",
  bpActiveSaved: "已设为当前使用的档案。",
  bpDelete: "删除档案",
  bpDeleteShort: "删掉",
  bpDeleting: "删除中…",
  bpDeleteConfirm: "要删掉 {name} 吗？删了就不能恢复。",
  bpDocsTitle: "资料文件",
  bpDocsHint: "上传 PDF / PPTX / txt / md，或粘贴文本。处理完成后会更新简报（不会把全文塞进聊天）。",
  bpDocsUploadCta: "上传文件",
  bpDocsUploading: "上传中…",
  bpDocsPasteLabel: "粘贴文本",
  bpDocsPastePlaceholder: "例如：一句证明、产品说明、客户原话。",
  bpDocsPasteCta: "保存粘贴并处理",
  bpDocsPasteEmpty: "先粘贴一点文字。",
  bpDocsPasteTooLong: "粘贴太长了，请缩短后再试。",
  bpDocsFileTooLarge: "文件太大，单文件上限约 40MB。",
  bpDocsTooMany: "这个档案的资料数量已满，请先删除一份。",
  bpDocsQuotaHint: "单文件约 40MB；每个档案最多 20 份资料。",
  bpDocsLoading: "加载资料列表…",
  bpDocsEmpty: "还没有资料。先上传或粘贴一份。",
  bpDocsUntitled: "未命名资料",
  bpDocsStatusPending: "处理中",
  bpDocsStatusReady: "已就绪",
  bpDocsStatusFailed: "失败",
  bpDocsProcessing: "正在提取、切块并生成简报…",
  bpDocsReady: "资料已就绪，简报已更新。",
  bpDocsDeleted: "资料已删除。",
  bpDocsDelete: "删除",
  bpDocsDeleteConfirm: "确定删除这份资料？相关切块也会删掉。",
  bpDocsRetry: "重试处理",
  bpDocsResummarize: "重新生成简报",
  bpDocsResummarized: "简报已按现有资料重写。",
  bpDocsBriefUpdated: "简报与结构化字段已更新。可继续手改后保存。",
  bpFieldBusinessName: "品牌 / 公司名",
  bpFieldWhatTheySell: "卖什么",
  bpFieldWhoTheyServe: "服务谁",
  bpFieldFounderRoleFace: "创始人角色 / 出镜人",
  bpFieldStance: "立场",
  bpFieldProofCredentials: "证明 / 资历",
  bpFieldOfferCta: "产品与行动号召",
  bpFieldToneNotes: "语气备注",
  bpFieldDoNotSay: "不要说什么",
  bpHintBusinessName: "对外怎么称呼这个品牌。",
  bpHintWhatTheySell: "产品、服务、交付是什么。",
  bpHintWhoTheyServe: "理想客户是谁。",
  bpHintFounderRoleFace: "谁出镜、扮演什么角色。",
  bpHintStance: "站在哪一边，反对什么。",
  bpHintProofCredentials: "凭什么信你：案例、数字、身份。",
  bpHintOfferCta: "卖什么套餐，希望对方做什么。",
  bpHintToneNotes: "说话风格、禁区语气。",
  bpHintDoNotSay: "绝对不要提的说法或承诺。",
  profileModalTitle: "用哪个档案？",
  profileModalUse: "用这个档案",
  profileModalSkip: "先不选档案",
  profileModalCreate: "去建个档案",
  profileModalEmpty: "还没有档案。去档案页建一个，或者先不选。",
  profileModalLoading: "正在加载档案…",
  profileModalClose: "关闭",
  histTitle: "最近对话",
  histNewChat: "新对话",
  histUngrouped: "没放文件夹",
  histUngroup: "从文件夹拿出来",
  histLoading: "在加载…",
  histError: "对话没加载出来。",
  histEmpty: "还没有对话",
  histEmptyFolder: "这个文件夹是空的。",
  histMoveToFolder: "放到文件夹",
  histCreateFolder: "加文件夹",
  histCreateFolderTitle: "加文件夹",
  histCreateFolderSubmit: "加好",
  histCreateSubfolder: "加子文件夹",
  histCreateSubfolderTitle: "加子文件夹",
  histFolderNamePlaceholder: "文件夹名字",
  histFolderNameRequired: "先写个文件夹名字。",
  histRenameFolder: "改名字",
  histDeleteFolder: "删掉文件夹",
  histDeleteFolderConfirm: "要删这个文件夹吗？里面的子文件夹也会删掉。对话还在，会回到「没放文件夹」。",
  histFoldersHint: "文件夹用来按项目收纳对话，不是「我的品牌」。",
  histFilterHint: "这里汇总你在各工具里的对话。点开就能继续聊。",
  histOpenHistory: "对话",
  histCloseHistory: "收起",
  histSaveFailed: "这一轮没存上。屏幕上的回复还在。",
  histRetry: "再试一次",
  histRenameChat: "改名字",
  histDeleteChat: "删掉",
  histDeleteChatConfirm: "要删掉这个对话吗？删了就回不来了。",
  histChatTitlePlaceholder: "对话名字",
  histChatTitleRequired: "先写个对话名字。",
  histCancel: "取消",
  histChatActions: "对话选项",
  histFolderActions: "文件夹选项",
  histFolderExpand: "展开文件夹",
  histFolderCollapse: "收起文件夹",
  histFolderColor: "颜色",
  histFolderParent: "放到哪个文件夹下面",
  histFolderParentNone: "最外层",
  histFolderColorCoral: "珊瑚橙",
  histFolderColorAmber: "琥珀黄",
  histFolderColorLime: "嫩绿",
  histFolderColorTeal: "青蓝",
  histFolderColorSky: "天蓝",
  histFolderColorViolet: "紫",
  histFolderColorRose: "玫红",
  histFolderColorSlate: "灰蓝",
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
  sourcesEmpty: "After you send a message, this panel lists the teaching nodes used.",
  sourcesNoneLabel: "No graph source",
  sourcesNoneBody:
    "General steer: this reply used Jeff craft framing without naming a graph node. Try a clearer ask, or pick a named job under Tools.",
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
  navBrandProfiles: "Brand profile",
  navAccount: "Account",
  navSignIn: "Sign in",
  navSignOut: "Sign out",
  navSignedInAs: "Signed in",
  navPrimaryLabel: "Primary",
  navAccountLabel: "Account",
  authTitle: "Sign in",
  authSubtitle: "Use email and password to save your work.",
  authSignIn: "Sign in",
  authSignUp: "Sign up",
  authSwitchToSignUpBefore: "Don't have an account?",
  authSwitchToSignUpAction: "Sign up here",
  authSwitchToSignInBefore: "Already have an account?",
  authSwitchToSignInAction: "Sign in",
  authEmail: "Email",
  authPassword: "Password",
  authConfirmPassword: "Confirm password",
  authPasswordMismatch: "Those two passwords do not match. Check them again.",
  authReferralCode: "Referral code (optional)",
  authReferralInvalid:
    "That referral code is too long or has extra characters. Use letters and numbers, or leave it blank.",
  authWorking: "Working…",
  authEnvMissing:
    "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/web/.env.local.",
  authEmailInvalid: "Enter a valid email first.",
  authPasswordShort: "Password must be at least 6 characters.",
  authSignInFailed: "Sign in failed. Check email and password, or try again later.",
  authSignUpFailed: "Sign up failed. Try another email, or try again later.",
  authConfirmEmail:
    "Sign up succeeded. If email confirmation is on, confirm in your inbox, then sign in here.",
  authAlreadySignedIn: "You are already signed in. Redirecting…",
  authSignUpTitle: "Sign up",
  authSignUpSubtitle: "Create an account to save your brand profiles.",
  authForgotLink: "Forgot password?",
  authForgotTitle: "Reset password",
  authForgotSubtitle: "Enter your email and we will send a reset link.",
  authForgotSubmit: "Send reset link",
  authForgotSent:
    "If that email has an account, the reset link is on its way. Open it from your inbox.",
  authForgotFailed: "Could not send the link. Try again later, or use another email.",
  authBackToSignIn: "Back to sign in",
  authResetTitle: "Set a new password",
  authResetSubtitle: "Enter a new password, then confirm it.",
  authResetPassword: "New password",
  authResetConfirm: "Confirm password",
  authResetSubmit: "Save new password",
  authResetSuccess: "Password updated. Taking you onward…",
  authResetFailed: "Could not update the password. Try again, or request a new reset link.",
  authResetMismatch: "Those passwords do not match. Check them again.",
  authResetNeedSession:
    "This reset link is expired or was not opened. Request a new one.",
  authLinkInvalid: "That sign in or reset link is invalid. Request a new one, or sign in again.",
  accountTitle: "Account",
  accountSubtitle: "Change your password. Brand profiles live under Brand profile.",
  accountEmailLabel: "Email",
  accountEmailMissing: "No email on this account",
  accountPasswordTitle: "Change password",
  accountPasswordHint: "Enter your current password, then set a new one.",
  accountCurrentPassword: "Current password",
  accountCurrentPasswordRequired: "Enter your current password first.",
  accountCurrentPasswordWrong: "That current password is wrong. Try again.",
  accountNewPassword: "New password",
  accountConfirmPassword: "Confirm new password",
  accountPasswordSave: "Update password",
  accountPasswordSaved: "Password updated.",
  accountPasswordFailed: "Could not update the password. Try again later.",
  accountPasswordUnchanged: "The new password must be different from the current one.",
  accountPasswordNeedEmail: "This account has no email, so password change is unavailable here.",
  accountNeedSignIn: "Sign in first to change account settings.",
  bpListTitle: "Brand profiles",
  bpListSubtitle: "One account can keep many client profiles. Each chat picks the one it needs.",
  bpLoading: "Loading…",
  bpCreateTitle: "New Brand profile",
  bpCreatePageSubtitle: "Fill the name, facts, and brief in one go. Add documents after it is saved.",
  bpCreateSubmit: "Create this profile",
  bpCreateDocsLater: "Documents upload after create, on the edit page.",
  bpCardEmpty: "Not filled yet",
  bpNameLabel: "Profile name",
  bpNamePlaceholder: "e.g. Client A / my brand",
  bpNameRequired: "Enter a profile name first.",
  bpCreateCta: "Create",
  bpCreating: "Creating…",
  bpEmptyTitle: "No Brand profiles yet",
  bpEmptyBody: "Use Create on the right and fill the page in one go.",
  bpYourProfiles: "Your profiles",
  bpActiveBadge: "Active",
  bpSetActive: "Set active",
  bpSavingActive: "Saving…",
  bpOpenEdit: "Edit",
  bpEditTitle: "Edit Brand profile",
  bpEditSubtitle: "Fill client facts, upload materials, and generate an editable brief.",
  bpBackToList: "Back to Brand profiles",
  bpStructuredTitle: "Structured fields",
  bpStructuredHint: "Fill what you know. Empty is fine; you can edit later.",
  bpBriefTitle: "Active brief",
  bpBriefHint: "Chat always sees this block (about 2500 characters max). Upload can generate it; you can still edit.",
  bpBriefCount: "{n} / 2500 characters",
  bpBriefTooLong: "Brief is too long. Keep it within 2500 characters.",
  bpSave: "Save",
  bpSaving: "Saving…",
  bpSaved: "Saved.",
  bpActiveSaved: "Set as the active Brand profile.",
  bpDelete: "Delete profile",
  bpDeleteShort: "Delete",
  bpDeleting: "Deleting…",
  bpDeleteConfirm: "Delete {name}? This cannot be undone.",
  bpDocsTitle: "Documents",
  bpDocsHint:
    "Upload PDF / PPTX / txt / md, or paste text. When processing finishes, the brief updates. Full extracts never go into chat.",
  bpDocsUploadCta: "Upload file",
  bpDocsUploading: "Uploading…",
  bpDocsPasteLabel: "Paste text",
  bpDocsPastePlaceholder: "For example: a proof line, product note, or customer quote.",
  bpDocsPasteCta: "Save paste and process",
  bpDocsPasteEmpty: "Paste some text first.",
  bpDocsPasteTooLong: "Paste is too long. Shorten it and try again.",
  bpDocsFileTooLarge: "File is too large. Max about 40MB per file.",
  bpDocsTooMany: "This profile already has the maximum number of documents. Delete one first.",
  bpDocsQuotaHint: "About 40MB per file. Up to 20 documents per profile.",
  bpDocsLoading: "Loading documents…",
  bpDocsEmpty: "No documents yet. Upload or paste one.",
  bpDocsUntitled: "Untitled document",
  bpDocsStatusPending: "Pending",
  bpDocsStatusReady: "Ready",
  bpDocsStatusFailed: "Failed",
  bpDocsProcessing: "Extracting, chunking, and updating the brief…",
  bpDocsReady: "Document is ready. Brief updated.",
  bpDocsDeleted: "Document deleted.",
  bpDocsDelete: "Delete",
  bpDocsDeleteConfirm: "Delete this document? Its chunks will be removed too.",
  bpDocsRetry: "Retry process",
  bpDocsResummarize: "Re-summarize brief",
  bpDocsResummarized: "Brief rebuilt from ready documents.",
  bpDocsBriefUpdated: "Brief and structured fields updated. You can keep editing, then save.",
  bpFieldBusinessName: "Business / brand name",
  bpFieldWhatTheySell: "What they sell",
  bpFieldWhoTheyServe: "Who they serve",
  bpFieldFounderRoleFace: "Founder role / face",
  bpFieldStance: "Stance",
  bpFieldProofCredentials: "Proof / credentials",
  bpFieldOfferCta: "Offer and CTA",
  bpFieldToneNotes: "Tone notes",
  bpFieldDoNotSay: "Do not say",
  bpHintBusinessName: "How this brand is named publicly.",
  bpHintWhatTheySell: "Product, service, or delivery.",
  bpHintWhoTheyServe: "Ideal client.",
  bpHintFounderRoleFace: "Who appears on camera and in what role.",
  bpHintStance: "What side they take, and what they push against.",
  bpHintProofCredentials: "Why trust them: cases, numbers, identity.",
  bpHintOfferCta: "What offer to sell, and what action to ask for.",
  bpHintToneNotes: "Voice and tone boundaries.",
  bpHintDoNotSay: "Claims or phrases that must never appear.",
  profileModalTitle: "Which profile?",
  profileModalUse: "Use this profile",
  profileModalSkip: "Continue without a profile",
  profileModalCreate: "Create a profile",
  profileModalEmpty: "No profiles yet. Create one on the Profile page, or continue without.",
  profileModalLoading: "Loading profiles…",
  profileModalClose: "Close",
  histTitle: "Chats",
  histNewChat: "New chat",
  histUngrouped: "Ungrouped",
  histUngroup: "Ungroup",
  histLoading: "Loading chats…",
  histError: "Could not load chat history.",
  histEmpty: "No chats",
  histEmptyFolder: "This folder is empty.",
  histMoveToFolder: "Move to folder",
  histCreateFolder: "New folder",
  histCreateFolderTitle: "Create folder",
  histCreateFolderSubmit: "Create",
  histCreateSubfolder: "New subfolder",
  histCreateSubfolderTitle: "New subfolder",
  histFolderNamePlaceholder: "Folder name",
  histFolderNameRequired: "Enter a folder name first.",
  histRenameFolder: "Rename",
  histDeleteFolder: "Delete folder",
  histDeleteFolderConfirm: "Delete this folder? Nested folders are deleted too. Your chats stay and go back to Ungrouped.",
  histFoldersHint: "Folders group chats by project. They are not a Brand profile.",
  histFilterHint: "All your chats across tools. Open one to jump back in.",
  histOpenHistory: "History",
  histCloseHistory: "Hide history",
  histSaveFailed: "Could not save this turn. Your reply is still on screen.",
  histRetry: "Try again",
  histRenameChat: "Rename",
  histDeleteChat: "Delete",
  histDeleteChatConfirm: "Delete this chat? You cannot undo this.",
  histChatTitlePlaceholder: "Chat name",
  histChatTitleRequired: "Enter a chat name first.",
  histCancel: "Cancel",
  histChatActions: "Chat actions",
  histFolderActions: "Folder actions",
  histFolderExpand: "Expand folder",
  histFolderCollapse: "Collapse folder",
  histFolderColor: "Color",
  histFolderParent: "Parent folder",
  histFolderParentNone: "Top level (no nest)",
  histFolderColorCoral: "Coral",
  histFolderColorAmber: "Amber",
  histFolderColorLime: "Lime",
  histFolderColorTeal: "Teal",
  histFolderColorSky: "Sky",
  histFolderColorViolet: "Violet",
  histFolderColorRose: "Rose",
  histFolderColorSlate: "Slate",
};

const TABLES: Record<Locale, MessageTable> = { zh, en };

export const DEFAULT_LOCALE: Locale = "zh";

export const LOCALE_STORAGE_KEY = "ie-coach-locale";

/** Cookie mirror of an explicit UI locale choice so SSR/first paint match. */
export const LOCALE_COOKIE_KEY = "ie-coach-locale";

export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const CATEGORY_KEYS: Record<ModuleCategory, MessageKey> = {
  Ideation: "catIdeation",
  "IP Positioning": "catIpPositioning",
  Content: "catContent",
  Trust: "catTrust",
  Convert: "catConvert",
};

export type MessageVars = {
  n?: number;
  name?: string;
};

/**
 * Returns chrome copy for a locale and key.
 * Supports `{n}` count and `{name}` string placeholders.
 */
export function t(locale: Locale, key: MessageKey, vars?: MessageVars): string {
  let raw: string = TABLES[locale][key];
  if (vars?.n !== undefined) {
    raw = raw.replace("{n}", String(vars.n));
  }
  if (vars?.name !== undefined) {
    raw = raw.replace("{name}", vars.name);
  }
  return raw;
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
