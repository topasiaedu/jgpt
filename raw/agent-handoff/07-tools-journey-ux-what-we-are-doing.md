# What we are doing: Tools page journey UX redesign

**Audience:** builders / implementer agents  
**Store:** `raw/agent-handoff/` (builder only)  
**Updated:** 2026-09-18  
**Repo:** `/Users/stanley/Documents/GIthub/jgpt`  
**Do not ingest into jeff-wiki / jeff-graph.**

> **BUILDER ONLY / NOT JEFF TEACHING.**  
> This brief locks the **All Tools (`/tools`) information architecture** for Influence Engine Coach. It is not doctrine, not student curriculum, and must never be copied into `jeff-wiki` / `jeff-graph`.

Read this before any implementation prompt in `08-tools-journey-ux-agent-prompts.md`.

Related briefs (keep intact; do not overwrite):

| File | Role vs this brief |
| --- | --- |
| `01` / `02` | Module packs + catalog product; still valid |
| `03` / `04` | Brand shell, ZH chrome, tokens; keep |
| `05` / `06` | Home recommend → tool chat; **home flow still locked**. This brief **supersedes F2’s “card wall only / no journey framing”** for `/tools` only: journey rail returns as **scroll-to-section**, not as a filter that hides other stages |

---

## One-line goal

Redesign `/tools` so the wall reads as Jeff’s product journey (**选题构思 → IP 定位 → 内容 → 信任 → 成交**): sticky numbered rail scrolls to stage sections; core modules stay visible; practice/polish sits under collapsed 「更多练习工具」; optional single 「从这里开始」 points at `ip-stage-check`. Preserve every module id/route and chat-first UX.

---

## Why now

Catalog and packs already align with the offline workshop ingest (framework pages + graph nodes + module packs such as `content-asset-stack`, `comment-reply-three-lines`, positioning map, etc.). The missing product layer is **browse IA**: the wall still feels like a flat category list (plus a multi-card 「常用」 strip), not a teachable path. Stanley approved planning first; this handoff is for implementation agents.

---

## Locked product direction (Stanley, planning)

```text
/tools
  Sticky journey rail: numbered stages 1 to 5
  Click = smooth scroll to that section (do NOT filter away other stages)

  Page body: ordered stage sections in ladder order
  Each section: stage title + one-line job blurb + core module cards

  Under each stage (or under Content/Trust/IP as needed):
    Collapsed disclosure 「更多练习工具」 for practice/polish modules

  Featured strip:
    Remove multi-card 「常用」 / Popular
    Default replacement: single 「从这里开始」 → ip-stage-check
    (OPEN if Stanley overrides later; implementers default to one start-here)

  Search: still finds ALL modules (core + practice), even when practice is collapsed

  Module open: still /tools/[moduleId], chat-first (no intake forms)
```

### Explicitly wrong

| Wrong | Right |
| --- | --- |
| Clicking a stage **filters** so other stages disappear | Click scrolls; all stages remain on the page |
| Deleting practice modules from catalog/packs | Keep ids; collapse/hide in UI only |
| Multi-card 「常用」 curriculum strip as primary | One 「从这里开始」 (`ip-stage-check`) or none if Stanley says remove entirely |
| Purple / cream AI-cliché restyle | Keep Influence Engine warm orange + existing fonts |
| Expanding into language-lock / CJK-quote sanitizer work | Separate workstream; out of scope for 07/08 |

---

## Journey stages (product labels)

Use existing `MODULE_CATEGORY_ORDER` and i18n category keys. ZH chrome is primary.

| # | Catalog category | ZH chrome (existing keys) | Job blurb intent (write final copy in Phase C; placeholders OK in A) |
| --- | --- | --- | --- |
| 1 | Ideation | 选题构思 (`catIdeation`) | Diagnose stuckness and generate filmable ideas |
| 2 | IP Positioning | IP 定位 (`catIpPositioning`) | Who you serve, standpoint, pillars |
| 3 | Content | 内容 (`catContent`) | Assets, hooks, banks, flagship Reel |
| 4 | Trust | 信任 (`catTrust`) | Memory hooks, comments, longer trust scripts |
| 5 | Convert | 成交 (`catConvert`) | Soft invites and offer clarity after trust |

**Source of truth for stage ↔ module mapping:**  
`jeff-wiki/frameworks/module-flow-map.md`  
(runtime mirror may also exist under `apps/web/content/jeff/jeff-wiki/frameworks/module-flow-map.md`; prefer repo root wiki when they diverge, then align).

Catalog still owns ids, titles, descriptions, categories: `apps/web/lib/modules/catalog.ts`.

---

## Core vs practice (approved split for UI)

**Do not delete** any of these. Practice = collapsed under 「更多练习工具」 (or equivalent i18n). Core = always visible in the stage section.

### Core (always visible)

**Ideation**

- `ip-stage-check`
- `content-ideation-ip`
- `direction-fixer`

**IP Positioning**

- `who-i-serve`
- `standpoint-builder`
- `ip-pillars`

**Content**

- `content-asset-planner`
- `content-asset-stack`
- `scroll-stop-hook`
- `faq-content-bank`
- `ig-reel-script`

**Trust**

- `soundbite-one-liner`
- `comment-reply-three-lines`
- `criticism-armor`
- `comment-to-content`
- `long-video-trust-script`
- `story-trust-script`

**Convert (all convert modules are core)**

- `value-convert-ladder`
- `soft-cta-closer`
- `trust-offer-bridge`
- `dm-comment-closer`
- `offer-explanation-simple`

