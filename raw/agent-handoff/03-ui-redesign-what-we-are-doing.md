# What we are doing: Influence Engine Coach UI/UX redesign

**Audience:** builders / implementer agents 
**Store:** `raw/agent-handoff/` (builder only) 
**Updated:** 2026-09-08 
**Do not ingest into jeff-graph.**

> **BUILDER ONLY / NOT JEFF TEACHING.** 
> This brief is product chrome and UX for `apps/web`. It is not doctrine, not student curriculum, and must never be copied into `jeff-wiki` / `jeff-graph`.

Read this before any implementation prompt in `04-ui-redesign-agent-prompts.md`. 
Module product work already has its own briefs: `01-what-we-are-doing.md` and `02-implementation-agent-prompts.md` (keep those; do not overwrite).

Proposal board (compare tokens / IA / phases): 
`/Users/stanley/.cursor/projects/Users-stanley-Documents-GIthub-jgpt/canvases/jeff-ip-brand-redesign.canvas.tsx`

---

## One-line goal

Redesign the existing **Jeff IP test** Next app (`apps/web`) as **Influence Engine Coach**: wear Jeff 梁明耀 educator / Influence Engine / Brand Warriors brand, Chinese-first UI chrome with multilingual support, stage-first Tools, chat-first modules kept. Do **not** rebuild probe, doctrine, or module packs.

## Why (product)

Stakeholders already have grounded Ask Jeff chat plus ~39 named IP tools. The product still looks like a utility lab (cream + forest green + “Jeff IP test” hero disclaimer), not Jeff’s public IP coach brand. Public Influence Engine surfaces lead with warm orange, paper cream, dark cinematic moments, and ZH-led copy. The redesign closes that gap without turning the coach into a webinar funnel.

## Locked decisions (Stanley, 2026-09-08)

| Decision | Lock |
| --- | --- |
| Product name | **Influence Engine Coach** (not “Jeff IP test” in visible chrome) |
| Logo / photo rights | **YES**: Influence Engine, Brand Warriors, webinar, workshop brand assets may be used |
| Language | UI chrome **main = Chinese**; support **multilingual** (EN + ZH at minimum). Match user language where product copy appears. Chat **replies** still follow existing Jeff voice / language-match rules |
| Identity | Educator Jeff 梁明耀 (Influence Engine / Brand Warriors). **Not** JLPW / BR Law lawyer chrome (梁柏林 scrapes in `raw/jeff/public` are contrast only) |
| Sales CTA inside coach | Soft footer / empty-state link only → `https://webinar.influenceengine.co/opt-in`. No countdown, scarcity, or form capture inside the coach |

## Brand identity summary

### Educator vs lawyer split

| Wear this | Do not wear this |
| --- | --- |
| Influence Engine / Brand Warriors / webinar energy | JLPW firm navy, Legal500 lawyer pages |
| Orange urgency CTAs, warm paper, occasional dark brand band | Forest-green utility theme (current `apps/web`) |
| Founder / workshop / stage photography (sparingly) | Abstract SaaS illustration, purple AI gradients |
| Ladder language: see → trust → convert; Personal IP as market position | Book “war gore” / blood-red as daily chrome |

### Palette (from webinar opt-in extract)

| Token | Hex | Role |
| --- | --- | --- |
| Primary / CTA | `#F36B21` | Send, Start, active nav, primary buttons |
| Primary light | `#FF8A3D` | Hover / highlight |
| Paper | `#FFF8F2` / `#FFF1E7` | Body / section fills |
| Ink | `#17120F` | Body text |
| Muted | `#70665F` | Secondary copy, captions |
| Stone | `#EADFD7` / `#D2CBBB` | Soft dividers, subtle surfaces |
| Gold | `#A78340` | Authority accent sparingly (e.g. sources hit state) |
| Hero dark | `#080808` / `#0B0B0B` | Brand bar or rare first-open band + soft orange glow |

### Type

