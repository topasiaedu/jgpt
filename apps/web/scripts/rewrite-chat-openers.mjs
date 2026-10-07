/**
 * One-shot builder script: rewrite pack chatOpeners to Artemo conversational shape.
 * Run from apps/web: node scripts/rewrite-chat-openers.mjs
 * Not imported by the student app.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packsDir = path.join(__dirname, "..", "lib", "modules", "packs");
const zhMapPath = path.join(__dirname, "..", "lib", "modules", "packChatOpenersZh.ts");
const localePath = path.join(__dirname, "..", "lib", "modules", "packLocale.ts");

/**
 * @param {string} greeting
 * @param {string[]} bullets
 * @param {string} question
 */
function opener(greeting, bullets, question) {
  const g = greeting
    .replace(/^Hey\. Ready to help you /, "Hey. Let's ")
    .replace(/^Hey\. Ready to help /, "Hey. Let's ");
  const softBullets = bullets.map((b) =>
    b
      .replace(/^We will /, "")
      .replace(/^Bring /, "Bring ")
      .replace(/^You leave with /, "Walk away with "),
  );
  const bulletLines = softBullets.map((b) => `- ${b}`).join("\n");
  // Spoken coach: greeting → bullets → one question. No "Here is how we will work" curriculum line.
  return `${g}\n\n${bulletLines}\n\n${question}`;
}

/**
 * @param {string} greeting
 * @param {string[]} bullets
 * @param {string} question
 */
function openerZh(greeting, bullets, question) {
  const g = greeting
    .replace(/^嗨。来，我帮你/, "我会帮你")
    .replace(/^嗨。来，我陪你/, "我会陪你")
    .replace(/^嗨。来，我帮外向型/, "我会帮外向型")
    .replace(/^嗨。来，我帮内敛型/, "我会帮内敛型")
    .replace(/^嗨。我来帮你/, "我会帮你")
    .replace(/^嗨。我来陪你/, "我会陪你")
    .replace(/^嗨。我来帮外向型/, "我会帮外向型")
    .replace(/^嗨。我来帮内敛型/, "我会帮内敛型");
  const softBullets = bullets.map((b) =>
    b
      .replace(/^一起写出 /, "咱们写 ")
      .replace(/^一起写/, "咱们写")
      .replace(/^一起判断/, "咱们先看")
      .replace(/^一起整理/, "咱们整理")
      .replace(/^一起调/, "咱们调")
      .replace(/^一起设计/, "咱们定")
      .replace(/^一起写满/, "咱们写满")
      .replace(/^一起写：/, "咱们写：")
      .replace(/^离开时带走/, "走的时候带走")
      .replace(/^带走/, "走的时候带走"),
  );
  const bulletLines = softBullets.map((b) => `- ${b}`).join("\n");
  // Spoken coach: greeting → bullets → one question. No "我们这样推进" curriculum line.
  return `${g}\n\n${bulletLines}\n\n${question}`;
}

