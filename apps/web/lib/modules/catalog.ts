import type { ModuleCategory, ModuleDefinition } from "@/lib/modules/types";

/**
 * Full Jeff IP module menu (proposed set shipped for stakeholder cut).
 * Product UX copy only: not doctrine pages for jeff-wiki ingest.
 */
export const MODULE_CATALOG: ModuleDefinition[] = [
  {
    id: "ip-stage-check",
    title: "IP Stage Check",
    category: "IP Foundation",
    status: "ready",
    description: [
      "What it does: Diagnoses where you are stuck in the see → trust → convert path. It names whether you are mainly unseen, trusted but not converting, or converting without a clear next move, then points you to the next module to open.",
      "What to input: Your niche or industry, what you sell or want to be known for, how often you show up on camera or in content, and what feels stuck (views, trust, or deals).",
      "When to use: At the start of personal IP work, after a quiet stretch, or when advice to post more is not helping.",
      "What you get: A plain-language stage read, one priority focus, and a recommended next tool from this wall.",
    ].join("\n\n"),
  },
  {
    id: "standpoint-builder",
    title: "Standpoint Builder",
    category: "IP Foundation",
    status: "ready",
    description: [
      "What it does: Helps you write one sharp 立场 (standpoint) line so people know what you stand for, not only what you sell.",
      "What to input: Who you serve, what you believe that others soft-pedal, and what you refuse to do in your work.",
      "When to use: Before filming, before a profile rewrite, or when your content sounds generic and interchangeable.",
      "What you get: A short standpoint line you can say on camera, plus a note on how to keep it advice-led rather than ego-led.",
    ].join("\n\n"),
  },
  {
    id: "boss-brand-brief",
    title: "Boss Brand Brief",
    category: "IP Foundation",
    status: "ready",
    description: [
      "What it does: Frames the founder face as the brand: who you are on camera, what to film, and what boss brand means for a lean personal IP, not a big agency campaign.",
      "What to input: Your role (founder, expert, operator), audience, one proof point you are willing to show, and topics you can teach without a script team.",
      "When to use: When you know you need to be the face, but the calendar is empty of filmable ideas.",
      "What you get: A short brief: positioning angle, filmable situations, and a simple do / don't list for looking like a brand without looking like an ad.",
    ].join("\n\n"),
  },
  {
    id: "lean-ip-setup",
    title: "Lean IP Setup",
    category: "IP Foundation",
    status: "ready",
    description: [
      "What it does: Gives a starter operating rhythm for personal IP without a full crew, studio, or daily content factory.",
      "What to input: Hours you can honestly give per week, platforms you already use, and whether you are more comfortable teaching, storytelling, or hot takes.",
      "When to use: When you are starting from zero capacity, or when waiting for a full media team is blocking you from shipping anything.",
      "What you get: A lean weekly rhythm (capture, edit lightly, post, review), plus a minimum kit mindset: phone, light, and consistency over polish theater.",
    ].join("\n\n"),
  },
  {
    id: "who-i-serve",
    title: "Who I Serve",
    category: "IP Foundation",
    status: "ready",
    description: [
      "What it does: Clarifies your ideal customer and why they buy you (the person and craft), not only the product on the shelf.",
      "What to input: Who you want to serve, what problem they bring, why they should choose you over a cheaper or louder option, and one proof of fit you already have.",
      "When to use: Before you write offers or scripts, when your audience description is \"everyone,\" or when content talks about features but not who it is for.",
      "What you get: A short ideal-customer sketch, a why-they-buy-you line, and one content angle that shows people-first fit.",
    ].join("\n\n"),
  },
  {
    id: "ip-pillars",
    title: "IP Pillars",
    category: "IP Foundation",
    status: "ready",
    description: [
      "What it does: Turns your craft into 3 to 5 recurring content themes (pillars) you can rotate without inventing a new topic every day.",
      "What to input: What you do day to day, questions clients ask, results you can show, and the standpoint you want people to remember.",
      "When to use: When your feed feels random, when you run out of ideas mid-week, or when you need a simple theme map before planning scripts.",
      "What you get: Three to five named pillars, example post angles under each, and a note on rotating see / trust / convert without volume-as-money thinking.",
    ].join("\n\n"),
  },
  {
    id: "ig-reel-script",
    title: "IG Reel Script",
    category: "Get Seen",
    status: "ready",
    description: [
      "What it does: Writes a shootable 15-45 second Instagram Reel script in Jeff's content-asset style: hook, body beats, close. Built to get you seen and useful, not to hard-sell in the first second.",
      "What to input: Niche or industry, audience, your standpoint or offer angle, one lesson or story beat, language preference, and how soft the close should be.",
      "When to use: When you need a concrete Reel to film this week, or when drafts keep sounding like ads instead of teaching assets.",
      "What you get: A structured script (hook, body, close), optional on-screen text cues, and a close that invites without overnight-fame promises.",
    ].join("\n\n"),
  },
  {
    id: "scroll-stop-hook",
    title: "Scroll-Stop Hook",
    category: "Get Seen",
    status: "ready",
    description: [
      "What it does: Focuses only on opening lines that earn the first second of attention, without writing the full Reel.",
      "What to input: Topic, audience pain or curiosity, and the standpoint you want the hook to imply.",
      "When to use: When the body of your video is fine but people scroll past the first frame, or when you want several hook options to A/B mentally before filming.",
      "What you get: Multiple scroll-stop opening lines, with a note on what makes each stop-worthy without clickbait that breaks trust.",
    ].join("\n\n"),
  },
  {
    id: "value-teaching-reel",
    title: "Value Teaching Reel",
    category: "Get Seen",
    status: "ready",
    description: [
      "What it does: Scripts a Reel that teaches one tip openly, then adds a light next step. Value first; soft convert later.",
      "What to input: The one tip you can teach in under a minute, who it helps, and what gentle next step (follow, save, DM keyword, or booking) feels honest.",
      "When to use: When you want trust-building content, or when your feed is all promo and no teaching.",
      "What you get: A value-led Reel outline with a clear teaching beat and a light invite that does not flip into a hard pitch.",
    ].join("\n\n"),
  },
  {
    id: "hot-take-script",
    title: "Hot Take Script",
    category: "Get Seen",
    status: "ready",
    description: [
      "What it does: Turns a sharp standpoint into an on-camera hot take that still reads as advice, not ego performance.",
      "What to input: The claim you want to make, who it challenges, and the practical truth behind the heat.",
      "When to use: When you need contrast in a crowded niche, or when soft educational posts are not showing your edge.",
      "What you get: A short hot-take script with stance, reason, and a landing that protects relationship with the viewer.",
    ].join("\n\n"),
  },
  {
    id: "process-proof-reel",
    title: "Process Proof Reel",
    category: "Get Seen",
    status: "ready",
    description: [
      "What it does: Scripts a short Reel that shows why customers choose you and how you work, as advice for the viewer rather than ego flex.",
      "What to input: Why people pick you, one step of your process you can show on camera, and what the viewer should take away even if they never buy.",
      "When to use: When you need proof content without a hard sell, or when your feed claims expertise but never shows the work.",
      "What you get: A process-proof Reel script (hook, how we work beat, soft close) that stays advice-led.",
    ].join("\n\n"),
  },
  {
    id: "first-impression-script",
    title: "First Impression Script",
    category: "Get Seen",
    status: "ready",
    description: [
      "What it does: Turns an event or viewpoint into a first-impression piece: open discussion, then light traffic toward your space.",
      "What to input: The event or moment, your viewpoint on it, who should care, and where you want curious people to go next (profile, follow, save, or soft invite).",
      "When to use: After a talk, launch, news moment, or industry event when you want presence without overnight-fame framing.",
      "What you get: A short first-impression script: viewpoint → discussion beat → traffic invite that stays asset-like.",
    ].join("\n\n"),
  },
  {
    id: "short-vs-long-planner",
    title: "Short vs Long Planner",
    category: "Get Seen",
    status: "ready",
    description: [
      "What it does: Helps you decide when short video is for volume of exposure versus when long video is for trust depth.",
      "What to input: Your current stage (unseen vs trust-building), topics you can cover, and capacity for short clips versus longer sits.",
      "When to use: When you are confused about Reels vs YouTube-style length, or when you are only posting short and wonder why trust is flat.",
      "What you get: A simple plan: which topics go short, which go long, and how they support see → trust without volume-equals-money thinking.",
    ].join("\n\n"),
  },
  {
    id: "long-video-trust-script",
    title: "Long Video Trust Script",
    category: "Earn Trust",
    status: "ready",
    description: [
      "What it does: Outlines a YouTube-style deeper teach so viewers stay long enough to trust your judgment, not only your hook.",
      "What to input: The topic you can teach for 5 to 15 minutes, who it helps, one story or example from your practice, and the trust outcome you want.",
      "When to use: When short clips get views but not belief, or when a topic needs depth the Reel format cannot hold.",
      "What you get: A long-video outline (open, teaching sections, close) labeled as structure for your craft, with a soft next step.",
    ].join("\n\n"),
  },
  {
    id: "story-trust-script",
    title: "Story Trust Script",
    category: "Earn Trust",
    status: "ready",
    description: [
      "What it does: Turns a personal or client story into a belief-building script without inventing Jeff case studies as doctrine.",
      "What to input: The story (yours or a client you have permission to paraphrase), the belief you want the viewer to take, and what stays private.",
      "When to use: When teaching tips feel dry, or when you need human proof that your standpoint is lived.",
      "What you get: A story script with setup, turn, belief land, and a note that stories illustrate; they are not universal Jeff patient scripts.",
    ].join("\n\n"),
  },
  {
    id: "authority-relatable-mixer",
    title: "Authority Relatable Mixer",
    category: "Earn Trust",
    status: "ready",
    description: [
      "What it does: Helps you mix authority and relatability so you know what role can show (teacher / performer / live host energy) and what it should not overplay.",
      "What to input: How you usually show up, where you feel stiff or too casual, and what your audience needs to trust you.",
      "When to use: When you look expert but cold, or warm but not credible, or when you keep switching personas with no plan.",
      "What you get: A mix brief: what to show more of, what to dial down, and one filmable beat that balances authority with human.",
    ].join("\n\n"),
  },
  {
    id: "faq-content-bank",
    title: "FAQ Content Bank",
    category: "Earn Trust",
    status: "ready",
    description: [
      "What it does: Turns common client questions into a short post series that builds trust through answers, not ads.",
      "What to input: Five to ten questions you hear often, your niche, and which answers you can give without oversharing confidential detail.",
      "When to use: When you are out of topics, or when DMs repeat the same questions you could answer once on camera.",
      "What you get: A bank of FAQ titles plus 1 to 2 sentence angles for each, ready to turn into Reels or captions.",
    ].join("\n\n"),
  },
  {
    id: "learning-journey-series",
    title: "Learning Journey Series",
    category: "Earn Trust",
    status: "ready",
    description: [
      "What it does: Maps a short series arc for \"how I got here\" or \"how we work\" so trust builds across multiple posts.",
      "What to input: Where you started, a turning point, how you work now, and what the viewer should learn without copying your whole life story.",
      "When to use: When one-off posts feel disconnected, or when you want a multi-part trust arc without inventing drama.",
      "What you get: A 3 to 5 episode outline with purpose tags and soft continuity between parts.",
    ].join("\n\n"),
  },
  {
    id: "soundbite-one-liner",
    title: "Soundbite One-Liner",
    category: "Earn Trust",
    status: "ready",
    description: [
      "What it does: Crafts short punches in your niche voice that carry standpoint without needing a full script.",
      "What to input: Your niche, the belief you want remembered, words you actually say, and words that feel fake on your tongue.",
      "When to use: For captions, on-screen text, profile lines, or closing punches after a teach.",
      "What you get: Several one-liners plus a note on which fit advice tone versus ego flex.",
    ].join("\n\n"),
  },
  {
    id: "content-asset-planner",
    title: "Content Asset Planner",
    category: "Content Asset System",
    status: "ready",
    description: [
      "What it does: Builds a week plan of content assets tagged see / trust / convert so you are not posting random volume.",
      "What to input: Your stage (unseen, building trust, or converting), available filming slots, and themes you can cover without research theater.",
      "When to use: At the start of a week, after a random posting streak, or when you need balance across exposure, trust, and invites.",
      "What you get: A simple weekly slate with purpose tags and a reminder that assets beat ad spam.",
    ].join("\n\n"),
  },
  {
    id: "direction-fixer",
    title: "Direction Fixer",
    category: "Content Asset System",
    status: "ready",
    description: [
      "What it does: Stops the vague advice to post more. It helps you pick a path: what to double down on, what to pause, and why.",
      "What to input: What you have been posting, what metrics or gut feel worry you, and what outcomes you actually want (seen, trusted, booked).",
      "When to use: When effort is high and clarity is low, or when every coach tells you volume is the answer.",
      "What you get: A direction call with one primary lane, one secondary lane, and what to stop doing for now.",
    ].join("\n\n"),
  },
  {
    id: "value-convert-ladder",
    title: "Value → Convert Ladder",
    category: "Content Asset System",
    status: "ready",
    description: [
      "What it does: Maps how free value leads into a natural invite, so convert content does not appear out of nowhere.",
      "What to input: What you teach for free, what you sell, and where people currently drop off between liked the tip and ready to talk.",
      "When to use: When trust content never turns into conversations, or when convert posts feel abrupt.",
      "What you get: A short ladder of asset types from value → invite, with language that stays coach-like rather than funnel-y.",
    ].join("\n\n"),
  },
  {
    id: "ad-vs-asset-checker",
    title: "Ad vs Asset Checker",
    category: "Content Asset System",
    status: "ready",
    description: [
      "What it does: Reviews a draft and flags whether it reads like a sales ad or like a content asset. Rewrites toward asset when it is too salesy.",
      "What to input: Paste your caption, script, or outline, plus the audience and the honest goal of the post.",
      "When to use: Before you post something that feels pushy, or when people say your draft sounds like an ad.",
      "What you get: A verdict (ad vs asset), why, and a rewritten version that keeps the point without hard-sell tone.",
    ].join("\n\n"),
  },
  {
    id: "comment-to-content",
    title: "Comment to Content",
    category: "Content Asset System",
    status: "ready",
    description: [
      "What it does: Turns comments, pushback, or DMs into your next scripts so objections become teaching assets.",
      "What to input: The comment or pushback (paste), your honest reply instinct, and whether you want a Reel, caption, or story response.",
      "When to use: After a spicy comment, when the same question keeps showing up, or when criticism feels like a dead end.",
      "What you get: One or more next-script angles that answer the comment as advice, not as a fight.",
    ].join("\n\n"),
  },
  {
    id: "content-ideation-ip",
    title: "Content Ideation (IP)",
    category: "Content Asset System",
    status: "ready",
    description: [
      "What it does: Generates content ideas from your process, FAQs, results, and standpoint so ideation stays IP-shaped.",
      "What to input: How you work, questions you get, results you can show, and the standpoint line you want reinforced.",
      "When to use: When the blank page wins, or when ideas feel random instead of on-brand for your personal IP.",
      "What you get: A short idea list tagged see / trust / convert, each tied to process, question, result, or standpoint.",
    ].join("\n\n"),
  },
  {
    id: "advice-vs-ego-coach",
    title: "Advice vs Ego Coach",
    category: "On-Camera Coach",
    status: "ready",
    description: [
      "What it does: A pre-shoot checklist so you show up as advice for the viewer, not as ego for yourself.",
      "What to input: What you plan to say, why it matters to them, and any flex lines you are tempted to keep.",
      "When to use: Right before filming, or when past videos felt self-congratulatory even when the tip was useful.",
      "What you get: A go / fix checklist, lines to cut or reframe, and a reminder of how Jeff separates advice from ego.",
    ].join("\n\n"),
  },
  {
    id: "criticism-armor",
    title: "Criticism Armor",
    category: "On-Camera Coach",
    status: "ready",
    description: [
      "What it does: Helps you stay consistent when hate, doubt, or 变好羞耻症 (shame about getting better / showing up) shows up after you post.",
      "What to input: What criticism you fear or already got, what you believe about your work, and what staying consistent looks like for you this month.",
      "When to use: After a harsh comment, before a vulnerable post, or when you are tempted to quit because growth feels exposed.",
      "What you get: A short armor plan: what to ignore, what to learn from, and how to keep posting without performing toughness.",
    ].join("\n\n"),
  },
  {
    id: "bianhao-coach",
    title: "变好羞耻症 Coach",
    category: "On-Camera Coach",
    status: "ready",
    description: [
      "What it does: Coaches through 变好羞耻症: family or peer pressure when you improve, show up on camera, or outgrow old norms.",
      "What to input: Who is pressuring you, what they say, what you are trying to build, and what consistency looks like this month.",
      "When to use: When growth triggers shame or pushback at home or among peers, or when you hide progress to keep the peace.",
      "What you get: A short plan: what to ignore, what to reframe, and how to keep showing up without performing toughness or overnight-fame talk.",
    ].join("\n\n"),
  },
  {
    id: "high-ticket-caution",
    title: "High-Ticket Caution",
    category: "On-Camera Coach",
    status: "ready",
    description: [
      "What it does: Helps you decide when NOT to film weakness or messy process if your offer is high-trust or high-ticket and premature vulnerability would hurt.",
      "What to input: What you sell, how high the trust bar is, what you were about to film, and what risk worries you.",
      "When to use: Before posting a \"behind the scenes struggle\" for a premium offer, or when relatability advice conflicts with client confidence.",
      "What you get: A caution call: film / don't film / film differently, with reasons grounded in trust timing, not fake scarcity theater.",
    ].join("\n\n"),
  },
  {
    id: "dont-outsource-judgment",
    title: "Don't Outsource Judgment",
    category: "On-Camera Coach",
    status: "ready",
    description: [
      "What it does: Keeps AI drafts in their place: useful drafts, human final judgment. You decide what is true for your craft.",
      "What to input: The AI draft (paste), what you agree with, what feels off, and the decision only you can make.",
      "When to use: After ChatGPT or any model drafts a script or plan, before you post or teach from it.",
      "What you get: A keep / cut / rewrite pass plus a clear reminder that judgment stays with you.",
    ].join("\n\n"),
  },
  {
    id: "soft-cta-closer",
    title: "Soft CTA Closer",
    category: "Convert",
    status: "ready",
    description: [
      "What it does: Ends a value piece with one clear next step without flipping the whole post into a hard sell.",
      "What to input: The value you already taught, the one next step you want (follow, save, DM, book), and how warm the audience is.",
      "When to use: When your teach is strong but the ending trails off, or when closes feel either missing or too pushy.",
      "What you get: Two to three soft close options plus guidance to pick one. KB on offers is thin: steer with Jeff craft, no invented funnel architecture.",
    ].join("\n\n"),
  },
  {
    id: "trust-offer-bridge",
    title: "Trust → Offer Bridge",
    category: "Convert",
    status: "ready",
    description: [
      "What it does: Writes messaging that assumes trust is already built and bridges into talking about what you offer, without overnight-fame or ad-as-asset framing.",
      "What to input: What trust you have earned, what you offer in plain words, and what the honest next conversation is.",
      "When to use: When people already trust you but you freeze when naming the offer, or when invite posts feel disconnected from prior teaching.",
      "What you get: A short bridge script or caption. Knowledge on full offer systems is thin: Generally → Jeff → steer; no invented offer architecture.",
    ].join("\n\n"),
  },
  {
    id: "dm-comment-closer",
    title: "DM / Comment Closer",
    category: "Convert",
    status: "ready",
    description: [
      "What it does: Drafts a reply that moves warm interest in comments or DMs toward a clear next step without pressure theater.",
      "What to input: The comment or DM (paste), what they seem to want, and the next step you can honestly offer.",
      "When to use: When warm leads go cold because your replies are vague, or when you over-pitch in the first reply.",
      "What you get: A reply draft plus a softer and firmer variant. Stay coach-like; do not invent Jeff sales scripts as doctrine.",
    ].join("\n\n"),
  },
  {
    id: "offer-explanation-simple",
    title: "Offer Explanation (Simple)",
    category: "Convert",
    status: "ready",
    description: [
      "What it does: Explains what you sell in plain language so a stranger understands the outcome without jargon or fake scarcity.",
      "What to input: What you sell, who it is for, the outcome, and what it is not.",
      "When to use: For profile bios, pinned comments, landing blurbs, or when you cannot say your offer in one breath.",
      "What you get: A plain-language offer paragraph and a shorter line. No invented Jeff funnel or pricing architecture; facts come from your intake.",
    ].join("\n\n"),
  },
  {
    id: "script-humanizer",
    title: "Script Humanizer",
    category: "Polish",
    status: "ready",
    description: [
      "What it does: Turns a stiff, essay-like draft into a 1-on-1 speakable script you can say to camera without sounding like a brochure.",
      "What to input: Paste the stiff draft, note your natural speaking language, and flag any jargon you must keep.",
      "When to use: When AI or written drafts sound correct but unspeakable, or when you freeze reading your own script aloud.",
      "What you get: A humanized script with shorter lines, spoken rhythm, and coach tone that still keeps your point.",
    ].join("\n\n"),
  },
  {
    id: "revision-sharpen",
    title: "Revision Sharpen",
    category: "Polish",
    status: "ready",
    description: [
      "What it does: Cuts fluff and sharpens a draft to one diagnosis and one move so the viewer knows what changed.",
      "What to input: Paste the draft, the one point that must survive, and what feels padded.",
      "When to use: When a script is \"fine\" but long, or when you have three messages fighting in one video.",
      "What you get: A sharpened version with a one-line diagnosis of what was wrong and one clear move you made.",
    ].join("\n\n"),
  },
  {
    id: "hook-rewriter",
    title: "Hook Rewriter",
    category: "Polish",
    status: "ready",
    description: [
      "What it does: Keeps your script body and rewrites only the open so the first seconds earn attention without clickbait that breaks trust.",
      "What to input: Paste the full script or at least the current hook plus the body topic, and the audience.",
      "When to use: When the middle is strong but people leave in second one, or when you want several stronger opens for the same piece.",
      "What you get: Multiple rewritten hooks plus a note on which to film first.",
    ].join("\n\n"),
  },
  {
    id: "platform-adapter",
    title: "Platform Adapter",
    category: "Polish",
    status: "ready",
    description: [
      "What it does: Adapts one piece across Reel, caption, and story formats without changing the core standpoint.",
      "What to input: The source script or caption, which formats you need, and any length limits you care about.",
      "When to use: When you filmed once and want companion text, or when you need a story cut from a longer Reel.",
      "What you get: Adapted versions per format, still asset-like, not ad spam.",
    ].join("\n\n"),
  },
  {
    id: "bullet-caption-pack",
    title: "Bullet Caption Pack",
    category: "Polish",
    status: "ready",
    description: [
      "What it does: Writes supporting caption text under a Reel so the post teaches even on mute-scroll or save-later reading.",
      "What to input: The Reel topic or script summary, key bullets you must include, and CTA softness.",
      "When to use: After you have a video draft but the caption is empty, or when saves matter as much as views.",
      "What you get: A caption with short bullets, a soft close, and optional on-screen text echoes.",
    ].join("\n\n"),
  },
];

