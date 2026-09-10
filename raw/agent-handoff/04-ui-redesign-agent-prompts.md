# Implementation agent prompts: Influence Engine Coach UI redesign

**Audience:** human operator copying prompts into fresh Cursor agent chats 
**Store:** `raw/agent-handoff/` (builder only) 
**Updated:** 2026-09-08 
**Do not ingest into jeff-graph.**

> **BUILDER ONLY / NOT JEFF TEACHING.** 
> Paste these into implementer agents only. Do not treat as Jeff doctrine. Do not ingest into `jeff-wiki` / `jeff-graph`.

## How to use

1. Read [03-ui-redesign-what-we-are-doing.md](03-ui-redesign-what-we-are-doing.md) yourself once. 
2. Run agents **in order** (U1 → U2 → U3). Do not merge into one mega-agent. 
3. Each prompt is sized for ~200k context models: point at files; do not paste entire CSS dumps. 
4. Paste the **entire** phase block as the user message (including Required reading). 
5. After each phase: skim diff, run listed checks, then start the next agent on a **new** chat. 
6. Do **not** ask agents to commit unless you explicitly want a commit in that chat. 
7. Module handoffs `01` / `02` stay as-is. This pack is chrome only.

### Context budget (why phases are split)

| Too big (avoid) | This pack |
| --- | --- |
| One agent restyles shell + tools wall + motion + all docs | Three agents: brand shell → tools/module chrome → polish/docs |
| Dumping webinar HTML or full `globals.css` into the prompt | Point at token table in `03` + open files in repo |
| Rebuilding modules / probe / OpenAI | Restyle and rename only |

### Language reminder (all phases)

UI chrome **main = Chinese**; EN secondary via i18n. Chat **model replies** still follow existing Jeff language-match rules. No dash punctuation in student-facing copy (workspace rule).

---

## Phase U1: Brand shell + rename + ZH chrome foundation

**Outcome:** Influence Engine Coach look and name on shell/nav/home; CSS tokens + fonts; ZH default chrome with EN secondary skeleton; soft webinar footer; dead intake CSS off primary path. Tools wall still largely old layout (U2).

### Prompt (copy below)

```text
You are implementing Phase U1 only of the Influence Engine Coach UI redesign in this repo.

## Hard rules
- BUILDER ONLY / NOT JEFF TEACHING. Do NOT ingest anything into jeff-wiki / jeff-graph. Do NOT mount or import dev-wiki into the student app.
- Work product code under apps/web. Do not change probe, OpenAI, module pack overlays, or POST /api/chat behavior except unavoidable metadata/title strings.
- Product name in visible chrome: Influence Engine Coach (not “Jeff IP test”).
- UI chrome main = Chinese; provide EN strings too (i18n skeleton). Default locale zh. Chat replies still follow existing Jeff language-match rules (do not force ZH model output).
- Logo/photo rights: YES for Influence Engine / Brand Warriors / webinar / workshop assets. Prefer apps/web/public/brand/. Do not put binaries in jeff-wiki.
- Soft webinar CTA only: https://webinar.influenceengine.co/opt-in. No countdown, scarcity, or form capture inside the coach.
- No dash punctuation in user-facing copy (em/en dash or spaced hyphen-as-aside). Prefer periods, commas, colons.
- No Turbopack at monorepo root. Use apps/web webpack scripts (`npm run dev` / `npm run build` under apps/web).
- TypeScript: no `any`, no non-null assertions, no `as unknown as T`. Double-quoted strings.
- Do not commit unless I explicitly ask.

## Required reading (open these; do not invent architecture)
1. raw/agent-handoff/03-ui-redesign-what-we-are-doing.md
2. raw/agent-handoff/README.md
3. Canvas (proposal): /Users/stanley/.cursor/projects/Users-stanley-Documents-GIthub-jgpt/canvases/jeff-ip-brand-redesign.canvas.tsx
4. apps/web/app/globals.css (tokens + shell styles; skim, do not dump back in chat)
5. apps/web/app/layout.tsx
6. apps/web/app/page.tsx
7. apps/web/components/AppNav.tsx
8. apps/web/components/ChatShell.tsx
9. apps/web/STAKEHOLDER.md (tone only in U1; full rewrite is U3)

## Build exactly
1. CSS tokens in globals.css (or equivalent): primary #F36B21, light #FF8A3D, paper #FFF8F2 / #FFF1E7, ink #17120F, muted #70665F, gold #A78340, hero dark #080808 / #0B0B0B, stone dividers as needed. Replace forest-green accent as the primary CTA color.
2. Fonts: Manrope headlines + Noto Sans SC body; Inter only as fallback. Wire via next/font or documented CSS import in layout. Keep app usable if Google Fonts is slow (fallbacks).
3. AppNav: wordmark / product name “Influence Engine Coach” (text wordmark OK if mark files not yet present). Ask Jeff / Tools labels in ZH default with EN available. Orange active state.
4. layout metadata title/description → Influence Engine Coach (not Jeff IP test).
5. Home / ChatShell empty-state: one composition (brand, one promise line, a few example chips / Start here, composer). Move lab / draft disclaimer energy out of the hero into a quieter footer area.
6. Soft webinar footer link (ZH + EN string) to https://webinar.influenceengine.co/opt-in.
7. Basic i18n skeleton: zh default + en for chrome strings used in U1 (nav, empty state, footer, common buttons). Document how to switch (toggle or locale detection stub is enough in U1).
8. Rename remaining visible “Jeff IP test” chrome strings you touch in U1. Leave deep STAKEHOLDER rewrite for U3 if time is tight, but do not leave the browser tab title as Jeff IP test.
9. If ModuleIntakeForm CSS still pollutes the primary stylesheet path, remove or isolate it so primary chat/tools CSS is brand-first. Do not reintroduce intake forms.
10. Optional: add apps/web/public/brand/README.md with suggested asset paths + attribution note. Download marks only if straightforward; text wordmark is acceptable for U1 Done.

## Out of scope (stop if tempted)
- Full /tools stage-first redesign (that is U2)
- Full module intro / bubble restyle beyond what global tokens naturally cascade
- Heavy motion, first-visit dark cinematic experience (U3)
- New modules, doctrine ingest, probe changes
- Commits unless asked

## Done when
- npm run build --prefix apps/web passes
- / shows Influence Engine Coach branding, orange/paper tokens, ZH-primary chrome
- Soft webinar footer present without scarcity UI
- i18n skeleton exists with zh default + en
- Brief reply: files touched + how to try locally + any missing brand binaries
```

