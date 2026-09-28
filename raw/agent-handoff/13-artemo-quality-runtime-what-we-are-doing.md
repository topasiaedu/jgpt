# What we are doing: Artemo-level quality runtime (platform + family migration)

**Audience:** builders / implementer agents  
**Store:** `raw/agent-handoff/` (builder only)  
**Updated:** 2026-09-29  
**Repo:** `/Users/stanley/Documents/GIthub/jgpt`  
**Do not ingest into jeff-wiki / jeff-graph.**

> **BUILDER ONLY / NOT JEFF TEACHING.**  
> This brief locks a **Quality Runtime + family deliverable contracts** initiative for Influence Engine Coach (~55 tools). It is not doctrine, not student curriculum, and must never be copied into `jeff-wiki` / `jeff-graph`.

Read this before any implementation prompt in `14-artemo-quality-runtime-agent-prompts.md`.

Related briefs (do not overwrite; this brief does **not** reopen Hook Studio chrome or reply/recommend work):

| File | Role vs this brief |
| --- | --- |
| `11` / `12` | Hook Studio on Hook Formula (Maria-shaped UX). **Keep.** Studio chrome stays; this brief upgrades quality **runtime** and family templates, including chat path for Hook/Line. |
| `09` / `10` | Reply brevity, home recommend under input, opener bullets. **Keep.** Out of scope here except where openers must fit family templates. |
| `01` / `02` | Module packs + catalog. Pack ids stay. Overlays migrate onto family templates; do not invent dozens of new modules. |

Engineering SoT for past decisions: `dev-wiki/accomplishments-and-decisions.md` and dated session pages. Prefer those over chat history when they conflict with memory.

---

## One-line goal

Ship **Artemo-level quality** across ~55 tools by building an enforceable **Quality Runtime** (Collect → Confirm → Deliver → Refine) plus **family deliverable contracts**, then migrating packs onto those templates: no overlay-only bandaids, and no turning every tool into an IG script writer.

---

## Why now

Stanley compared Artemo-level coaching quality to Influence Engine Coach on a real Type-1 diabetes / Jeff niche transcript flow (IG Reel / OPENS path). The gap is not “missing nice wording.” Tools ask softly, then dump thin or framework-heavy replies; density and gatekeeping are not enforced in code.

A prior agent direction that only pasted soft “ask better / be denser” into ~55 pack overlays was **cancelled**. That path cannot produce Artemo feel: soft text with no lifecycle, no typed critical slots, no mode budgets, and no golden evals.

What we need instead:

1. **Platform spine (code)** that every migrated pack rides.
2. **Per-family / per-pack overlay rewrites** that fit family templates (structured migration).
3. A flagship win Stanley can feel on `ig-reel-script` before rolling the rest.

---

## Locked product direction (Stanley, 2026-09-29)

```text
1) Both layers required
   Quality Runtime (code) AND per-pack overlay/opener rewrites that FIT family templates.
   Neither layer alone is enough.

2) Explicitly wrong (bandaid)
   Soft "ask better / be denser" pasted into 55 overlays with no enforcement.
   OR shared rules only with no per-family deliverable contracts.
   Cancel any agent that only does one of those.

3) Lifecycle (hard)
   Collect → Confirm → Deliver → Refine.
   Hard intake gate on critical slots.
   Confirm before dense deliver.
   Refine after deliver without restarting the whole interrogation.

4) Portable Artemo principles (shape only; no proprietary Maria/Artemo prompt copy)
   - Hard intake gate
   - Confirm before dense deliver
   - Job-shaped density (deliverable matches the tool job)
   - Named levers the student can pull next
   - Two-mode speech (clarifying short / deliverable dense)
   - Assumption honesty
   - User facts own the niche; Jeff owns the craft
   - Variance from answers (different inputs → different outputs)

5) Script duration lock
   Script / Spoken family defaults to ~60s and above.
   Fix ig-reel-script contradiction: catalog title OPENS 60秒五幕剧 vs openers saying 15–45s.
   Target: ~60s+ dense OPENS deliverable; update EN + ZH catalog + openers + overlays together.

6) Chat-first remains
   No global intake forms. Critical slots are typed and enforced in conversation.
   I-don't-know / weak answers get option prompts, not silent skip.

7) Migration is flagged
   Unmigrated packs can keep legacy behavior behind a qualityRuntime (or equivalent) flag until migrated.
   Do not big-bang rewrite all 55 overlays in one agent turn.

8) Do not turn non-script tools into IG script writers
   Diagnosis stays diagnosis. Positioning stays positioning. Mindset stays guardrail.
   Family taxonomy below is quality taxonomy, not catalog stage labels.
```

