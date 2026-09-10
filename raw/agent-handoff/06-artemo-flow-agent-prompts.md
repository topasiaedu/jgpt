# Implementation agent prompts: Artemo-style user flow

**Audience:** builders / implementer agents (~200k context)  
**Store:** `raw/agent-handoff/` (builder only)  
**Updated:** 2026-09-10  
**Do not ingest into jeff-graph.**

> **BUILDER ONLY / NOT JEFF TEACHING.**  
> Copy one phase at a time. Do not run F1+F2+F3 as one mega prompt.

Product context: `05-artemo-flow-what-we-are-doing.md` (required).  
Brand chrome from `03` / `04` stays; **stage-first IA from U2 is superseded**.

---

## How to use

1. Give the agent **one** phase prompt below (F1, then F2, then F3).
2. Require reading `05` plus the listed `apps/web` files (open them; do not invent architecture).
3. Stop at phase Done when. No commit unless Stanley asks.
4. If a prior phase is incomplete, stop and list gaps instead of improvising.

Shared hard rules for every phase:

- BUILDER ONLY / NOT JEFF TEACHING. Do not ingest into `jeff-wiki` / `jeff-graph`. Do not import `dev-wiki` into the student app.
- Chat-first only. No intake forms.
- UI chrome ZH-main + multilingual via existing i18n. Jeff reply language-match unchanged.
- No dash punctuation in user-facing copy.
- TypeScript strictness: no `any`, no non-null assertions (`!`), no `as unknown as T`. Double-quoted strings.
- No Turbopack at monorepo root next to huge `raw/`. Use `npm run dev --prefix apps/web` (webpack).
- Do not invent new module packs or Jeff doctrine.
- Do not overwrite handoffs `01` to `04`.

---

## Phase F1: Home Dashboard flow

**Outcome:** `/` asks「今天要做什么 IP 内容？」. After the user message, the assistant can recommend 2 to 4 catalog tools as clickable deep links to `/tools/[moduleId]`. Stage-first empty-state chips that force IP Stage Check as the only path are removed or demoted.

### Prompt (copy below)

```text
You are implementing Phase F1 only of the Artemo-style user flow for Influence Engine Coach in this repo.

## Hard rules
- BUILDER ONLY / NOT JEFF TEACHING. Do NOT ingest into jeff-wiki / jeff-graph. Do NOT import dev-wiki into the student app.
- Chat-first only. No intake forms.
- UI chrome ZH-main + EN via existing i18n. Chat replies still use Jeff language-match rules.
- No dash punctuation in user-facing copy.
- TypeScript: no `any`, no non-null assertions, no `as unknown as T`. Double-quoted strings.
- No Turbopack at monorepo root. Do not commit unless I explicitly ask.
- Do not invent new module packs or doctrine. Recommend only real catalog module ids (prefer status ready / wired packs).
- Out of scope for F1: full All Tools restyle (F2), deep tool chat rewrite / query-param context (F3).

## Required reading
1. raw/agent-handoff/05-artemo-flow-what-we-are-doing.md (locked flow + recommend model)
2. apps/web/app/page.tsx
3. apps/web/components/ChatShell.tsx
4. apps/web/components/AppNav.tsx
5. apps/web/app/api/chat/route.ts
6. apps/web/lib/chatTypes.ts
7. apps/web/lib/chatClient.ts
8. apps/web/lib/systemPrompt.ts (home / free-chat path only; extend carefully)
9. apps/web/lib/modules/catalog.ts
10. apps/web/lib/i18n/messages.ts
11. apps/web/STAKEHOLDER.md (read only in F1; rewrite in F3)

## Build exactly
1. Home empty / dashboard lead: primary ask is「今天要做什么 IP 内容？」 (ZH string in i18n; EN equivalent). Brand title may stay Influence Engine Coach; the job of the empty state is the ask, not a stage lecture.
2. Demote or remove empty-state path chips that force IP Stage Check as the primary path. Optional secondary links to All Tools or one example tool are fine if they do not dominate.
3. After the user sends a clear intent message on home (no moduleId), the assistant may recommend 2 to 4 relevant tools.
4. Prefer a clean structured approach if the change stays small: e.g. chat API response includes validated `recommendedModuleIds: string[]` (filter unknown / unwired ids), and ChatShell renders them as link cards/buttons to `/tools/[moduleId]`. If structured is too large, a documented markdown-link fallback is acceptable; say which you chose in the reply.
5. Recommendations must use real catalog titles where shown; deep link to `/tools/[moduleId]`.
6. Do not mix home transcript into the tool route in F1. Links open the tool page; fresh thread is already the default ModuleChatShell mount behavior.
7. Extend i18n for new home ask / recommend chrome strings (zh default, en secondary).
8. Keep probe, sources, brand tokens, soft webinar footer.

## Out of scope
- Restyling `/tools` away from stage hero (F2)
- Tool opener rewrite, `?from=home&q=` wiring, overlay polish (F3)
- New modules, doctrine ingest, probe redesign
- Commits unless asked
- Full STAKEHOLDER rewrite (F3)

## Done when
- npm run build --prefix apps/web passes
- Home asks「今天要做什么 IP 内容？」 (or i18n equivalent) as the primary empty-state job
- After an intent message, UI can show 2 to 4 clickable tool recommendations to `/tools/[moduleId]`
- IP Stage Check is not the forced front door on home
- Brief reply: approach chosen (structured vs markdown), files touched, how to try locally
```