/** @type {Record<string, { en: string; zh: string }>} */
const OPENERS = {
  "ip-stage-check": {
    en: opener(
      "Hey. Ready to help you check what stage your IP is in right now.",
      [
        "We will sort whether you mainly own content, or a working system",
        "Bring a honest yes or no on which content types fit you",
        "You leave with a clear next stage, not a lecture",
      ],
      "Do you already know which three content types fit you best?",
    ),
    zh: openerZh(
      "我会帮你看清现在个人 IP 卡在哪个阶段。",
      [
        "一起判断你现在主要有内容，还是已有能运转的系统",
        "你只要诚实回答哪些内容类型适合自己",
        "离开时带走下一步，不听长篇理论",
      ],
      "你已经知道哪三种内容最适合自己吗？",
    ),
  },
  "standpoint-builder": {
    en: opener(
      "Hey. Ready to help you lock a clear standpoint people can recognize.",
      [
        "We will fill what you stand for, what you stand against, and your real gap",
        "Bring one belief you insist on that others soft-pedal",
        "You leave with a sharp standpoint line, not a framework class",
      ],
      "What do you insist on in your work that others avoid saying?",
    ),
    zh: openerZh(
      "我会帮你立一个别人一眼能认出的立场。",
      [
        "一起写满：坚持什么、反对什么、真实缺口",
        "你带一句别人常回避、但你坚持的主张",
        "带走锋利立场句，不听框架课",
      ],
      "你在工作里坚持什么，是别人常回避的？",
    ),
  },
  "boss-brand-brief": {
    en: opener(
      "Hey. Ready to help you write a short Boss Brand brief.",
      [
        "We will frame your founder face as the brand, with filmable scenes",
        "Bring your role and who should recognize you",
        "You leave with do and don't lines, without sliding into ads",
      ],
      "What is your role, and who should recognize your face?",
    ),
    zh: openerZh(
      "我会帮你写一份短的老板品牌 brief。",
      [
        "把创办人面孔当品牌，并列出可拍场景",
        "你带上角色，以及谁该认出你",
        "带走可做与别做，不滑进硬广",
      ],
      "你的角色是什么，谁该认出你的脸？",
    ),
  },
  "lean-ip-setup": {
    en: opener(
      "Hey. Ready to help you set a lean weekly IP rhythm you can keep.",
      [
        "We will design a simple capture and post cadence",
        "Bring an honest hours-per-week number",
        "You leave with a rhythm that fits real life",
      ],
      "How many honest hours a week can you give to capture and post?",
    ),
    zh: openerZh(
      "我会帮你定一套能坚持的轻量每周 IP 节奏。",
      [
        "一起设计简单的拍摄与发布节奏",
        "你带一个诚实的每周小时数",
        "带走贴合真实生活的节奏，不堆任务",
      ],
      "你每周能诚实拿出多少小时来拍和发？",
    ),
  },
  "who-i-serve": {
    en: opener(
      "Hey. Ready to help you write your three-line positioning map.",
      [
        "We will fill who you are, who you help, and what you solve",
        "Bring plain words about your identity and role",
        "You leave with one clear map, not jargon",
      ],
      "In plain words, who are you in this market?",
    ),
    zh: openerZh(
      "我会帮你写满定位三行地图。",
      [
        "一起写：我是谁、我帮谁、解决什么",
        "你用白话说身份与角色即可",
        "带走一张清楚地图，不堆术语",
      ],
      "用白话说，市场里你是谁？",
    ),
  },
  "ip-pillars": {
    en: opener(
      "Hey. Ready to help you lock durable Brand Pillars.",
      [
        "We will move from who you serve to lasting topic pillars",
        "Bring who you serve and the pain they feel",
        "You leave with 3 to 5 pillars you can keep teaching",
      ],
      "Who do you serve, and what pain do they feel?",
    ),
    zh: openerZh(
      "我会帮你定下能长期用的品牌支柱。",
      [
        "从你服务谁，走到可长期讲的题目支柱",
        "你带上服务对象和他们的痛点",
        "带走 3 到 5 个能持续教的支柱",
      ],
      "你服务谁，他们的痛点是什么？",
    ),
  },
  "brand-stance-model": {
    en: opener(
      "Hey. Ready to help you draft a clear brand stance.",
      [
        "We will write what you stand for and what you stand against",
        "Bring one belief you will not trade away",
        "You leave with two clean legs of stance",
      ],
      "What do you stand for?",
    ),
    zh: openerZh(
      "我会帮你起草清楚的品牌立场。",
      [
        "一起写坚持什么、反对什么",
        "你带一句不会拿去换流量的信念",
        "带走两腿干净立场",
      ],
      "你坚持什么？",
    ),
  },
  "ig-reel-script": {
    en: opener(
      "Hey. Let's write you a shootable Instagram Reel.",
      [
        "15 to 45 seconds as a content asset, not a hard-sell ad",
        "Bring the one lesson or story beat you want them to take away",
        "Walk away with lines you can film",
      ],
      "What is the one lesson or story beat you want them to take away?",
    ),
    zh: openerZh(
      "我会帮你写一条能直接拍的 Instagram Reel。",
      [
        "咱们写 15 到 45 秒，当内容资产，不当硬广",
        "你把想让观众带走的那个教训或故事点带过来就行",
        "走的时候手里有能开拍的台词",
      ],
      "你希望观众带走的那个教训或故事点是什么？",
    ),
  },
  "scroll-stop-hook": {
    en: opener(
      "Hey. Ready to help you sharpen the first 1 to 3 seconds.",
      [
        "We will craft a scroll-stop open only",
        "Bring who you are talking to and the pain that should stop them",
        "You leave with stronger opens, not a full script rewrite",
      ],
      "Who is the viewer, and what pain should stop them?",
    ),
    zh: openerZh(
      "我会帮你打磨前 1 到 3 秒的停滑开场。",
      [
        "只打磨开场，不重写整支脚本",
        "你带上对象，以及该让他们停下来的痛点",
        "带走更强开场句",
      ],
      "对象是谁，哪一个痛点该让他们停下来？",
    ),
  },
  "value-teaching-reel": {
    en: opener(
      "Hey. Ready to help you script a value-led Reel.",
      [
        "We will teach one tip openly, then a light next step",
        "Bring one tip you can teach in under a minute",
        "You leave with a Reel that gives first, then invites",
      ],
      "What is the one tip you can teach in under a minute?",
    ),
    zh: openerZh(
      "我会帮你写一条价值向 Reel。",
      [
        "先公开教一招，再给一个轻下一步",
        "你带上一分钟内能教完的那一招",
        "带走先给价值、再轻邀请的脚本",
      ],
      "你能在一分钟内教完的那一招是什么？",
    ),
  },
  "hot-take-script": {
    en: opener(
      "Hey. Ready to help you turn a sharp claim into a hot-take script.",
      [
        "We will land advice, not a flex",
        "Bring one claim you are willing to own in a sentence",
        "You leave with a script that takes a side cleanly",
      ],
      "What claim are you willing to own in one sentence?",
    ),
    zh: openerZh(
      "我会帮你把锋利主张写成热观点脚本。",
      [
        "落点是建议，不是炫耀",
        "你带上一句愿意认领的主张",
        "带走能干净站队的脚本",
      ],
      "你愿意用一句话认领的主张是什么？",
    ),
  },
  "process-proof-reel": {
    en: opener(
      "Hey. Ready to help you write a process-proof Reel.",
      [
        "We will show how you work so trust can build",
        "Bring one process step you can honestly show on camera",
        "You leave with a Reel that proves craft, not hype",
      ],
      "What is one process step you can honestly show on camera?",
    ),
    zh: openerZh(
      "我会帮你写一条过程证明 Reel。",
      [
        "让人看见你怎么做事，好建立信任",
        "你带上一个能诚实上镜展示的流程步骤",
        "带走证明手艺、不堆噱头的脚本",
      ],
      "你能诚实上镜展示的一个流程步骤是什么？",
    ),
  },
  "first-impression-script": {
    en: opener(
      "Hey. Ready to help you write a first-impression script.",
      [
        "We will lead with viewpoint, then light traffic",
        "Bring the event or moment you are reacting to",
        "You leave with a clean open that sounds like you",
      ],
      "What event or moment are you reacting to?",
    ),
    zh: openerZh(
      "我会帮你写一条第一印象脚本。",
      [
        "先观点，再轻带流量",
        "你带上正在回应的事件或瞬间",
        "带走听起来像你本人的干净开场",
      ],
      "你在回应的是什么事件或瞬间？",
    ),
  },
  "short-vs-long-planner": {
    en: opener(
      "Hey. Ready to help you plan which topics go short vs long.",
      [
        "We will serve see then trust, not volume-equals-money",
        "Bring where you are in stage right now",
        "You leave with a simple short vs long map",
      ],
      "What stage are you in right now?",
    ),
    zh: openerZh(
      "我会帮你规划哪些题目适合短、哪些适合长。",
      [
        "服务被看见再到信任，不走发得越多越赚钱",
        "你带上现在所处的阶段",
        "带走一张简单的长短内容地图",
      ],
      "你现在处在哪个阶段？",
    ),
  },
  "long-video-trust-script": {
    en: opener(
      "Hey. Ready to help you outline a longer trust teach.",
      [
        "We will build a trust path, not stock filler",
        "Bring a topic you can teach for 5 to 15 minutes without fluff",
        "You leave with an outline that earns trust",
      ],
      "What topic can you teach for 5 to 15 minutes without fluff?",
    ),
    zh: openerZh(
      "我会帮你搭长视频信任大纲。",
      [
        "走信任路径，不堆通用注水模板",
        "你带上一个能讲 5 到 15 分钟还不注水的题目",
        "带走能建立信任的大纲",
      ],
      "有哪个题目你能讲 5 到 15 分钟还不注水？",
    ),
  },
  "story-trust-script": {
    en: opener(
      "Hey. Ready to help you shape a story that builds trust.",
      [
        "We will use your facts only, beat by beat",
        "Bring the starting situation in plain words",
        "You leave with a story script people can believe",
      ],
      "What was the starting situation?",
    ),
    zh: openerZh(
      "我会帮你把故事写成能建立信任的脚本。",
      [
        "只用你的事实，一拍一拍写",
        "你用白话带上起点处境",
        "带走别人愿意相信的故事脚本",
      ],
      "起点处境是什么？",
    ),
  },
  "authority-relatable-mixer": {
    en: opener(
      "Hey. Ready to help you mix authority with relatability.",
      [
        "We will balance how you sell trust on camera",
        "Bring which role feels closest: performer, host, teacher, or blogger",
        "You leave with a mix that fits how you actually sell trust",
      ],
      "Which role is closest to how you sell trust?",
    ),
    zh: openerZh(
      "我会帮你混搭权威与亲和。",
      [
        "一起调镜头上怎么卖信任的比例",
        "你带上最接近的角色：艺人、直播主、老师或博主",
        "带走贴合你真实卖信任方式的混搭",
      ],
      "你最接近哪一种角色？",
    ),
  },
  "faq-content-bank": {
    en: opener(
      "Hey. Ready to help you build a CONTENT BANK.",
      [
        "We will sort topics, categories, formats, and status",
        "Paste questions, views, myths, or stories you already have",
        "You leave with a bank you can pull from, not a one-off post",
      ],
      "What material can you paste first (questions, views, myths, or stories)?",
    ),
    zh: openerZh(
      "我会帮你建内容库 CONTENT BANK。",
      [
        "一起整理题材、分类、形式与状态",
        "把已有的问题、观点、误区或故事丢给我",
        "带走可反复取用的库，不是一次性帖子",
      ],
      "你先能贴哪一类素材（问题、观点、误区或故事）？",
    ),
  },
  "learning-journey-series": {
    en: opener(
      "Hey. Ready to help you map a short learning-journey series.",
      [
        "We will set soft continuity across a few pieces",
        "Bring where you started and the turning point that matters",
        "You leave with a series order people can follow",
      ],
      "Where did you start, and what turning point matters most?",
    ),
    zh: openerZh(
      "我会帮你排一条有软连贯的学习旅程系列。",
      [
        "几条内容之间有轻连贯",
        "你带上从哪里起步，以及最重要的转折点",
        "带走别人跟得上的系列顺序",
      ],
      "你从哪里起步，哪个转折点最重要？",
    ),
  },
  "soundbite-one-liner": {
    en: opener(
      "Hey. Ready to help you craft a Memory Hook people can retell.",
      [
        "We will land one line, then scene and result",
        "Bring the belief people should remember about how you work",
        "You leave with a hook that sticks",
      ],
      "What belief should people remember about how you work?",
    ),
    zh: openerZh(
      "我会帮你写出别人能复述的记忆钩子。",
      [
        "先落一句金句，再补场景与结果",
        "你带上希望别人记住你做事方式的信念",
        "带走能站住的钩子",
      ],
      "你希望别人记住你做事方式的哪一个信念？",
    ),
  },
  "content-asset-planner": {
    en: opener(
      "Hey. Ready to help you plan with the four content assets.",
      [
        "We will classify posts as exposure, awareness, trust, or convert",
        "Bring whether you are mainly unseen, building trust, or converting",
        "You leave with a simple plan, not a funnel lecture",
      ],
      "Are you mainly unseen, building trust, or converting?",
    ),
    zh: openerZh(
      "我会帮你用四种内容资产做规划。",
      [
        "把帖子归到曝光、认知、信任或成交",
        "你带上现在主要是没被看见、在建信任，还是在成交",
        "带走简单计划，不听漏斗课",
      ],
      "你现在主要是没被看见、在建信任，还是在成交？",
    ),
  },
  "content-asset-stack": {
    en: opener(
      "Hey. Ready to help you place a piece on the Content Asset Stack.",
      [
        "We will see where it moves people: see, remember, believe, ask, buy",
        "Paste the draft or idea, and who it is for",
        "You leave with a clear next push for that piece",
      ],
      "Paste the piece or idea, and who is it for?",
    ),
    zh: openerZh(
      "我会帮你把内容放到内容资产堆叠上看一步。",
      [
        "看它把人推到：看见、记住、相信、询问、成交的哪一步",
        "把草稿或选题丢给我，并说给谁看",
        "带走这条内容的下一步推力",
      ],
      "把草稿或选题丢给我，并说给谁看？",
    ),
  },
  "direction-fixer": {
    en: opener(
      "Hey. Ready to help you make a direction call.",
      [
        "We will name primary lane, secondary lane, and what to stop",
        "Bring what you have been posting and the outcome you want",
        "You leave with a clear keep / cut decision",
      ],
      "What have you been posting, and what outcome do you actually want?",
    ),
    zh: openerZh(
      "我会帮你做一次方向判断。",
      [
        "点名主赛道、次赛道、该停什么",
        "你带上最近在发什么，以及真正想要的结果",
        "带走清楚的留 / 砍决定",
      ],
      "你最近在发什么，真正想要的结果是什么？",
    ),
  },
  "value-convert-ladder": {
    en: opener(
      "Hey. Ready to help you map where people drop on the path to buy.",
      [
        "We will name your customer path and the weak step",
        "Bring what you teach for free and what you sell",
        "You leave with a drop-off call, not a funnel theory class",
      ],
      "What do you teach for free, and what do you sell?",
    ),
    zh: openerZh(
      "我会帮你看客户购买路径上掉在哪。",
      [
        "点名路径，并标出弱的一步",
        "你带上免费教什么、卖的是什么",
        "带走掉点判断，不听漏斗理论课",
      ],
      "你免费教什么，卖的是什么？",
    ),
  },
  "ad-vs-asset-checker": {
    en: opener(
      "Hey. Ready to help you check if a draft reads like an ad or an asset.",
      [
        "We will diagnose the draft, then rewrite toward asset",
        "Paste the draft you want checked",
        "You leave with a clearer asset version",
      ],
      "Paste the draft you want checked?",
    ),
    zh: openerZh(
      "我会帮你判断草稿像销售广告还是内容资产。",
      [
        "先诊断，再改向资产",
        "把要检查的草稿丢给我",
        "带走更清楚的资产版",
      ],
      "把要检查的草稿丢给我？",
    ),
  },
  "comment-to-content": {
    en: opener(
      "Hey. Ready to help you turn a comment into next-script angles.",
      [
        "We will treat it as advice material, not argument theater",
        "Paste the comment or pushback",
        "You leave with angles you can film next",
      ],
      "Paste the comment?",
    ),
    zh: openerZh(
      "我会帮你把评论转成下一支脚本角度。",
      [
        "当建议素材，不当吵架表演",
        "把评论或推回丢给我",
        "带走下一支能拍的角度",
      ],
      "把评论丢给我？",
    ),
  },
  "content-ideation-ip": {
    en: opener(
      "Hey. Ready to help you fill Topic Bingo and grow topic seeds.",
      [
        "We will center your market persona, then grow about 12 topic seeds",
        "Bring who the market should remember you as, in plain words",
        "You leave with filmable topic seeds, not a blank page",
      ],
      "In plain words, who should the market remember you as?",
    ),
    zh: openerZh(
      "我会帮你填九宫格，长出题目雏形。",
      [
        "中心是人设，再长出大约 12 个题目雏形",
        "你用白话说市场该把你记成谁",
        "带走能拍的题目，不留空白页",
      ],
      "用白话说，市场该把你记成谁？",
    ),
  },
  "advice-vs-ego-coach": {
    en: opener(
      "Hey. Ready to help you check advice vs ego before you film.",
      [
        "We will run a short pre-shoot checklist",
        "Bring what you plan to say on camera",
        "You leave with a go or fix call that protects the viewer",
      ],
      "What do you plan to say on camera?",
    ),
    zh: openerZh(
      "我会帮你在开拍前检查：是给观众建议，还是给自己炫耀。",
      [
        "跑一份短的开拍前检查",
        "你带上打算在镜头前说的话",
        "带走拍 / 先改的判断，保护观众",
      ],
      "你打算在镜头前说什么？",
    ),
  },
  "comment-reply-three-lines": {
    en: opener(
      "Hey. Ready to help you draft a three-line comment reply.",
      [
        "We will catch, clarify, and pull back to your main line",
        "Paste the comment you want to answer",
        "You leave with a reply that shows judgment, not a fight",
      ],
      "Paste the comment you want to answer?",
    ),
    zh: openerZh(
      "我会帮你按三句法起草评论回复。",
      [
        "接住、澄清、拉回主轴",
        "把要回的评论丢给我",
        "带走显判断、不吵架的回复",
      ],
      "把要回的评论丢给我？",
    ),
  },
  "criticism-armor": {
    en: opener(
      "Hey. Ready to help you turn criticism into judgment, not emotion.",
      [
        "We will run a short shield pass on the criticism",
        "Bring what you fear, or what you already got",
        "You leave with a steadier read and a usable response angle",
      ],
      "What criticism do you fear, or already got?",
    ),
    zh: openerZh(
      "我会帮你把批评变成判断，而不是情绪。",
      [
        "对批评跑一轮短护盾",
        "你带上怕什么，或已经收到什么",
        "带走更稳的判断，和可用的回应角度",
      ],
      "你怕什么批评，或已经收到什么？",
    ),
  },
  "bianhao-coach": {
    en: opener(
      "Hey. Ready to help you through growth-shame pressure without toughness theater.",
      [
        "We will name the pressure and what stays true for you",
        "Bring who is pushing you to become better at content, and what they say",
        "You leave with a calmer next move you can own",
      ],
      "Who is pressuring you to become better at content, and what do they say?",
    ),
    zh: openerZh(
      "我会陪你过「变好羞耻症」压力，不做强硬表演。",
      [
        "点名压力，并留下对你仍真实的部分",
        "你带上谁在逼你内容变好，他们怎么说",
        "带走你能认领的冷静下一步",
      ],
      "谁在逼你内容「变好」，他们怎么说？",
    ),
  },
  "high-ticket-caution": {
    en: opener(
      "Hey. Ready to help you call film, don't film, or film differently for high-ticket timing.",
      [
        "We will check audience warmth before you push price",
        "Bring what you were about to film and how warm the audience feels",
        "You leave with a timing call, not a sales script",
      ],
      "What were you about to film, and how warm is the audience?",
    ),
    zh: openerZh(
      "我会帮你对高客单时机做拍 / 别拍 / 换拍法判断。",
      [
        "先看观众热度，再谈推价格",
        "你带上正要拍什么，观众热度到哪了",
        "带走时机判断，不是销售脚本",
      ],
      "你正要拍什么，观众热度到哪了？",
    ),
  },
  "dont-outsource-judgment": {
    en: opener(
      "Hey. Ready to help you keep judgment while you edit an AI draft.",
      [
        "We will mark keep, cut, or rewrite",
        "Paste the draft you are unsure about",
        "You leave owning the call, not outsourcing it",
      ],
      "Paste the AI draft you are unsure about?",
    ),
    zh: openerZh(
      "我会帮你在改 AI 草稿时把判断权留在自己手里。",
      [
        "标出留、删、改写",
        "把你吃不准的草稿丢给我",
        "带走你亲手做的判断，不外包",
      ],
      "把你吃不准的 AI 草稿丢给我？",
    ),
  },
  "soft-cta-closer": {
    en: opener(
      "Hey. Ready to help you write a soft close.",
      [
        "We will summarize value, give a clear ask, and lower the barrier",
        "Bring what you already taught and the next step you want",
        "You leave with a close that invites, not hard-sells",
      ],
      "What value did you already teach, and what next step do you want?",
    ),
    zh: openerZh(
      "我会帮你写软收尾。",
      [
        "总结价值、发出指令、降低门槛",
        "你带上已经教了什么价值，以及想要的下一步",
        "带走邀请式收尾，不硬卖",
      ],
      "你已经教了什么价值，想要的下一步是什么？",
    ),
  },
  "trust-offer-bridge": {
    en: opener(
      "Hey. Ready to help you bridge from trust into a clear offer.",
      [
        "We will name your path, then write the bridge line",
        "Bring what trust you have earned and what you offer in plain words",
        "You leave with a bridge that feels earned",
      ],
      "What trust have you earned, and what do you offer in plain words?",
    ),
    zh: openerZh(
      "我会帮你从信任接到清楚的 offer。",
      [
        "先点名路径，再写桥段",
        "你带上已赢得的信任，以及白话里你提供什么",
        "带走显得挣来的桥段",
      ],
      "你已经赢得什么信任，用白话你提供什么？",
    ),
  },
  "dm-comment-closer": {
    en: opener(
      "Hey. Ready to help you move warm interest to a clear next step.",
      [
        "We will draft a reply that stays human and clear",
        "Paste the comment or DM",
        "You leave with a next-step reply you can send",
      ],
      "Paste the comment or DM?",
    ),
    zh: openerZh(
      "我会帮你把有温度的兴趣推进到清楚下一步。",
      [
        "起草一则有人味又清楚的回复",
        "把评论或私信丢给我",
        "带走可直接发出的下一步回复",
      ],
      "把评论或私信丢给我？",
    ),
  },
  "offer-explanation-simple": {
    en: opener(
      "Hey. Ready to help you explain your offer in plain language.",
      [
        "We will write a clear paragraph without invented funnel jargon",
        "Bring what you sell and who it is for",
        "You leave with words a stranger can understand",
      ],
      "What do you sell, and who is it for?",
    ),
    zh: openerZh(
      "我会帮你用白话说明 offer。",
      [
        "写清楚一段，不编漏斗术语",
        "你带上卖什么、给谁",
        "带走陌生人也能懂的说法",
      ],
      "你卖什么，给谁？",
    ),
  },
  "script-humanizer": {
    en: opener(
      "Hey. Ready to help you turn a stiff draft into 1-on-1 speakable lines.",
      [
        "We will rewrite brochure tone into human speech",
        "Paste the draft that sounds stiff",
        "You leave with lines you can say out loud",
      ],
      "Paste the draft that sounds like a brochure?",
    ),
    zh: openerZh(
      "我会帮你把生硬草稿改成一对一能说出口的句子。",
      [
        "把手册腔改成人话",
        "把听起来生硬的草稿丢给我",
        "带走能大声念出来的句子",
      ],
      "把听起来像手册的草稿丢给我？",
    ),
  },
  "revision-sharpen": {
    en: opener(
      "Hey. Ready to help you sharpen a draft with one diagnosis and one move.",
      [
        "We will keep the one point that must survive",
        "Paste the draft and name that must-keep point",
        "You leave with a tighter draft, not a full rewrite for fun",
      ],
      "Paste the draft, and what is the one point that must survive?",
    ),
    zh: openerZh(
      "我会帮你用一个诊断加一个动作磨利草稿。",
      [
        "保住必须留下来的那一点",
        "把草稿丢给我，并点名必须留下的点",
        "带走更利的版本，不为改而改",
      ],
      "把草稿丢给我，必须留下来的那一点是什么？",
    ),
  },
  "hook-rewriter": {
    en: opener(
      "Hey. Ready to help you rewrite only the open into stronger hooks.",
      [
        "We will avoid trust-breaking clickbait",
        "Paste the current hook or the body topic",
        "You leave with stronger opens, body left intact",
      ],
      "Paste the current hook or the body topic?",
    ),
    zh: openerZh(
      "我会帮你只改开场，写成更强钩子。",
      [
        "不做砸信任的标题党",
        "把现有钩子或正文主题丢给我",
        "带走更强开场，正文不动",
      ],
      "把现有钩子或正文主题丢给我？",
    ),
  },
  "platform-adapter": {
    en: opener(
      "Hey. Ready to help you adapt one piece across formats without losing the standpoint.",
      [
        "We will keep the same spine, change the shape",
        "Paste the source script or caption, and list the formats you need",
        "You leave with format-ready versions",
      ],
      "Paste the source, and which formats do you need?",
    ),
    zh: openerZh(
      "我会帮你把同一条内容适配到不同格式，立场不丢。",
      [
        "脊梁不变，外形变",
        "贴来源脚本或文案，并列出你要的格式",
        "带走各格式可用版本",
      ],
      "贴来源，并说你要哪些格式？",
    ),
  },
  "bullet-caption-pack": {
    en: opener(
      "Hey. Ready to help you write a supporting caption with short bullets and a soft close.",
      [
        "We will support the Reel, not compete with it",
        "Bring the Reel topic or a short script summary",
        "You leave with a caption you can paste",
      ],
      "What is the Reel topic or script summary?",
    ),
    zh: openerZh(
      "我会帮你写带短要点和软收尾的配套文案。",
      [
        "文案服务 Reel，不抢戏",
        "你带上 Reel 主题或脚本摘要",
        "带走可直接贴的文案",
      ],
      "这条 Reel 的主题或脚本摘要是什么？",
    ),
  },
  "two-kinds-student-two-methods": {
    en: opener(
      "Hey. Ready to help you sort loud vs quiet and pick the matching route.",
      [
        "We will match you to Three C or Three R",
        "Bring whether you are more outgoing or reserved on camera",
        "You leave with a route that fits your energy",
      ],
      "Are you more outgoing on camera, or more reserved?",
    ),
    zh: openerZh(
      "我会帮你分清外向或内敛，并选对应路线。",
      [
        "匹配到三 C 或三 R",
        "你带上镜头前更外向还是更内敛",
        "带走贴合你能量的路线",
      ],
      "你镜头前更外向，还是更内敛？",
    ),
  },
  "three-c-method": {
    en: opener(
      "Hey. Ready to help you run the Three C method for an outgoing owner.",
      [
        "We will build a simple routine that fits a louder energy",
        "Bring the market you are speaking to",
        "You leave with concrete next captures",
      ],
      "What market are you speaking to?",
    ),
    zh: openerZh(
      "我会帮外向型老板跑三 C 方法。",
      [
        "定一套贴合外向能量的简单节奏",
        "你带上你在对谁说话的市场",
        "带走具体下一步拍摄",
      ],
      "你在对哪个市场说话？",
    ),
  },
  "three-r-method": {
    en: opener(
      "Hey. Ready to help you run the Three R routine for a reserved owner.",
      [
        "We will build a quieter, steady capture habit",
        "Bring the industry or craft the reads should come from",
        "You leave with a routine you can keep without forcing loud energy",
      ],
      "What industry or craft should the reads come from?",
    ),
    zh: openerZh(
      "我会帮内敛型老板跑三 R 节奏。",
      [
        "定一套更安静、能坚持的拍摄习惯",
        "你带上素材该来自哪个行业或手艺",
        "带走不用硬装外向也能坚持的节奏",
      ],
      "素材该来自哪个行业或手艺？",
    ),
  },
  "waffle-grid": {
    en: opener(
      "Hey. Ready to help you fill The Waffle idea grid.",
      [
        "We will start at the center, then fill the rest",
        "Bring who you are and who you serve in plain words",
        "You leave with a filled grid of angles",
      ],
      "Centre first: who are you and who do you serve?",
    ),
    zh: openerZh(
      "我会帮你填华夫饼九宫格。",
      [
        "先从中心格开始，再填四周",
        "你用白话说你是谁、帮谁",
        "带走填满的角度格",
      ],
      "先说中心：你是谁，你帮谁？",
    ),
  },
  "content-not-working-checklists": {
    en: opener(
      "Hey. Ready to help you run the Content Not Working checklists.",
      [
        "We will check positioning before camera tricks",
        "Bring the main symptom: nobody watching, no ideas to film, or both",
        "You leave with a diagnosis and the next fix",
      ],
      "Is the main symptom nobody watching, no ideas to film, or both?",
    ),
    zh: openerZh(
      "我会帮你跑「内容失效」两套清单。",
      [
        "先定位，再谈拍摄技巧",
        "你带上主症状：没人看、没得拍，或两个都有",
        "带走诊断和下一步修正",
      ],
      "主症状是没人看、没得拍，还是两个都有？",
    ),
  },
  "positioning-four-questions": {
    en: opener(
      "Hey. Ready to help you answer the four positioning questions.",
      [
        "We will tighten who you are for, what you stand for, proof, and the ask",
        "Bring your current one-liner if you have one",
        "You leave with clearer answers you can reuse in content",
      ],
      "Who are you trying to be obvious for right now?",
    ),
    zh: openerZh(
      "我会帮你答完定位四问。",
      [
        "收紧：为谁、坚持什么、证明、邀请",
        "若有现成一句话定位，先丢给我",
        "带走能反复用在内容里的清楚答案",
      ],
      "你现在最想让谁一眼认出你？",
    ),
  },
  "goat-four-beats": {
    en: opener(
      "Hey. Ready to help you structure one short video with GOAT beats.",
      [
        "We will hit Grab, Open, Answer, Take away",
        "Bring the topic in one breath",
        "You leave with a short video spine you can film",
      ],
      "What is the topic?",
    ),
    zh: openerZh(
      "我会帮你用 GOAT 四拍搭一条短视频。",
      [
        "抓注意、打开、回答、带走",
        "你用一句话说清题目",
        "带走能开拍的短视频骨架",
      ],
      "题目是什么？",
    ),
  },
  "story-structure-search": {
    en: opener(
      "Hey. Ready to help you build a longer story structure.",
      [
        "We will move Problem to Search to Story to Solution to What next",
        "Bring the problem that opens the story",
        "You leave with a structure you can teach from",
      ],
      "What problem opens the story?",
    ),
    zh: openerZh(
      "我会帮你搭更长的故事结构。",
      [
        "从问题到寻找、故事、解法、下一步",
        "你带上打开故事的那个问题",
        "带走能用来教学的结构",
      ],
      "打开故事的问题是什么？",
    ),
  },
  "eight-ways-to-open": {
    en: opener(
      "Hey. Ready to help you pick stronger ways to open.",
      [
        "We will try several open patterns on your topic",
        "Bring the topic or draft open you have now",
        "You leave with a few usable opens to test",
      ],
      "What topic or current open should we start from?",
    ),
    zh: openerZh(
      "我会帮你选出更强的开场方式。",
      [
        "在你的题目上试几种开场",
        "你带上题目或现有开场",
        "带走几个可试的开场",
      ],
      "从哪个题目或现有开场开始？",
    ),
  },
  "hit-100x-followers": {
    en: opener(
      "Hey. Ready to help you check what counts as a hit for your size.",
      [
        "We will use the 100 times followers definition",
        "Bring about how many followers you have now",
        "You leave with a clearer hit bar for your account",
      ],
      "About how many followers do you have right now?",
    ),
    zh: openerZh(
      "我会帮你按账号体量看什么叫爆。",
      [
        "用粉丝数一百倍的定义来卡",
        "你带上现在大约多少粉丝",
        "带走更清楚的「爆」门槛",
      ],
      "你现在大约有多少粉丝？",
    ),
  },
  "six-caption-angles": {
    en: opener(
      "Hey. Ready to help you write six caption angles as one-liners under the video.",
      [
        "We will give six angles, not six full essays",
        "Bring what the video already does, in one breath",
        "You leave with paste-ready one-liners",
      ],
      "What does the video already do, in one breath?",
    ),
    zh: openerZh(
      "我会帮你写六个文案角度，都是视频下的一行话。",
      [
        "六个角度，不是六篇长文",
        "你用一句话说视频已经在做什么",
        "带走可直接贴的一行文案",
      ],
      "用一句话说，这条视频已经在做什么？",
    ),
  },
  "four-content-layers": {
    en: opener(
      "Hey. Ready to help you plan The 4 Content Layers.",
      [
        "We will place Story, Case, POV, and News for your lane",
        "Bring who you serve",
        "You leave with a simple layer plan",
      ],
      "Who do you serve?",
    ),
    zh: openerZh(
      "我会帮你规划内容四层。",
      [
        "为你的赛道排好故事、案例、观点、新闻",
        "你带上服务谁",
        "带走简单的分层计划",
      ],
      "你服务谁？",
    ),
  },
  "content-authority-ladder": {
    en: opener(
      "Hey. Ready to help you place yourself on the Content Authority Ladder.",
      [
        "We will see where you sit from News to POV to Case to Story",
        "Bring what you have been publishing lately",
        "You leave with the next rung to climb",
      ],
      "What have you been publishing lately?",
    ),
    zh: openerZh(
      "我会帮你看清自己在内容权威阶梯上的位置。",
      [
        "从新闻到观点、案例、故事，看你在哪一格",
        "你带上最近在发什么",
        "带走下一阶该爬什么",
      ],
      "你最近在发什么？",
    ),
  },
};

