# Product / repo decisions: Hook Studio + Quality Runtime + UI cleanup

**Date:** 2026-09-29  
**Audience:** builders, Cursor agents, vault / wiki readers of **repo product truth**  
**Store:** `raw/agent-handoff/` (builder vault under `raw/`)  
**Label:** **PRODUCT / REPO DECISIONS.** Not Jeff teaching IP. Not student curriculum.  
**Do not ingest into `jeff-wiki` / `jeff-graph`.**

Engineering SoT also lives under `dev-wiki/` (especially `accomplishments-and-decisions.md`). This file is the durable record for this workstream so prompts cannot be mistaken for teaching sources.

Related briefs (context only, not prompts):
- [11-hook-studio-ux-what-we-are-doing.md](11-hook-studio-ux-what-we-are-doing.md)
- [13-artemo-quality-runtime-what-we-are-doing.md](13-artemo-quality-runtime-what-we-are-doing.md)

Agent copy-paste prompt files (`*agent-prompts*`) were deleted from `raw/` so they cannot enter wiki ingest.

---

## Verdict

Shipped: Hook Studio as a separate top-nav batch surface; Artemo-standard Quality Runtime across all module packs; recent chrome cleanup for quieter tool chat and nav.

Rejected: patching ~55 soft “ask denser” overlays with no lifecycle, typed slots, or family contracts.

---

## Hook Studio

### Decisions

| Decision | Locked choice |
| --- | --- |
| Surface | Separate top-nav route `/studio` (not nested under tool chat / ModuleWorkspace) |
| UX inspiration | Maria Wendt public Hook Writer: **shape only** (profile, modes, generate, cards) |
| Doctrine / brain | Jeff Hook Formula native (`scroll-stop-hook` + related packs). No proprietary Maria Worker prompt, “Maria’s Principle” labels, or viral-guarantee framing |
| Chat vs batch | Batch Generate is additive; students can still refine in chat afterward |
| Quality Runtime interaction | Studio batch Generate **force-Delivers** (lifecycle reason `hook_studio_batch:*`) so cards keep working; chat path still uses Collect → Confirm → Deliver → Refine |

### Shipped (code anchors)

- `apps/web/app/studio/page.tsx`: top-nav Studio page powered by Hook Formula module id `scroll-stop-hook`
- `AppNav`: Hook Studio link + locale toggle
- `HookStudioPanel` / `HookStudioWorkspace`: profile, modes, Generate, copyable cards
- `lib/hookStudio/*`: compose markers, detect batch, parse cards, mode overlays, studio batch overlay
- `qualityRuntime/lifecycle.ts`: Studio markers force Deliver so JSON cards are not blocked by Collect/Confirm

### Verify

- Open `/studio` from top nav (not only from a tool chat header)
- Generate yields copyable cards; rewrite / from-idea modes still Jeff-named
- Studio batch turns skip QA paths that would forbid JSON card contracts

---

## Quality Runtime (Artemo-standard)

### Decisions

| Decision | Locked choice |
| --- | --- |
| Lifecycle | **Collect → Confirm → Deliver → Refine** |
| Intake | Typed **critical** vs optional slots; IDK options; chat-first (no global intake forms) |
| Budgets | Mode-aware: clarifying short; deliverable dense and job-shaped |
| Architecture | **Both** platform spine (code) **and** per-family / per-pack migration (not soft overlays alone) |
| Script / Spoken default | ~**60s+** dense OPENS / spoken deliverable. Reject thin 15–45s as the default for IG Reel OPENS tools |
| Wrong path | Soft “ask better / be denser” pasted across ~55 overlays with no enforcement: **cancelled** |

### Families taxonomy

`QualityFamilyId` contracts in `lib/modules/qualityRuntime/families.ts`:

| Family id | Job shape (short) |
| --- | --- |
| `diagnosis` | Diagnostic brief + ranked next actions (not a script) |
| `positioning-map` | Who / serve / standpoint map |
| `ideation-bank` | Numbered usable bank |
| `script-spoken` | Shootable spoken script ~60s+ |
| `hook-line` | Scroll-stop opens / lines (not a full Reel) |
| `rewrite-adapter` | Stronger version of their draft |
| `reply-micro-convert` | Short reply paths + soft CTA |
| `planner-ladder` | Sequence plan with checkpoints |
| `mindset-guardrail` | Guardrail coaching; refuse fame hacks |

### Shipped (Q0–Q5)

| Phase | What landed |
| --- | --- |
| Q0 | Spine: types, slots, IDK helpers, budgets, lifecycle detect/inject, family stubs |
| Q1–Q4 | Flagship + family waves: packs set `qualityRuntime: true` in pack source where migrated early |
| Q5 | Remaining Map / Ideation / Planner / Mindset / Rewrite / leftover packs via `q5Migrations.ts` applied by `finalizeQ5Pack` at pack **registration** in `lib/modules/packs/index.ts` (`registerPack` → `getModulePack`) |

**Coverage:** all registered module packs resolve with Quality Runtime enabled (inline opt-in for earlier waves; Q5 leftovers finalized at `getModulePack` registration). Optional later: inline those Q5 fields into pack source files for inspectability.

Key paths:

- `apps/web/lib/modules/qualityRuntime/` (`lifecycle`, `slots`, `budgets`, `families`, `inject`, `finalizeQ5`, `q5Migrations`, …)
- Smokes: `scripts/smoke-quality-runtime-q0.ts` … `q5.ts`

### Verify

- Missing criticals stay in Collect; Confirm before dense Deliver (except families that intentionally skip Confirm, e.g. some micro-reply / mindset cases)
- Script family packs default ~60s+ in catalog + openers + overlays (EN + ZH)
- `getModulePack(id)` returns `qualityRuntime` enabled for every registered pack
- Studio batch still force-Delivers after Quality Runtime ship

---

## UI cleanup (recent)

### Decisions / shipped

| Change | Outcome |
| --- | --- |
| Draft / trial footer | Removed (“Draft teaching graph…” / “Learn the system live”) |
| Tool chat start | Cleaner: no intro banner strip auto-stack; no duplicate OPENS chip + Content label stack; quiet title → Jeff coaching chat |
| Locale | Toggle moved to **top nav**; `AppFooter` removed |
| Assistant markdown | `AssistantMessage` light Markdown: bold, HR, lists (no full MD dependency) |

### Verify

- No `AppFooter` component; locale only in `AppNav`
- Tool pages: title + chat opener, without stacked chrome noise
- Assistant replies render bold / lists / horizontal rules cleanly

---

## Out of scope / still optional

- Browser QC live density (manual / scripted live checks remain optional)
- Inline Quality Runtime fields from `q5Migrations` into individual pack source files (inspectability only; runtime already correct via `finalizeQ5Pack`)
- Git commit: only when Stanley asks

---

## Access wall

- This file is **builder product / repo truth**, not Jeff workshop doctrine.
- Never paste into student answers or teaching ingest.
- Module product copy stays under `apps/web/`. Doctrine stays in `jeff-*`.
