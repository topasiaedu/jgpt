# What we are doing: Reply brevity, Artemo recommend, opener + question bullets

**Audience:** builders / implementer agents  
**Store:** `raw/agent-handoff/` (builder only)  
**Updated:** 2026-09-22  
**Repo:** `/Users/stanley/Documents/GIthub/jgpt`  
**Do not ingest into jeff-wiki / jeff-graph.**

> **BUILDER ONLY / NOT JEFF TEACHING.**  
> This brief locks a **reply + home recommend + tool opener** UX pass for Influence Engine Coach. It is not doctrine, not student curriculum, and must never be copied into `jeff-wiki` / `jeff-graph`.

Read this before any implementation prompt in `10-reply-and-recommend-ux-agent-prompts.md`.

Related briefs (do not overwrite; this brief **narrowly supersedes** home recommend presentation from `05` / `06`):

| File | Role vs this brief |
| --- | --- |
| `05` / `06` | Home ask → recommend → fresh tool chat still locked. **Superseded here:** recommend cards under a chat reply after send. Target = Artemo-style cards under the input as intent becomes clear. |
| `01` / `02` | Module packs + catalog; still valid. Opener **copy shape** changes here; pack jobs / ids stay. |
| `03` / `04` | Brand shell, ZH chrome, tokens; keep. |
| `07` / `08` | `/tools` journey IA; out of scope for this pass. |

Engineering SoT for past decisions: `dev-wiki/accomplishments-and-decisions.md` and dated session pages. Prefer those over chat history when they conflict with memory.

---

## One-line goal

Make home tool suggestion feel like Artemo (simple ask + input, recommendation pops **under the input**), make tool openers conversational with bullets, and stop the model from lecturing frameworks or stacking clarifying questions in a prose row (use a short bullet list instead).

---

## Why now

Stanley reviewed the live product (2026-09-22) against Artemo screenshots:

1. Replies explain frameworks too deeply.
2. Home recommend is chat-message-then-cards, not Artemo's simple input + card under the composer.
3. Tool openers read as stating commitments ("I will write X using framework Y…"), not conversational Artemo-style openers.
4. When the model asks several clarifying questions, they often stack in one paragraph; they should be a bullet list.

Reference: Artemo empty create state, Artemo recommendation under input, Artemo-style tool workspace greeting (planning chat screenshots).

---

## Locked product direction (Stanley, 2026-09-22)

```text
1) Framework talk (tool chat + free chat)
   Apply Jeff moves. Do not teach the framework.
   No "OPENS is…" / curriculum dumps. Short punches, then deliver or ask.

2) Home recommend UI (Artemo)
   Centered ask + simple composer.
   When create-intent is clear enough, recommendation block pops UNDER the input
   (not under an assistant chat bubble after a full coach essay).
   Keep 2 to 4 real catalog tools (existing RECOMMEND_MIN / MAX).
   Short optional coach line is OK; long curriculum reply is not.
   Trigger: as-you-type with debounce (Artemo), not only after Send.
   Deep links still /tools/[moduleId]?from=home&q=… when intent exists.

3) Tool opener (seeded first bubble)
   Conversational greeting (Artemo tone), not "I will run framework X…".
   Short bullet list (what we will do / what you should paste or answer).
   One easy follow-up question.
   EN + ZH. Home handoff prefix may stay above the opener.

4) Multiple clarifying questions in later replies
   If asking 2+ questions in one turn, format as a markdown bullet list.
   Keep the existing cap: at most 1 to 2 clarifying questions per turn
   (do not turn into an interrogation). Soften any rule that bans
   "form-like lists" so it does not block clarifying-question bullets.
```

### Explicitly wrong

| Wrong | Right |
| --- | --- |
| Long explanation of what OPENS / Brand Pillars / etc. *is* | Use the steps; name the move lightly if needed; do the work |
| Recommend cards only under the assistant message after Send | Cards under the home composer as intent clarifies (debounced) |
| Opener: "I will write … using framework …" | Conversational ready-to-help + bullets + one question |
| Three clarifying questions in one prose paragraph | Max 1 to 2; if 2, use bullets |
| Rewriting `/tools` journey IA or inventing new modules | Out of scope |
| Purple / cream AI-cliché restyle | Keep Influence Engine brand tokens |

---

## Current vs target (home)

| Surface | Current | Target |
| --- | --- | --- |
| Empty home | Brand + ask + path chips + example chips + bottom composer | Keep brand + ask + tip energy; **composer-forward** Artemo feel. Path / example chips may stay demoted or trimmed if they fight the simple composition. |
| Recommend trigger | User sends → `/api/chat` recommend mode → coach reply + cards under that message | Debounced typing (and still on send) → recommend under **composer**; avoid requiring a long coach essay first |
| Card count | 2 to 4 validated catalog ids | Same (2 to 4). Artemo screenshot shows one card; **product keeps 2 to 4** unless Stanley later says single. |
| Engine | `recommend_modules` tool + `appendHomeRecommendOverlay` | Reuse catalog validation (`recommend.ts`). Prefer a **lightweight client debounce → API** path over calling a full coach completion every keystroke. Document the chosen approach in the phase reply. |

