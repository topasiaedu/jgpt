# Accomplishments and decisions (repo source of truth)

**Audience:** builders and Cursor agents working in this repo  
**Store:** Dev / Cursor wiki only (never student-facing)  
**Updated:** 2026-09-18  
**Do not ingest into `jeff-graph` / `jeff-wiki`.**

This page is the engineering source of truth for what we built, what we decided, and what is still open. Prefer it (with `decisions.md`, `architecture.md`, `goals.md`, and dated pages under `sessions/`) over chat history. Paste-ready agent implementation prompts are **not** stored under `raw/agent-handoff/`.

---

## Product in one line

**jgpt** compiles Jeff Leong teaching into a closed wiki + graph, then serves a stakeholder test app (**Influence Engine Coach** / Jeff IP test lineage) that answers in Jeff’s coaching voice from that store only.

Live test URL (when deployed): `https://jgpt-xi.vercel.app/`  
App code: `apps/web/`  
GitHub: `https://github.com/topasiaedu/jgpt`

---

## 2026-09 session: Tools journey, frameworks, pack fidelity

**BUILDER ONLY.** Full dated writeup: [sessions/2026-09-tools-journey-and-fidelity.md](sessions/2026-09-tools-journey-and-fidelity.md).

### Commits

- `733752b` Ship Jeff workshop frameworks into the tools journey with locale lock and probe fidelity.
- `fd54b88` Deepen tool packs to Jeff slide steps so answers stop sounding generic.

### Accomplishments (this session)

- Offline AUG-D1 / D2 / D3 slides copied, OCR / extracted, and ingested as workshop evidence.
- Framework Needed PDF (stakeholder Jeff) ingested as **elevated draft**; ~14 frameworks mapped into core modules. Elevated ≠ approved.
- Tools journey UX: Ideation → IP 定位 → 内容 → 信任 → 成交; **core-only** `/tools` page; removed search, pill rail, 「更多练习」, Ask Jeff on that surface.
- Locale lock (chosen ZH / EN); EN ASCII quotes; EN catalog English-only titles.
- Probe fidelity fix (module hints no longer flood evidence).
- P0 pack rewrites to Jeff slide steps (Topic Bingo, SELF DIAGNOSTIC, Triangle, Brand Pillars, Hook Formula, CONTENT BANK, Eight Ways, OPENS Reel, S.T.O.R.Y, purchase paths, and related).
- Shared `modulePrompt` hygiene across packs.
- Agent implementation prompt files removed from `raw/agent-handoff/` so they cannot enter teaching ingest.

### Decisions locked (this session)

- Journey stages and core vs practice: ManyChat out; Brand Stance practice / Suggested; Convert core = ladder + bridge (and related convert cores).
- Browse IA: scroll-not-filter first, then later **removed search + rail** entirely for a core-only wall.
- Keep Jeff named frameworks over generic modules when similar.
- 三行地图 expand; split 评论回应三句法 vs B.R.E.A.K; Stack vs 四种内容资产 as **two** modules (option B).
- Suggested frameworks stay draft; elevated stakeholder PDF ≠ approved doctrine.
- Agent implementation prompts are not stored in `raw/` (deleted; SoT in `dev-wiki/`).

### Open / deferred (this session)

- P1 / P2 pack deepenings from the fidelity audit.
- `raw/jeff` media often untracked locally.
- Browser MCP flaky; smoke via HTTP / API when possible.

---

## What we accomplished (cumulative)

### Knowledge system
- Dual stores with a hard wall:
  - **Jeff Teaching Graph:** `jeff-wiki/`, `jeff-graph/`, allowlisted `raw/jeff/` sources, `schema/voice/`, `schema/alignment/`
  - **Dev / Cursor wiki:** `dev-wiki/`, `dev-graph/` (architecture, decisions, builder logs). Students never see this.
