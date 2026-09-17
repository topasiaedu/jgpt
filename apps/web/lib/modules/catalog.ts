import type { ModuleCategory, ModuleDefinition } from "@/lib/modules/types";

/**
 * Full Jeff IP module menu (proposed set shipped for stakeholder cut).
 * Product UX copy only: not doctrine pages for jeff-wiki ingest.
 */
export const MODULE_CATALOG: ModuleDefinition[] = [
  {
    id: "ip-stage-check",
    title: "IP Stage Check",
    category: "Ideation",
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
    category: "IP Positioning",
    status: "ready",
    description: [
      "What it does: Helps you write one sharp standpoint line so people know what you stand for, not only what you sell.",
      "What to input: Who you serve, what you believe that others soft-pedal, and what you refuse to do in your work.",
      "When to use: Before filming, before a profile rewrite, or when your content sounds generic and interchangeable.",
      "What you get: A short standpoint line you can say on camera, plus a note on how to keep it advice-led rather than ego-led.",
    ].join("\n\n"),
  },
  {
    id: "boss-brand-brief",
    title: "Boss Brand Brief",
    category: "IP Positioning",
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
    category: "IP Positioning",
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
    title: "Positioning One-Liner: Three-Line Map",
    category: "IP Positioning",
    status: "ready",
    description: [
      "What it does: Fills Jeff's Positioning One-Liner: Three-Line Map (AUG-D1 p038): Who I am / Who I help / What I solve, so the market quickly understands who you help.",
      "What to input: Who I am (identity, industry, experience, role), who I help, what I solve (problem or change the market buys), optional proof of fit.",
      "When to use: Before offers or scripts, when positioning is a long bio, or when content talks about you without naming who it is for.",
      "What you get: All three map lines, an optional one-liner that stitches them, and one people-first content angle.",
    ].join("\n\n"),
  },
  {
    id: "ip-pillars",
    title: "Brand Pillars",
    category: "IP Positioning",
    status: "ready",
    description: [
      "What it does: Maps Jeff Brand Pillars: 3 to 5 recurring content themes from your craft you can rotate without inventing a new topic every day.",
      "What to input: What you do day to day, questions clients ask, results you can show, and the standpoint you want people to remember.",
      "When to use: When your feed feels random, when you run out of ideas mid-week, or when you need a simple theme map before planning scripts.",
      "What you get: Three to five named pillars, example post angles under each, and a note on rotating see / trust / convert without volume-as-money thinking.",
    ].join("\n\n"),
  },
  {
    id: "ig-reel-script",
    title: "IG Reel Script",
    category: "Content",
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
    title: "Hook Formula",
    category: "Content",
    status: "ready",
    description: [
      "What it does: Applies Hook Formula: opening lines that earn the first second of attention, without writing the full Reel.",
      "What to input: Topic, audience pain or curiosity, and the standpoint you want the hook to imply.",
      "When to use: When the body of your video is fine but people scroll past the first frame, or when you want several hook options to A/B mentally before filming.",
      "What you get: Multiple scroll-stop opening lines, with a note on what makes each stop-worthy without clickbait that breaks trust.",
    ].join("\n\n"),
  },
  {
    id: "value-teaching-reel",
    title: "Value Teaching Reel",
    category: "Content",
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
    category: "Content",
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
    category: "Content",
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
    category: "Content",
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
    category: "Content",
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
    category: "Trust",
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
    category: "Trust",
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
    category: "Trust",
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
    title: "CONTENT BANK",
    category: "Content",
    status: "ready",
    description: [
      "What it does: Builds a CONTENT BANK from common client questions: a short post series that teaches through answers, not ads.",
      "What to input: Five to ten questions you hear often, your niche, and which answers you can give without oversharing confidential detail.",
      "When to use: When you are out of topics, or when DMs repeat the same questions you could answer once on camera.",
      "What you get: A bank of FAQ titles plus 1 to 2 sentence angles for each, ready to turn into Reels or captions.",
    ].join("\n\n"),
  },
  {
    id: "learning-journey-series",
    title: "Learning Journey Series",
    category: "Trust",
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
    title: "Memory Hook",
    category: "Trust",
    status: "ready",
    description: [
      "What it does: Builds a Memory Hook: one retellable line (plus scene and result when ready) in your niche voice, not slogan spam.",
      "What to input: Your niche, the belief you want remembered, words you actually say, and words that feel fake on your tongue.",
      "When to use: For captions, on-screen text, profile lines, or closing punches after a teach.",
      "What you get: Several one-liners plus a note on which fit advice tone versus ego flex.",
    ].join("\n\n"),
  },
  {
    id: "content-asset-planner",
    title: "Four Content Assets",
    category: "Content",
    status: "ready",
    description: [
      "What it does: Classifies and plans posts using Jeff Four Content Assets (AUG-D1 p016): Exposure / Awareness / Trust / Convert. One job: each piece knows its asset type.",
      "What to input: Your stage, available filming slots, themes you can teach without research theater, optional platform.",
      "When to use: At the start of a week, after a random posting streak, or when posts have no clear type.",
      "What you get: A weekly slate with one type tag per slot. Not the Content Asset Stack funnel (separate tool).",
    ].join("\n\n"),
  },
  {
    id: "content-asset-stack",
    title: "Content Asset Stack",
    category: "Content",
    status: "ready",
    description: [
      "What it does: Maps how a piece of content moves people along Jeff Content Asset Stack (AUG-D1 p015): See → Remember → Believe → Ask → Convert.",
      "What to input: The piece or idea, who it is for, where they are on the stack now, and where you want them next.",
      "When to use: When content goes out but does not stack trust evidence, or when you are forcing Convert before Believe.",
      "What you get: A stack-path diagnosis and rewrite notes for one step of movement. Not the four asset types (separate tool).",
    ].join("\n\n"),
  },
  {
    id: "direction-fixer",
    title: "Direction Fixer",
    category: "Ideation",
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
    category: "Convert",
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
    category: "Content",
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
    category: "Trust",
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
    title: "Topic Bingo",
    category: "Ideation",
    status: "ready",
    description: [
      "What it does: Fills a Topic Bingo / 九宫格 grid (related English name: The Waffle): nine filmable topic cells from process, FAQs, results, and standpoint so ideation stays IP-shaped.",
      "What to input: How you work, questions you get, results you can show, and the standpoint line you want reinforced.",
      "When to use: When the blank page wins, or when ideas feel random instead of on-brand for your personal IP.",
      "What you get: A short idea list tagged see / trust / convert, each tied to process, question, result, or standpoint. Prefer The Waffle module when you want the format times themes multiplication plan.",
    ].join("\n\n"),
  },
  {
    id: "advice-vs-ego-coach",
    title: "Advice vs Ego Coach",
    category: "Content",
    status: "ready",
    description: [
      "What it does: A pre-shoot checklist so you show up as advice for the viewer, not as ego for yourself.",
      "What to input: What you plan to say, why it matters to them, and any flex lines you are tempted to keep.",
      "When to use: Right before filming, or when past videos felt self-congratulatory even when the tip was useful.",
      "What you get: A go / fix checklist, lines to cut or reframe, and a reminder of how Jeff separates advice from ego.",
    ].join("\n\n"),
  },
  {
    id: "comment-reply-three-lines",
    title: "Comment Reply Three Lines",
    category: "Trust",
    status: "ready",
    description: [
      "What it does: Drafts Jeff Comment Reply Three Lines (AUG-D1 p028) in-thread replies: catch, clarify, return to the main point, so target customers see your judgment, not a fight.",
      "What to input: The comment to answer, your standpoint or facts, and who the original content was for.",
      "When to use: After a spicy comment or DM, when the same pushback repeats, or when you want a reply that teaches without winning the internet.",
      "What you get: Two to three reply drafts plus notes on when to stop draining energy and how to keep publishing.",
    ].join("\n\n"),
  },
  {
    id: "criticism-armor",
    title: "B.R.E.A.K Shield",
    category: "Trust",
    status: "ready",
    description: [
      "What it does: Runs Jeff B.R.E.A.K Shield (AUG-D1 p026): Baselines, Reason, Evidence, Angle, Keep Going, so criticism becomes judgment, not emotion.",
      "What to input: Criticism you fear or already got, your baseline conviction, and what Keep Going looks like this month.",
      "When to use: After harsh feedback, before a vulnerable post, or when you are tempted to quit because growth feels exposed.",
      "What you get: A short B.R.E.A.K plan: what stays fixed, what is noise vs signal, respond or not, and how to keep posting.",
    ].join("\n\n"),
  },
  {
    id: "bianhao-coach",
    title: "Growth Shame Coach",
    category: "Trust",
    status: "ready",
    description: [
      "What it does: Coaches through growth shame: family or peer pressure when you improve, show up on camera, or outgrow old norms.",
      "What to input: Who is pressuring you, what they say, what you are trying to build, and what consistency looks like this month.",
      "When to use: When growth triggers shame or pushback at home or among peers, or when you hide progress to keep the peace.",
      "What you get: A short plan: what to ignore, what to reframe, and how to keep showing up without performing toughness or overnight-fame talk.",
    ].join("\n\n"),
  },
  {
    id: "high-ticket-caution",
    title: "High-Ticket Caution",
    category: "Trust",
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
    category: "Trust",
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
    category: "Content",
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
    category: "Content",
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
    category: "Content",
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
    category: "Content",
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
    category: "Content",
    status: "ready",
    description: [
      "What it does: Writes supporting caption text under a Reel so the post teaches even on mute-scroll or save-later reading.",
      "What to input: The Reel topic or script summary, key bullets you must include, and CTA softness.",
      "When to use: After you have a video draft but the caption is empty, or when saves matter as much as views.",
      "What you get: A caption with short bullets, a soft close, and optional on-screen text echoes.",
    ].join("\n\n"),
  },
  {
    id: "two-kinds-student-two-methods",
    title: "Two Kinds of Student, Two Methods",
    category: "Ideation",
    status: "ready",
    description: [
      "What it does: Sorts loud vs quiet temperament and assigns the Three C or Three R filming route so completion does not die on the wrong method.",
      "What to input: Whether you are outgoing or reserved on camera, what you do, and where filming got stuck.",
      "When to use: At the start of a content program, or when a careful professional stopped after two awkward shoots.",
      "What you get: A temperament call, the matching route, and a first-week plan. DISC stays a finer coaching tune only.",
    ].join("\n\n"),
  },
  {
    id: "three-c-method",
    title: "Three C Method",
    category: "Ideation",
    status: "ready",
    description: [
      "What it does: Builds reactive content for outgoing owners from Controversial, Common interest, and Conflict, then take a side in plain words.",
      "What to input: Who watches, a controversial view, a common market interest, and a conflict worth opening.",
      "When to use: When an outgoing owner is forced into tidy research-first filming and gets bored.",
      "What you get: Three C angles with take-a-side lines, plus a warning if heat lacks substance.",
    ].join("\n\n"),
  },
  {
    id: "three-r-method",
    title: "Three R Method",
    category: "Ideation",
    status: "ready",
    description: [
      "What it does: Builds a read-then-respond routine for reserved owners: news, book, article, then add your own view.",
      "What to input: Your industry, what you can read this week, and the lived view the source misses.",
      "When to use: When a quiet professional freezes because they feel they must be original on day one.",
      "What you get: A weekly Three R plan and one sample outline. Borrowed-only content never builds authority alone.",
    ].join("\n\n"),
  },
  {
    id: "waffle-grid",
    title: "The Waffle",
    category: "Ideation",
    status: "ready",
    description: [
      "What it does: Fills the 3x3 waffle: centre who you are and who you serve, eight owned themes, then formats times themes toward about 100 videos.",
      "What to input: Centre (who you are and serve), theme seeds, and formats you will actually film.",
      "When to use: When ideas run out, or themes drift into lifestyle that does not sell.",
      "What you get: A filled waffle plus a multiplication plan. Related to 九宫格 / Topic Bingo; keep both names until human merge.",
    ].join("\n\n"),
  },
  {
    id: "content-not-working-checklists",
    title: "Content Not Working Checklists",
    category: "Ideation",
    status: "ready",
    description: [
      "What it does: Runs two coach checklists: nobody watching, and no ideas to film. Positioning before lighting tricks.",
      "What to input: The symptom, what is actually sold, and your current positioning guess.",
      "When to use: When views are dead or the calendar is empty and everyone wants a camera tip.",
      "What you get: Ordered diagnosis, loud/quiet route call, and next grid steps.",
    ].join("\n\n"),
  },
  {
    id: "positioning-four-questions",
    title: "Positioning Four Questions",
    category: "IP Positioning",
    status: "ready",
    description: [
      "What it does: Answers four questions then crowns what you are the most of until you are king of a real category.",
      "What to input: What you sell, who you sell to, why you sell it, and what you are the most of.",
      "When to use: When you cannot be introduced in one sentence, or narrowing feels like turning away business.",
      "What you get: Four answers, a crown line, and Who are you / Why you directions. Related to but not the same as the three-line map.",
    ].join("\n\n"),
  },
  {
    id: "brand-stance-model",
    title: "Brand Stance Model",
    category: "IP Positioning",
    status: "ready",
    description: [
      "What it does: Writes stand for, stand against, and what you are known for doing. The third leg is suggested until Jeff wording is confirmed.",
      "What to input: What you stand for, what you stand against, and repeated public proof of what you do.",
      "When to use: When stance is only opinions, or when IP Influence Triangle needs evidence work.",
      "What you get: Three stance legs with a Suggested label on the third, mapped carefully to IP Influence Triangle.",
    ].join("\n\n"),
  },
  {
    id: "goat-four-beats",
    title: "GOAT Four Beats",
    category: "Content",
    status: "ready",
    description: [
      "What it does: Structures one short video as Grab, Open a question, Answer it, Take it away.",
      "What to input: Topic, the viewer biggest problem, and the one thing they should keep.",
      "When to use: When you need the short structure students remember, not a full workshop OPENS rewrite.",
      "What you get: A GOAT beat script. Related to OPENS / Hook Formula; different named beats.",
    ].join("\n\n"),
  },
  {
    id: "story-structure-search",
    title: "Story Structure (Problem to Search)",
    category: "Content",
    status: "ready",
    description: [
      "What it does: Builds the longer story arc: Problem, Search, Story, Solution, What next.",
      "What to input: The opening problem, the search, the solution, and what next for the viewer.",
      "When to use: When a story is only something that happened because the search is missing.",
      "What you get: A five-beat longer story outline. Related to S.T.O.R.Y; different named steps.",
    ].join("\n\n"),
  },
  {
    id: "eight-ways-to-open",
    title: "Eight Ways to Open",
    category: "Content",
    status: "ready",
    description: [
      "What it does: Drafts openings for the first three seconds across eight ways, plus loudest-moment-first editing.",
      "What to input: Topic, viewer biggest problem, and optional loudest moment already filmed.",
      "When to use: When strong videos die on a weak open, or you open with an introduction.",
      "What you get: Opening lines by way, strongest two to film, and the edit rule. Complements Hook Formula.",
    ].join("\n\n"),
  },
  {
    id: "hit-100x-followers",
    title: "What Counts as a Hit (100x)",
    category: "Content",
    status: "ready",
    description: [
      "What it does: Defines a hit as one hundred times your followers, diagnoses misses, and turns hits into series.",
      "What to input: Follower count, recent view numbers, and whether you need diagnosis or series planning.",
      "When to use: When students argue about whether something went viral, especially on small accounts.",
      "What you get: Their hit threshold, clear/miss read, and next moves. Matches 一百倍就是爆款.",
    ].join("\n\n"),
  },
  {
    id: "six-caption-angles",
    title: "Six Caption Angles",
    category: "Content",
    status: "ready",
    description: [
      "What it does: Writes one-line captions in six angles so the caption does not compete with the video.",
      "What to input: What the video already does, and an unspoken audience feeling.",
      "When to use: When captions become essays, or you need six angles fast.",
      "What you get: Six one-liners with the strongest marked for unspoken feeling.",
    ].join("\n\n"),
  },
  {
    id: "four-content-layers",
    title: "The 4 Content Layers",
    category: "Content",
    status: "ready",
    description: [
      "What it does: Plans posts across Story, Case, POV, and News. Not the same as Four Content Assets (曝光/认知/信任/成交).",
      "What to input: Who you serve, proof you can show, and this week mix goal.",
      "When to use: When the calendar is all news or all opinion with no story or case.",
      "What you get: Ideas per layer plus Lead with Story / Prove with Case / Differentiate with POV / Borrow from News.",
    ].join("\n\n"),
  },
  {
    id: "content-authority-ladder",
    title: "Content Authority Ladder",
    category: "Content",
    status: "ready",
    description: [
      "What it does: Places you on the News to POV to Case to Story ladder and plans the climb toward owned trust.",
      "What to input: Recent posts and owned proof or stories only you can tell.",
      "When to use: When publishing feels busy but authority is flat, or content is easy to copy.",
      "What you get: Rung diagnosis and next climbs. Pairs with The 4 Content Layers.",
    ].join("\n\n"),
  },

];

/** Category order for the All Tools page (Jeff ladder rails). */
export const MODULE_CATEGORY_ORDER: ModuleCategory[] = [
  "Ideation",
  "IP Positioning",
  "Content",
  "Trust",
  "Convert",
];

/** Catalog id for IP Stage Check when deep-linked as a normal tool. */
export const START_MODULE_ID = "ip-stage-check";

/**
 * Single 「从这里开始」 entry on /tools (default: IP Stage Check).
 * Not a multi-card popular curriculum strip. Stanley may later remove this entirely.
 */
export const FEATURED_MODULE_IDS: readonly string[] = [START_MODULE_ID];

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
