# What we are doing — Artemo-style IP modules on Jeff IP test

**Audience:** builders / implementer agents  
**Store:** `raw/agent-handoff/` (builder only)  
**Updated:** 2026-09-08  
**Do not ingest into jeff-graph.**

Read this before any implementation prompt in `02-implementation-agent-prompts.md`.

---

## One-line goal

Extend the existing **Jeff IP test** Next app (`apps/web`, live pattern like Artemo’s tool wall) with **IP-positioned modules** that equip a beginner to build personal IP the Jeff way: get seen → earn trust → then deal. Modules produce assets (scripts, briefs, plans). Free chat stays.

## Why (product)

Stakeholders already have a grounded coach chat. That is not enough. People who do not know IP need **named tools** with:

1. Card grid by category (Artemo “All Tools” feel)
2. Intro description modal (“what this is / when to use it / Start …”)
3. Short intake form
4. Guided generate in Jeff voice, still closed-doctrine + sources chip

Reference UX (external): Artemo tool cards + intro modal (e.g. “Direct Cold Email Writer”). We are **not** cloning Artemo’s ad/email/funnel catalog. We are cloning the **module shell**, filled with Jeff IP jobs.

## What already exists (do not rebuild)

| Piece | Location |
| --- | --- |
| Next App Router chat UI | `apps/web/` (Vercel Root Directory `apps/web`) |
| `POST /api/chat` | probe + OpenAI + optional `probe_jeff` tools |
| Teaching bundle | `apps/web/content/jeff/` (synced from monorepo `jeff-wiki`, `jeff-graph`, `schema/voice`) |
| Voice / doctrine rules | `schema/voice/`, `schema/alignment/`, `schema/AGENTS.md` |
| Dash strip | `apps/web/lib/stripDashPunctuation.ts` |
| Stakeholder guide | `apps/web/STAKEHOLDER.md` |
| Eng SoT | `dev-wiki/accomplishments-and-decisions.md` |

Runtime today:

```text
ChatShell → POST /api/chat → fresh probe → systemPrompt + evidence → OpenAI → reply + sources
```

Hard rules already locked (keep them):

- Closed Jeff allowlist; no open-web RAG for doctrine; no `dev-wiki` in student path
- Out of coverage: Generally → Jeff → steer (no KB-meta refuse)
- English ask → full English; 1-on-1 coach register; no dash punctuation
- Never invent Jeff niche case studies as doctrine
- Per-turn fresh probe; dialogue-only history; sources on each Jeff bubble
- Do not run Turbopack / `next dev` at monorepo root beside huge `raw/jeff` media

## Target architecture (modules)

```text
/              → free “Ask Jeff” chat (keep ChatShell)
/tools         → category grid of modules
/tools/[id]    → intro modal → intake → module chat (same API, module mode)
```

Extend `POST /api/chat` request (do not fork a second OpenAI stack):

```ts
type ChatRequestBody = {
  messages: ChatMessage[];
  moduleId?: string;
  intake?: Record<string, string>;
};
```

When `moduleId` is set:

1. Load module pack from `apps/web/lib/modules/`
2. Probe with user ask + intake summary + module `probeHints`
3. `buildSystemPrompt` + module `systemOverlay` (output format, ask-if-missing)
4. Same tool loop, dash strip, sources response

Module packs are **product UX**, not doctrine. Do not file module blurbs into `jeff-wiki` as teaching pages.

### Suggested code layout

```text
apps/web/lib/modules/
  types.ts
  catalog.ts              # all v1 modules: id, title, category, description
  packs/
    ig-reel-script.ts     # intakeFields, probeHints, systemOverlay, boundNodeIds?
    ...
apps/web/app/tools/page.tsx
apps/web/app/tools/[moduleId]/page.tsx
apps/web/components/tools/
  ToolsGrid.tsx
  ModuleIntroModal.tsx
  ModuleIntakeForm.tsx
  ModuleChatShell.tsx     # thin wrapper around ChatShell patterns
```

Optional nav: **Ask Jeff | Tools**.

## v1 module menu (locked for this handoff)

User-facing descriptions belong in `catalog.ts` (and intro modal). Categories:

