# Implementation agent prompts: Tools page journey UX redesign

**Audience:** builders / implementer agents (~200k context)  
**Store:** `raw/agent-handoff/` (builder only)  
**Updated:** 2026-09-18  
**Repo:** `/Users/stanley/Documents/GIthub/jgpt`  
**Do not ingest into jeff-wiki / jeff-graph.**

> **BUILDER ONLY / NOT JEFF TEACHING.**  
> Copy **one** phase at a time into a **fresh** agent chat. Do not run A+B+C as one mega prompt.

Product context (required every phase): `07-tools-journey-ux-what-we-are-doing.md`.

---

## How Stanley should use this

1. Open a fresh Cursor agent (prefer ~200k context). Working directory: `/Users/stanley/Documents/GIthub/jgpt`.
2. Paste **exactly one** phase prompt block below (Phase A, then later B, then C).
3. Require the agent to **read the listed real files** before coding. Do not invent architecture.
4. After each phase: agent stops and reports. No commit unless Stanley asks.
5. If a prior phase is incomplete, the next agent stops and lists gaps instead of improvising.

Shared hard rules for every phase:

- BUILDER ONLY / NOT JEFF TEACHING. Do not ingest into `jeff-wiki` / `jeff-graph`. Do not import `dev-wiki` into the student app.
- Preserve every module **id** and `/tools/[moduleId]` route. Do not delete packs or catalog entries.
- Chat-first module UX unchanged (no intake forms).
- Journey rail **scrolls**; it must **not** filter away other stages.
- UI chrome ZH-first + EN via existing i18n. No dash punctuation in user-facing / chrome copy.
- Match Influence Engine design system in `apps/web/app/globals.css` (warm orange `--accent`, Manrope / Noto SC). No purple/indigo AI clichés; no cream+terracotta restyle; no broadsheet IA.
- TypeScript: no `any`, no non-null assertions (`!`), no `as unknown as T`. Double-quoted strings. Prefer template strings or `.join()` over `+` concatenation for strings.
- No Turbopack at monorepo root next to huge `raw/`. Use `npm run dev --prefix apps/web` / `npm run build --prefix apps/web`.
- **Out of scope forever for these phases:** language-lock, CJK/English quote sanitizers, `sanitizeAssistantReply` / `normalizeEnglishQuotes` work, Jeff doctrine ingest, new module packs (unless a tiny id typo fix is required).
- Do not overwrite handoffs `01` to `06`. Do not rewrite home recommend flow from `05`/`06` except to avoid regressing deep links.

---

## Phase A: Journey rail + section IA + i18n chrome

**Outcome:** `/tools` has a sticky numbered journey rail and five ordered stage sections with one-line job blurbs. Rail click scrolls to the section without hiding other stages. Placeholder helpers exist for core vs practice membership (practice may still render visibly in A; collapsing is Phase B). Featured trio can stay temporarily if needed; prefer already switching featured chrome strings toward journey language without finishing start-here polish (B).

**Size note:** One coherent deliverable (structure + scroll + i18n). Do not also build the collapse UX or full copy polish.

### Prompt (copy below)

