# Feedback round: what we are doing

**Date:** 2026-10-06  
**Audience:** builders / Cursor agents only  
**Label:** PRODUCT / REPO BRIEF. Not Jeff teaching IP. Not student curriculum.  
**Do not ingest into `jeff-wiki` / `jeff-graph`.**

Companion: [17-feedback-round-agent-prompts.md](17-feedback-round-agent-prompts.md) (paste-ready implementation prompts).

Supersedes product direction in [15-hook-studio-and-quality-runtime-decisions.md](15-hook-studio-and-quality-runtime-decisions.md) **only where this brief conflicts** (Hook Studio removal; chat opener shape; ZH 口语化). Quality Runtime Collect → Confirm → Deliver → Refine spine stays.

---

## Stakeholder feedback (source notes)

1. **Chinese is broken.** Not only wrong language. Much ZH copy and many ZH replies read like direct English translation: stiff, not 口语化, not how people talk day to day.
2. **Markdown lists show `1. 1. 1.`** instead of `1. 2. 3.`
3. **Keep intro simple:** one-line sentence like Artemo (**chat opener only**).
4. **Some messages are unclear.** User reads them and thinks "so what do you want from me?"
5. **Jeff frameworks must be named** as `Jeff's <<Some Framework>>` (ZH: `Jeff 的 <<框架名>>`), not vague "this framework."
6. **Random topics derail the AI** inside a tool chat.
7. **Remove Hook Studio.** Keep useful Studio prompt ideas as reference inside Hook Formula chat only.

---

## Locked decisions (human confirmed)

| Topic | Decision |
| --- | --- |
| Chinese scope | **All ZH surfaces students see in tools:** model replies under ZH locale, chat openers (`chatOpenerZh` / shared ZH openers), catalog ZH, and stiff tool-related i18n. Goal is **口语化 classroom Mandarin**, not formal translationese. |
| Intro | **Chat opener only.** One sentence stating the job + one concrete question. Drop "Here is how we will work / 我们这样配合" blocks. **Do not** change `ModuleIntroModal` this round. |
| Framework naming | Yes: `Jeff's <<Name>>` / `Jeff 的 <<名>>` when applying a named Jeff framework. |
| Hook Studio | **Remove the product surface** (`/studio`, nav, panel, batch chat wiring). Keep Hook Formula tool chat (`scroll-stop-hook`). Fold useful Studio prompt quality into that pack as reference, not a second UI. |
| Home recommend | **Out of scope.** Do not change home recommend flow, cards, or recommend overlays. |
| Repo voice rule | Still ban dash punctuation in student-facing prose (em/en dash, spaced hyphen as punctuation). Prefer period, comma, colon, or a new sentence. |

---

## Problem → root cause (engineering)

### Chinese / 口语化

- UI default locale is `zh`. Chat locks reply language to UI locale.
- Pack `systemOverlay`, lifecycle injection, and much doctrine in the prompt stay **English**. The model is told ZH wins, but often produces stiff translated Mandarin or mixes EN.
- Many `chatOpenerZh` / `packChatOpenersZh` lines mirror English structure ("我们这样配合" + process bullets), which already sounds non-口语.
- `catalogZh.ts` descriptions are often translationese.
- `sanitizeAssistantReply` does **not** fix language quality; it only strips banned dashes (and EN quote normalize).

### List numbering `1. 1. 1.`

- `apps/web/components/AssistantMessage.tsx` parses `1. item` into `<ol><li>`, **strips the source number**, and lets CSS counters render (`.assistant-ol` in `globals.css`).
- Blank lines **flush** the current list. Each item after a blank line becomes its own `<ol>` and restarts at 1.
- Voice rules ask for a "blank line between beats," which encourages blank lines between list items and triggers the bug.

### Unclear "so what?"

- Openers and Confirm turns explain process before asking for one concrete input.
- Target cadence: short diagnosis or job → next move → **one direct ask** ("paste X", "answer Y in one sentence").

### Framework naming

- Packs use `Exact Jeff framework: …` / `fw.*` ids / slide titles.
- Voice rules ban lecture-y "Jeff's chain begins…" fluff, but stakeholders want clear naming when a real Jeff framework is in play: `Jeff's <<Hook Formula>>`.

### Topic derail

- Module chats already have "Stay on this tool's job" rules; they are not strong enough in practice.
- Home recommend is broader by design; **leave it alone** this round.

### Hook Studio

- First-class top nav → `/studio` batch UI for Hook Formula modes.
- Wired through `lib/hookStudio/*`, chat route batch contract, lifecycle force-Deliver, catalog copy, smokes.
- Product decision: remove that surface; Hook Formula chat remains the only student path for hooks.

---

## Target outcomes (acceptance)

1. **ZH feels spoken.** Under ZH UI, tool chat replies and ZH openers/catalog read like Jeff classroom talk, not translated product copy.
2. **Numbered lists count** `1. 2. 3.` even when the model puts blank lines between items.
3. **Every tool chat opener** is one short job sentence + one question (EN and ZH). No "how we work" bullet block.
4. **Every assistant turn** ends with one concrete ask when more input is needed. User should never wonder what to do next.
5. **Named Jeff frameworks** appear as `Jeff's <<…>>` / `Jeff 的 <<…>>` when used.
6. **Off-tool topics** get a short redirect back to the tool job (module chat only).
7. **No Hook Studio** in nav or as a student product. Useful batch prompt ideas live only as reference inside `scroll-stop-hook` (and related pack overlays if needed). Hook Formula chat still works.
8. **Home recommend untouched.**

