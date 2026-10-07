/**
 * Chinese chat openers keyed by module id.
 * Kept beside packs so EN openers stay in pack files; locale helper picks ZH here.
 * Shape: spoken beat + one short job sentence + one concrete question (口语化).
 */

import { prefixJeffSpokenBeatZh } from "@/lib/modules/qualityRuntime/familyOverlay";

const PACK_CHAT_OPENERS_ZH_JOBS: Record<string, string> = {
  "ad-vs-asset-checker":
    "我来帮你看看这段草稿像硬广，还是像有用的内容资产。把要检查的草稿丢给我。",
  "advice-vs-ego-coach":
    "我来帮你在开拍前检查：这话是给观众的建议，还是给自己炫耀。你打算在镜头前说什么？",
  "authority-relatable-mixer":
    "我来帮你混搭权威和亲和，让镜头上的你还像自己。镜头前你更像哪种角色：表演者、主持人、老师，还是博主？",
  "bianhao-coach":
    "我来陪你面对「内容要变好」的压力，不做强硬表演。谁在逼你内容变好，他们怎么说？",
  "boss-brand-brief":
    "我来帮你写一份短的创办人品牌 brief，方便开拍。你的角色是什么，谁该认出你的脸？",
  "brand-stance-model":
    "我来帮你起草清楚的品牌立场。你坚持什么？用白话说。",
  "bullet-caption-pack":
    "我来帮你写配套文案：短要点加软收尾，服务 Reel 不抢戏。这条 Reel 讲什么？",
  "comment-reply-three-lines":
    "我来帮你按三句法起草评论回复。把要回的评论丢给我。",
  "comment-to-content":
    "我来帮你把评论转成下一支脚本的角度。把评论或推回丢给我。",
  "content-asset-planner":
    "我来帮你用四种内容资产做规划：曝光、认知、信任、成交。你现在主要是没被看见、在建信任，还是在成交？",
  "content-asset-stack":
    "我来帮你把一条内容放到内容资产堆叠上看：看见、记住、相信、询问、成交。我们要堆叠的是哪一条内容？",
  "content-authority-ladder":
    "我来帮你看清自己在内容权威阶梯上的位置：新闻、观点、案例、故事。用白话概括你最近发的两条内容。",
  "content-ideation-ip":
    "我来帮你填九宫格 Topic Bingo，长出大约 12 个能拍的题目。市场里你是谁，用一句话说？",
  "content-not-working-checklists":
    "我来帮你跑「内容失效」两套清单。你觉得内容失效的症状是什么？没人看、没得拍，还是两个都有？",
  "criticism-armor":
    "我来帮你把批评变成清楚判断，别在情绪里打转。你怕哪种批评，或已经收到了什么？",
  "direction-fixer":
    "我来帮你做一次清楚的方向判断：留什么、砍什么、为什么。你最近在发什么内容？",
  "dm-comment-closer":
    "我来帮你把评论或私信里的兴趣，推进到清楚的下一步。把评论或私信丢给我。",
  "dont-outsource-judgment":
    "我来帮你在改 AI 草稿时，把判断权留在自己手里。把要审的 AI 草稿丢给我。",
  "eight-ways-to-open":
    "我来帮你试几种开场方式，打磨视频前三秒。从哪个题目或现有开场开始？",
  "faq-content-bank":
    "我来帮你建内容库 CONTENT BANK，方便以后反复取用。你先能贴哪类素材：问题、观点、误区，还是故事？",
  "first-impression-script":
    "我来帮你写一条密实第一印象脚本，大约 60 秒及以上，先讲观点。你在回应的是什么事件或瞬间？",
  "four-content-layers":
    "我来帮你规划内容四层：故事、案例、观点、新闻。你服务谁？",
  "goat-four-beats":
    "我来帮你用 GOAT 四拍搭一条密实短视频，大约 60 秒及以上：抓注意、打开、回答、带走。题目是什么？",
  "high-ticket-caution":
    "我来帮你对高客单时机做判断：拍、别拍，还是换拍法。你在保护的高信任产品是什么？",
  "hit-100x-followers":
    "我来帮你按账号体量定义什么叫爆。你现在大约有多少粉丝？",
  "hook-rewriter":
    "我来帮你只改开场，写成更强钩子。把现有钩子或正文主题丢给我。",
  "hot-take-script":
    "我来帮你把锋利主张写成密实热观点脚本，大约 60 秒及以上，落点是建议，不是炫耀。你愿意用一句话认领的主张是什么？",
  "ig-reel-script":
    "我来帮你写一条能直接拍的 Instagram Reel，大约 60 秒及以上，当教学资产，不当硬广。你希望观众带走的那个教训或故事节拍是什么？",
  "ip-pillars":
    "我来帮你定下 3 到 5 个能长期教的品牌支柱。你帮谁，对方每周卡在什么痛点？",
  "ip-stage-check":
    "我来帮你看清现在个人 IP 卡在哪个阶段。你已经知道哪三种内容最适合自己吗？",
  "lean-ip-setup":
    "我来帮你定一套能坚持的轻量每周 IP 节奏。你每周能诚实拿出多少小时来拍和发？",
  "learning-journey-series":
    "我来帮你排一条有软连贯的学习旅程系列。你在这件事上从哪里起步？",
  "long-video-trust-script":
    "我来帮你搭长视频信任大纲（5 到 15 分钟），不堆注水。有哪个题目你能讲 5 到 15 分钟还不注水？",
  "offer-explanation-simple":
    "我来帮你用白话说明 offer，让陌生人也能听懂。你卖什么，用白话说？",
  "platform-adapter":
    "我来帮你把同一条内容适配到不同格式，立场不丢。把要改写的原文丢给我。",
  "positioning-four-questions":
    "我来帮你答完定位四问，让陌生人更快听懂你为谁工作。你卖的是什么，用一句话说？",
  "process-proof-reel":
    "我来帮你写一条密实过程证明 Reel，大约 60 秒及以上，让人看见你怎么做事，好建立信任。你能诚实上镜展示的一个流程步骤是什么？",
  "revision-sharpen":
    "我来帮你用一个诊断加一个动作磨利草稿。把水分多的草稿丢给我。",
  "script-humanizer":
    "我来帮你把生硬草稿改成一对一能说出口的句子。把听起来像手册的草稿丢给我。",
  "scroll-stop-hook":
    "我来帮你写前 1 到 3 秒能停住滑动的开场。这条视频是讲给谁听的，先打哪个痛点？",
  "short-vs-long-planner":
    "我来帮你规划哪些题目适合短、哪些适合长。你现在处在哪个阶段？",
  "six-caption-angles":
    "我来帮你写六个文案角度，都是视频下的一行话。视频主旨用一句话说？",
  "soft-cta-closer":
    "我来帮你写软收尾：邀请，不硬卖。你已经教了什么价值，想要的下一步是什么？",
  "soundbite-one-liner":
    "我来帮你写出别人能复述的记忆钩子。你在哪个细分领域说话？",
  "standpoint-builder":
    "我来帮你立一个别人一眼能认出的立场。在你的市场里，你坚持什么？",
  "story-structure-search":
    "我来帮你搭密实更长的故事结构：问题、寻找、故事、解法、下一步。打开故事的问题是什么？",
  "story-trust-script":
    "我来帮你把故事写成密实、能建立信任的脚本，只用你的事实。起点处境是什么？",
  "three-c-method":
    "我来帮外向型老板跑三 C 方法：争议、共同兴趣、冲突。这条反应式内容给谁看？",
  "three-r-method":
    "我来帮内敛型老板跑三 R 节奏：先读、再回应、再加你的观点。你在哪个行业？",
  "trust-offer-bridge":
    "我来帮你从已建立的信任接到清楚的 offer。你已经在镜头前赢得了什么信任？",
  "two-kinds-student-two-methods":
    "我来帮你分清外向或内敛，并选对应路线。镜头前你更偏外向反应，还是内向克制？",
  "value-convert-ladder":
    "我来帮你看客户购买路径上掉在哪。你现在免费教什么？",
  "value-teaching-reel":
    "我来帮你写一条价值向 Reel，大约 60 秒及以上：先公开教一招，再给一个轻下一步。你能用大约 60 秒及以上教完的那一招是什么？",
  "waffle-grid":
    "我来帮你填华夫饼九宫格。先说中心：你是谁，你帮谁？",
  "who-i-serve":
    "我来帮你写满定位三行地图：我是谁、我帮谁、解决什么。用白话说，市场里你是谁？",
};

/**
 * ZH openers with a rotating Jeff spoken beat already applied.
 */
export const PACK_CHAT_OPENERS_ZH: Record<string, string> = Object.fromEntries(
  Object.entries(PACK_CHAT_OPENERS_ZH_JOBS).map(([id, text]) => [
    id,
    prefixJeffSpokenBeatZh(text, id),
  ]),
);