---

## Phase U2: Tools wall + module chrome

**Outcome:** Stage-first `/tools` (featured 3 + category rails); short ZH intro modal; module chat toolbar / bubbles / sources restyled to brand; Start / deep-link → IP Stage Check. No new modules.

### Prompt (copy below)

```text
You are implementing Phase U2 only of the Influence Engine Coach UI redesign in this repo.

## Hard rules
- BUILDER ONLY / NOT JEFF TEACHING. Do NOT ingest into jeff-wiki / jeff-graph. Do NOT import dev-wiki into the student app.
- Phase U1 brand shell assumed done (tokens, fonts, rename, i18n skeleton). If missing, stop and say what U1 left incomplete.
- Keep chat-first modules (intro optional → chat). Do not bring back intake forms as a gate.
- UI chrome main = Chinese; EN via existing i18n. Extend strings for tools/module chrome. Chat replies still use Jeff language-match rules.
- Soft webinar CTA only (no countdown/scarcity). No dash punctuation in user-facing copy.
- No Turbopack at monorepo root. TypeScript strictness: no `any`, no non-null assertions, no `as unknown as T`. Double-quoted strings.
- Do not commit unless I explicitly ask.
- Do not invent new Jeff doctrine or new module packs.

## Required reading
1. raw/agent-handoff/03-ui-redesign-what-we-are-doing.md (Tools IA + surfaces)
2. Canvas: /Users/stanley/.cursor/projects/Users-stanley-Documents-GIthub-jgpt/canvases/jeff-ip-brand-redesign.canvas.tsx
3. apps/web/app/globals.css (token system from U1)
4. apps/web/components/tools/ToolsGrid.tsx
5. apps/web/components/tools/ModuleIntroModal.tsx
6. apps/web/components/tools/ModuleChatShell.tsx
7. apps/web/components/tools/ModuleWorkspace.tsx
8. apps/web/app/tools/page.tsx
9. apps/web/app/tools/[moduleId]/page.tsx
10. apps/web/lib/modules/catalog.ts (categories + featured ids; do not rewrite all pack overlays)
11. apps/web/components/ChatShell.tsx (empty-state Start / shortcuts)
12. apps/web/components/AssistantMessage.tsx
13. apps/web/components/MessageSourcesChip.tsx

## Build exactly
1. /tools stage-first layout:
   - Stage hero / guide: "Where are you stuck?" (ZH) with clear path to IP Stage Check (`ip-stage-check`)
   - Featured trio (default: ig-reel-script, standpoint-builder, who-i-serve unless 03/product copy clearly says otherwise)
   - Category rails using existing MODULE_CATEGORY_ORDER (Foundation → Get Seen → Earn Trust → … → Polish). Cards are interaction targets, not a flat equal dump.
   - Search remains secondary.
2. ModuleIntroModal: short job card (what it does / bring this / you get this), orange Start CTA, skip remembered. Chrome ZH-primary; keep tool title clear.
3. Module chat toolbar: coach context chip (tool title), not builder jargon. Restyle to brand tokens.
4. Bubbles + sources: user warm stone tint; Jeff paper + orange role cue; sources chip quieter, gold accent when hits. Keep Sources used panel for stakeholders (may stay available; do not delete capability).
5. Deep-link Start / home empty-state: primary onboarding path to IP Stage Check; keep 1 to 2 other tool jumps max on Ask Jeff empty state (not full catalog).
6. Extend i18n strings for tools wall + intro + module chrome (zh default, en secondary).
7. Mobile: tools usable as stage chips / sections then list; do not require desktop-only layout.

## Out of scope
- Heavy motion systems (U3)
- New modules or catalog expansion
- Doctrine / probe / API redesign
- Full STAKEHOLDER.md rewrite (U3)
- Commits unless asked

## Done when
- npm run build --prefix apps/web passes
- /tools shows featured + rails (not 39 equal undifferentiated cards)
- Intro modal is short; module chat looks on-brand
- Start / empty-state deep-link reaches IP Stage Check
- Brief reply: files touched + how to click-test Tools + one module
```

