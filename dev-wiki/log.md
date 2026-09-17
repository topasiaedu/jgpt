# Dev wiki log

| Date | Note |
| --- | --- |
| 2026-09-03 | Initial scaffold: dual stores, schema/AGENTS.md, empty jeff-graph, seeded dev-graph. Next: upload sources to `raw/jeff/`. |
| 2026-09-03 | Public scrape to `raw/jeff/public/` (IP practice/teaching research); not ingested into jeff-graph. |

## 2026-09-04 — Jeff raw media organization

- Organized Jeff Leong sources from Downloads into `raw/jeff/` (slides, webinars, testimonials, workshops).
- TurboScribe: flat select-all folder at `raw/jeff/_turboscribe/upload/` (82 symlinks; no merged audio).
- Wrote `raw/jeff/INGEST_MANIFEST.md` (`ingested: false`). Did not touch jeff-wiki / jeff-graph.

## 2026-09-04 — TurboScribe batch-1 capture + first teaching ingest + media prune

- Extracted `Downloads/Jeff GPT.zip` → `raw/jeff/transcripts/turboscribe-batch-1/` (149 files) + zip copy `Jeff-GPT-batch-1.zip`. Wrote `MANIFEST.md`.
- First jeff-wiki / jeff-graph ingest from webinar Day2 + WS clips + slides (+ light testimonials). Public scrape still excluded.
- After transcripts confirmed on disk: deleted raw video/audio superseded by this batch; kept media still awaiting transcription (other webinars, empty IP videos, unmatched duplicates pending later batches). Cleared Downloads duplicates for this Jeff media set (not Dr Jasmine zips).
- Slides kept at `raw/jeff/slides/`.

## 2026-09-04 — Stakeholder webapp handoff docs

- Wrote `raw/agent-handoff/01-what-we-are-doing.md` (approved Jeff IP test plan: Next.js, Vercel, gpt-4.1-mini, file-based jeff wiki/graph).
- Wrote `raw/agent-handoff/02-implementation-agent-prompts.md` (Phases A UI scaffold, B probe+OpenAI, C deploy polish).
- Not ingested into jeff-graph.

## 2026-09-04 — Phase A: Jeff IP test UI shell

- Scaffolded Next.js App Router (TypeScript) at repo root: chat UI titled Jeff IP test, stub `POST /api/chat`, `.env.example`, README run/Vercel notes.
- No OpenAI, no probe, no `dev-wiki` / `dev-graph` imports. Phase B not started.

## 2026-09-04 — Incident: Next.js OOM from watching `raw/` (~68GB)

- **Symptom:** Mac thrashing (32GB RAM, ~43GB swap). Activity Monitor: `node` ~51GB, `next-server (v15.5.25)` hundreds of MB.
- **Cause:** Phase A scaffolded Next.js App Router at the **repo root** with `next dev --turbopack`. The project root sits beside `raw/jeff` (~68GB media/transcripts). Turbopack/file watching walked that tree and blew memory.
- **Killed:** PIDs 9179 (node), 9173 (next-server), hung `npm run dev` PGID 9149 / terminal restart, and in-flight `npx next build` (9416/9422/9437/9441). Confirmed cwd `/Users/stanley/Documents/GIthub/jgpt`. No unrelated system processes.
- **Fix (do not re-run turbopack until app is isolated):**
  - `next.config.ts`: `outputFileTracingRoot` + `turbopack.root` pinned to app dir; `outputFileTracingExcludes` for `raw/**` and other bulk trees; webpack `watchOptions.ignored` for `raw/**`, `node_modules/**`, wiki/graph/eval/schema.
  - `package.json`: default `dev` is `next dev` (webpack). `dev:turbo` kept but unsafe while app shares root with `raw/`.
  - `tsconfig.json`: include only `app`/`components`/`lib`; exclude `raw` and other stores.
  - `.gitignore` + `.cursorignore`: `raw/`.
  - Cleared `.next` cache from the runaway session.
- **Follow-up:** Move the webapp to `apps/web` so the Next project root no longer contains `raw/`, then turbopack can be reconsidered.

## 2026-09-05 — Phase B: apps/web move + probe + OpenAI chat

- Moved Next app from repo root to `apps/web/` (root `package.json` delegates scripts). Vercel Root Directory: `apps/web`.
- `.gitignore`: no longer ignores all of `raw/`; ignores heavy media patterns + `_staging/` / `_turboscribe/`. `.cursorignore` still excludes `raw/` for indexing.
- Implemented `POST /api/chat`: lexical probe over `jeff-graph` (seed + 1–2 hop, evidence cap), linked `jeff-wiki` excerpts, OpenAI Chat Completions (`gpt-4.1-mini` default), Jeff voice + closed doctrine + Generally → Jeff → steer, Sources used panel wired.
- Path guards refuse `dev-wiki/`, `dev-graph/`, `raw/jeff/public`. Teaching roots resolve via monorepo (`../../jeff-*` from `apps/web`).
- Soft-fail 503 if `OPENAI_API_KEY` missing. `npm run test:probe` verifies probe without OpenAI (no key in this environment; OpenAI live call not tested).
- Phase C not started.