### IP Foundation

1. **IP Stage Check** — Diagnose unseen / no trust / not converting; next module to open.  
2. **Standpoint Builder** — One sharp 立场 line.  
3. **Boss Brand Brief** — Founder face as brand; what to film.  
4. **Lean IP Setup** — Start without a full crew; weekly rhythm.

### Get Seen

5. **IG Reel Script** — Centerpiece. 15–45s Reel: hook → body → close; asset not ad.  
6. **Scroll-Stop Hook** — Opening lines only.  
7. **Value Teaching Reel** — Teach one tip openly; light next step.  
8. **Hot Take Script** — Standpoint on camera; advice not ego.

### Content Asset System

9. **Content Asset Planner** — Week plan tagged see / trust / convert.  
10. **Direction Fixer** — Stop “post more”; pick a path.  
11. **Value → Convert Ladder** — Value first, then invite.  
12. **Ad vs Asset Checker** — Paste draft; rewrite if salesy.

### On-Camera Coach

13. **Advice vs Ego Coach** — Pre-shoot checklist.  
14. **Criticism Armor** — Stay consistent under hate / 变好羞耻症.

### Polish

15. **Script Humanizer** — Stiff draft → 1-on-1 speakable script.

### Explicit non-goals for v1

- Artemo Ad Writer HAO/HVO/HSO as hero tools  
- Cold email / Money Tales / contracts / podcast outreach suites  
- Epic Pitch / full offer architecture (KB thin)  
- “Guaranteed viral” naming (Jeff rejects overnight fame / viral-as-promise)  
- Auth, DB, accounts  
- Mounting `dev-*` or ingesting this handoff into teaching

## KB grounding (honest)

Batch-1 graph is draft: principles, claims, terms, rejects, suggested frameworks. Overlays must bind to existing nodes where possible (`pr.exposure-trust-conversion`, `pr.standpoint-or-invisible`, `cl.content-not-ads`, `cl.short-vs-long-video`, `cl.value-then-convert`, `pr.advice-vs-ego`, rejects, etc.). If thin: Generally → Jeff → steer. Never invent named Jeff IP frameworks as confirmed.

## Success for this effort

- `/tools` looks like an IP tool wall with the 15 cards + real intro descriptions  
- At least **IG Reel Script** works end-to-end: intro → intake → script + sources  
- Free chat still works unchanged when `moduleId` omitted  
- No doctrine wall breaks; build still passes under `apps/web`  
- Later agents can add packs without rewriting the shell

## Ops reminders

- Local: `npm run dev --prefix apps/web` (webpack). Never turbo at repo root with huge `raw/`.  
- Vercel: Root `apps/web`; env `OPENAI_API_KEY`; optional `OPENAI_MODEL=gpt-4.1-mini`.  
- Teaching files: committed `apps/web/content/jeff/`; run sync/`prebuild` when wiki/graph/voice change.  
- No commit unless the human asks.

## Related reading (implementers)

- `dev-wiki/accomplishments-and-decisions.md`  
- `dev-wiki/architecture.md`  
- `schema/AGENTS.md`  
- `apps/web/README.md`, `apps/web/STAKEHOLDER.md`  
- `apps/web/lib/systemPrompt.ts`, `route.ts`, `ChatShell.tsx`


---

## Full proposed module set (shipped for stakeholder cut)

**Updated:** 2026-09-08 (builder note)

v1 locked **15** modules for the first shell. The product now ships the **full proposed catalog** (39 ready packs) so stakeholder can cut later. Do not treat every card as confirmed doctrine depth.

New categories: **Earn Trust**, **Convert**.

KB-thin overlays (Generally → Jeff → steer; no invented named frameworks / offer architecture): `ip-pillars`, `first-impression-script`, `authority-relatable-mixer`, `faq-content-bank`, `learning-journey-series`, `high-ticket-caution`, and all Convert modules (`soft-cta-closer`, `trust-offer-bridge`, `dm-comment-closer`, `offer-explanation-simple`).

Success metric for this expansion: every proposed id exists in `catalog.ts` + `packs/` registry with `status: "ready"`; `/tools` grid loads them; build passes. Stakeholder cut is a later product decision.