- Headlines: **Manrope**
- Body (ZH-first): **Noto Sans SC**
- Inter / system only as fallback for mixed EN labels or offline font failure
- Do not keep IBM Plex as the primary face

### Imagery

- Rare brand moments: Jeff on stage, Brand Warriors workshop collage, Attention War energy
- Not wallpaper behind every chat turn
- Daily UI: funnel orange + paper; dark Brand Warriors moments only for first-open or hero strip

## What to keep from current product

Do **not** rebuild these. Restyle and rename around them.

| Keep | Why |
| --- | --- |
| Ask Jeff free chat at `/` | Returning users; probe + sources |
| Tools at `/tools` + `/tools/[moduleId]` | Named jobs beat one blank bot |
| Chat-first modules (intro optional → opener → gather in chat) | Intake form already removed from primary path |
| Sources chip + Sources used panel | Stakeholder trust |
| Closed doctrine + fresh probe + dash strip | Alignment rules |
| Category ladder mirroring Jeff stages | Already see → trust → convert flavored |
| `POST /api/chat` with optional `moduleId` | Shared stack |
| Module packs / overlays under `apps/web/lib/modules/` | Product UX, not doctrine |

Runtime (unchanged conceptually):

```text
ChatShell / ModuleChatShell → POST /api/chat → probe → systemPrompt (+ module overlay) → OpenAI → reply + sources
```

## UX information architecture

### Primary nav

**Ask Jeff · Tools · (optional) Start here**

| Route | Job |
| --- | --- |
| `/` | Free coach chat (default for returning users) |
| Start path | Empty-state or `/start` (or deep-link) → **IP Stage Check** as onboarding |
| `/tools` | Curated wall: stage guide + featured starters + category rails |
| `/tools/[moduleId]` | Short intro skim → module chat |

Sources stay a capability (chip / panel), not a third top-level nav item.

### Tools wall (not 39 equal Artemo cards)

1. Stage hero strip: “Where are you stuck?” → push **IP Stage Check**
2. Feature **3** starters (proposal defaults: IG Reel Script, Standpoint Builder, Who I Serve; adjust only if product copy clearly prefers otherwise)
3. Group by Jeff ladder rails (map existing catalog categories; do not invent new doctrine categories):
   - Foundation (~ IP Foundation)
   - Get Seen
   - Earn Trust
   - Content / On-Camera as needed
   - Convert
   - Polish
4. Ask Jeff empty state: **1** stage question + **2** tool jumps, not the whole catalog
5. Search stays secondary to stage browsing

### Soft webinar footer

One quiet line, e.g. “线上学完整系统” / “Learn the system live” → webinar URL. Never countdown, scarcity, or WhatsApp form inside the coach.

## Visual direction + anti-patterns

### Do

- Orange `#F36B21` for CTA / send / active nav underline
- Ink on paper; optional dark brand bar with soft orange glow
- Manrope + Noto Sans SC
- Warm paper grain or dark band atmosphere (subtle)
- Motion later (Phase U3): send pulse, opener entrance, stage rail snap on mobile
- Cards on Tools only because they are the interaction target

### Do not

- Purple / indigo AI gradients
- Forest-green lab theme (current accent)
- Lawyer navy / Legal500 chrome
- Dark Artemo-style equal card dump without Jeff face/voice
- Serif + terracotta “premium coach” cliché as the whole system
- Broadsheet dense newspaper layout
- Countdown / scarcity / hard sell in coach chrome

## Multilingual approach

| Layer | Rule |
| --- | --- |
| UI chrome (nav, buttons, empty state, tools labels, errors, footer) | **Chinese default**; EN strings available (toggle and/or locale detection) |
| Module titles / short intro | Prefer ZH for chrome; keep recognizable EN tool names where already branded (e.g. IG Reel Script) or provide bilingual labels |
| Chat model replies | Existing Jeff language-match rules (ask language → reply language). Do not force ZH replies when the user writes EN |
| Stakeholder docs | Update `STAKEHOLDER.md` / `README.md` for Influence Engine Coach; can stay EN for builders/testers unless asked otherwise |