## 2026-09-05 — Phase C: deploy polish + stakeholder readiness

- `prebuild` syncs `jeff-wiki` + `jeff-graph` into `apps/web/content/jeff/` for Vercel serverless; runtime prefers that bundle, falls back to monorepo root.
- UX: loading state, inline API errors, assistant paragraph/list formatting, example questions empty state, Sources used always on desktop / collapsible on mobile.
- Docs: `apps/web/STAKEHOLDER.md` + `apps/web/README.md` (Vercel Root Directory `apps/web`, env `OPENAI_API_KEY`, optional `OPENAI_MODEL=gpt-4.1-mini`).
- Safety: zero `dev-wiki`/`dev-graph` imports; no em/en dash in app user-facing strings. `npm run build --prefix apps/web` passes (webpack; no turbopack).
- Tracing still excludes `raw/`. No git commit in this phase.

## 2026-09-05 — Sound profile (stakeholder ChatGPT tone)

- Stakeholder testing: content/graph roughly right, but replies still sounded like ChatGPT (polite essays, “Great!”, bold headers, “aligned with Jeff’s teaching”, meta Exposure→Trust→Deal labels).
- Added `schema/voice/sound-profile.md` (cadence, POV, banned tells, draft few-shots from webinar Day2 + WS clips). Pointed `jeff-style.md` / `do-dont.md` and `jeff-wiki/voice/` at it.
- `apps/web` prebuild sync now copies `schema/voice/` → `content/jeff/voice/`; `systemPrompt.ts` loads and prioritizes the sound pack + negative self-check. No probe/graph logic change. No git commit.

## 2026-09-05 — Language match for Jeff IP test chat

- Bug: English user messages got full Chinese replies (Chinese-heavy few-shots + bilingual habit).
- Hard rule in `schema/voice/sound-profile.md` + early priority bullet in `apps/web/lib/systemPrompt.ts`: match latest user message language; EN→EN (loanwords OK), CN→CN, mixed→dominant.
- Softened few-shots: 5/10 are English replies to English users. Re-ran `npm run sync:jeff`. No commit.

## 2026-09-05 — 1-on-1 register + language match (voice pass)

- Stakeholder: tone still felt webinar-stage; want Jeff talking to one person (across table / on a call). Sampled DJI / testimonial interview transcripts under `raw/jeff/transcripts/turboscribe-batch-1/` for short “you” cadence.
- `schema/voice/sound-profile.md`: kept hard **Language match**; added **Register: 1-on-1 coach** (ban everyone / in this session / key takeaways / curriculum dumps; prefer you + one diagnosis + one next move + one question). Few-shots rewritten shorter in 1-on-1 register (EN + CN mix).
- `jeff-style.md` / `do-dont.md` + `apps/web/lib/systemPrompt.ts` hard rules aligned. Re-synced `content/jeff/voice/`. No probe/graph change. No commit.

## 2026-09-05 — Dash punctuation ban (voice + post-process)

- Bug: Jeff IP chat still emitted em dashes in replies (e.g. “先被看到 — nobody…”, “not ads — so focus…”).
- Strengthened hard ban in `schema/voice/sound-profile.md`, `do-dont.md`, `jeff-style.md`, and `apps/web/lib/systemPrompt.ts`: never output `—` / `–` / spaced `-` as punctuation; prefer period / comma / colon / new sentence.
- Belt and suspenders: `stripDashPunctuation` runs on assistant `reply` in `POST /api/chat` before JSON return (`apps/web/lib/stripDashPunctuation.ts`). Preserves in-word hyphens.
- Added `npm run test:strip-dash`. Re-ran `npm run sync:jeff` → `content/jeff/voice/`. No commit.

## 2026-09-05 — English-only EN replies + readable formatting

- Stakeholder feedback: Chinese sprinkle in English replies hard for weak Chinese readers; dense / glued bilingual hard to scan.
- `schema/voice/sound-profile.md`: EN → **full English only** (gloss Jeff terms: positioning, boss is the brand, get seen first); CN replies stay Chinese. Formatting hard rule: max ~3 short paras or 1 para + short numbered list; blank lines between beats; end with one question.
- Few-shots split: EN exemplars English-only; CN exemplars labeled separately. `jeff-style.md` / `do-dont.md` + `apps/web/lib/systemPrompt.ts` hard rules aligned.
- Chat UI: slightly more spacing between assistant paragraphs/lists (`globals.css` + `AssistantMessage` null-safe list captures).
- Bumped sound-profile prompt budget 12k → 14k so new few-shots are not truncated.
- Re-ran `npm run sync:jeff` → `content/jeff/voice/`. No commit.