---

## Phase U3: Polish + motion + stakeholder docs

**Outcome:** 2 to 3 intentional motions; mobile polish; empty/error student copy; STAKEHOLDER + README for Influence Engine Coach; optional first-visit dark brand moment; multilingual toggle or locale detection verified. No new doctrine.

### Prompt (copy below)

```text
You are implementing Phase U3 only of the Influence Engine Coach UI redesign in this repo.

## Hard rules
- BUILDER ONLY / NOT JEFF TEACHING. Do NOT ingest into jeff-wiki / jeff-graph.
- Phases U1 to U2 assumed done. If brand shell or stage-first tools are missing, stop and list gaps.
- Soft webinar link only (no scarcity UI). No dash punctuation in user-facing copy.
- UI chrome ZH-main + EN secondary. Verify toggle and/or locale detection works for chrome strings. Do not change Jeff chat language-match policy.
- No Turbopack at monorepo root. TypeScript: no `any`, no non-null assertions, no `as unknown as T`. Double-quoted strings.
- Do not commit unless I explicitly ask.
- No new modules, no doctrine pages, no probe redesign.

## Required reading
1. raw/agent-handoff/03-ui-redesign-what-we-are-doing.md (success criteria + polish notes)
2. Canvas polish section: /Users/stanley/.cursor/projects/Users-stanley-Documents-GIthub-jgpt/canvases/jeff-ip-brand-redesign.canvas.tsx
3. apps/web/app/globals.css
4. apps/web/components/ChatShell.tsx
5. apps/web/components/tools/ToolsGrid.tsx
6. apps/web/components/tools/ModuleChatShell.tsx
7. apps/web/STAKEHOLDER.md
8. apps/web/README.md
9. i18n files introduced in U1/U2

## Build exactly
1. Motion (2 to 3 intentional, not noise): e.g. send/CTA pulse, assistant opener entrance, mobile stage rail scroll-snap. Prefer CSS; keep subtle.
2. Mobile polish: full-bleed chat usability; sources as drawer/sheet if needed; tools stage chips readable.
3. Empty / error / “No graph source” student-facing copy: on-brand, ZH-primary with EN available, calm coach tone (not lab panic).
4. Optional: first-visit dark brand moment (#080808 / #0B0B0B + soft orange glow), once, dismissible or short; do not wallpaper every session.
5. Update apps/web/STAKEHOLDER.md and apps/web/README.md for Influence Engine Coach (routes, Ask Jeff / Tools / Start, ZH chrome note, soft webinar footer). Keep builder-accurate; do not invent new doctrine claims.
6. Verify multilingual: chrome switches zh↔en (toggle or detection). Document the switch in README briefly.
7. Optional: append a short builder note to dev-wiki/log.md that U1 to U3 UI redesign landed (builder log only; not jeff teaching).
8. Spot-check: no remaining primary hero “Jeff IP test” naming; forest-green not primary CTA.

## Out of scope
- New doctrine, new modules, API/probe rewrites
- Webinar funnel features inside the coach
- Commits unless asked
- Mega redesign of Sources panel data model

## Done when
- npm run build --prefix apps/web passes
- Motion present but restrained; mobile paths usable
- STAKEHOLDER.md + README describe Influence Engine Coach
- Locale toggle or detection verified for chrome
- Brief reply: files touched + click-test checklist for Stanley / stakeholders
```

---

## Optional follow-ups (do not put in U1 to U3 unless asked)

- Stakeholder vs student density toggle for Sources panel
- Full bilingual module description corpus for all ~39 tools
- Dedicated `/start` route if empty-state deep-link is not enough
- Brand mark SVG polish after CDN downloads
- Commit / PR when the operator asks

## Operator checklist

After U1: open `/`, confirm Influence Engine Coach name, orange tokens, ZH chrome, webinar footer, build green. 
After U2: open `/tools`, featured + rails, one module intro → chat, Start → IP Stage Check. 
After U3: mobile pass, motion check, locale switch, hand STAKEHOLDER.md to testers.
