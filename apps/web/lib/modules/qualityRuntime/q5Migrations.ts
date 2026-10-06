/**
 * Q5 Quality Runtime migration registry (remaining Map / Ideation / Planner / Mindset / Rewrite / leftovers).
 * Applied at pack registration via finalizeQ5Pack. BUILDER ONLY.
 */

import type { Q5MigrationSpec } from "@/lib/modules/qualityRuntime/finalizeQ5";
import { defaultIdkForLabel, q5Openers } from "@/lib/modules/qualityRuntime/finalizeQ5";
import type { QualityFamilyId } from "@/lib/modules/qualityRuntime/types";

function idkMap(entries: Array<{ id: string; label: string }>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const entry of entries) {
    out[entry.id] = defaultIdkForLabel(entry.label);
  }
  return out;
}

function spec(opts: {
  family: QualityFamilyId;
  fields: Array<{ id: string; label: string; required: boolean }>;
  forceCriticalIds?: string[];
  jobEn: string;
  jobZh: string;
  askEn: string;
  askZh: string;
  sections: string[];
  levers: string[];
  confirmBlurb: string;
  refuseScriptLine?: string;
}): Q5MigrationSpec {
  const openers = q5Openers({
    jobEn: opts.jobEn,
    jobZh: opts.jobZh,
    askEn: opts.askEn,
    askZh: opts.askZh,
  });

  /** Include every required field, then fill to at least 3 IDK keys. */
  const forIdk: Array<{ id: string; label: string }> = [];
  const seenIds: Set<string> = new Set();
  for (const field of opts.fields) {
    if (!field.required) {
      continue;
    }
    if (seenIds.has(field.id)) {
      continue;
    }
    seenIds.add(field.id);
    forIdk.push({ id: field.id, label: field.label });
  }
  for (const field of opts.fields) {
    if (forIdk.length >= 3) {
      break;
    }
    if (seenIds.has(field.id)) {
      continue;
    }
    seenIds.add(field.id);
    forIdk.push({ id: field.id, label: field.label });
  }

  /** Packs with fewer than 3 intake fields get a constraint slot so Collect can gate. */
  const extraSlots =
    opts.fields.length < 3
      ? [
          {
            id: "constraint",
            label: "Constraint or boundary",
            criticality: "critical" as const,
            probeHint: "One constraint: time, tone, platform, or what they refuse to say.",
            idkOptions: defaultIdkForLabel("Constraint or boundary"),
          },
        ]
      : undefined;

  if (extraSlots !== undefined) {
    forIdk.push({ id: "constraint", label: "Constraint or boundary" });
  }

  const forceCriticalIds: string[] =
    opts.forceCriticalIds !== undefined
      ? [...opts.forceCriticalIds]
      : opts.fields.filter((field) => field.required).map((field) => field.id);

  if (extraSlots !== undefined && !forceCriticalIds.includes("constraint")) {
    forceCriticalIds.push("constraint");
  }

  while (forceCriticalIds.length < 3 && forceCriticalIds.length < opts.fields.length) {
    const nextId: string = opts.fields[forceCriticalIds.length].id;
    if (!forceCriticalIds.includes(nextId)) {
      forceCriticalIds.push(nextId);
    } else {
      break;
    }
  }

  return {
    qualityFamily: opts.family,
    confirmBlurb: opts.confirmBlurb,
    deliverableSectionOrder: opts.sections,
    refineLevers: opts.levers,
    idkOptionsBySlotId: idkMap(forIdk),
    forceCriticalIds,
    extraSlots,
    refuseScriptLine: opts.refuseScriptLine,
    ...openers,
  };
}