## 2026-09-05 — Per-message sources + niche invention guard

- Stakeholder: asked which **source** grounded a diabetes “reduce meds” short-video script; suspected GPT invention. Correct: Jeff store is IP/brand craft; that medical niche script is **not** Jeff doctrine.
- UI: each assistant message stores `sources` from `/api/chat`; Jeff bubble top-right chip shows `N sources` or **No graph source**; expand lists id/title/type. Right Sources panel syncs to latest reply or selected bubble; empty = **No graph source** / **General steer**.
- Voice + `systemPrompt`: hard ban inventing Jeff case studies / patient stories / niche workshop scripts; niche drafts labeled as example structure for *their* practice; Jeff stays on positioning / face / trust / content assets.
- Synced `schema/voice/` → `content/jeff/voice/`. Updated `STAKEHOLDER.md`. No probe logic change (still return only ranked nodes used). No turbopack. No commit.

## 2026-09-05 — Long-chat fresh probe + probe_jeff tool

- Goal: ~30 min chats without assuming first-turn probe covers later asks, and without stuffing stale wiki excerpts into every compose.
- Per turn: automatic fresh `probeTeaching` on latest user ask (light prior-user blend only for short/pronoun follow-ups). System prompt gets **this turn’s evidence pack only**.
- History: `toDialogueOnly` keeps last **16** messages as role+content (sources stripped client + server). No prior evidence blobs in the prompt.
- Optional OpenAI tool loop: `probe_jeff({ query })` re-probes jeff-graph/wiki; max **2** tool calls/turn then force final answer. Response `sources` = union of auto probe + tool probes.
- Prompt: this-turn-only evidence, call tool on topic shift, niche invention ban, language match, dash ban. `npm run test:long-chat` verifies cap + turn2 funnel query ≠ turn1 founder pack paste.
- No turbopack. No commit.

## 2026-09-07: Vercel chat API unreachable UX + harden deploy

- Symptom on Vercel: client showed "Could not reach the chat API..." after sending a founder/IP question. That string is the ChatShell catch when `fetch` fails or the body is non-JSON (HTML timeout/gateway page), not a soft OpenAI JSON error.
- Likely causes: platform timeout on large system prompt + `probe_jeff` tool loops (default ~10s/15s), and/or serverless path layout when tracing root was the monorepo. Missing `OPENAI_API_KEY` already returned JSON 503.
- Fix: `runtime = "nodejs"`, `maxDuration = 60`, outer JSON catch-all on `POST /api/chat`; prefer tracing `content/jeff` under apps/web (`/api/chat` includes); broaden `getTeachingRoot` / voice candidates for Vercel cwd layouts; client distinguishes network vs HTTP vs non-JSON body snippet.
- Docs: README Vercel env + include-files-outside-root note. Did not commit `.env.local`. Pushed to `main` for redeploy.

## 2026-09-07: Vercel /api/chat HTML 500 MODULE_NOT_FOUND

- Live `POST/HEAD /api/chat` returned Next HTML 500 (`x-matched-path: /500`) in ~500ms, not a timeout.
- Vercel logs: `Cannot find module 'next/dist/compiled/next-server/app-route.runtime.prod.js'` and missing `react/jsx-runtime.js` under `/var/task/apps/web/node_modules`.
- Root cause: `outputFileTracingExcludes` listed `node_modules/**`, which stripped Next/React from the serverless NFT bundle.
- Fix: remove `node_modules` from tracing excludes; pin `outputFileTracingRoot` to `apps/web`; commit `apps/web/content/jeff/**` (stop gitignoring); sync script keeps committed bundle if monorepo parents are absent; shrink sound-profile prompt budget to 6k chars.

## 2026-09-08 — Vault SoT + remove agent handoff prompts

- Deleted `raw/agent-handoff/` (01 what-we-are-doing, 02 implementation agent prompts, README) so builder prompts are not mistaken for wiki/teaching doctrine.
- Added `dev-wiki/accomplishments-and-decisions.md` as the engineering source-of-truth summary (built, decided, open).
- Updated `dev-wiki/index.md`, `decisions.md` (D9–D12 + rejected rows), `goals.md` status.

## 2026-09-08 — Agent handoff restored for IP modules (Artemo-style)