- Karpathy-style **compile then probe**: immutable raw sources → compiled wiki/graph → query from the compiled store (not raw RAG-only each time).
- First TurboScribe ingest (batch-1): webinar Day 2, workshop clips, slides, light testimonials → draft principles, claims, terms, stories, sources, graph nodes/edges.
- Public web captures under `raw/jeff/public/` kept **out** of doctrine (not ingested as Jeff teaching).
- Load-bearing draft teaching spine from batch-1: **get seen → earn trust → then deal** (曝光 → 信任 → 成交), founder face as brand, content assets ≠ ads. Suggested wrappers stay draft until review.
- Workshop slide ingest (AUG-D1/D2/D3) plus Framework Needed elevated draft mapping into tools/modules (see session page).

### Stakeholder webapp (Influence Engine Coach)
- Next.js App Router app in `apps/web/`, default model `gpt-4.1-mini`, OpenAI via `OPENAI_API_KEY`.
- Probe: lexical seed + 1 to 2 hop graph traverse + linked wiki excerpts; module packs add overlays without flooding hints.
- Per turn: **fresh probe**; model may call `probe_jeff` up to twice to refine; evidence is **this turn only**.
- Chat history capped (last ~16 messages, dialogue only) so long sessions do not stack stale wiki packs into context.
- Per-message sources chip; empty grounding shows honest “No graph source” / general steer.
- Voice pack: `schema/voice/sound-profile.md` (1-on-1 coach, English-only when user writes English, no ChatGPT tells, no dash punctuation).
- Server strips em/en dash and spaced hyphen-as-punctuation from replies; EN ASCII quote normalization.
- Home: Artemo-style recommend 2 to 4 tools → fresh tool chat. `/tools`: five-stage journey labels; **core-only** browse as of 2026-09 session.
- Deployed on Vercel (Root Directory `apps/web`). Teaching bundle committed under `apps/web/content/jeff/` for serverless reads.

### Ops / lessons already paid for
- Do **not** run Turbopack / `next dev` at repo root next to huge `raw/jeff` media (caused ~51GB node RAM). App lives under `apps/web/`; default `dev` is webpack.
- Vercel 500 was caused by `outputFileTracingExcludes` stripping `node_modules` from the serverless bundle. Fixed; `/api/chat` returns JSON again.
- Agent implementation prompt files under `raw/agent-handoff/` were **deleted** (again 2026-09-18, and earlier 2026-09-08) so they are not treated as vault doctrine or scraped into teaching. Engineering SoT stays in this wiki.

---

## Decisions locked (summary)

Full dated log: [decisions.md](decisions.md). Highlights:

| ID | Decision |
| --- | --- |
| D1 | Compile then probe (wiki + graph), not ad-hoc chat over loose files |
| D2 | Repo-first authoring; DB only later as teaching-only serving copy from git |
| D3 | Dual store; student/runtime mounts Jeff teaching only |
| D4 | Closed Jeff allowlist; no open-web RAG for doctrine |
| D5 | Out of coverage: Generally → Jeff → steer (no KB-meta refuse) |
| D6 | Do not relativize other educators as “also fine” under Jeff |
| D7 | Sufficiency before full student product (stakeholder test UI was an approved limited check) |
| D8 | Suggested IP framework names stay draft until evidence / approval |

### Webapp / voice / tools decisions (2026-09)