export const Q5_MIGRATIONS: Record<string, Q5MigrationSpec> = {
  "positioning-four-questions": spec({
    family: "positioning-map",
    fields: [{"id":"sellWhat","label":"What do you sell","required":true},{"id":"sellTo","label":"Who do you sell it to","required":true},{"id":"sellWhy","label":"Why do you sell it","required":true},{"id":"mostOf","label":"What are you the most of","required":true}],
    jobEn: "I'll help you answer four positioning questions so strangers know who you are for." ,
    jobZh: "我来帮你答完定位四问，让陌生人更快听懂你为谁工作。" ,
    askEn: "What do you sell, in one plain line?",
    askZh: "你卖的是什么，用一句话说？",
    sections: ["Answers to four questions","Crown: king of category","Ways to be the most","Named refine levers"],
    levers: ["sharper who","narrower audience","clearer proof or crown","tighter market language"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for four positioning answers plus crown category line. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "standpoint-builder": spec({
    family: "positioning-map",
    fields: [{"id":"insist","label":"坚持什么","required":true},{"id":"oppose","label":"反对什么","required":true},{"id":"realGap","label":"真实缺口 (FLAW)","required":true},{"id":"marketImpression","label":"One market-impression sentence","required":true},{"id":"language","label":"Language preference","required":false}],
    jobEn: "I'll help you lock a clear standpoint people can recognize." ,
    jobZh: "我来帮你立一个别人一眼能认出的立场。" ,
    askEn: "What do you insist on in your market?",
    askZh: "在你的市场里，你坚持什么？",
    sections: ["Structured map answers","Crown or stance line","Anti-audience or narrowing note","Named refine levers"],
    levers: ["sharper who","narrower audience","clearer proof or crown","tighter market language"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for IP Influence Triangle standpoint map. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "brand-stance-model": spec({
    family: "positioning-map",
    fields: [{"id":"standFor","label":"What you stand for","required":true},{"id":"standAgainst","label":"What you stand against","required":true},{"id":"realGap","label":"真实缺口 / FLAW (optional)","required":false}],
    forceCriticalIds: ["standFor","standAgainst","realGap"],
    jobEn: "I'll help you draft a clear brand stance with a real gap." ,
    jobZh: "我来帮你起草清楚的品牌立场。" ,
    askEn: "What do you stand for, in plain words?",
    askZh: "你坚持什么？用白话说。",
    sections: ["Structured map answers","Crown or stance line","Anti-audience or narrowing note","Named refine levers"],
    levers: ["sharper who","narrower audience","clearer proof or crown","tighter market language"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for brand stance legs with a real gap. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "boss-brand-brief": spec({
    family: "positioning-map",
    fields: [{"id":"role","label":"Your role","required":true},{"id":"audience","label":"Audience","required":true},{"id":"proof","label":"One proof point you are willing to show","required":true},{"id":"topics","label":"Topics you can teach without a script team","required":true}],
    jobEn: "I'll help you write a short founder-face brand brief you can film from." ,
    jobZh: "我来帮你写一份短的创办人品牌 brief，方便开拍。" ,
    askEn: "What is your role on camera?",
    askZh: "你的角色是什么，谁该认出你的脸？",
    sections: ["Structured map answers","Crown or stance line","Anti-audience or narrowing note","Named refine levers"],
    levers: ["sharper who","narrower audience","clearer proof or crown","tighter market language"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for founder-face brand brief for lean IP. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "ip-pillars": spec({
    family: "positioning-map",
    fields: [{"id":"whoAndPain","label":"WHO + 痛点","required":true},{"id":"marketQuestions","label":"10 market questions","required":true},{"id":"language","label":"Language preference","required":false}],
    forceCriticalIds: ["whoAndPain","marketQuestions","language"],
    jobEn: "I'll help you lock 3 to 5 durable content pillars you can teach for a long time." ,
    jobZh: "我来帮你定下 3 到 5 个能长期教的品牌支柱。" ,
    askEn: "Who do you help, and what pain shows up weekly?",
    askZh: "你帮谁，对方每周卡在什么痛点？",
    sections: ["Structured map answers","Crown or stance line","Anti-audience or narrowing note","Named refine levers"],
    levers: ["sharper who","narrower audience","clearer proof or crown","tighter market language"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for 3 to 5 durable content pillars. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "offer-explanation-simple": spec({
    family: "positioning-map",
    fields: [{"id":"whatYouSell","label":"What you sell","required":true},{"id":"whoFor","label":"Who it is for","required":true},{"id":"outcome","label":"Outcome","required":true},{"id":"notThis","label":"What it is not","required":false}],
    jobEn: "I'll help you explain your offer in plain language a stranger can understand." ,
    jobZh: "我来帮你用白话说明 offer，让陌生人也能听懂。" ,
    askEn: "What do you sell, in plain words?",
    askZh: "你卖什么，用白话说？",
    sections: ["Structured map answers","Crown or stance line","Anti-audience or narrowing note","Named refine levers"],
    levers: ["sharper who","narrower audience","clearer proof or crown","tighter market language"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for plain-language offer explanation. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "authority-relatable-mixer": spec({
    family: "positioning-map",
    fields: [{"id":"role","label":"Primary role (艺人 / 直播主 / 老师 / 博主)","required":true},{"id":"usualShowUp","label":"How you usually show up","required":true},{"id":"stiffOrCasual","label":"Where you feel stiff or too casual","required":true},{"id":"audienceNeed","label":"What audience needs to trust you","required":true},{"id":"format","label":"Format","required":false}],
    jobEn: "I'll help you mix authority and relatability so you still sound like yourself on camera." ,
    jobZh: "我来帮你混搭权威和亲和，让镜头上的你还像自己。" ,
    askEn: "Which role are you playing on camera?",
    askZh: "镜头前你更像哪种角色：表演者、主持人、老师，还是博主？",
    sections: ["Structured map answers","Crown or stance line","Anti-audience or narrowing note","Named refine levers"],
    levers: ["sharper who","narrower audience","clearer proof or crown","tighter market language"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for authority and relatability mix for your role. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "ad-vs-asset-checker": spec({
    family: "diagnosis",
    fields: [{"id":"draft","label":"Paste your draft","required":true},{"id":"audience","label":"Audience","required":true},{"id":"goal","label":"Honest goal of the post","required":true},{"id":"mustKeep","label":"Must-keep facts or offers","required":false}],
    jobEn: "I'll help you check whether a draft sounds like a hard-sell ad, or like a useful content asset." ,
    jobZh: "我来帮你看看这段草稿像硬广，还是像有用的内容资产。" ,
    askEn: "Paste the draft that might be ad-shaped.",
    askZh: "把要检查的草稿贴过来。",
    sections: ["Framing call","Evidence scorecard","Ranked next actions","Named refine levers"],
    levers: ["clearer framing call","stronger evidence cite","reordered next actions","tighter constraint"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for ad vs content-asset verdict plus rewrite. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "content-not-working-checklists": spec({
    family: "diagnosis",
    fields: [{"id":"symptom","label":"Symptom","required":true},{"id":"whatSold","label":"The business: what is actually sold","required":true},{"id":"methodGuess","label":"The method: loud or quiet","required":true},{"id":"customerWords","label":"The words customers use","required":true},{"id":"positioningGuess","label":"Positioning guess","required":true}],
    jobEn: "I'll help you run the Content Not Working checklists." ,
    jobZh: "我来帮你跑「内容失效」两套清单。" ,
    askEn: "What symptom makes you say content is not working?",
    askZh: "你觉得内容失效的症状是什么？没人看、没得拍，还是两个都有？",
    sections: ["Framing call","Evidence scorecard","Ranked next actions","Named refine levers"],
    levers: ["clearer framing call","stronger evidence cite","reordered next actions","tighter constraint"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for two coach checklists for content that is not working. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "hit-100x-followers": spec({
    family: "diagnosis",
    fields: [{"id":"followers","label":"Follower count","required":true},{"id":"recentViews","label":"Recent view numbers","required":true},{"id":"goal","label":"What you want next","required":true}],
    jobEn: "I'll help you define what counts as a hit for your account size." ,
    jobZh: "我来帮你按账号体量定义什么叫爆。" ,
    askEn: "About how many followers do you have?",
    askZh: "你现在大约有多少粉丝？",
    sections: ["Framing call","Evidence scorecard","Ranked next actions","Named refine levers"],
    levers: ["clearer framing call","stronger evidence cite","reordered next actions","tighter constraint"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for 100x hit diagnosis and series plan. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "direction-fixer": spec({
    family: "diagnosis",
    fields: [{"id":"posting","label":"What you have been posting","required":true},{"id":"worry","label":"What metrics or gut feel worry you","required":true},{"id":"outcomes","label":"Outcomes you actually want","required":true},{"id":"niche","label":"Niche or industry","required":false}],
    jobEn: "I'll help you make a clear direction call: keep, cut, and why." ,
    jobZh: "我来帮你做一次清楚的方向判断：留什么、砍什么、为什么。" ,
    askEn: "What have you been posting lately?",
    askZh: "你最近在发什么内容？",
    sections: ["Framing call","Evidence scorecard","Ranked next actions","Named refine levers"],
    levers: ["clearer framing call","stronger evidence cite","reordered next actions","tighter constraint"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for direction pick: double down vs pause. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "faq-content-bank": spec({
    family: "ideation-bank",
    fields: [{"id":"topicsOrQuestions","label":"题材 inputs (problems, views, myths, stories, or FAQ questions)","required":true},{"id":"niche","label":"Niche","required":true},{"id":"preferredForms","label":"Preferred 形式 (optional)","required":false},{"id":"statusDefault","label":"Default 状态 (optional)","required":false},{"id":"boundaries","label":"Answer boundaries","required":false}],
    forceCriticalIds: ["topicsOrQuestions","niche","preferredForms"],
    jobEn: "I'll help you build a CONTENT BANK you can reuse later." ,
    jobZh: "我来帮你建内容库 CONTENT BANK，方便以后反复取用。" ,
    askEn: "What material can you paste first: questions, views, myths, or stories?",
    askZh: "你先能贴哪类素材：问题、观点、误区，还是故事？",
    sections: ["Inventory filters","Numbered rows with 题材/分类/形式/状态","Reuse notes","Named refine levers"],
    levers: ["tighter filters","more usable bank rows","better tags","which row to film first"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for CONTENT BANK inventory rows. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "content-ideation-ip": spec({
    family: "ideation-bank",
    fields: [{"id":"renshe","label":"人设 (center)","required":true},{"id":"interestPro","label":"兴趣 / 专业","required":true},{"id":"viewStory","label":"观点 / 故事","required":true},{"id":"customerIndustry","label":"客户 / 行业","required":true},{"id":"trendPain","label":"趋势 / 痛点","required":true}],
    jobEn: "I'll help you fill Topic Bingo and grow about 12 filmable topic seeds." ,
    jobZh: "我来帮你填九宫格 Topic Bingo，长出大约 12 个能拍的题目。" ,
    askEn: "Who are you in this market, in one line?",
    askZh: "市场里你是谁，用一句话说？",
    sections: ["Filters used","Numbered bank","Tags / reuse notes","Named refine levers"],
    levers: ["tighter filters","more usable bank rows","better tags","which row to film first"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for Topic Bingo seeds with 穿心线. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "waffle-grid": spec({
    family: "ideation-bank",
    fields: [{"id":"whoYouAre","label":"Who you are and who you serve","required":true},{"id":"themes","label":"Themes you already own","required":true},{"id":"formats","label":"Formats you will use","required":false}],
    forceCriticalIds: ["whoYouAre","themes","formats"],
    jobEn: "I'll help you fill The Waffle idea grid." ,
    jobZh: "我来帮你填华夫饼九宫格。" ,
    askEn: "Who are you, and who do you serve?",
    askZh: "先说中心：你是谁，你帮谁？",
    sections: ["Filters used","Numbered bank","Tags / reuse notes","Named refine levers"],
    levers: ["tighter filters","more usable bank rows","better tags","which row to film first"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for waffle grid themes times formats. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "bullet-caption-pack": spec({
    family: "ideation-bank",
    fields: [{"id":"topic","label":"Reel topic or script summary","required":true},{"id":"bullets","label":"Key bullets to include","required":true},{"id":"ctaSoftness","label":"CTA softness","required":true},{"id":"language","label":"Language preference","required":false}],
    jobEn: "I'll help you write a caption that supports the Reel with short bullets and a soft close." ,
    jobZh: "我来帮你写配套文案：短要点加软收尾，服务 Reel 不抢戏。" ,
    askEn: "What is the Reel about?",
    askZh: "这条 Reel 讲什么？",
    sections: ["Filters used","Numbered bank","Tags / reuse notes","Named refine levers"],
    levers: ["tighter filters","more usable bank rows","better tags","which row to film first"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for supporting bullet caption under a Reel. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "six-caption-angles": spec({
    family: "ideation-bank",
    fields: [{"id":"videoPoint","label":"What the video already does","required":true},{"id":"audienceFeeling","label":"Unspoken audience feeling","required":true}],
    forceCriticalIds: ["videoPoint","audienceFeeling"],
    jobEn: "I'll help you write six one-line caption angles under the video." ,
    jobZh: "我来帮你写六个文案角度，都是视频下的一行话。" ,
    askEn: "What is the video point in one line?",
    askZh: "视频主旨用一句话说？",
    sections: ["Filters used","Numbered bank","Tags / reuse notes","Named refine levers"],
    levers: ["tighter filters","more usable bank rows","better tags","which row to film first"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for six one-line caption angles. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "four-content-layers": spec({
    family: "ideation-bank",
    fields: [{"id":"whoYouServe","label":"Who you serve","required":true},{"id":"proofAvailable","label":"Proof you can show","required":true},{"id":"weekGoal","label":"This week goal","required":false}],
    forceCriticalIds: ["whoYouServe","proofAvailable","weekGoal"],
    jobEn: "I'll help you plan the four content layers: Story, Case, POV, and News." ,
    jobZh: "我来帮你规划内容四层：故事、案例、观点、新闻。" ,
    askEn: "Who do you serve?",
    askZh: "你服务谁？",
    sections: ["Filters used","Numbered bank","Tags / reuse notes","Named refine levers"],
    levers: ["tighter filters","more usable bank rows","better tags","which row to film first"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for Story Case POV News layer plan. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "learning-journey-series": spec({
    family: "ideation-bank",
    fields: [{"id":"started","label":"Where you started","required":true},{"id":"turningPoint","label":"Turning point","required":true},{"id":"howWeWork","label":"How you work now","required":true},{"id":"viewerLearn","label":"What the viewer should learn","required":true},{"id":"episodeCount","label":"Preferred episode count","required":false}],
    jobEn: "I'll help you map a short learning-journey series with soft continuity." ,
    jobZh: "我来帮你排一条有软连贯的学习旅程系列。" ,
    askEn: "Where did you start in this craft?",
    askZh: "你在这件事上从哪里起步？",
    sections: ["Filters used","Numbered bank","Tags / reuse notes","Named refine levers"],
    levers: ["tighter filters","more usable bank rows","better tags","which row to film first"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for multi-part learning journey arc. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "comment-to-content": spec({
    family: "ideation-bank",
    fields: [{"id":"comment","label":"Comment or pushback","required":true},{"id":"instinct","label":"Your honest reply instinct","required":true},{"id":"format","label":"Desired format","required":true},{"id":"tone","label":"Tone guardrail","required":false}],
    jobEn: "I'll help you turn a comment into angles for your next script." ,
    jobZh: "我来帮你把评论转成下一支脚本的角度。" ,
    askEn: "Paste the comment or pushback.",
    askZh: "把评论或推回贴过来。",
    sections: ["Filters used","Numbered bank","Tags / reuse notes","Named refine levers"],
    levers: ["tighter filters","more usable bank rows","better tags","which row to film first"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for comment-to-teaching asset angles. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "three-c-method": spec({
    family: "ideation-bank",
    fields: [{"id":"audience","label":"Who watches","required":true},{"id":"controversial","label":"Controversial view","required":true},{"id":"commonInterest","label":"Common interest","required":true},{"id":"conflict","label":"Conflict worth having","required":true}],
    jobEn: "I'll help you run the Three C method for an outgoing owner: Controversial, Common interest, Conflict." ,
    jobZh: "我来帮外向型老板跑三 C 方法：争议、共同兴趣、冲突。" ,
    askEn: "Who is the audience for this reactive piece?",
    askZh: "这条反应式内容给谁看？",
    sections: ["Filters used","Numbered bank","Tags / reuse notes","Named refine levers"],
    levers: ["tighter filters","more usable bank rows","better tags","which row to film first"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for Three C reactive content set. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "three-r-method": spec({
    family: "ideation-bank",
    fields: [{"id":"industry","label":"Industry or craft","required":true},{"id":"readSource","label":"What you can read this week","required":true},{"id":"livedView","label":"Your lived view","required":true}],
    jobEn: "I'll help you run the Three R routine for a reserved owner: read, respond, then add your view." ,
    jobZh: "我来帮内敛型老板跑三 R 节奏：先读、再回应、再加你的观点。" ,
    askEn: "What industry are you in?",
    askZh: "你在哪个行业？",
    sections: ["Filters used","Numbered bank","Tags / reuse notes","Named refine levers"],
    levers: ["tighter filters","more usable bank rows","better tags","which row to film first"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for Three R read-then-respond routine. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "content-asset-planner": spec({
    family: "planner-ladder",
    fields: [{"id":"stage","label":"Your stage","required":true},{"id":"slots","label":"Available filming slots this week","required":true},{"id":"themes","label":"Themes you can cover without research theater","required":true},{"id":"platform","label":"Primary platform this week","required":false}],
    jobEn: "I'll help you plan with four content assets: exposure, recognition, trust, and conversion." ,
    jobZh: "我来帮你用四种内容资产做规划：曝光、认知、信任、成交。" ,
    askEn: "Are you mainly unseen, building trust, or converting?",
    askZh: "你现在主要是没被看见、在建信任，还是在成交？",
    sections: ["Stage mix across 四种内容资产","Day-by-slot plan","Checkpoints","Named refine levers"],
    levers: ["clearer horizon","rebalanced steps","stronger checkpoints","which step this week"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for 四种内容资产 week plan. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "content-asset-stack": spec({
    family: "planner-ladder",
    fields: [{"id":"piece","label":"Content piece or idea","required":true},{"id":"audience","label":"Who this is for","required":true},{"id":"currentStep","label":"Where they are now on the stack","required":true},{"id":"desiredStep","label":"Where you want them next","required":true}],
    jobEn: "I'll help you place one piece on the Content Asset Stack: see, remember, believe, ask, then buy." ,
    jobZh: "我来帮你把一条内容放到内容资产堆叠上看：看见、记住、相信、询问、成交。" ,
    askEn: "Which piece are we stacking?",
    askZh: "我们要堆叠的是哪一条内容？",
    sections: ["Horizon and constraint","Ladder or week plan","Checkpoints","Named refine levers"],
    levers: ["clearer horizon","rebalanced steps","stronger checkpoints","which step this week"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for 看见到成交 stack map. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "content-authority-ladder": spec({
    family: "planner-ladder",
    fields: [{"id":"recentPosts","label":"Recent posts","required":true},{"id":"ownedProof","label":"Owned proof or stories","required":true}],
    forceCriticalIds: ["recentPosts","ownedProof"],
    jobEn: "I'll help you place yourself on the Content Authority Ladder, from news to POV to case to story." ,
    jobZh: "我来帮你看清自己在内容权威阶梯上的位置：新闻、观点、案例、故事。" ,
    askEn: "Paste two recent posts in plain summary.",
    askZh: "用白话概括你最近发的两条内容。",
    sections: ["Horizon and constraint","Ladder or week plan","Checkpoints","Named refine levers"],
    levers: ["clearer horizon","rebalanced steps","stronger checkpoints","which step this week"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for News to Story authority ladder climb. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "short-vs-long-planner": spec({
    family: "planner-ladder",
    fields: [{"id":"stage","label":"Current stage","required":true},{"id":"topics","label":"Topics you can cover","required":true},{"id":"capacity","label":"Capacity","required":true},{"id":"platforms","label":"Platforms","required":false}],
    jobEn: "I'll help you plan which topics go short versus long." ,
    jobZh: "我来帮你规划哪些题目适合短、哪些适合长。" ,
    askEn: "What stage are you in right now?",
    askZh: "你现在处在哪个阶段？",
    sections: ["Horizon and constraint","Ladder or week plan","Checkpoints","Named refine levers"],
    levers: ["clearer horizon","rebalanced steps","stronger checkpoints","which step this week"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for short vs long format plan. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "value-convert-ladder": spec({
    family: "planner-ladder",
    fields: [{"id":"freeTeach","label":"What you teach for free","required":true},{"id":"sell","label":"What you sell","required":true},{"id":"dropOff","label":"Where people drop off","required":true},{"id":"pathGuess","label":"Likely purchase path (1 to 7)","required":false},{"id":"audience","label":"Audience","required":false}],
    jobEn: "I'll help you map where people drop on the path to buy." ,
    jobZh: "我来帮你看客户购买路径上掉在哪。" ,
    askEn: "What do you teach for free right now?",
    askZh: "你现在免费教什么？",
    sections: ["Horizon and constraint","Ladder or week plan","Checkpoints","Named refine levers"],
    levers: ["clearer horizon","rebalanced steps","stronger checkpoints","which step this week"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for value to convert path plan. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "lean-ip-setup": spec({
    family: "planner-ladder",
    fields: [{"id":"hours","label":"Hours you can honestly give per week","required":true},{"id":"platforms","label":"Platforms you already use","required":true},{"id":"comfort","label":"Comfort mode","required":true},{"id":"blocker","label":"What blocks you from shipping now","required":false}],
    jobEn: "I'll help you set a lean weekly IP rhythm you can actually keep." ,
    jobZh: "我来帮你定一套能坚持的轻量每周 IP 节奏。" ,
    askEn: "How many hours a week can you honestly give this?",
    askZh: "你每周能诚实拿出多少小时来拍和发？",
    sections: ["Horizon and constraint","Ladder or week plan","Checkpoints","Named refine levers"],
    levers: ["clearer horizon","rebalanced steps","stronger checkpoints","which step this week"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for lean personal IP operating rhythm. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "trust-offer-bridge": spec({
    family: "planner-ladder",
    fields: [{"id":"trustEarned","label":"Trust you have earned","required":true},{"id":"offerPlain","label":"What you offer in plain words","required":true},{"id":"nextConversation","label":"Honest next conversation","required":true},{"id":"pathGuess","label":"Purchase path this bridge serves (1 to 7)","required":false},{"id":"format","label":"Format","required":false}],
    jobEn: "I'll help you bridge from earned trust into a clear offer." ,
    jobZh: "我来帮你从已建立的信任接到清楚的 offer。" ,
    askEn: "What trust have you already earned on camera?",
    askZh: "你已经在镜头前赢得了什么信任？",
    sections: ["Horizon and constraint","Ladder or week plan","Checkpoints","Named refine levers"],
    levers: ["clearer horizon","rebalanced steps","stronger checkpoints","which step this week"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for trust to offer bridge on a named path. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "advice-vs-ego-coach": spec({
    family: "mindset-guardrail",
    fields: [{"id":"plan","label":"What you plan to say","required":true},{"id":"viewerWhy","label":"Why it matters to them","required":true},{"id":"flexLines","label":"Flex lines you are tempted to keep","required":false},{"id":"format","label":"Format","required":false}],
    forceCriticalIds: ["plan","viewerWhy","flexLines"],
    jobEn: "I'll help you check, before you film, whether this is advice for the viewer or a flex for yourself." ,
    jobZh: "我来帮你在开拍前检查：这话是给观众的建议，还是给自己炫耀。" ,
    askEn: "What do you plan to say on camera?",
    askZh: "你打算在镜头前说什么？",
    sections: ["Reframe","Do / don't","One practice","Named refine levers"],
    levers: ["sharper reframe","clearer do/don't","smaller practice","which line to keep"],
    confirmBlurb: "If needed, mirror in one short beat what guardrail plan you will deliver for advice vs ego pre-shoot checklist.",
  }),
  "criticism-armor": spec({
    family: "mindset-guardrail",
    fields: [{"id":"criticism","label":"Criticism you fear or already got","required":true},{"id":"baseline","label":"Your baseline (Baselines)","required":true},{"id":"consistent","label":"Keep Going this month","required":true},{"id":"shame","label":"变好羞耻症 / growth shame notes (optional)","required":false}],
    jobEn: "I'll help you turn criticism into a clear judgment call, not an emotional loop." ,
    jobZh: "我来帮你把批评变成清楚判断，别在情绪里打转。" ,
    askEn: "What criticism do you fear, or already got?",
    askZh: "你怕哪种批评，或已经收到了什么？",
    sections: ["Baselines","Reason / Evidence / Angle","Keep Going practice","Named refine levers"],
    levers: ["sharper reframe","clearer do/don't","smaller practice","which line to keep"],
    confirmBlurb: "If needed, mirror in one short beat what guardrail plan you will deliver for B.R.E.A.K shield judgment plan.",
  }),
  "bianhao-coach": spec({
    family: "mindset-guardrail",
    fields: [{"id":"whoPressure","label":"Who is pressuring you","required":true},{"id":"whatTheySay","label":"What they say","required":true},{"id":"building","label":"What you are trying to build","required":true},{"id":"consistency","label":"Consistency this month","required":true}],
    jobEn: "I'll help you face the pressure to make content \"better\" without forcing a stiff performance." ,
    jobZh: "我来陪你面对「内容要变好」的压力，不做强硬表演。" ,
    askEn: "Who is putting pressure on you as you improve?",
    askZh: "谁在逼你内容变好，他们怎么说？",
    sections: ["Reframe","Do / don't","One practice","Named refine levers"],
    levers: ["sharper reframe","clearer do/don't","smaller practice","which line to keep"],
    confirmBlurb: "If needed, mirror in one short beat what guardrail plan you will deliver for growth-shame coaching plan.",
  }),
  "high-ticket-caution": spec({
    family: "mindset-guardrail",
    fields: [{"id":"offer","label":"What you sell","required":true},{"id":"aboutToFilm","label":"What you were about to film","required":true},{"id":"risk","label":"Risk that worries you","required":true},{"id":"audienceWarmth","label":"Audience warmth","required":false}],
    jobEn: "I'll help you decide film, don't film, or film differently when the offer is high ticket." ,
    jobZh: "我来帮你对高客单时机做判断：拍、别拍，还是换拍法。" ,
    askEn: "What high-trust offer are you protecting?",
    askZh: "你在保护的高信任产品是什么？",
    sections: ["Reframe","Do / don't","One practice","Named refine levers"],
    levers: ["sharper reframe","clearer do/don't","smaller practice","which line to keep"],
    confirmBlurb: "If needed, mirror in one short beat what guardrail plan you will deliver for when not to film weakness call.",
  }),
  "dont-outsource-judgment": spec({
    family: "mindset-guardrail",
    fields: [{"id":"draft","label":"AI draft","required":true},{"id":"agree","label":"What you agree with","required":true},{"id":"off","label":"What feels off","required":true},{"id":"yourCall","label":"Decision only you can make","required":true}],
    jobEn: "I'll help you keep ownership while you edit an AI draft." ,
    jobZh: "我来帮你在改 AI 草稿时，把判断权留在自己手里。" ,
    askEn: "Paste the AI draft you want to review.",
    askZh: "把要审的 AI 草稿贴过来。",
    sections: ["Reframe","Do / don't","One practice","Named refine levers"],
    levers: ["sharper reframe","clearer do/don't","smaller practice","which line to keep"],
    confirmBlurb: "If needed, mirror in one short beat what guardrail plan you will deliver for AI draft pass with human judgment kept.",
  }),
  "two-kinds-student-two-methods": spec({
    family: "mindset-guardrail",
    fields: [{"id":"temperament","label":"Loud or quiet","required":true},{"id":"niche","label":"What they do","required":true},{"id":"stuck","label":"Where filming stuck","required":true}],
    jobEn: "I'll help you sort loud versus quiet energy and pick the matching method." ,
    jobZh: "我来帮你分清外向或内敛，并选对应路线。" ,
    askEn: "Are you more loud-reactive or quiet-reserved on camera?",
    askZh: "镜头前你更偏外向反应，还是内向克制？",
    sections: ["Reframe","Do / don't","One practice","Named refine levers"],
    levers: ["sharper reframe","clearer do/don't","smaller practice","which line to keep"],
    confirmBlurb: "If needed, mirror in one short beat what guardrail plan you will deliver for loud vs quiet method assignment.",
  }),
  "script-humanizer": spec({
    family: "rewrite-adapter",
    fields: [{"id":"draft","label":"Paste the stiff draft","required":true},{"id":"speakingLanguage","label":"Natural speaking language","required":true},{"id":"jargon","label":"Jargon you must keep","required":false},{"id":"length","label":"Target length","required":false}],
    forceCriticalIds: ["draft","speakingLanguage","jargon"],
    jobEn: "I'll help you turn a stiff draft into lines you can say one-on-one out loud." ,
    jobZh: "我来帮你把生硬草稿改成一对一能说出口的句子。" ,
    askEn: "Paste the draft that sounds like a brochure.",
    askZh: "把听起来像手册的草稿贴过来。",
    sections: ["Humanized speakable script","Keep list","Cut list","Named refine levers"],
    levers: ["more speakable","tighter cut","preserve intent better","which paragraph to read aloud"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for humanized speakable rewrite of your draft. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "platform-adapter": spec({
    family: "rewrite-adapter",
    fields: [{"id":"source","label":"Source script or caption","required":true},{"id":"formats","label":"Formats you need","required":true},{"id":"limits","label":"Length limits","required":false},{"id":"standpoint","label":"Standpoint to keep","required":false}],
    forceCriticalIds: ["source","formats","limits"],
    jobEn: "I'll help you adapt one piece across formats without losing your standpoint." ,
    jobZh: "我来帮你把同一条内容适配到不同格式，立场不丢。" ,
    askEn: "Paste the source piece to adapt.",
    askZh: "把要改写的原文贴过来。",
    sections: ["Before → after or adapted cut","Craft notes","What was preserved","Named refine levers"],
    levers: ["more speakable","tighter cut","preserve intent better","which paragraph to read aloud"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for cross-format adaptation keeping standpoint. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "revision-sharpen": spec({
    family: "rewrite-adapter",
    fields: [{"id":"draft","label":"Draft","required":true},{"id":"mustSurvive","label":"One point that must survive","required":true},{"id":"padded","label":"What feels padded","required":false},{"id":"language","label":"Language preference","required":false}],
    forceCriticalIds: ["draft","mustSurvive","padded"],
    jobEn: "I'll help you sharpen a draft with one diagnosis and one move." ,
    jobZh: "我来帮你用一个诊断加一个动作磨利草稿。" ,
    askEn: "Paste the draft that feels padded.",
    askZh: "把水分多的草稿贴过来。",
    sections: ["Before → after or adapted cut","Craft notes","What was preserved","Named refine levers"],
    levers: ["more speakable","tighter cut","preserve intent better","which paragraph to read aloud"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for sharpened cut with one diagnosis one move. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
  }),
  "soundbite-one-liner": spec({
    family: "hook-line",
    fields: [{"id":"niche","label":"Niche","required":true},{"id":"belief","label":"Belief to remember","required":true},{"id":"wordsYouSay","label":"Words you actually say","required":true},{"id":"wordsFake","label":"Words that feel fake","required":false}],
    jobEn: "I'll help you craft a Memory Hook: one line people can retell." ,
    jobZh: "我来帮你写出别人能复述的记忆钩子。" ,
    askEn: "What niche do you speak in?",
    askZh: "你在哪个细分领域说话？",
    sections: ["一句话 Memory Hook lines","一个场景","一个结果","Named refine levers"],
    levers: ["sharper line","clearer scene","stronger result","which line to film"],
    confirmBlurb: "Mirror the plan in 2 to 4 bullets for Memory Hook one-liner with scene and result. Name assumptions. Ask for go-ahead before the dense deliverable. Do not write a Reel script.",
    refuseScriptLine: "Opens and memory lines only. Never write a full Instagram Reel script here.",
  }),
};

export const Q5_MIGRATED_IDS: string[] = Object.keys(Q5_MIGRATIONS);