- Recreated `raw/agent-handoff/` as **builder-only** briefs (explicit: do not ingest into jeff teaching).
  - `01-what-we-are-doing.md`: product goal, keep existing chat/probe, `/tools` + module packs, locked 15-module menu, non-goals.
  - `02-implementation-agent-prompts.md`: Phases A–D copy-paste prompts (shell → API+IG Reel → remaining packs → polish), sized for ~200k-context agents without one mega-task.
  - `README.md` + `raw/README.md` access-wall notes.
- Updated `dev-wiki/index.md` pointer. No app code in this note.

## 2026-09-08 — Phases A–D: Tools wall landed (builder log)

- Phase A–C: `/tools` category grid, intro → intake → module chat for all 15 packs; free chat at `/` kept; shared `POST /api/chat` with `moduleId` + intake.
- Phase D polish: home deep-link chips to Tools / IG Reel Script; title search; per-module “Don’t show again”; module chat loading/error parity; STAKEHOLDER + README routes updated. No new modules. No jeff doctrine ingest from this work.

## 2026-09-08 — Full Jeff IP module list shipped for stakeholder cut

Expanded Tools from the curated 15 to the full proposed set (39 ready packs), including Earn Trust and Convert categories. Some modules are KB-thin by design; overlays steer rather than invent doctrine. Stakeholder can cut later.

## 2026-09-08 — Tools chat-first + Jeff-distinctive overlays

- Removed intake form gate: intro (optional/skip) → ModuleChatShell with seeded `chatOpener`.
- `intakeFields` kept as internal chat slots; `modulePrompt` injects conversational rules, anti-generic Jeff rewrite rule, and capped `boundNodeIds` title/summary briefs from nodes.json.
- Strengthened all ~39 pack overlays/probeHints; deeper flagship care on IG Reel, Standpoint, Stage Check, Asset Planner, Value Teaching, Ad vs Asset, Advice vs Ego, Hot Take, Boss Brand, Scroll-Stop Hook.
- STAKEHOLDER updated: report generic/non-Jeff module answers. Free chat at `/` unchanged.

## 2026-09-08: Influence Engine Coach UI redesign handoffs (docs only)

- Wrote `raw/agent-handoff/03-ui-redesign-what-we-are-doing.md` and `04-ui-redesign-agent-prompts.md` (phases U1 to U3). Locked: product name Influence Engine Coach, ZH-main chrome + multilingual, brand asset rights YES.
- Updated `raw/agent-handoff/README.md`, `raw/README.md`, and this wiki index pointer. No `apps/web` UI implementation in this step. Not jeff teaching ingest.

## 2026-09-08 — Phase U3: Influence Engine Coach polish + docs

- U1–U3 UI redesign on `apps/web`: brand shell + stage-first Tools already in tree; U3 added restrained motion (CTA/send pulse, opener fade-in, mobile stage-rail snap), mobile chat/tools polish, ZH/EN student empty/error copy, optional dismissible first-visit dark brand moment, STAKEHOLDER + README rewritten for Influence Engine Coach. Locale toggle verified (footer 中文/EN; first-visit EN browser hint). No new modules, no doctrine ingest, no probe rebuild. Builder log only.

## 2026-09-10 — Artemo flow handoffs (docs only)

- Wrote `raw/agent-handoff/05-artemo-flow-what-we-are-doing.md` and `06-artemo-flow-agent-prompts.md` (phases F1 to F3). Locked: home ask「今天要做什么 IP 内容？」→ recommend 2 to 4 tools → fresh tool chat clarify-then-deliver; All Tools = category card wall; no stage-first primary; no forms.
- Updated `raw/agent-handoff/README.md` (01 to 06). Stage-first front door from 03/U2 superseded for product flow; brand chrome from U1 to U3 kept. No `apps/web` UI in this step. Not jeff teaching ingest.

## 2026-09-10 — Artemo flow F1 to F3 landed (builder log)

- F1: home ask「今天要做什么 IP 内容？」+ structured `recommendedModuleIds` cards.
- F2: `/tools` category card wall; stage hero removed as primary.
- F3: fresh tool chat per open (remount keying); pack `chatOpener` + optional `?from=home&q=` handoff (length-capped); shared overlay clarify-then-deliver reinforced; STAKEHOLDER + README updated for locked flow. No intake forms. No doctrine ingest.

## 2026-09-18 — Tools journey UX Phases A to C landed (builder log)

- `/tools` sticky numbered journey rail scrolls to stage sections (does not filter). Core cards stay visible; practice under collapsed 「更多练习工具」; single 「从这里开始」 → `ip-stage-check`. Search still reaches all modules.
- Phase C: ZH/EN journey chrome copy polish; membership audit helper (`auditJourneyMembership`) wired in ToolsGrid (dev warn only). No jeff-wiki / jeff-graph ingest. Language-lock / quote sanitizer workstreams left alone.
