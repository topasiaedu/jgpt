# Implementation agent prompts — IP modules on Jeff IP test

**Audience:** human operator copying prompts into fresh Cursor agent chats  
**Store:** `raw/agent-handoff/` (builder only)  
**Updated:** 2026-09-08  
**Do not ingest into jeff-graph.**

## How to use

1. Read [01-what-we-are-doing.md](01-what-we-are-doing.md) yourself once.  
2. Run agents **in order** (A → B → C → D). Do not merge phases into one mega-agent.  
3. Each prompt is sized for ~200k context models: enough repo context to work, small enough that the agent finishes without drowning mid-task.  
4. Paste the **entire** phase block as the user message (including the “Required reading” list).  
5. After each phase: skim diff, run the listed checks, then start the next agent on a **new** chat (or clear context).  
6. Do **not** ask agents to commit unless you explicitly want a commit in that chat.

### Context budget (why phases are split)

| Too big (avoid) | This pack |
| --- | --- |
| One agent builds all 15 modules + full UI + API + polish | Four agents: shell → API+IG → module pack batch → polish/nav |
| Dumping all of `raw/jeff` transcripts into the prompt | Point at `jeff-graph` + wiki pages + existing `apps/web` only |
| Rewriting probe/OpenAI from scratch | Extend request + overlay only |

---

## Phase A — Tools shell + catalog (no OpenAI behavior change)

**Outcome:** `/tools` grid with 15 cards, intro modal with descriptions, routes stubbed; chat API unchanged.

### Prompt (copy below)

```text
You are implementing Phase A only of Jeff IP test “Artemo-style tools” in this repo.

## Hard rules
- Builder handoff only. Do NOT ingest anything into jeff-wiki / jeff-graph. Do NOT mount or import dev-wiki into the student app.
- Work only under apps/web for product code. Do not rebuild probe/OpenAI.
- Do not change POST /api/chat behavior in this phase (no moduleId yet).
- No Turbopack at monorepo root. Use apps/web webpack scripts.
- No dash punctuation in user-facing English copy (em/en dash or spaced hyphen-as-aside). Prefer periods/commas/colons.
- Do not commit unless I explicitly ask.
- TypeScript: no `any`, no non-null assertions, no `as unknown as T`. Double-quoted strings.

## Required reading (open these files; do not invent architecture)
1. raw/agent-handoff/01-what-we-are-doing.md
2. raw/agent-handoff/README.md
3. apps/web/components/ChatShell.tsx
4. apps/web/app/page.tsx
5. apps/web/lib/chatTypes.ts
6. apps/web/STAKEHOLDER.md (tone of stakeholder product)

## Build exactly
1. Create apps/web/lib/modules/types.ts with ModuleCategory, ModuleDefinition (id, title, category, description, optional status: "ready" | "soon"), IntakeField type stub for later.
2. Create apps/web/lib/modules/catalog.ts exporting all 15 v1 modules from 01-what-we-are-doing.md with FULL user-facing descriptions (Artemo intro style: what it does, what to input, when to use, what you get). Categories: IP Foundation, Get Seen, Content Asset System, On-Camera Coach, Polish.
3. Only `ig-reel-script` may be status "ready". Others "soon" is fine in Phase A (or all clickable into a “coming in next phase” intake placeholder — prefer: ready opens intake stub page; soon shows disabled or “Coming soon” on Start).
4. UI:
   - apps/web/app/tools/page.tsx — “All Tools” grid grouped by category; search filter optional but nice.
   - ModuleIntroModal — title, description, primary “Start {title}”, checkbox “Don’t show this again for this tool” (localStorage key per module id), close control.
   - apps/web/app/tools/[moduleId]/page.tsx — validate id from catalog; show intro then a simple placeholder panel “Intake + chat land in Phase B/C” for ready modules; 404/redirect for unknown ids.
5. Home page: add a clear link/nav to /tools without destroying ChatShell (e.g. top bar Ask Jeff | Tools).
6. Keep existing free chat at `/` working.

## Out of scope (stop if tempted)
- moduleId on API, system overlays, intake forms wired to OpenAI
- New doctrine pages in jeff-wiki
- Auth, DB, redesign of Sources panel
- Implementing all 15 generate behaviors

## Done when
- npm run build --prefix apps/web passes
- /tools shows 15 cards with real descriptions in the intro modal
- / still chats as before
- Brief note at end of your reply: files touched + how to try locally
```