```text
You are implementing Phase A only of the Tools page journey UX redesign for Influence Engine Coach.

## Repo
Working directory: /Users/stanley/Documents/GIthub/jgpt

## Hard rules
- BUILDER ONLY / NOT JEFF TEACHING. Do NOT ingest into jeff-wiki / jeff-graph. Do NOT import dev-wiki into the student app.
- Preserve every module id and /tools/[moduleId] route. Do not delete catalog entries or packs.
- Chat-first modules unchanged. No intake forms.
- Journey rail must SCROLL to sections. Do NOT filter the page so other stages disappear (remove or stop using activeCategory filtering that hides groups).
- UI chrome ZH-first + EN via existing i18n. No dash punctuation in user-facing copy.
- Match existing Influence Engine tokens in apps/web/app/globals.css (warm orange, Manrope/Noto SC). No purple/indigo clichés; no cream+terracotta AI default restyle.
- TypeScript: no `any`, no non-null assertions (`!`), no `as unknown as T`. Double-quoted strings.
- No Turbopack at monorepo root. Do not commit unless I explicitly ask.
- Out of scope for Phase A: collapsing 「更多练习工具」 UX polish (Phase B), start-here featured strip finalization (Phase B), full copy QA (Phase C), language-lock / quote sanitizer work (separate track: leave ChatShell sanitizers alone).

## Required reading (open and read; do not invent)
1. raw/agent-handoff/07-tools-journey-ux-what-we-are-doing.md
2. jeff-wiki/frameworks/module-flow-map.md
3. apps/web/app/tools/page.tsx
4. apps/web/components/tools/ToolsPageClient.tsx
5. apps/web/components/tools/ToolsGrid.tsx
6. apps/web/lib/modules/catalog.ts
7. apps/web/lib/modules/types.ts
8. apps/web/lib/modules/moduleDisplay.ts
9. apps/web/lib/i18n/messages.ts
10. apps/web/app/globals.css (tools-* and shell-tools sections)

## Build exactly
1. Add a small helper module such as apps/web/lib/modules/toolsJourney.ts (name may vary; keep it one file) that exports:
   - Ordered stages matching MODULE_CATEGORY_ORDER (Ideation → IP Positioning → Content → Trust → Convert)
   - Stable section element ids (e.g. stage-ideation, or keep cat-${category} if you prefer continuity)
   - Core module id sets and practice module id sets exactly as listed in 07 (Convert: all convert modules are core)
   - Message keys (or string getters) for stage one-line job blurbs
   Any catalog id not listed in 07 core lists defaults to practice.
2. Rewrite ToolsGrid IA:
   - Sticky (or sticky-enough on desktop; usable on mobile) numbered journey rail: 1 选题构思, 2 IP 定位, 3 内容, 4 信任, 5 成交 (use existing cat* i18n keys + numbers).
   - Clicking a rail item smooth-scrolls to that stage section and may set active highlight only. It must NOT filter away other stages.
   - Remove the behavior where activeCategory !== "all" hides other category groups.
   - Render all five stage sections in order when not searching. Each section: title + one-line job blurb + module cards for that category.
3. While not searching, you may still show all modules in each stage (core and practice mixed) OR already split visually with practice still expanded. Collapsed disclosure is Phase B; in A at least wire membership helpers so B can collapse without redoing IA.
4. Search: when query is non-empty, keep finding modules across the full catalog (title + display title). Search results must not depend on the old category filter. Prefer showing matches grouped by stage or as a clear results list; all hits visible.
5. i18n: add ZH + EN strings for:
   - Journey rail aria label / title (replace or evolve toolsRailsTitle away from “全部分类” if needed)
   - Five stage job blurbs (short; no dash punctuation)
   - Optional toolsSubtitle update so the page reads as a journey browse, not only “按分类浏览”
   Keep ZH as the default table quality bar.
6. CSS: sticky rail, section scroll margin under any fixed header, numbered rail chips consistent with existing .tools-rail-* language. Do not invent a new brand system.
7. Keep deep links and card → router.push(`/tools/${module.id}`) behavior.
8. Do not change home recommend flow, module packs, probe, or quote sanitizers.

## Out of scope
- Collapsed 「更多练习工具」 interaction and start-here strip (Phase B)
- Final copy polish and exhaustive reachability QA (Phase C)
- Language-lock / CJK quote work
- Commits unless asked
- Doctrine / graph changes

## Done when
- npm run build --prefix apps/web passes
- /tools shows numbered journey rail + five ordered sections with blurbs
- Rail click scrolls; other stages remain on the page (no filter-away)
- toolsJourney (or equivalent) helpers encode core vs practice ids from 07
- Brief reply: files touched, how to click-test scroll locally, anything deferred to B

## Stop and report
Stop after Phase A. Do not start Phase B. List gaps if build fails.
```

---

## Phase B: Core vs practice collapse + start-here + mobile polish

**Outcome:** Core modules always visible per stage; practice modules live under a collapsed 「更多练习工具」 disclosure per stage that has practice items. Multi-card 「常用」 strip removed; default single 「从这里开始」 card/button for `ip-stage-check` (`START_MODULE_ID`). CSS/mobile polish for sticky rail and disclosures. Search still surfaces practice modules when querying.

**Size note:** One coherent deliverable (collapse UX + start-here + polish). Assumes Phase A structure exists.

### Prompt (copy below)