| Decision | Why |
| --- | --- |
| Stakeholder UI evolved into **Influence Engine Coach** | Demo modules, i18n, branded handoff beyond freeform chat |
| Model default `gpt-4.1-mini` (override via `OPENAI_MODEL`) | Instruction following vs cost balance for grounded chat |
| File-based `jeff-wiki` + `jeff-graph` in deploy | No DB for this round; same truth as git |
| Sources on every Jeff bubble | Stakeholders can see grounded vs freelanced turns |
| English ask → full English reply (no Chinese sprinkle); EN ASCII quotes | Non-Chinese speakers must follow replies; catalog EN titles stay English-only |
| Locale lock after ZH / EN choice | Stops mid-session chrome language drift |
| 1-on-1 coach register, not webinar stage voice | Sound like personal coaching, not a lecture dump |
| Never invent Jeff niche case studies | Model freelanced stories; IP graph does not contain them |
| Re-probe tool + per-turn evidence only; no module-hint flood | Long chats and packs must not drown the probe pack |
| No dash punctuation in student-facing replies | Product / voice rule; enforced in prompts + post-process strip |
| `/tools` five-stage journey; core-only wall (search/rail/practice disclosure removed) | Teach a path, not a flat dump of every pack |
| Jeff named frameworks over generic twins; split 三句法 vs B.R.E.A.K; Stack vs 四种内容资产 as two modules | Fidelity to workshop naming and structure |
| Framework Needed = elevated draft ≠ approved | Stakeholder PDF informs packs; does not auto-promote doctrine |
| Commit `apps/web/content/jeff` for Vercel | Serverless must read teaching files even if outside-root include is off |
| No paste-ready agent prompts in `raw/agent-handoff/` | Prevents builder prompts entering teaching ingest |

### Rejected (see also decisions.md)

Open-web RAG for Jeff doctrine · mixed student+builder wiki · “I don’t have that in my KB” refuse · rival-educator relativizing · database-first authoring before validation · treating Suggested frameworks as confirmed · treating Framework Needed elevation as approval · Turbopack watching whole monorepo with `raw/` · tracing excludes that delete `node_modules` from the Vercel function · keeping implementation prompt packs in `raw/` as vault content.

---

## Repo map (current)

```text
apps/web/           Influence Engine Coach (Next.js) → Vercel root
jeff-wiki/          Compiled teaching pages
jeff-graph/         nodes.json + edges.json
schema/             AGENTS.md, voice/, alignment/, prompts/
raw/jeff/           Immutable sources (local; often untracked if huge)
raw/agent-handoff/  Pointer README only (no paste prompts)
dev-wiki/           THIS engineering vault (source of truth for process)
dev-wiki/sessions/  Dated builder session records
dev-graph/          Lightweight project decision graph
eval/               Golden / adversarial templates
```

---

## How answering works (runtime)

1. User sends a message (free chat or module tool chat).  
2. Server probes Jeff graph/wiki for **this** ask (fresh), with pack overlay hygiene.  
3. Model may call `probe_jeff` up to 2 more times.  
4. Compose with voice rules + **this turn’s** evidence only.  
5. Strip dash punctuation / normalize EN quotes; return reply + sources for the chip.  

Dev wiki is never mounted.

---

## Still open / next

- P1 / P2 pack deepenings from the fidelity audit.  
- More TurboScribe batches → deeper ingest where media still awaits transcription.  
- Promote draft / Suggested / Framework Needed elevated nodes only after Jeff or delegate review.  
- Distill more voice few-shots from true 1-on-1 transcripts.  
- Score `eval/` goldens + adversarial other-school traps against sufficiency bars.  
- Optional later: student product, auth, serving DB export of teaching slice only.  
- Prefer HTTP / API smoke over flaky Browser MCP for regression checks.

---

## Vercel checklist (operators)

| Setting | Value |
| --- | --- |
| Root Directory | `apps/web` |
| Env required | `OPENAI_API_KEY` |
| Env optional | `OPENAI_MODEL=gpt-4.1-mini` |
| Teaching files | `apps/web/content/jeff/` (committed + prebuild sync) |

Local: `npm run dev --prefix apps/web` (webpack only; never `dev:turbo` while sharing a tree with huge `raw/`).

---

## Related pages

- [sessions/2026-09-tools-journey-and-fidelity.md](sessions/2026-09-tools-journey-and-fidelity.md)  
- [architecture.md](architecture.md)  
- [decisions.md](decisions.md)  
- [goals.md](goals.md)  
- [log.md](log.md)  
- Agent contract: `../schema/AGENTS.md`  
- Voice: `../schema/voice/sound-profile.md`