### Explicitly wrong

| Wrong | Right |
| --- | --- |
| Paste soft “ask denser” into 55 overlays | Quality Runtime + family contracts + migrated overlays |
| Shared rules only; no per-pack/family deliverable shape | Family templates + overlay checklist per pack |
| Turn every tool into an IG Reel script writer | Job-shaped density per family |
| Soft `IntakeField` checklist with no gate | Typed critical slots + Collect gate before Deliver |
| Always max ~3 short paragraphs (home free-chat budget) on dense deliverables | Two-mode reply budgets: clarifying short / deliverable dense |
| `responseQa` only “ask-match” length polish | Golden evals for lifecycle + family deliverable shape |
| One agent ships platform + all 55 packs | Q0 spine, then Q1 flagship, then family waves Q2–Q5 |
| Copy Maria / Artemo proprietary Worker prompts | Portable principles + Jeff doctrine brain |
| Viral-guarantee / overnight-fame chrome | Jeff bans stay |
| Reopen Hook Studio H1–H3 chrome redesign | Keep Studio; align Hook chat path with quality runtime lessons |

---

## Current architecture failure modes

These are real paths today. Agents must fix the spine, not paper over them in prose.

| Failure | Where | What goes wrong |
| --- | --- | --- |
| Soft-only slots | `apps/web/lib/modules/types.ts` → `IntakeField` | Label + `required?: boolean` only. No typed criticality, no IDK policy, no confirm step, no deliverable schema. |
| Soft checklist injection | `apps/web/lib/modules/modulePrompt.ts` → `formatSlotChecklist` / `buildSharedModuleRules` | Slots become bullet advice. “When enough is known… just write it” is soft. No hard Collect → Confirm gate. |
| Home brevity leaks into tools | `apps/web/lib/systemPrompt.ts` | Free-chat style “Max ~3 short paragraphs…” fights dense script / map deliverables when not mode-aware. |
| QA is ask-match only | `apps/web/lib/responseQa.ts` + `apps/web/app/api/chat/route.ts` | Post-hoc judge checks whether the reply matches the ask (length / missing deliverable). Does not enforce family contracts, confirm-before-deliver, or golden transcript flows. |
| Pack soft escape hatches | Many packs under `apps/web/lib/modules/packs/*.ts` | Overlay lines like “When enough is known, or the user says just write it, deliver…” without enforced critical slots or confirm. |
| Duration contradiction | `ig-reel-script` pack + `catalog.ts` / `catalogZh.ts` | Title/bound node: OPENS 60s five-act; openers/starter still say 15–45 seconds. |

Key files today (platform + packs):

- `apps/web/lib/modules/types.ts`
- `apps/web/lib/modules/modulePrompt.ts`
- `apps/web/lib/systemPrompt.ts`
- `apps/web/lib/responseQa.ts`
- `apps/web/app/api/chat/route.ts`
- `apps/web/lib/modules/packs/*.ts` (~55 packs)
- `apps/web/lib/modules/catalog.ts` / `catalogZh.ts`
- `apps/web/lib/modules/packChatOpenersZh.ts` / `packLocale.ts`
- Hook Studio (orthogonal chrome): `apps/web/components/tools/HookStudio*.tsx`, `apps/web/lib/hookStudio/*`

---

## Platform architecture sketch

Both columns are required. Code enforces lifecycle and budgets. Prompts/overlays define job-shaped content inside that spine.