### Practice (collapse under 「更多练习工具」)

**Content polish / reels / rewriters / adapters**

- `value-teaching-reel`
- `hot-take-script`
- `process-proof-reel`
- `first-impression-script`
- `short-vs-long-planner`
- `ad-vs-asset-checker`
- `advice-vs-ego-coach`
- `script-humanizer`
- `revision-sharpen`
- `hook-rewriter`
- `platform-adapter`
- `bullet-caption-pack`

**Trust practice**

- `bianhao-coach`
- `high-ticket-caution`
- `dont-outsource-judgment`
- `authority-relatable-mixer`
- `learning-journey-series`

**Optional IP practice**

- `boss-brand-brief`
- `lean-ip-setup`

If a catalog module is not listed above, treat it as **practice** until Stanley says otherwise (still reachable via search and the collapsed region). Prefer extending the helper lists in code over silently dropping cards.

---

## Featured / start-here (open item + default)

| Decision | Status |
| --- | --- |
| Remove multi-card 「常用」 (`FEATURED_MODULE_IDS`: currently `ig-reel-script`, `standpoint-builder`, `who-i-serve`) | Locked: remove that strip as “popular trio” |
| Replace with single 「从这里开始」 → `ip-stage-check` | **Default for implementers** (`START_MODULE_ID` already exists in catalog). Note as **open** if Stanley later wants zero start-here strip |
| Keep IP Stage Check as a normal Ideation core card as well | Yes |

---

## Architecture / files to read (not invent)

| Area | Paths |
| --- | --- |
| Tools page shell | `apps/web/app/tools/page.tsx`, `apps/web/components/tools/ToolsPageClient.tsx` |
| Wall UX | `apps/web/components/tools/ToolsGrid.tsx` (search, rail chips, featured, category sections) |
| Catalog | `apps/web/lib/modules/catalog.ts`, `apps/web/lib/modules/types.ts`, `apps/web/lib/modules/moduleDisplay.ts` |
| i18n | `apps/web/lib/i18n/messages.ts`, `LocaleProvider` |
| Design tokens / tools CSS | `apps/web/app/globals.css` (`.shell-tools`, `.tools-*`, `--accent` `#f36b21`, Manrope / Noto SC) |
| Stage mapping SoT | `jeff-wiki/frameworks/module-flow-map.md` |
| Module chat (do not break) | `apps/web/components/tools/ModuleWorkspace.tsx`, `ModuleChatShell.tsx`, packs under `apps/web/lib/modules/packs/` |

Suggested implementation shape (agents may refine, but stay small):

- Add a single helper module (e.g. `apps/web/lib/modules/toolsJourney.ts`) exporting ordered stages, core id sets, practice id sets, and stage job-blurb message keys.
- `ToolsGrid` uses helpers for section membership; rail clicks only `scrollIntoView` (and may set an “active stage” highlight via IntersectionObserver or click state) **without** filtering `visibleGroups` to one category.
- When searching, show flat or grouped matches for **all** modules; collapsing practice is less important while `query` is non-empty (all hits visible).

---

## Brand / chrome rules (unchanged)

- Product: **Influence Engine Coach**
- UI chrome **ZH-first**; EN via existing i18n
- Warm orange accent (`--accent: #f36b21`), paper/warm backgrounds already in `globals.css`
- Fonts: Manrope headlines, Noto Sans SC body (existing CSS variables)
- **No** purple-on-white / indigo gradient clichés; **no** warm-cream + terracotta “AI default” restyle; **no** broadsheet newspaper IA
- **No dash punctuation** in student-facing / UI chrome copy (em dash, en dash, or hyphen used as a sentence dash). Hyphens inside ids/paths/URLs are fine
- Cards on `/tools` are interaction containers (open a module); keep them coherent with existing `.tools-card` language rather than inventing a new visual system

---

## Out of scope (separate tracks)

| Track | Rule |
| --- | --- |
| Language lock / CJK quote sanitizer / English-quote normalization | **Do not expand** into this work. May already be in progress elsewhere (`sanitizeAssistantReply`, `normalizeEnglishQuotes`, ChatShell). Mention only as “leave alone” |
| New Jeff doctrine pages or graph ingest | Forbidden from these handoffs |
| Deleting or renaming module **ids** | Forbidden (titles/blurbs via i18n/display OK) |
| Home recommend flow (`05`/`06`) | Do not regress; this brief is `/tools` IA |
| Probe / sources chip / API chat architecture | Unchanged |
| Commits / PRs | Only if Stanley asks |

---

## Success criteria (product)

1. `/tools` shows numbered sticky journey rail; each item scrolls to its stage section; other stages stay on the page.
2. Five ordered sections with one-line job blurbs; core cards visible; practice under collapsed 「更多练习工具」.
3. Multi-card 「常用」 gone; default single 「从这里开始」 → `/tools/ip-stage-check` (unless Stanley overrides to remove).
4. Search still reaches practice modules.
5. Every existing catalog module remains openable at `/tools/[id]` with chat-first UX.
6. Visual system matches current Influence Engine Coach tokens; ZH chrome primary; no dash punctuation in new copy.
7. Build passes: `npm run build --prefix apps/web`.

---

## How Stanley uses the next file

Open `08-tools-journey-ux-agent-prompts.md`. Paste **one** phase (A, then B, then C) into a **fresh** Cursor agent chat on a ~200k context model. Do not combine phases.
