# Feedback round: implementation agent prompts

**Date:** 2026-10-06  
**Audience:** human pasting into Cursor agents  
**Label:** BUILDER PROMPTS. Not Jeff teaching IP.  
**Do not ingest into `jeff-wiki` / `jeff-graph`.**

Spec SoT: [16-feedback-round-what-we-are-doing.md](16-feedback-round-what-we-are-doing.md).  
Read doc 16 before any agent below. Do not invent scope beyond doc 16.

**Context budget:** each prompt is sized for a ~200k model. One agent = one prompt. Do not merge A–E into a single run.

**Run order:** A first. Then B, C, D can run in parallel. E after A; if D also touches `scroll-stop-hook.ts`, finish D before E or have E rebase carefully.

**Repo rules every agent must follow:**
- Work in `/Users/stanley/Documents/GIthub/jgpt` (or the workspace root).
- No dash punctuation in student-facing prose (em/en dash, spaced hyphen as sentence dash).
- Do not commit unless the human asks.
- Do not touch home recommend.
- Do not redesign `ModuleIntroModal`.
- Prefer small, focused diffs. Match existing code style.
- After edits: run the lightest relevant check (typecheck / targeted smoke). Fix what you break.

---

## Agent A — Platform: lists + global voice rules + opener builders

### Paste this

```text
You are implementing Agent A of the jgpt feedback round.

READ FIRST (required):
- raw/agent-handoff/16-feedback-round-what-we-are-doing.md
- apps/web/components/AssistantMessage.tsx
- apps/web/app/globals.css (search assistant-ol)
- apps/web/content/jeff/voice/sound-profile.md
- apps/web/lib/systemPrompt.ts
- apps/web/lib/modules/modulePrompt.ts
- apps/web/lib/modules/qualityRuntime/familyOverlay.ts (buildLifecycleOpener / buildLifecycleOpenerZh)
- apps/web/lib/sanitizeAssistantReply.ts (for awareness only; do not turn it into a language rewriter)

YOUR ONLY JOBS:
1) Fix numbered lists rendering as 1. 1. 1.
   - Root cause: parseBlocks flushes the ordered list on blank lines, so each item becomes its own <ol> and CSS counters restart at 1.
   - Fix: when inside an ordered (and likely unordered) list, blank lines must NOT flush/split the list. Keep items in one list so counters go 1. 2. 3.
   - Adjust voice formatting rules so "blank line between beats" does not encourage blank lines BETWEEN numbered list items. Blank line before/after the whole list is fine.
2) Global prompt hard rules (EN + ZH) for tool chat:
   - ZH 口语化: when UI locale is zh, reply in natural spoken classroom Mandarin. Ban translationese / formal written Chinese that sounds like English product copy. Light English classroom tokens OK.
   - Clarity: every turn that needs input must end with ONE concrete ask (paste X / answer Y). Ban process dumps ("here is how we will work") in normal replies.
   - Framework naming: when using a named Jeff framework, say Jeff's <<Name>> (ZH: Jeff 的 <<名>>). Apply it; do not lecture. Do not invent names.
   - Anti-derail (module chat only): if user goes off the tool job, short redirect + one ask that returns to the tool. Do NOT change home recommend.
3) Change opener builders only:
   - buildLifecycleOpener / buildLifecycleOpenerZh must produce ONE job sentence + ONE question (no "Here is how we will work" / "我们这样配合" bullets).
   - Do NOT rewrite all pack chatOpener strings in this agent (Agent B does that). You may update call sites of the builders if signatures change.

OUT OF SCOPE FOR YOU:
- catalogZh / messages.ts copy rewrites
- Hook Studio removal
- Home recommend
- Intro modal
- Mass pack opener rewrites
- Mass pack systemOverlay rewrites

DONE WHEN:
- A markdown string with blank lines between "1. a", "2. b", "3. c" renders as 1. 2. 3. in AssistantMessage
- sound-profile / systemPrompt / modulePrompt encode 口语化, clarity ask, Jeff's <<>>, anti-derail
- lifecycle opener builders are one-line + question
- Briefly list files changed and any follow-up for Agent B (e.g. new builder signature)
```

### Notes for the human

- Smallest agent; unblocks B.
- If you keep a unit/smoke for AssistantMessage parsing, add one; otherwise a quick manual fixture in a smoke script is enough.

---

## Agent B — Chat openers only (EN + ZH, all tools)

### Paste this