| Layer | Code (Quality Runtime) | Prompt / pack (family templates) |
| --- | --- | --- |
| Lifecycle | Detect / inject Collect → Confirm → Deliver → Refine mode into module chat | Overlay text must respect current mode; no dense dump in Collect |
| Critical slots | Typed slots (critical vs optional); missing critical → stay in Collect | Slot labels, probe hints, IDK option prompts per pack |
| I-don't-know | Option-engine stub: offer concrete choices or micro-examples when user blank | Family-safe options (do not invent niche facts) |
| Reply budgets | Clarifying: short. Deliverable: dense, job-shaped token/paragraph budget | Deliverable section order and named levers |
| Family contract | Types + registry stub: expected deliverable shape per family | Pack overlay implements that shape for this moduleId |
| Migration flag | `qualityRuntime` (or equivalent) on pack / route path; legacy until migrated | Migrated packs opt in; unmigrated keep legacy |
| Eval | Golden transcript fixtures + smoke scripts | Flagship flows (diabetes-style for Script) asserted |

Lifecycle sketch:

```text
Collect  → ask 1–2 critical gaps (bullets if two); IDK → options
Confirm  → mirror what you will deliver; name assumptions; get go-ahead
Deliver  → dense, family-shaped output + named levers
Refine   → tweak levers without re-asking filled critical slots
```

---

## Tool families (quality taxonomy)

Not the same as catalog stage (`Ideation` / `IP Positioning` / …). Assign packs to **quality families** for contracts and migration waves.

| Family | Artemo-quality means | Critical slots (examples) | Deliverable shape |
| --- | --- | --- | --- |
| **Diagnosis** | Clear stage/read + next move; not a script | Evidence of current state, goal, constraint | Diagnostic brief + ranked next actions |
| **Positioning / Map** | Sharp who/why/standpoint map; user owns niche facts | Who they serve, proof, offer angle, anti-audience | Structured map / four-question answers / one-liner stance |
| **Ideation / Bank** | Volume with filters; usable bank, not essay | Niche, pillar or theme, constraints | Numbered bank with tags / reuse notes |
| **Script / Spoken (60s+)** | Shootable spoken script at ~60s+; OPENS or family beats | Niche, audience, lesson/story beat, tone, soft close | Full timed beats + optional on-screen text + Step |
| **Hook / Line** | Scroll-stop opens; legs annotated; not full Reel | Audience, pain, contrast/result, curiosity (or rewrite source) | Multiple lines + why + legs / rewrite note |
| **Rewrite / Adapter** | Stronger version of **their** draft; preserve intent | Pasted source, goal of rewrite, constraints | Before→after or adapted cut with notes |
| **Reply / Micro-convert** | Short reply paths that invite next step | Channel, comment/DM text, offer boundary | 2–3 line options + soft CTA |
| **Planner / Ladder** | Sequence plan; not one script | Goal horizon, assets on hand, constraint | Ladder / week plan / stack with checkpoints |
| **Mindset / Guardrail** | Guardrail coaching; refuse fame hacks | Trigger situation, current impulse | Reframe + do/don't + one practice |

Script family packs (Q1–Q2 targets; confirm against catalog when implementing):

- Flagship: `ig-reel-script`
- Rest: `value-teaching-reel`, `hot-take-script`, `process-proof-reel`, `first-impression-script`, `goat-four-beats`, `story-trust-script`, `long-video-trust-script`
- Related adapters (usually **Rewrite / Adapter**, not Script): `script-humanizer`, `platform-adapter`, `revision-sharpen` (do not force 60s OPENS onto these)

---

## Per-tool tweaking is required (and how it stays non-chaos)

Artemo quality is not one mega-prompt. Each pack still needs overlay + opener fit.

**Non-chaos rules:**

1. **Family template first.** New pack work fills a family checklist; it does not invent a private lifecycle.
2. **Overlay checklist (every migrated pack):**
   - Declares `qualityFamily`
   - Lists critical vs optional slots (typed)
   - Confirm blurb (what dense deliver will contain)
   - Deliverable section order matching family contract
   - Named levers for Refine
   - IDK option prompts for each critical slot (or shared family options)
   - Duration / length rules where relevant (Script: ~60s+)
   - Jeff bans: no overnight-fame, no virality guarantee