---

## Phase B — API module mode + IG Reel Script end-to-end

**Outcome:** `moduleId` + `intake` on chat API; IG Reel Script intake → Jeff-grounded script + sources.

### Prompt (copy below)

```text
You are implementing Phase B only: wire module mode into the existing chat API and ship IG Reel Script end-to-end.

## Hard rules
- Closed doctrine: reuse probeTeaching + buildSystemPrompt + generateJeffReply. Do not add open-web RAG. Never import dev-wiki / dev-graph into apps/web runtime.
- Out of coverage still Generally → Jeff → steer. No KB-meta refuse.
- English user language → full English. 1-on-1 coach. No dash punctuation in outputs (keep stripDashPunctuation).
- Never invent Jeff patient stories / niche workshop case studies as Jeff doctrine. Module output is a template for THEIR practice.
- Do not commit unless I explicitly ask.
- TypeScript strictness: no `any`, no `!`, no `as unknown as T`. Double-quoted strings.
- Phase A assumed done (catalog + /tools). If missing, stop and say what Phase A left incomplete.

## Required reading
1. raw/agent-handoff/01-what-we-are-doing.md (Target architecture + IG Reel Script)
2. apps/web/app/api/chat/route.ts
3. apps/web/lib/systemPrompt.ts
4. apps/web/lib/openai.ts
5. apps/web/lib/probe.ts
6. apps/web/lib/chatTypes.ts
7. apps/web/lib/modules/catalog.ts (from Phase A)
8. jeff-graph/nodes.json (or apps/web/content/jeff/jeff-graph/nodes.json) — bind IG module to short-video / value-then-convert / content-not-ads / exposure-trust nodes where ids exist
9. schema/voice/sound-profile.md (or content/jeff/voice/sound-profile.md) — do not fight voice rules

## Build exactly
1. Extend ChatRequestBody: optional moduleId?: string; intake?: Record<string, string>. Validate types at runtime like existing messages validation.
2. apps/web/lib/modules/packs/ig-reel-script.ts (or equivalent) exporting:
   - intakeFields (niche/industry, audience, standpoint or offer, one lesson/story bullet, language preference, CTA softness)
   - probeHints (keywords for first probe)
   - systemOverlay: you are running IG Reel Script; ask at most ONE missing critical question if intake empty; then produce a shootable 15–45s Reel script (hook, body beats, close, on-screen text); content asset not hard-sell ad; no overnight-fame promises; bind to evidence; sources still via probe
   - optional boundNodeIds to prefer in overlay text (do not fake citations)
3. Register pack lookup by moduleId from catalog.
4. In route.ts / systemPrompt path: if moduleId present, merge intake into probe query construction + append systemOverlay after base system prompt. Free chat (no moduleId) unchanged.
5. UI for /tools/ig-reel-script:
   - Intro modal (Phase A)
   - Intake form from intakeFields
   - Then chat UI reusing ChatShell patterns (extract shared bits if needed) that POSTs messages + moduleId + intake every turn
   - Sources chip must still work
6. Mark ig-reel-script ready in catalog if not already.

## Out of scope
- Implementing the other 14 packs’ overlays (stubs OK)
- Eval harness, auth, DB
- Large voice-pack rewrites

## Done when
- Manual path: Tools → IG Reel Script → intake → get a structured Reel script with sources when graph hits
- Free chat at / still works with no moduleId
- npm run build --prefix apps/web passes
- npm run test:probe --prefix apps/web still passes if present
- Reply with: example intake JSON shape, files touched, any follow-ups for Phase C
```

---

## Phase C — Remaining module packs (batch, shared pattern)

**Outcome:** All 15 modules have intake + overlay packs; “soon” modules become usable (quality may vary with KB depth).

### Prompt (copy below)