---

## Phase F2: All Tools = card wall only

**Outcome:** `/tools` becomes an Artemo-like category card grid (search OK). Stage hero / “你卡在哪一步” is not primary. Featured strip optional/small. Intro stays optional/short → chat.

### Prompt (copy below)

```text
You are implementing Phase F2 only of the Artemo-style user flow for Influence Engine Coach in this repo.

## Hard rules
- BUILDER ONLY / NOT JEFF TEACHING. Do NOT ingest into jeff-wiki / jeff-graph.
- Phase F1 home recommend assumed done or at least not regress. If home still forces stage-check as the only path, note it; do not expand F2 into a full F1 rebuild.
- Chat-first modules: intro optional/skip → chat. No intake forms.
- UI chrome ZH-main + EN. No dash punctuation in user-facing copy.
- TypeScript: no `any`, no non-null assertions, no `as unknown as T`. Double-quoted strings.
- No Turbopack at monorepo root. Do not commit unless I explicitly ask.
- Do not invent new categories or doctrine. Use existing MODULE_CATEGORY_ORDER / catalog.
- Out of scope: recommend engine polish (F1), deep tool chat / context query params (F3).

## Required reading
1. raw/agent-handoff/05-artemo-flow-what-we-are-doing.md (All Tools target IA)
2. apps/web/app/tools/page.tsx
3. apps/web/components/tools/ToolsGrid.tsx
4. apps/web/components/tools/ModuleIntroModal.tsx
5. apps/web/lib/modules/catalog.ts
6. apps/web/lib/i18n/messages.ts
7. apps/web/app/globals.css (tools-stage-* and related)
8. apps/web/components/AppNav.tsx (demote Start-here-as-primary if still stage-gated)
9. apps/web/STAKEHOLDER.md (read only; rewrite in F3)

## Build exactly
1. `/tools` primary UX = category card wall (group by existing catalog categories). Cards open the existing intro → chat path.
2. Remove or demote the stage hero / “你卡在哪一步” / primary CTA to IP Stage Check so it is not the page story. Stage Check remains a normal card in the catalog.
3. Featured strip: optional and small, not a journey curriculum. Search is allowed and useful.
4. Keep intro modal optional/short; skip remembered. Do not lengthen onboarding.
5. Update tools chrome i18n strings away from stage-journey primary copy (ZH default, EN secondary).
6. Mobile: usable category sections / filters + cards; no desktop-only wall.
7. Do not break deep links to `/tools/[moduleId]`.

## Out of scope
- Home recommend engine changes (F1)
- Tool chat opener / clarify overlay / `?q=` context (F3)
- New modules, doctrine, probe changes
- Commits unless asked
- Full STAKEHOLDER + README rewrite (F3)

## Done when
- npm run build --prefix apps/web passes
- `/tools` reads as Artemo-like category cards; stage hero is gone or clearly non-primary
- Search (if present) works; intro → chat still works for a sample module
- Brief reply: files touched + how to click-test All Tools
```

---

## Phase F3: Tool chat clarify-then-deliver + polish

**Outcome:** Fresh tool chat per open; opener asks what they want to create today (tool-scoped); overlays reinforce 1 to 2 questions/turn then deliverable; home recommendations can pass optional context query params; STAKEHOLDER + README + short wiki log updated; browser QC checklist in Done when.