/** Category order for the All Tools page (Jeff ladder rails). */
export const MODULE_CATEGORY_ORDER: ModuleCategory[] = [
  "IP Foundation",
  "Get Seen",
  "Earn Trust",
  "Content Asset System",
  "On-Camera Coach",
  "Convert",
  "Polish",
];

/**
 * Optional compact featured strip on /tools (not a curriculum journey).
 * Order is display order: IG Reel Script, Standpoint Builder, Who I Serve.
 */
export const FEATURED_MODULE_IDS: readonly string[] = [
  "ig-reel-script",
  "standpoint-builder",
  "who-i-serve",
];

/** Catalog id for IP Stage Check when deep-linked as a normal tool. */
export const START_MODULE_ID = "ip-stage-check";

/**
 * Looks up a module by id. Returns undefined when the id is not in the catalog.
 */
export function getModuleById(moduleId: string): ModuleDefinition | undefined {
  return MODULE_CATALOG.find((module) => module.id === moduleId);
}

/**
 * Resolves status with a default of "soon" when omitted.
 */
export function getModuleStatus(module: ModuleDefinition): "ready" | "soon" {
  return module.status ?? "soon";
}

/**
 * Catalog module count (used by ZH coverage checks and docs).
 */
export const MODULE_CATALOG_COUNT = MODULE_CATALOG.length;