```text
You are implementing Phase C only: add module packs for the remaining v1 tools using the same pattern as IG Reel Script.

## Hard rules
- Follow the pack interface established in Phase B. Do not redesign the API.
- Overlays must stay inside Jeff closed doctrine + Generally→Jeff→steer. Prefer citing existing node themes; if KB is thin, say so in the overlay (“steer to nearest Jeff angle”) rather than inventing frameworks.
- Reject overnight fame / volume-equals-money / ads-as-assets / outsourcing judgment to GPT where relevant (see jeff-graph Reject nodes).
- No dash punctuation in user-facing strings. No commit unless I ask.
- TypeScript: no `any`, no `!`, no `as unknown as T`.

## Required reading
1. raw/agent-handoff/01-what-we-are-doing.md (full v1 module list + descriptions intent)
2. apps/web/lib/modules/catalog.ts
3. The IG pack file from Phase B (copy structure)
4. apps/web/lib/modules/types.ts
5. jeff-graph/nodes.json — map each module to best-effort bound themes
6. apps/web/app/tools/[moduleId]/page.tsx — ensure any ready module loads pack by id

## Build exactly
For each remaining module id, add a pack file (or a single packs registry split cleanly) with intakeFields, probeHints, systemOverlay:

IP Foundation: ip-stage-check, standpoint-builder, boss-brand-brief, lean-ip-setup
Get Seen: scroll-stop-hook, value-teaching-reel, hot-take-script
Content Asset System: content-asset-planner, direction-fixer, value-convert-ladder, ad-vs-asset-checker
On-Camera Coach: advice-vs-ego-coach, criticism-armor
Polish: script-humanizer

Requirements per pack:
- Intake: 3–6 fields max, concrete placeholders
- Overlay: output shape specified (checklist / brief / script / rewrite). Ask at most one clarifying question when critical intake missing.
- Catalog: set status "ready"; descriptions already in catalog stay unless a factual fix is needed
- Tools/[moduleId] page must work for every catalog id (shared ModuleChat flow)

Keep overlays compact (prompt budget). Do not paste entire wiki pages into overlays; rely on probe evidence packs.

## Out of scope
- New categories beyond the 15
- Artemo email/ad suites
- Deep UI redesign, search perfection, animations binge
- jeff-wiki ingest

## Done when
- All 15 modules start → intake → chat with moduleId
- build passes
- Short table in your reply: module id → primary graph themes used → known KB thin spots
```

---

## Phase D — Product polish + stakeholder docs (small)

**Outcome:** Nav/search/empty states and docs match the new Tools surface; no new modules.

### Prompt (copy below)

```text
You are implementing Phase D only: polish the Tools experience and update stakeholder-facing docs. No new modules.

## Hard rules
- Stay in apps/web (+ STAKEHOLDER/README). Do not touch jeff-graph doctrine unless fixing a sync script bug you caused.
- No dash punctuation in UI copy. No commit unless I ask.
- Keep free chat and module chat both obvious.

## Required reading
1. apps/web/app/tools/page.tsx and related components
2. apps/web/components/ChatShell.tsx
3. apps/web/STAKEHOLDER.md
4. apps/web/README.md
5. raw/agent-handoff/01-what-we-are-doing.md (success criteria)

## Build exactly
1. Home empty state: 1–2 chips that deep-link to /tools or IG Reel Script (in addition to existing example questions).
2. Tools page: working category headers; simple client search by title; mobile-usable grid.
3. Module intro “Don’t show again” verified per module id.
4. Loading/error parity with ChatShell for module chat.
5. Update STAKEHOLDER.md: what Tools are, how to try IG Reel Script, how to report bad module output (question, intake, reply, sources).
6. Update apps/web/README.md briefly: routes /, /tools, /tools/[moduleId].
7. Optional: append a short note to dev-wiki/log.md that Phase A–D tools landed (builder log only).

## Out of scope
- New module packs, model changes, Vercel project settings, commits

## Done when
- build passes
- STAKEHOLDER.md tells a non-engineer how to try Tools
- Reply: checklist of UX paths verified
```

---

## Optional follow-ups (do not put in A–D unless asked)

- Eval goldens per module under `eval/`  
- More TurboScribe ingest to thicken Offer Bridge modules  
- Serving DB export (not now)  
- Promoting Suggested frameworks after Jeff review  

## Operator checklist

After Phase A: open `/tools`, open one intro modal, confirm `/` chat.  
After Phase B: full IG Reel Script generate on Vercel or local with `OPENAI_API_KEY`.  
After Phase C: spot-check Standpoint + Ad vs Asset + Criticism Armor.  
After Phase D: hand STAKEHOLDER.md to Jeff’s team with Tools section.