### Prompt (copy below)

```text
You are implementing Phase F3 only of the Artemo-style user flow for Influence Engine Coach in this repo.

## Hard rules
- BUILDER ONLY / NOT JEFF TEACHING. Do NOT ingest into jeff-wiki / jeff-graph.
- F1 + F2 assumed landed (home recommend + All Tools card wall). If missing, stop and list gaps.
- Chat-first only. No intake forms. No dash punctuation in user-facing copy.
- UI chrome ZH-main + EN. Jeff language-match for replies unchanged.
- TypeScript: no `any`, no non-null assertions, no `as unknown as T`. Double-quoted strings.
- No Turbopack at monorepo root. Do not commit unless I explicitly ask.
- No new doctrine pages. No new module packs unless a tiny opener string fix is required for clarity.

## Required reading
1. raw/agent-handoff/05-artemo-flow-what-we-are-doing.md (session model + success criteria)
2. apps/web/components/tools/ModuleWorkspace.tsx
3. apps/web/components/tools/ModuleChatShell.tsx
4. apps/web/lib/modules/modulePrompt.ts
5. apps/web/lib/modules/packs/ (pattern: chatOpener + systemOverlay clarify rules; do not rewrite all packs wholesale)
6. apps/web/components/ChatShell.tsx (recommend link shape from F1)
7. apps/web/lib/chatTypes.ts / chatClient.ts / app/api/chat/route.ts (only if needed for context hint)
8. apps/web/STAKEHOLDER.md
9. apps/web/README.md
10. apps/web/lib/i18n/messages.ts

## Build exactly
1. Ensure opening a tool starts a **new** chat thread (fresh messages seeded with opener). Fix remount/keying if client navigation reuses state incorrectly.
2. Opener stays conversational and tool-scoped (what they want to create with this tool today / pack chatOpener). Do not replace with a form.
3. Reinforce clarify-then-deliver: overlays / modulePrompt rules keep 1 to 2 questions per turn until enough, then deliverable in the same chat. Prefer tightening shared overlay helpers over editing all 39 packs unless a flagship opener is clearly wrong.
4. Wire home recommendations → tool chat with optional context query params, e.g. `?from=home&q=...` (short URL-encoded intent). Tool may use `q` to bias the first question or a silent hint; never as an intake form. Validate / length-cap `q`.
5. Update apps/web/STAKEHOLDER.md and apps/web/README.md for the locked Artemo flow (home ask → recommend → tool chat; All Tools card wall; no stage-first front door). Keep builder-accurate.
6. Append a short builder note to dev-wiki/log.md that F1 to F3 Artemo flow landed (builder log only; not jeff teaching).
7. Keep sources chip, probe, brand, soft webinar footer.

## Out of scope
- Rebuilding recommend ranking ML
- Persistent multi-session chat history DB
- New modules / doctrine ingest
- Commits unless asked

## Done when
- npm run build --prefix apps/web passes
- Browser QC checklist (agent or human) all pass or gaps listed:
  - [ ] Home shows「今天要做什么 IP 内容？」
  - [ ] After intent, 2 to 4 tool cards link to `/tools/[id]`
  - [ ] Tool opens fresh chat with conversational opener
  - [ ] Follow-ups are 1 to 2 questions/turn; deliverable appears in same chat
  - [ ] `/tools` is category card wall (no stage hero primary)
  - [ ] Optional `?from=home&q=` from a home recommendation is visible in behavior or URL without a form
  - [ ] Locale toggle still works; sources still show on replies
  - [ ] STAKEHOLDER + README match the locked flow
- Brief reply: files touched + QC results + how to try the home→tool path
```

---

## Operator checklist

| Step | Action |
| --- | --- |
| 1 | Paste **F1** only; verify home ask + recommendations |
| 2 | Paste **F2** only; verify All Tools card wall |
| 3 | Paste **F3** only; verify tool chat + docs + QC |
| 4 | Commit only when Stanley asks |

## Optional follow-ups (not in F1 to F3 unless asked)

- Smarter recommend ranking using pack `probeHints` / categories
- Persist tool threads per user (needs auth / storage product decision)
- Shrink or rename nav labels after stakeholder language review
- Further demote unused stage-rail CSS once unused
