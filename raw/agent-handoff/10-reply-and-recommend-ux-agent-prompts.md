# Implementation agent prompts: Reply brevity, Artemo recommend, opener + question bullets

**Audience:** builders / implementer agents (~200k context)  
**Store:** `raw/agent-handoff/` (builder only)  
**Updated:** 2026-09-22  
**Do not ingest into jeff-wiki / jeff-graph.**

> **BUILDER ONLY / NOT JEFF TEACHING.**  
> Copy **one phase at a time** (R1, then R2, then R3). Do not run R1+R2+R3 as one mega prompt.

Product context (required): `09-reply-and-recommend-ux-what-we-are-doing.md`.

---

## How to use

1. Paste **one** phase prompt below into a fresh agent turn.
2. Require the agent to open the listed files (do not invent architecture).
3. Stop at that phase's Done when. No commit unless Stanley asks.
4. If a prior phase is incomplete, stop and list gaps instead of improvising the missing work.

### Why three phases

Sized for ~200k-context agents without blowing the window mid-task:

| Phase | Focus | Why split |
| --- | --- | --- |
| R1 | Home Artemo recommend UI + debounce path | UI + API surface; leave pack copy alone |
| R2 | All pack openers EN + ZH | ~56 string rewrites; mechanical but file-heavy |
| R3 | Shared prompt rules (no framework lecture + question bullets) | Prompt-only; do not re-touch all packs |

Shared hard rules for every phase:

- BUILDER ONLY / NOT JEFF TEACHING. Do not ingest into `jeff-wiki` / `jeff-graph`. Do not import `dev-wiki` into the student app.
- Chat-first only. No intake forms.
- UI chrome ZH-main + multilingual via existing i18n. Jeff reply language-match / UI locale lock unchanged.
- No dash punctuation in user-facing copy.
- TypeScript: no `any`, no non-null assertions (`!`), no `as unknown as T`. Double-quoted strings.
- No Turbopack at monorepo root next to huge `raw/`. Use `npm run build --prefix apps/web` / `npm run dev --prefix apps/web`.
- Do not invent new module packs or Jeff doctrine.
- Do not overwrite handoffs `01` to `08`. Do not expand into `/tools` journey IA (`07` / `08`).
- Do not commit unless Stanley explicitly asks.

---

## Phase R1: Home recommend = Artemo under-input

**Outcome:** Home stays a simple ask + composer. When create-intent is clear enough, 2 to 4 tool recommendation cards appear **under the input** (debounced as-you-type, and still on send). Long coach essay + cards under a chat bubble is no longer the primary path.

### Prompt (copy below)

```text
You are implementing Phase R1 only of the reply / recommend UX pass for Influence Engine Coach in this repo.

## Hard rules
- BUILDER ONLY / NOT JEFF TEACHING. Do NOT ingest into jeff-wiki / jeff-graph. Do NOT import dev-wiki into the student app.
- Chat-first only. No intake forms.
- UI chrome ZH-main + EN via existing i18n. Reply language still follows UI locale lock.
- No dash punctuation in user-facing copy.
- TypeScript: no `any`, no non-null assertions, no `as unknown as T`. Double-quoted strings.
- No Turbopack at monorepo root. Do not commit unless I explicitly ask.
- Recommend only real ready + wired catalog module ids. Keep RECOMMEND_MIN=2 and RECOMMEND_MAX=4.
- Out of scope for R1: rewriting pack chatOpeners (R2), systemPrompt / modulePrompt brevity rules (R3), /tools journey IA.

## Required reading (open these)
1. raw/agent-handoff/09-reply-and-recommend-ux-what-we-are-doing.md (locked product; supersedes 05/06 recommend presentation)
2. apps/web/components/ChatShell.tsx
3. apps/web/lib/modules/recommend.ts
4. apps/web/lib/modules/homeHandoff.ts
5. apps/web/app/api/chat/route.ts
6. apps/web/lib/openai.ts (recommend_modules tool only)
7. apps/web/lib/chatTypes.ts
8. apps/web/lib/chatClient.ts
9. apps/web/lib/i18n/messages.ts
10. apps/web/app/globals.css (recommend / empty-state / composer classes you will touch)

## Build exactly
1. Home primary composition: centered ask + simple composer (Artemo feel). Keep Influence Engine brand tokens. Demote or trim path/example chip clutter if it fights a simple first viewport; do not remove All Tools access entirely.
2. When the draft create-intent is clear enough, show a recommendation block UNDER the composer (not under an assistant message as the primary UX). Include 2 to 4 validated tools with deep links via buildToolHrefFromHome(id, intent).
3. Trigger: debounced as-you-type (suggest ~300 to 500ms; min character threshold so empty/noise drafts do not fire). Also keep a path on Send so Enter still works.
4. Engine: reuse validateRecommendedModuleIds / listRecommendableModules. Prefer a lightweight recommend path (small API or constrained call) over a full coach completion on every keystroke. If you keep recommend_modules, avoid dumping a long coaching essay into the message list as a prerequisite for cards. Document the approach in your reply.
5. Cards: tool title, category meta, clear CTA (existing recommend i18n keys OK; add tip/chrome strings if needed for Artemo tip under input).
6. Vague intent: show nothing or one short tip asking for more detail; do not invent tools.
7. Do not break /tools/[moduleId] deep links or home handoff query params.
8. Mobile: recommendation under input remains usable; no desktop-only layout.

## Out of scope
- Pack opener rewrites (R2)
- systemPrompt / modulePrompt framework-lecture rules (R3)
- Changing recommend count to a single card
- New modules, doctrine ingest, /tools redesign
- Commits unless asked

## Done when
- npm run build --prefix apps/web passes
- Typing a clear create intent (e.g. "ig script" / 「写一条 Reel 脚本」) shows 2 to 4 cards under the input without requiring a long coach reply first
- Vague drafts do not spam bad recommendations
- Brief reply: approach chosen (debounce + API shape), files touched, how to try locally with npm run dev --prefix apps/web
```