```text
You are implementing Phase B only of the Tools page journey UX redesign for Influence Engine Coach.

## Repo
Working directory: /Users/stanley/Documents/GIthub/jgpt

## Hard rules
- BUILDER ONLY / NOT JEFF TEACHING. Do NOT ingest into jeff-wiki / jeff-graph.
- Phase A assumed landed (journey rail + ordered sections + scroll-not-filter + toolsJourney helpers). If A is missing, STOP and list gaps; do not rebuild all of A from scratch unless trivial stubs exist.
- Do not delete modules. Practice is collapsed/hidden in default UI only.
- Rail still scrolls; never filter-away stages.
- Preserve ids/routes. Chat-first unchanged. No intake forms.
- UI chrome ZH-first + EN. No dash punctuation in user-facing copy.
- Design system: existing warm orange / Manrope / Noto SC. No purple AI clichés.
- TypeScript: no `any`, no non-null assertions, no `as unknown as T`. Double-quoted strings.
- No Turbopack at monorepo root. Do not commit unless I explicitly ask.
- Out of scope: language-lock / quote sanitizer track; full copy QA (Phase C); home flow rewrites; doctrine ingest.

## Required reading (open and read; do not invent)
1. raw/agent-handoff/07-tools-journey-ux-what-we-are-doing.md (core vs practice lists + start-here default)
2. jeff-wiki/frameworks/module-flow-map.md
3. apps/web/components/tools/ToolsGrid.tsx
4. apps/web/components/tools/ToolsPageClient.tsx
5. apps/web/lib/modules/toolsJourney.ts (or whatever Phase A named the helper)
6. apps/web/lib/modules/catalog.ts (FEATURED_MODULE_IDS, START_MODULE_ID)
7. apps/web/lib/i18n/messages.ts
8. apps/web/app/globals.css
9. apps/web/lib/modules/moduleDisplay.ts

## Build exactly
1. Per stage section:
   - Always show core module cards (from Phase A / 07 lists).
   - If the stage has practice modules, render a collapsed <details> or equivalent disclosure labeled 「更多练习工具」 (i18n key; EN e.g. “More practice tools”). Default closed.
   - Practice cards inside the disclosure use the same card component / openModule behavior.
   - Convert stage: all convert modules are core; no practice disclosure unless something unexpected lands in Convert.
2. Featured strip:
   - Remove the multi-card 「常用」 / Popular strip driven by FEATURED_MODULE_IDS trio (ig-reel-script, standpoint-builder, who-i-serve).
   - Default: single 「从这里开始」 entry opening ip-stage-check (use START_MODULE_ID). Update FEATURED_MODULE_IDS to `["ip-stage-check"]` or replace featured rendering with an explicit start-here control that does not look like a three-card curriculum.
   - Note in your reply: Stanley may later ask to remove start-here entirely; default is one start-here unless he overrides.
   - ip-stage-check remains a normal core card under Ideation as well.
3. Search behavior:
   - When query is non-empty, matching practice modules must appear in results even if disclosures are closed in the non-search view.
   - Clearing search returns to journey sections with practice collapsed again.
4. i18n: ZH + EN for start-here title, practice disclosure label, and any new aria strings. Replace toolsFeaturedTitle 「常用」 with 「从这里开始」 (or a dedicated key). No dash punctuation.
5. CSS / mobile:
   - Sticky rail usable on narrow screens (horizontal scroll of numbered chips is OK; do not require a desktop-only sidebar).
   - Disclosure easy to tap; cards remain readable; scroll-margin so sticky header/rail does not cover section titles.
   - Keep visual language continuous with existing .tools-card / .tools-rail-chip.
6. Do not break ModuleWorkspace / packs / chat openers.
7. Leave language-lock and quote sanitizer files untouched.

## Out of scope
- Exhaustive copy tone pass and full QA checklist execution beyond smoke (Phase C)
- Language-lock / CJK quote work
- New modules or doctrine
- Commits unless asked

## Done when
- npm run build --prefix apps/web passes
- Core visible; practice under collapsed 「更多练习工具」 per stage that needs it
- Multi-card 常用 gone; single 从这里开始 → /tools/ip-stage-check
- Search still finds a known practice id (e.g. hook-rewriter or bianhao-coach)
- Mobile: rail + sections usable without horizontal page breakage
- Brief reply: files touched, how to verify collapse + start-here, note that start-here is the default open decision

## Stop and report
Stop after Phase B. Do not start Phase C.
```

---

## Phase C: Copy pass + reachability QA (no language-lock)

**Outcome:** Stage blurbs and tools chrome copy feel Jeff-product clear in ZH (EN secondary), no dash punctuation. Every catalog module is reachable via search and/or core/practice UI. Light QA checklist completed in the agent reply. No language-lock or quote-sanitizer work.

**Size note:** One coherent deliverable (copy + verify + checklist). No large IA rewrites unless Phase A/B left a clear bug.

### Prompt (copy below)