```text
You are implementing Agent B of the jgpt feedback round.

READ FIRST (required):
- raw/agent-handoff/16-feedback-round-what-we-are-doing.md
- apps/web/lib/modules/types.ts (chatOpener docs)
- apps/web/lib/modules/packLocale.ts
- apps/web/lib/modules/packChatOpenersZh.ts
- apps/web/lib/modules/qualityRuntime/familyOverlay.ts (confirm Agent A already changed builders; if not, stop and tell the human)
- Spot-check 3 packs: scroll-stop-hook.ts, who-i-serve.ts, ig-reel-script.ts

YOUR ONLY JOB:
Rewrite EVERY tool chat opener to Artemo one-liner shape:
- EN chatOpener: one short job sentence + one concrete question. No "Here is how we will work" block. No process bullets.
- ZH chatOpenerZh / packChatOpenersZh entries: same shape, 口语化 spoken Mandarin (not direct translation of the English).
- If a pack uses buildLifecycleOpener / buildLifecycleOpenerZh, update the args so the built string matches the new one-line shape.
- Keep meaning: same tool job, same first collect ask.
- Preserve Quality Runtime intent (collect criticals) without explaining the whole lifecycle in the opener.

STYLE TARGET:
EN example:
"I'll help you write scroll-stop opens for the first 1 to 3 seconds. Who is this video for, and what problem should hit them first?"

ZH example (tone, not mandatory wording):
"我来帮你写前 1 到 3 秒能停住滑动的开场。这条视频是讲给谁听的？先打哪个痛点？"

OUT OF SCOPE:
- systemOverlay rewrites (Agent D)
- catalogZh / i18n (Agent C)
- Hook Studio removal (Agent E)
- Home recommend
- Intro modal
- Prompt hard-rule files unless a single line is required for opener consistency (prefer not)

DONE WHEN:
- No pack opener still contains "Here is how we will work" or "我们这样配合"
- packChatOpenersZh.ts matches the one-line shape and sounds spoken
- Grep clean for those two phrases under apps/web/lib/modules
- Summarize how many packs updated; call out any packs that had no ZH opener and what you did
```

### Notes for the human

- Mechanical but touches ~55 packs. Keep the agent on openers only so it does not drift into overlays.

---

## Agent C — ZH UI copy 口语化 (catalog + tool i18n)

### Paste this

```text
You are implementing Agent C of the jgpt feedback round.

READ FIRST (required):
- raw/agent-handoff/16-feedback-round-what-we-are-doing.md
- apps/web/lib/modules/catalogZh.ts
- apps/web/lib/modules/catalog.ts (EN reference for meaning only)
- apps/web/lib/i18n/messages.ts (ZH strings only; skip home recommend keys)
- apps/web/lib/modules/moduleDisplay.ts (how description paragraphs are parsed: 做什么 / 需要准备 / 何时使用 / 你会得到)

YOUR ONLY JOB:
Make student-facing ZH tool chrome sound 口语化:
1) Rewrite MODULE_ZH_COPY in catalogZh.ts so titles/descriptions feel like spoken classroom Chinese, not translated English. Keep the structural labels parseIntroSections needs (做什么 / 需要准备 / 何时使用 / 你会得到) unless code already allows equivalents; do not break intro parsing.
2) Rewrite stiff tool-related ZH strings in messages.ts (nav/tools/module chrome, errors, composer placeholders for tools, Hook Studio strings only if still present). DO NOT change home recommend / home composer recommend copy.
3) Remove or soften catalog lines that push users to Hook Studio / `/studio` (Agent E removes the feature; do not leave "go to Hook Studio" CTAs).

OUT OF SCOPE:
- Model system prompts / sound-profile
- Pack chatOpener / systemOverlay
- Home recommend behavior
- English catalog rewrite unless a ZH string cannot be fixed without a tiny EN clarity fix (prefer ZH only)

DONE WHEN:
- catalogZh no longer reads like direct EN translation on spot-check of 5 modules
- No Hook Studio marketing lines left in catalogZh
- Intro section parsing still works (labels intact)
- List which message keys you changed
```

### Notes for the human

- Copy-only agent. Good parallel track with B/D.

---

## Agent D — Pack overlays: framework naming, clarity, ZH speak pressure

### Paste this

```text
You are implementing Agent D of the jgpt feedback round.

READ FIRST (required):
- raw/agent-handoff/16-feedback-round-what-we-are-doing.md
- apps/web/lib/modules/modulePrompt.ts (shared rules Agent A should have added)
- apps/web/content/jeff/voice/sound-profile.md (ZH exemplars section)
- Spot-check packs with explicit framework lines: scroll-stop-hook.ts, soft-cta-closer.ts, who-i-serve.ts, goat-four-beats.ts, eight-ways-to-open.ts

YOUR ONLY JOB:
1) Across module packs' systemOverlay (and related QR overlay helpers if needed):
   - When a named Jeff framework is the tool brain, instruct the model to surface it as Jeff's <<Name>> / Jeff 的 <<名>> (use the real classroom name already in the pack; do not invent).
   - Replace vague "Exact Jeff framework:" lecture tone with apply-and-name style.
   - Add/strengthen: end turns that need input with one concrete ask; no process waffle.
   - Add/strengthen ZH pressure: when locale is zh, speak 口语化; do not literally translate English overlay jargon into stiff Chinese.
2) Update ZH few-shots / exemplars in sound-profile (CN section) if they model stiff translationese or long process intros. Keep EN exemplars English-only. Keep exemplars short.
3) Keep overlays concise. Do not paste essays into every pack. Prefer tightening shared modulePrompt rules + light per-pack naming lines.

BATCHING (important for context):
- Work in batches of about 10–15 packs per edit pass. Finish all packs before stopping.
- Do not open unrelated UI files.
- Skip chatOpener fields (Agent B owns those) unless a single adjacent line must change for consistency.

OUT OF SCOPE:
- Hook Studio UI removal (Agent E). You MAY leave brief "studio batch" comments if Agent E has not run; do not expand Studio.
- Home recommend
- catalogZh
- AssistantMessage renderer

DONE WHEN:
- Grep shows Jeff's << or Jeff 的 << guidance in shared rules and in packs that bind named frameworks
- Packs no longer rely on vague unnamed "the framework" as the only cue for named tools
- ZH exemplar tone in sound-profile is more spoken
- Summarize packs touched vs skipped
```