---

## Phase R2: Tool openers conversational + bullets

**Outcome:** Every wired pack's seeded first bubble is Artemo-conversational: short greeting, markdown bullet list, one question. EN + ZH. Home handoff prefix behavior stays.

### Prompt (copy below)

```text
You are implementing Phase R2 only of the reply / recommend UX pass for Influence Engine Coach in this repo.

## Hard rules
- BUILDER ONLY / NOT JEFF TEACHING. Do NOT ingest into jeff-wiki / jeff-graph.
- Phase R1 home recommend assumed done or at least not regress. If cards still only appear under chat bubbles, note it; do not expand R2 into a full R1 rebuild.
- Chat-first only. No intake forms. No dash punctuation in user-facing copy.
- TypeScript: no `any`, no non-null assertions, no `as unknown as T`. Double-quoted strings.
- No Turbopack at monorepo root. Do not commit unless I explicitly ask.
- Do not invent new modules or doctrine. Do not rewrite systemOverlay blocks in this phase (R3 owns prompt behavior).
- Out of scope: home recommend UI (R1), shared prompt brevity rules (R3).

## Required reading (open these)
1. raw/agent-handoff/09-reply-and-recommend-ux-what-we-are-doing.md (opener template section)
2. apps/web/lib/modules/types.ts (chatOpener / chatOpenerZh fields)
3. apps/web/lib/modules/packLocale.ts
4. apps/web/lib/modules/packChatOpenersZh.ts
5. apps/web/lib/modules/homeHandoff.ts (buildToolChatOpener)
6. apps/web/components/tools/ModuleChatShell.tsx
7. apps/web/components/AssistantMessage.tsx (confirm markdown lists render for seeded openers)
8. apps/web/lib/modules/packs/ (all pack files that define chatOpener)

## Build exactly
1. Rewrite every pack chatOpener to the locked shape from doc 09:
   - Conversational greeting (ready to help with this tool's job in plain speech)
   - Short markdown bullet list (2 to 3 items: outcome / what to bring / optional beat)
   - One direct follow-up question
   - Do NOT lecture the framework ("OPENS is…"). Naming a Jeff move lightly in a bullet is OK.
2. Update ZH the same way: prefer pack.chatOpenerZh when present; keep packChatOpenersZh.ts complete for packs that rely on the shared map. getPackChatOpener must still resolve correctly.
3. Update defaultChatOpener in packLocale.ts to match the new conversational + bullets pattern.
4. Keep buildToolChatOpener home prefix behavior (one short "You mentioned on home…" / 「你在首页提到：…」 line above the opener).
5. Verify AssistantMessage (or opener rendering path) shows bullets for the seeded first message. Fix rendering only if lists currently flatten to prose.
6. Keep openers short. No curriculum paragraphs.

## Out of scope
- Home Artemo recommend UI (R1)
- systemPrompt / modulePrompt / pack systemOverlay lecturing rules (R3)
- Catalog title / description rewrites unless a typo blocks the opener
- Commits unless asked

## Done when
- npm run build --prefix apps/web passes
- Spot-check at least 3 tools in EN and ZH (e.g. ig-reel-script, standpoint-builder, ad-vs-asset-checker): opener is conversational, has bullets, ends with one question
- Brief reply: how many packs updated, ZH strategy (inline vs map), any packs skipped and why
```