---

## In scope / out of scope

### In scope

- `AssistantMessage` list parsing (+ related CSS if needed)
- Voice / system / module prompt hard rules (口语化, clarity, framework naming, anti-derail, list formatting)
- Lifecycle opener builders (`buildLifecycleOpener` / `Zh`)
- All pack `chatOpener` / `chatOpenerZh` and `packChatOpenersZh.ts`
- `catalogZh.ts` and stiff tool-related ZH strings in `messages.ts` (not home recommend copy)
- Pack overlay lines for framework naming + clearer collect asks (keep overlays concise)
- Hook Studio removal + fold prompt reference into Hook Formula
- Smoke / typecheck fixes for removed Studio wiring

### Out of scope

- Home recommend (`recommend.ts`, home composer tips, recommend cards behavior)
- Intro modal redesign (`ModuleIntroModal`)
- New tools, new frameworks, doctrine ingest from `raw/jeff`
- English UI redesign / brand chrome
- Changing default model or Vercel config
- Git commit unless the human asks

---

## Key paths (orientation)

| Area | Paths |
| --- | --- |
| Chat API | `apps/web/app/api/chat/route.ts` |
| System prompt | `apps/web/lib/systemPrompt.ts` |
| Voice | `apps/web/content/jeff/voice/sound-profile.md` (sync `schema/voice/` if the repo keeps them paired) |
| Module overlay | `apps/web/lib/modules/modulePrompt.ts` |
| Packs | `apps/web/lib/modules/packs/*.ts` (~55 tools) |
| ZH openers fallback | `apps/web/lib/modules/packChatOpenersZh.ts` |
| Opener locale pick | `apps/web/lib/modules/packLocale.ts` |
| Lifecycle openers | `apps/web/lib/modules/qualityRuntime/familyOverlay.ts` |
| Catalog ZH | `apps/web/lib/modules/catalogZh.ts` |
| Message render | `apps/web/components/AssistantMessage.tsx`, `apps/web/app/globals.css` |
| Hook Studio | `apps/web/app/studio/`, `apps/web/components/tools/HookStudio*`, `apps/web/lib/hookStudio/`, nav in `AppNav.tsx` |
| Hook Formula pack | `apps/web/lib/modules/packs/scroll-stop-hook.ts` (+ `hook-rewriter.ts` as related) |
| Prior Hook Studio decision | `raw/agent-handoff/11-*.md`, `15-*.md` (history; this brief wins on removal) |

---

## Artemo opener shape (target)

**Before (current pattern):**

```text
Hey. I will help you …
Here is how we will work:
- …
- …
- …
What is …?
```

**After:**

```text
I'll help you write scroll-stop opens for the first 1 to 3 seconds. Who is this video for, and what problem should hit them first?
```

ZH: natural spoken Mandarin, same shape (one job line + one ask). No "我们这样配合".

---

## Framework naming shape (target)

- EN: `Using Jeff's <<Hook Formula>>, …`
- ZH: `按 Jeff 的 <<Hook Formula>>，…` (or the confirmed Chinese classroom title when that is the name)
- Apply the framework; do not lecture its history.
- Do not invent branded framework titles that are not in the pack / evidence.

---

## Hook Studio removal shape (target)

- Remove student entry points: nav "Hook Studio", `/studio`, and legacy studio nested routes as needed.
- Remove or gut batch-only UI components and `lib/hookStudio` chat-route coupling.
- Keep Hook Formula (`/tools/scroll-stop-hook`) chat-first flow.
- Preserve high-value Studio rules as **pack/system overlay reference** (formula legs, bans on overnight fame / Maria labels, rewrite-only opens, etc.) without requiring JSON card UI.
- Update smokes that assume Studio markers / parse pipeline; do not leave broken imports.

---

## Suggested agent split

Do **not** implement this whole round in one agent. Use the five prompts in doc 17, in order A → B → C → D → E (A before B; E can run after A, carefully avoiding `scroll-stop-hook` conflicts with D).

| Agent | Focus | Why this size |
| --- | --- | --- |
| A | Renderer + global prompt rules + opener **builders** | Small file set, high leverage |
| B | All chat openers EN+ZH collapsed | Many files, mechanical, one job |
| C | catalogZh + tool i18n 口语化 | Copy-only, no chat brain |
| D | Pack overlays: naming, clarity, ZH speak pressure | Overlay edits across packs, no UI |
| E | Remove Hook Studio + fold reference into Hook Formula | Isolated product deletion |

---

## Definition of done (human check)

- [ ] ZH opener sample on 3 tools sounds like spoken Chinese
- [ ] ZH reply sample does not read like translated English
- [ ] Numbered list with blank lines between items shows 1. 2. 3.
- [ ] Opener is one line + question; no process bullets
- [ ] Assistant asks for a concrete next input
- [ ] Framework mention uses `Jeff's <<…>>` / `Jeff 的 <<…>>`
- [ ] Off-topic in a tool chat redirects
- [ ] No Hook Studio in nav; studio surface gone or safe; Hook Formula chat works
- [ ] Home recommend unchanged