/**
 * Escape a string for use inside a TypeScript double-quoted string.
 * @param {string} value
 */
function escapeTs(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

/**
 * Replace chatOpener (and optional inline chatOpenerZh) in a pack file.
 * @param {string} source
 * @param {{ en: string; zh: string }} pair
 * @param {boolean} hasInlineZh
 */
function replaceOpenersInPack(source, pair, hasInlineZh) {
  const enLiteral = `"${escapeTs(pair.en)}"`;
  const zhLiteral = `"${escapeTs(pair.zh)}"`;

  let next = source.replace(
    /chatOpener:\s*(?:\r?\n\s*)?(?:"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)/,
    `chatOpener:\n    ${enLiteral}`,
  );

  if (hasInlineZh) {
    next = next.replace(
      /chatOpenerZh:\s*(?:\r?\n\s*)?(?:"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)/,
      `chatOpenerZh:\n    ${zhLiteral}`,
    );
  }

  return next;
}

const packFiles = fs.readdirSync(packsDir).filter((f) => f.endsWith(".ts") && f !== "index.ts");
let updated = 0;
const missing = [];

for (const file of packFiles) {
  const moduleId = file.replace(/\.ts$/, "");
  const pair = OPENERS[moduleId];
  if (pair === undefined) {
    missing.push(moduleId);
    continue;
  }

  const fullPath = path.join(packsDir, file);
  const source = fs.readFileSync(fullPath, "utf8");
  const hasInlineZh = /chatOpenerZh:/.test(source);
  const next = replaceOpenersInPack(source, pair, hasInlineZh);
  if (next === source) {
    console.warn(`No chatOpener replace matched: ${file}`);
    continue;
  }
  fs.writeFileSync(fullPath, next, "utf8");
  updated += 1;
}

const zhEntries = Object.entries(OPENERS)
  .map(([id, pair]) => `  "${id}":\n    "${escapeTs(pair.zh)}",`)
  .join("\n");

const zhFile = `/**
 * Chinese chat openers keyed by module id.
 * Kept beside packs so EN openers stay in pack files; locale helper picks ZH here.
 * Shape: spoken greeting + markdown bullets + one question (no curriculum transition).
 */

export const PACK_CHAT_OPENERS_ZH: Record<string, string> = {
${zhEntries}
};
`;

fs.writeFileSync(zhMapPath, zhFile, "utf8");

let localeSource = fs.readFileSync(localePath, "utf8");
localeSource = localeSource.replace(
  /export function defaultChatOpener\(locale: Locale\): string \{[\s\S]*?\n\}/,
  `export function defaultChatOpener(locale: Locale): string {
  if (locale === "zh") {
    return "我会陪你跑完这个 IP 工具。\\n\\n- 先说清楚你这次要带走的一件事\\n- 你用白话回答就行\\n- 需要时我直接交一版草稿\\n\\n你这次最需要拿到的一件事是什么？";
  }
  return "Hey. Let's finish this IP tool together.\\n\\n- Name the one outcome you need from this session\\n- Answer in plain words as we go\\n- I will draft when you are ready\\n\\nWhat is the one thing you need from this session?";
}`,
);
fs.writeFileSync(localePath, localeSource, "utf8");

console.log(`Updated ${String(updated)} pack files.`);
console.log(`ZH map entries: ${String(Object.keys(OPENERS).length)}`);
if (missing.length > 0) {
  console.log(`Missing openers for: ${missing.join(", ")}`);
  process.exitCode = 1;
}