### Key files today

- `apps/web/components/ChatShell.tsx` (home empty state, message list, recommend cards under assistant turns)
- `apps/web/lib/modules/recommend.ts` (`RECOMMEND_MIN`/`MAX`, catalog menu, `appendHomeRecommendOverlay`)
- `apps/web/app/api/chat/route.ts` (recommend mode when no `moduleId`)
- `apps/web/lib/openai.ts` (`recommend_modules` tool)
- `apps/web/lib/modules/homeHandoff.ts` (`buildToolHrefFromHome`, `buildToolChatOpener`)
- `apps/web/lib/i18n/messages.ts` (`homeAsk`, recommend chrome)

---

## Current vs target (tool opener)

| Surface | Current | Target |
| --- | --- | --- |
| First bubble | Pack `chatOpener` / ZH map: stating "I will …" + one question | Conversational greeting + **markdown bullets** + one question |
| Count | ~56 packs under `apps/web/lib/modules/packs/` | Rewrite **all** openers EN; ZH via `chatOpenerZh` and/or `packChatOpenersZh.ts` |
| Rendering | Seeded string in `ModuleChatShell` via `AssistantMessage` | Ensure opener markdown lists render (same as later replies) |

### Opener shape (locked template)

English pattern (adapt per tool; keep short):

```text
Hey. Ready to help you with {Tool job in plain speech}.

Here is how we will work:
- {one concrete outcome}
- {what you should bring or paste}
- {optional third beat}

{One direct question}?
```

Chinese: same structure, living speech, locale lock rules unchanged. No dash punctuation in user-facing copy.

Do **not** turn openers into framework lectures. Naming a Jeff move once in a bullet is fine; explaining the whole model is not.

### Key files

- `apps/web/lib/modules/packs/*.ts` (`chatOpener`, some `chatOpenerZh`)
- `apps/web/lib/modules/packChatOpenersZh.ts`
- `apps/web/lib/modules/packLocale.ts` (`getPackChatOpener`)
- `apps/web/lib/modules/homeHandoff.ts` (`buildToolChatOpener`)
- `apps/web/components/tools/ModuleChatShell.tsx`
- `apps/web/components/AssistantMessage.tsx`

---

## Current vs target (reply behavior)

| Behavior | Current | Target |
| --- | --- | --- |
| Framework depth | Shared format caps exist, but packs / evidence still tempt curriculum dumps | Hard rule: **apply, do not teach**. Prefer deliverable over definition. |
| Clarifying questions | "Ask at most 1 to 2 … Never dump a form-like list" | Keep 1 to 2 max. **If 2 questions, use a bullet list.** Ban only interrogation walls (4+), not clarifying bullets. |
| Formatting | Max ~3 short paragraphs OR short para + 2 to 4 list items | Keep; explicitly allow question bullets |

### Key files

- `apps/web/lib/systemPrompt.ts` (`inlineSoundHardRules` formatting)
- `apps/web/lib/modules/modulePrompt.ts` (`buildSharedModuleRules`)
- Pack `systemOverlay` strings: **tighten shared rules first**; only edit individual overlays if they still force lecturing after the shared fix (do not rewrite all 56 overlays in this pass)

---

## Brand / i18n / hard product rules (unchanged)

- Product: **Influence Engine Coach**
- UI chrome ZH-main + EN via existing i18n; reply language follows **UI locale lock**
- Chat-first. No intake forms.
- No dash punctuation in user-facing copy (em/en dash or hyphen-as-aside)
- Closed Jeff doctrine / probe / sources chip stay
- No Turbopack at monorepo root next to huge `raw/`. Dev: `npm run dev --prefix apps/web`
- TypeScript: no `any`, no non-null assertions (`!`), no `as unknown as T`. Double-quoted strings.

---

## Non-goals (this pass)

- Redesigning `/tools` journey rail / core vs practice
- New module packs or Jeff wiki ingest
- Persistent chat history DB
- Changing recommend count to a single Artemo-style card (unless Stanley later asks)
- Full STAKEHOLDER rewrite beyond a short accuracy note if flow text is now wrong
- Commits unless Stanley asks

---

## Success criteria (product)

1. Typing a clear create intent on home (e.g. "ig script") shows 2 to 4 tool cards **under the input** without needing a long coach essay first.
2. Opening a tool shows a conversational opener with bullets + one question (EN and ZH).
3. Tool chat answers apply frameworks without lecturing what they are.
4. When two clarifying questions appear, they render as a bullet list.
5. `npm run build --prefix apps/web` passes after each phase.

---

## Access wall

- Student runtime mounts Jeff teaching only.
- Never paste these handoff docs into student answers or teaching ingest.
- Module product copy lives under `apps/web/`. Doctrine stays in `jeff-*`.