### Notes for the human

- Largest reasoning load. If the agent stalls, split into D1 (shared rules + sound-profile + script/hook packs) and D2 (remaining packs) using the same paste with a pack allowlist.

---

## Agent E — Remove Hook Studio; keep prompt reference on Hook Formula

### Paste this

```text
You are implementing Agent E of the jgpt feedback round.

READ FIRST (required):
- raw/agent-handoff/16-feedback-round-what-we-are-doing.md
- raw/agent-handoff/15-hook-studio-and-quality-runtime-decisions.md (history only; this round REMOVES Studio UI)
- apps/web/components/AppNav.tsx
- apps/web/app/studio/page.tsx
- apps/web/app/tools/[moduleId]/studio/page.tsx
- apps/web/components/tools/HookStudioWorkspace.tsx
- apps/web/components/tools/HookStudioPanel.tsx
- apps/web/lib/hookStudio/* (compose, overlays, parse, batch contract)
- apps/web/app/api/chat/route.ts (Studio batch branches)
- apps/web/lib/modules/qualityRuntime/lifecycle.ts (hook_studio_batch force-Deliver)
- apps/web/lib/modules/packs/scroll-stop-hook.ts
- apps/web/lib/modules/packs/hook-rewriter.ts
- apps/web/lib/modules/homeHandoff.ts
- apps/web/lib/modules/catalog.ts and catalogZh.ts (Studio mentions)
- apps/web/lib/i18n/messages.ts (hookStudio* keys)
- apps/web/scripts/smoke-hook-studio-parse.ts
- apps/web/scripts/smoke-quality-runtime-q4.ts (Studio assertions)

YOUR ONLY JOB:
1) Remove Hook Studio as a student product surface:
   - Nav link / labels
   - /studio page and workspace/panel UI
   - Legacy nested studio route (redirect to Hook Formula tool or tools index; do not leave a broken page)
   - Chat-route batch detection / appendHookStudioBatchContract / pack swap for Studio markers
   - Lifecycle force-Deliver path that exists only for Studio batch markers (remove cleanly)
   - Handoff helpers that send users to Studio
   - Catalog / i18n copy that markets Hook Studio
2) Keep useful Studio PROMPT ideas as reference inside Hook Formula chat:
   - Fold high-value rules from studioBatchOverlay / modeOverlays / composeUserMessage into scroll-stop-hook (and hook-rewriter if needed) as normal chat overlay guidance.
   - Do NOT keep a second JSON card product UI.
   - Chat remains Collect → Confirm → Deliver → Refine for Hook Formula.
3) Clean smokes:
   - Delete or rewrite smoke-hook-studio-parse.ts
   - Remove Studio-only assertions from smoke-quality-runtime-q4.ts without weakening QR coverage
4) Ensure TypeScript build does not import deleted modules.

OUT OF SCOPE:
- Rewriting all other packs' openers/overlays
- Home recommend
- ZH catalog full 口语化 pass (Agent C) except deleting Studio pointers
- Changing Jeff wiki doctrine pages

DONE WHEN:
- No student nav entry to Hook Studio
- /studio is gone or safely redirects; app typechecks
- Hook Formula /tools/scroll-stop-hook still opens chat with opener
- Useful formula-legs / ban / rewrite guidance preserved in pack overlays
- List deleted files and where prompt reference was folded
```

### Notes for the human

- Product deletion agent. Run after A. Coordinate with D on `scroll-stop-hook.ts`.

---

## Optional micro-split (only if an agent hits context pressure)

| Split | Use when |
| --- | --- |
| B1 / B2 | Agent B cannot finish all openers: B1 = packs A–M filenames, B2 = rest + packChatOpenersZh |
| D1 / D2 | Agent D thrashing: D1 = shared rules + sound-profile + hook/script family packs; D2 = remaining packs |
| E1 / E2 | E1 = delete UI/nav/routes/chat wiring; E2 = fold prompts into scroll-stop-hook + fix smokes |

Do not split Agent A.

---

## After all agents

Human verification checklist lives at the bottom of doc 16. Suggested spot checks:
1. ZH UI + open `/tools/scroll-stop-hook` → opener is one spoken line + question
2. Ask for a 3-item numbered list with blank lines → shows 1. 2. 3.
3. Off-topic ask inside a tool → redirect
4. Confirm no Hook Studio in nav
5. Home page recommend unchanged