```text
You are implementing Phase C only of the Tools page journey UX redesign for Influence Engine Coach.

## Repo
Working directory: /Users/stanley/Documents/GIthub/jgpt

## Hard rules
- BUILDER ONLY / NOT JEFF TEACHING. Do NOT ingest into jeff-wiki / jeff-graph.
- Phases A + B assumed landed. If journey rail, scroll-not-filter, core/practice collapse, or start-here are missing, STOP and list gaps before copy polish.
- Do not delete modules. Do not change module ids.
- No dash punctuation in student-facing or tools chrome copy.
- Do NOT touch language-lock / CJK / English-quote sanitizer workstreams (sanitizeAssistantReply, normalizeEnglishQuotes, related ChatShell reply pipelines). Those are a separate track.
- TypeScript rules unchanged. No Turbopack at monorepo root. Do not commit unless I explicitly ask.
- Prefer small copy/CSS fixes over redesign.

## Required reading (open and read; do not invent)
1. raw/agent-handoff/07-tools-journey-ux-what-we-are-doing.md
2. jeff-wiki/frameworks/module-flow-map.md
3. apps/web/components/tools/ToolsGrid.tsx
4. apps/web/lib/modules/toolsJourney.ts (or Phase A helper path)
5. apps/web/lib/modules/catalog.ts
6. apps/web/lib/i18n/messages.ts
7. apps/web/app/globals.css (only if a QA bug needs a tiny fix)
8. apps/web/lib/modules/moduleDisplay.ts
9. apps/web/lib/modules/catalogZh.ts (if present; for display title coverage awareness only)

## Build exactly
1. Copy pass (ZH primary, EN secondary) for tools journey chrome only:
   - toolsTitle / toolsSubtitle
   - Journey rail labels (keep category meaning; numbering OK)
   - Five stage one-line job blurbs (clear job per stage; no dash punctuation; no curriculum lecture walls)
   - 「从这里开始」 and 「更多练习工具」 strings
   - Empty/search strings if they still talk about old IA incorrectly
2. Verify membership completeness in code:
   - Every MODULE_CATALOG id appears in exactly one of: core set for its category, or practice set (default practice if unknown).
   - No silent drops: count core+practice per category equals catalog filter for that category.
   - Optionally add a tiny dev-only assert or unit-free runtime check comment; prefer a simple exported function used in ToolsGrid that does not crash production if mismatch, but log or surface in your report if counts diverge.
3. Reachability:
   - Confirm search matches title/display for at least one core and one practice module per a quick manual or scripted check.
   - Confirm start-here navigates to /tools/ip-stage-check.
   - Confirm a practice module inside a disclosure still opens /tools/[id].
4. Light visual QA fixes only if broken: sticky overlap, missing scroll-margin, disclosure unusable on mobile. No brand redesign.
5. Append a short builder note to dev-wiki/log.md that Tools journey UX Phases A to C landed (builder log only; not jeff teaching ingest). Do not write jeff-wiki/log.md for this.
6. Leave home recommend, packs, probe, sources chip, and quote sanitizers alone unless a tools deep link regression is proven.

## Out of scope
- Language-lock / quote normalization
- New frameworks, graph nodes, module packs
- Rewriting Artemo home flow
- Commits unless asked

## Done when
- npm run build --prefix apps/web passes
- Copy checklist: no dash punctuation in new/changed tools chrome strings; ZH reads journey-clear
- Membership: every catalog id accounted for in core or practice helpers
- QA checklist in your reply (mark pass/fail):
  - [ ] Rail scrolls to each of 5 stages; others stay visible
  - [ ] Core cards visible without opening disclosure
  - [ ] Practice hidden until 「更多练习工具」 opened (non-search view)
  - [ ] Search finds a practice module while disclosures stay irrelevant to results
  - [ ] 从这里开始 → ip-stage-check
  - [ ] Sample core and practice deep links open chat-first tool pages
  - [ ] Mobile rail + sections usable
  - [ ] Language-lock files untouched
- Brief reply: files touched, any open product questions (e.g. remove start-here entirely), how Stanley should click-test

## Stop and report
Stop after Phase C. Do not expand into other workstreams.
```

---

## Phase order summary

| Phase | Fresh chat? | Delivers |
| --- | --- | --- |
| A | Yes | Sticky numbered rail, ordered sections + blurbs, scroll-not-filter, core/practice helper data |
| B | Yes | Collapse practice, single 从这里开始, mobile/CSS polish |
| C | Yes | Copy pass, membership/reachability verify, light QA checklist |

If context pressure appears mid-phase on a 200k model: finish the phase’s **Done when** items only; put extras in the stop report for the next fresh chat. Do not silently start the next phase in the same chat.