3. **Openers** state the job + first critical ask; no framework lecture; EN + ZH.
4. **Flag.** Pack opts into `qualityRuntime`; legacy packs unchanged until migrated.
5. **Evals.** Flagships get golden transcripts; family waves add at least one smoke per flagship.

---

## Phases (sizing for ~200k context agents)

| Phase | Outcome | Size intent |
| --- | --- | --- |
| **Q0** | Platform spine only: typed slots, lifecycle injection in chat route, mode-aware budgets, IDK stub, family contract types stub, `qualityRuntime` flag | Code-heavy; **do not** migrate all packs |
| **Q1** | Migrate **only** `ig-reel-script` to Script template + ~60s+ dense OPENS + golden eval/smoke (diabetes-style). Catalog EN+ZH duration fix | One flagship Stanley can feel |
| **Q2** | Remaining Script family packs only (list above). Reuse Q0 runtime | Pack wave; no new platform toys |
| **Q3** | Positioning flagship (`who-i-serve` **or** `positioning-four-questions`) + Diagnosis flagship (`ip-stage-check`) + evals | Two packs max + contracts |
| **Q4** | Hook/Line + Reply: listed ~6–10 packs (e.g. `scroll-stop-hook` chat path, `hook-rewriter`, `comment-reply-three-lines`, `dm-comment-closer`, …). Align with Studio lessons; do not rebuild Studio chrome | Bounded list only |
| **Q5** | Batch remaining Map / Ideation / Planner / Mindset with templates + migration flag. Sub-family slices if too many; report remaining | Checklist adherence mandatory |

Do **not** ask one agent to ship Q0–Q5 together. One phase per fresh agent chat. See `14-artemo-quality-runtime-agent-prompts.md`.

---

## Brand / i18n / hard product rules (unchanged)

- Product: **Influence Engine Coach**
- UI chrome ZH-main + EN via existing i18n; reply language follows UI locale lock
- Chat-first core; no global intake-form product
- No dash punctuation in user-facing copy
- TypeScript: no `any`, no non-null assertions, no `as unknown as T`; double-quoted strings
- No Turbopack at monorepo root
- Do not commit unless Stanley asks
- BUILDER ONLY: never ingest this brief into jeff-wiki / jeff-graph
- No Maria / Artemo proprietary prompt copy
- No viral-guarantee / overnight-fame framing

---

## Out of scope (this initiative)

- Rebuilding Hook Studio H1–H3 chrome (`11` / `12`) except chat-path quality alignment in Q4
- Home Artemo recommend / reply brevity redesign (`09` / `10`)
- `/tools` journey IA redesign
- New catalog modules for “Quality Runtime”
- Cloning Maria / Artemo Worker prompts or principle taxonomies
- Auth, billing, Worker rewrite of our stack
- Turning Diagnosis / Positioning / Mindset tools into IG script writers
- Big-bang overlay paste across all 55 packs without Q0 spine

---

## Done when (whole initiative)

1. Q0 Quality Runtime exists and can be opted into per pack.
2. `ig-reel-script` feels like a dense ~60s+ OPENS coaching flow (Collect → Confirm → Deliver → Refine) with golden eval coverage.
3. Script family packs migrated on the same spine (Q2).
4. Positioning + Diagnosis flagships migrated (Q3).
5. Hook/Line + Reply listed set migrated without breaking Hook Studio (Q4).
6. Remaining families migrated or explicitly listed as remaining with flag still off (Q5).
7. Unmigrated packs still work on legacy path.
8. `npm run build --prefix apps/web` passes after each phase.
9. Brief agent replies document approach + files touched + how to try locally.

---

## Access wall

- Student runtime mounts Jeff teaching only.
- Never paste these handoff docs into student answers or teaching ingest.
- Module **product** copy lives under `apps/web/` (catalog, overlays, i18n). Doctrine stays in `jeff-*`.
- These briefs are chrome / UX / prompt-product / runtime architecture only. They are not teaching doctrine.
