# Accomplishments and decisions (repo source of truth)

**Audience:** builders and Cursor agents working in this repo  
**Store:** Dev / Cursor wiki only (never student-facing)  
**Updated:** 2026-09-08  
**Do not ingest into `jeff-graph`.**

This page is the engineering source of truth for what we built, what we decided, and what is still open. Prefer it (with `decisions.md`, `architecture.md`, `goals.md`) over chat history or deleted agent handoff prompts.

---

## Product in one line

**jgpt** compiles Jeff Leong teaching into a closed wiki + graph, then serves a stakeholder test chat (**Jeff IP test**) that answers in Jeff’s coaching voice from that store only.

Live test URL (when deployed): `https://jgpt-xi.vercel.app/`  
App code: `apps/web/`  
GitHub: `https://github.com/topasiaedu/jgpt`

---

## What we accomplished

### Knowledge system
- Dual stores with a hard wall:
  - **Jeff Teaching Graph:** `jeff-wiki/`, `jeff-graph/`, allowlisted `raw/jeff/` sources, `schema/voice/`, `schema/alignment/`
  - **Dev / Cursor wiki:** `dev-wiki/`, `dev-graph/` (architecture, decisions, builder logs). Students never see this.
- Karpathy-style **compile then probe**: immutable raw sources → compiled wiki/graph → query from the compiled store (not raw RAG-only each time).
- First TurboScribe ingest (batch-1): webinar Day 2, workshop clips, slides, light testimonials → draft principles, claims, terms, stories, sources, graph nodes/edges.
- Public web captures under `raw/jeff/public/` kept **out** of doctrine (not ingested as Jeff teaching).
- Load-bearing draft teaching spine from batch-1: **get seen → earn trust → then deal** (曝光 → 信任 → 成交), founder face as brand, content assets ≠ ads. No confirmed named “#1 framework” yet; Suggested wrappers stay draft.

### Stakeholder webapp (Jeff IP test)
- Next.js App Router app in `apps/web/`, default model `gpt-4.1-mini`, OpenAI via `OPENAI_API_KEY`.
- Probe: lexical seed + 1 to 2 hop graph traverse + linked wiki excerpts.
- Per turn: **fresh probe**; model may call `probe_jeff` up to twice to refine; evidence is **this turn only**.
- Chat history capped (last ~16 messages, dialogue only) so long sessions do not stack stale wiki packs into context.
- Per-message sources chip (top right); empty grounding shows honest “No graph source” / general steer.
- Voice pack: `schema/voice/sound-profile.md` (1-on-1 coach, English-only when user writes English, no ChatGPT tells, no dash punctuation).
- Server strips em/en dash and spaced hyphen-as-punctuation from replies.
- Deployed on Vercel (Root Directory `apps/web`). Teaching bundle committed under `apps/web/content/jeff/` for serverless reads.

### Ops / lessons already paid for
- Do **not** run Turbopack / `next dev` at repo root next to huge `raw/jeff` media (caused ~51GB node RAM). App lives under `apps/web/`; default `dev` is webpack.
- Vercel 500 was caused by `outputFileTracingExcludes` stripping `node_modules` from the serverless bundle. Fixed; `/api/chat` returns JSON again.
- Agent implementation prompt files under `raw/agent-handoff/` were **deleted** (2026-09-08) so they are not treated as vault doctrine or scraped into teaching.

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
| D8 | Suggested IP framework names stay draft until evidence |

### Webapp / voice decisions (2026-09)

| Decision | Why |
| --- | --- |
| Stakeholder test UI named **Jeff IP test** | Let Jeff’s team judge fidelity before a full student product |
| Model default `gpt-4.1-mini` (override via `OPENAI_MODEL`) | Instruction following vs cost balance for grounded chat |
| File-based `jeff-wiki` + `jeff-graph` in deploy | No DB for this round; same truth as git |
| Sources on every Jeff bubble | Stakeholders can see grounded vs freelanced turns |
| English ask → full English reply (no Chinese sprinkle) | Non-Chinese speakers could not follow mixed replies |
| 1-on-1 coach register, not webinar stage voice | Sound like testimonial / personal talk, not a lecture dump |
| Never invent Jeff niche case studies (e.g. fake patient scripts) | Model freelanced medical stories; IP graph does not contain them |
| Re-probe tool + per-turn evidence only | 30-minute chats cannot rely on the first fetch; old packs hog context |
| No dash punctuation in student-facing replies | Product / voice rule; enforced in prompts + post-process strip |
| Commit `apps/web/content/jeff` for Vercel | Serverless must read teaching files even if outside-root include is off |

### Rejected (see also decisions.md)

Open-web RAG for Jeff doctrine · mixed student+builder wiki · “I don’t have that in my KB” refuse · rival-educator relativizing · database-first authoring before validation · treating Suggested frameworks as confirmed · Turbopack watching whole monorepo with `raw/` · tracing excludes that delete `node_modules` from the Vercel function.

---

## Repo map (current)

```text
apps/web/           Jeff IP test (Next.js) → Vercel root
jeff-wiki/          Compiled teaching pages
jeff-graph/         nodes.json + edges.json
schema/             AGENTS.md, voice/, alignment/, prompts/
raw/jeff/           Immutable sources (local; often untracked if huge)
dev-wiki/           THIS engineering vault (source of truth for process)
dev-graph/          Lightweight project decision graph
eval/               Golden / adversarial templates
```

---

## How answering works (runtime)

1. User sends a message.  
2. Server probes Jeff graph/wiki for **this** ask (fresh).  
3. Model may call `probe_jeff` up to 2 more times.  
4. Compose with voice rules + **this turn’s** evidence only.  
5. Strip dash punctuation; return reply + sources for the chip.  

Dev wiki is never mounted.

---

## Still open / next

- **Artemo-style user flow on `apps/web`:** builder handoffs `05` / `06` (phases F1 to F3). Locked 2026-09-10: home ask → recommend 2 to 4 tools → fresh tool chat; All Tools card wall; no stage-first primary. Brand from U1 to U3 kept. Implementation not started. Do not ingest handoff into jeff teaching.
- More TurboScribe batches → deeper ingest (remaining webinars, missing testimonial zips if re-downloaded).  
- Promote draft/Suggested nodes only after Jeff or delegate review.  
- Distill more voice few-shots from true 1-on-1 transcripts.  
- Score `eval/` goldens + adversarial other-school traps against sufficiency bars.  
- Optional later: student product, auth, serving DB export of teaching slice only.  
- Keep expanding **reject / warns_against** nodes so “other course says X” is answered with Jeff’s correction.

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

- [architecture.md](architecture.md)  
- [decisions.md](decisions.md)  
- [goals.md](goals.md)  
- [log.md](log.md)  
- Agent contract: `../schema/AGENTS.md`  
- Voice: `../schema/voice/sound-profile.md`