---

## Phase R3: Less framework lecture + clarifying questions as bullets

**Outcome:** Shared prompts tell the model to apply frameworks without teaching them, and to format 2 clarifying questions as a markdown bullet list (still max 1 to 2 questions per turn).

### Prompt (copy below)

```text
You are implementing Phase R3 only of the reply / recommend UX pass for Influence Engine Coach in this repo.

## Hard rules
- BUILDER ONLY / NOT JEFF TEACHING. Do NOT ingest into jeff-wiki / jeff-graph.
- R1 + R2 assumed landed (or note gaps; do not rebuild them here).
- Chat-first only. No intake forms. No dash punctuation in user-facing copy.
- TypeScript: no `any`, no non-null assertions, no `as unknown as T`. Double-quoted strings.
- No Turbopack at monorepo root. Do not commit unless I explicitly ask.
- Prefer shared prompt edits. Do NOT rewrite all 56 pack systemOverlays. Only patch an individual overlay if it still forces a framework lecture after the shared rules land.
- Out of scope: home recommend UI (R1), opener string rewrites (R2), /tools IA, new doctrine pages.

## Required reading (open these)
1. raw/agent-handoff/09-reply-and-recommend-ux-what-we-are-doing.md (reply behavior section)
2. apps/web/lib/systemPrompt.ts (inlineSoundHardRules formatting + bans)
3. apps/web/lib/modules/modulePrompt.ts (buildSharedModuleRules; clarifying-question rules)
4. apps/web/lib/modules/recommend.ts (home recommend overlay: keep brief; no curriculum)
5. apps/web/components/AssistantMessage.tsx (lists already supported; confirm only)
6. Optionally skim 1 to 2 flagship packs' systemOverlay (e.g. ig reel / brand pillars) to see if shared rules are enough

## Build exactly
1. Add a hard shared rule: apply Jeff frameworks / pack steps; do not explain what the framework is. Prefer deliverable or next move over definitions. Ban curriculum dumps and "Framework X is…" openings.
2. Clarifying questions: keep at most 1 to 2 per turn. If asking two questions in one turn, they MUST be a markdown bullet (or numbered) list, not a prose row. Soften or reword any "never dump a form-like list" rule so it does not block clarifying-question bullets; still ban long interrogations (3+ questions / intake walls).
3. Align systemPrompt formatting section with the above (short para + list is encouraged for questions and concrete moves).
4. Keep home recommend overlay brief ("coach briefly"; no curriculum). Do not undo R1 UI.
5. Optional: append a one-line builder note to dev-wiki/log.md that R1 to R3 landed (builder log only; not jeff teaching). Skip if you lack write access; mention it in the reply.
6. Do not change Student-facing doctrine files under jeff-wiki / raw/jeff.

## Out of scope
- Rewriting all pack openers again (R2)
- Home recommend layout (R1)
- Full overlay rewrites across all packs
- Commits unless asked

## Done when
- npm run build --prefix apps/web passes
- Brief reply quotes the exact new rule lines you added (path + summary)
- Manual check plan for a human: open a tool, ask vaguely, confirm the model does not lecture the framework and formats two questions as bullets when it asks two
```

---

## After all phases (Stanley)

Optional follow-ups (not in R1 to R3 unless asked):

- Browser QC against Artemo screenshots (home under-input cards; tool opener bullets)
- Whether recommend should collapse to **1** card like Artemo (currently locked at 2 to 4)
- Short STAKEHOLDER.md accuracy pass if home flow text is stale
- Commit when Stanley requests

---

## Access wall

- Never paste these prompts into student answers or teaching ingest.
- Delete or re-pointer this folder later if builder prompts must stay out of `raw/` long-term; engineering SoT remains `dev-wiki/`.