Implement a small i18n skeleton under `apps/web` (e.g. `lib/i18n/` or `messages/zh.json` + `messages/en.json`). Do not boil the ocean with a full CMS.

## Asset plan

### Suggested paths (binaries under the web app only)

```text
apps/web/public/brand/
  influence-engine-mark.svg|png
  brand-warriors-mark.svg|png
  jeff-educator-portrait.jpg   # optional, rare use
  workshop-hero.jpg            # optional dark-band moment
apps/web/public/brand/README.md  # attribution + source URLs; no doctrine
```

### Rules

- Download from webinar CDN / approved Influence Engine surfaces when needed; note source URL and date in `public/brand/README.md`
- **Do not** put brand binaries into `jeff-wiki`, `jeff-graph`, or teaching ingest paths
- Prefer SVG/PNG marks for nav; keep photo files reasonably sized
- If a mark file is missing in Phase U1, ship a **text wordmark** “Influence Engine Coach” first; swap marks when assets land

## Phased delivery (see `04` for copy-paste prompts)

| Phase | Outcome |
| --- | --- |
| **U1** | Brand shell: tokens, fonts, rename, ZH chrome foundation, soft webinar link, i18n skeleton |
| **U2** | Stage-first Tools + module chrome restyle + Start → IP Stage Check |
| **U3** | Motion, mobile polish, student empty/error copy, stakeholder docs, optional first-visit dark moment, verify locale |

## Success criteria

- First open reads as **Influence Engine Coach**, not “Jeff IP test lab”
- Orange + paper + Manrope/Noto Sans SC; forest green gone from primary chrome
- Nav / empty state / tools wall primarily Chinese, with EN available
- Tools feel stage-first (featured + rails), not 39 equal cards
- Modules remain chat-first; sources still work
- Soft webinar link only; no scarcity UI
- Probe / doctrine / module pack logic unchanged except unavoidable chrome strings
- `npm run build --prefix apps/web` passes
- No Turbopack at monorepo root; no ingest into jeff teaching

## Related files (start here; do not dump entire CSS into agent prompts)

| Area | Paths |
| --- | --- |
| Shell / tokens | `apps/web/app/globals.css`, `apps/web/app/layout.tsx`, `apps/web/app/page.tsx` |
| Nav / chat | `apps/web/components/AppNav.tsx`, `apps/web/components/ChatShell.tsx`, `apps/web/components/AssistantMessage.tsx`, `apps/web/components/MessageSourcesChip.tsx` |
| Tools | `apps/web/components/tools/ToolsGrid.tsx`, `ModuleIntroModal.tsx`, `ModuleWorkspace.tsx`, `ModuleChatShell.tsx`, `apps/web/app/tools/page.tsx`, `apps/web/app/tools/[moduleId]/page.tsx` |
| Catalog | `apps/web/lib/modules/catalog.ts`, `types.ts`, `packs/` |
| Dead path (clean carefully) | `apps/web/components/tools/ModuleIntakeForm.tsx` + any intake-only CSS still on the primary stylesheet path |
| Docs | `apps/web/STAKEHOLDER.md`, `apps/web/README.md` |
| Eng SoT | `dev-wiki/accomplishments-and-decisions.md`, `dev-wiki/log.md` |
| Proposal canvas | path above under `.cursor/.../canvases/` |

## Explicit non-goals

- Not teaching doctrine; no new Jeff frameworks in the graph
- Not ingesting this handoff or UI copy into `jeff-wiki` / `jeff-graph`
- Not cloning the full webinar funnel (forms, countdown, scarcity)
- Not rebuilding Artemo’s ad/email catalog
- Not implementing new module packs in U1 to U3 (unless a string rename only)
- Not committing unless the operator asks

## Operator note

Module handoffs (`01`, `02`) describe the **tools product**. This redesign (`03`, `04`) describes **brand + chrome**. Prefer `dev-wiki/` as engineering SoT for what shipped; prefer these raw briefs for agent paste prompts.
