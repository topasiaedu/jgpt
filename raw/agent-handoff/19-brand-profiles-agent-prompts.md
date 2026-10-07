# Brand profiles: implementation agent prompts

**Date:** 2026-10-06  
**Audience:** human pasting into Cursor agents  
**Label:** BUILDER PROMPTS. Not Jeff teaching IP.  
**Do not ingest into `jeff-wiki` / `jeff-graph`.**

Companion brief (required reading for every agent): [18-brand-profiles-what-we-are-doing.md](18-brand-profiles-what-we-are-doing.md)

## How to use

1. Confirm Supabase MCP is authenticated and a project is selected.
2. Run agents **in order A → B → C → D → E** unless noted.
3. Paste **one** agent block per new chat. Do not paste all five into one agent.
4. Each agent must re-read doc 18. Do not rely on prior chat memory across agents.
5. Model budget assumption: ~200k context. Each agent is sized to finish without swallowing the whole monorepo. Prefer targeted reads over `raw/jeff/**` crawls.
6. Do not commit unless the human asks.

## Shared hard rules (every agent)

- Brand profiles are **user data**, not Jeff doctrine. Never write uploads or briefs into `raw/jeff`, `jeff-wiki`, or `jeff-graph`.
- Ban dash punctuation in student-facing prose (em/en dash, spaced hyphen as punctuation). Prefer period, comma, colon, or a new sentence. Hyphens inside code/paths/ids are fine.
- Match existing `apps/web` TypeScript style. Prefer double quotes for strings in new TS. No `any`. No non-null assertion `!`. No `as unknown as T`.
- Vercel: do not use local disk as durable storage for uploads. Use Supabase Storage.
- Keep prompt budgets capped. Never dump full PDF/PPTX extract into chat system prompts.

---

## Agent A — Supabase foundation (schema, RLS, Storage, clients)

### Paste this

```text
You are implementing Agent A of the jgpt Brand profiles delivery.

READ FIRST (required):
- raw/agent-handoff/18-brand-profiles-what-we-are-doing.md
- .cursor/mcp.json
- apps/web/package.json
- apps/web/app/layout.tsx
- apps/web/README.md (deploy/env notes if present)

PREREQ: Supabase MCP must be connected with a project selected. If MCP tools are unavailable, STOP and tell the human to authenticate Supabase MCP. Do not invent a fake local-only DB.

YOUR ONLY JOB:
1) Via Supabase MCP (or approved SQL path in the Supabase skill), create:
   - extension vector
   - tables: brand_profiles, brand_assets, brand_chunks, user_preferences (columns per doc 18)
   - RLS policies: owner-only; assets/chunks via profile ownership
   - private Storage bucket brand-assets with INSERT+SELECT+UPDATE for owners
   - confirm Auth email/password is the intended method; document any dashboard toggle the human must enable
2) Add apps/web deps: @supabase/supabase-js, @supabase/ssr (and only other packages strictly required for clients/middleware).
3) Create apps/web/lib/supabase/browser.ts, server.ts, and Next middleware/session wiring so server components and route handlers can read the user session.
4) Add env example keys: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY. If a service role is required for ingest later, document it as server-only and do not expose it to the client. Do not commit real secrets.
5) Add a tiny typed helper module stub apps/web/lib/brandProfile/types.ts for structured field shape + asset kinds (no full ingest yet).

OUT OF SCOPE:
- Auth UI pages
- Brand profile CRUD UI
- Home picker
- PDF/PPTX ingest
- Chat prompt / probe_brand changes
- Jeff wiki/graph

DONE WHEN:
- Schema + RLS + bucket exist on the linked Supabase project
- apps/web can create a server/browser Supabase client from env
- Middleware refreshes/reads session without breaking existing routes
- List exact SQL/objects created and any human dashboard steps remaining
```

### Notes for the human

- Foundation only. Do not start B until A reports schema + clients ready.
- If Auth email/password is disabled in the dashboard, enable it before Agent B.

---

## Agent B — Auth UI + Brand profiles CRUD

### Paste this

```text
You are implementing Agent B of the jgpt Brand profiles delivery.

READ FIRST (required):
- raw/agent-handoff/18-brand-profiles-what-we-are-doing.md
- apps/web/lib/supabase/* (from Agent A)
- apps/web/lib/brandProfile/types.ts
- apps/web/components/AppNav.tsx
- apps/web/lib/i18n/messages.ts (add keys; keep tone consistent; ZH 口语化 for new ZH strings)
- apps/web/app/globals.css / existing page layout patterns (match current product chrome; do not invent a new visual system)

YOUR ONLY JOB:
1) Auth UI at /auth (or equivalent): email/password sign up, sign in, sign out. Wire to Supabase Auth. Show clear errors.
2) Brand profiles manage surfaces:
   - /brand-profiles list + create (name required)
   - /brand-profiles/[id] edit: name, structured fields form, active_brief textarea, save
3) APIs or server actions (your choice, keep secure with RLS + session):
   - list/create/rename/delete profiles (owner only)
   - get/update structured + active_brief
   - get/set user_preferences.last_active_profile_id
4) AppNav: show auth state, link to Brand profiles, sign out.
5) Empty states: no profiles yet → create first profile CTA.

Do NOT implement file upload/extract/embed in this agent. You may show a disabled "Documents" section placeholder that says Agent D will wire uploads, OR leave a clear TODO panel. Prefer a simple Documents placeholder over a fake uploader.

OUT OF SCOPE:
- Home recommend logic changes
- Tool chat brandProfileId wiring (Agent C/E)
- PDF/PPTX parsing
- probe_brand
- Jeff doctrine files

DONE WHEN:
- Human can sign up/in/out
- One account can create multiple Brand profiles and edit fields/brief
- last_active_profile_id can be saved
- Nav links work
- Summarize routes and API paths added
```

### Notes for the human

- After B, manually create two profiles on one account to prove multi-profile before C.

---

## Agent C — Home profile gate + tool handoff

### Paste this

```text
You are implementing Agent C of the jgpt Brand profiles delivery.

READ FIRST (required):
- raw/agent-handoff/18-brand-profiles-what-we-are-doing.md
- apps/web/components/ChatShell.tsx
- apps/web/lib/modules/homeHandoff.ts
- apps/web/components/tools/ModuleWorkspace.tsx
- apps/web/components/tools/ModuleChatShell.tsx
- apps/web/app/tools/page.tsx
- apps/web/app/tools/[moduleId]/page.tsx
- Brand profiles list/preference APIs from Agent B

YOUR ONLY JOB:
1) Home requires an active Brand profile before opening a tool:
   - If signed out: CTA to /auth; block tool card navigation into chat.
   - If signed in with zero profiles: CTA to create one.
   - If signed in with profiles: visible picker; default to last_active_profile_id; selecting updates preference.
2) When opening a recommend tool card (or any home→tool link), include profile=<uuid> in the URL and keep existing from=home&q= handoff behavior.
3) Tool workspace/chat:
   - Resolve profile from query param, else last_active preference.
   - If missing/unauthorized, redirect home with a clear message. Do not start module chat without a valid owned profile.
4) /tools catalog entry into a module uses the same gate.
5) Pass brandProfileId through the client chat request shape as far as ModuleChatShell/postChat (extend types if needed). If /api/chat does not enforce it yet, leave a clear TODO comment for Agent E, but the client MUST already send brandProfileId.

OUT OF SCOPE:
- Ingest/upload pipeline
- System prompt USER_BRAND_FACTS injection and probe_brand (Agent E)
- Reworking recommend ranking
- Visual redesign of home beyond the picker/gate

DONE WHEN:
- Cannot open a tool chat without auth + selected profile
- Handoff URL contains profile id
- Switching profiles on home changes which id is sent
- List files changed
```

### Notes for the human

- Spot check: with profile A selected, open IG Reel tool; URL has profile A. Switch to profile B on home; open again; URL has profile B.

---

## Agent D — Ingest pipeline (PDF / PPTX / text) + documents UI

### Paste this

```text
You are implementing Agent D of the jgpt Brand profiles delivery.

READ FIRST (required):
- raw/agent-handoff/18-brand-profiles-what-we-are-doing.md
- apps/web/lib/brandProfile/types.ts
- Brand profile detail page from Agent B (/brand-profiles/[id])
- Supabase Storage bucket brand-assets + tables brand_assets / brand_chunks from Agent A
- apps/web/lib/openai.ts / getOpenAIConfig (reuse OpenAI key for embeddings + brief summarize; do not invent a second provider)

YOUR ONLY JOB:
1) Documents UI on /brand-profiles/[id]: upload PDF, PPTX, txt/md; paste text box; list assets with status pending/ready/failed; delete asset.
2) Server ingest pipeline:
   - Store original in Storage under {userId}/{profileId}/{assetId}
   - Extract text (PDF by page, PPTX by slide, plain text as-is)
   - Enforce quotas from doc 18 (~40MB/file, capped assets + extract chars). Fail clearly over quota.
   - Chunk with source_label (page/slide), write brand_chunks, write embeddings (pgvector)
   - LLM summarize into structured fields (fill gaps, do not blindly wipe user edits if fields already populated: merge carefully) + regenerate active_brief with hard ~2.5k char cap
   - Mark asset ready/failed with error_message
3) Re-summarize action: rebuild brief from ready assets + current structured fields.
4) Never put full extract into any chat prompt path in this agent. Chat wiring is Agent E.
5) Keep work async enough that the upload request does not need to embed a 2GB corpus in one HTTP body. Prefer: create asset → process in route/job steps with clear status polling or refresh.

OUT OF SCOPE:
- Home picker (Agent C)
- probe_brand tool loop (Agent E) beyond ensuring chunks are queryable
- Jeff teaching ingest
- Changing Auth

DONE WHEN:
- PDF and PPTX and paste can reach ready
- active_brief updates and is editable afterward
- chunks+embeddings exist for ready assets
- Over-quota upload fails safely
- Document how to run a manual smoke (one PDF, one PPTX, one paste)
```

### Notes for the human

- Heaviest agent. If context pressure hits, split only as D1 (upload+extract+chunks) then D2 (embeddings+summarize+UI polish) using the same brief.

---

## Agent E — Chat grounding: USER_BRAND_FACTS + probe_brand + slot skip

### Paste this

```text
You are implementing Agent E of the jgpt Brand profiles delivery.

READ FIRST (required):
- raw/agent-handoff/18-brand-profiles-what-we-are-doing.md
- apps/web/app/api/chat/route.ts
- apps/web/lib/chatTypes.ts
- apps/web/lib/chatClient.ts
- apps/web/lib/systemPrompt.ts
- apps/web/lib/modules/modulePrompt.ts
- apps/web/lib/openai.ts (clone the probe_jeff tool-loop pattern)
- apps/web/lib/modules/qualityRuntime/* (Collect slot behavior)
- apps/web/components/tools/ModuleChatShell.tsx (ensure brandProfileId is sent)
- Brand brief/chunk loaders from Agents A/D

YOUR ONLY JOB:
1) /api/chat requires authenticated user + brandProfileId for the student product path; verify the profile is owned by the user; load active_brief + structured summary.
2) Inject a capped USER_BRAND_FACTS block into the system prompt. Label clearly: user-supplied brand facts, NOT Jeff doctrine. Hard char budget. Never attach full asset extracts.
3) Add probe_brand({ query }) tool parallel to probe_jeff:
   - Search brand_chunks for that profile only (vector and/or keyword)
   - Return 2 to 4 short excerpts under a hard char budget
   - Max 2 brand probe tool calls per turn
   - Prompt rules: when to call vs when to use probe_jeff
4) Response UI: brand materials must not reuse Jeff graph source ids. Add separate brand source chips/metadata on assistant messages when brand excerpts were used.
5) Quality-runtime / module overlay: if profile structured fields already provide audience/offer/niche/proof/stance/founder face, treat them as known in Collect and ask only for gaps.
6) Keep Jeff closed-doctrine wall intact. No open-web RAG. No writing brand text into jeff-wiki.

OUT OF SCOPE:
- Building Auth/profile CRUD UI (A/B)
- Home picker UX (C) except consuming brandProfileId already sent
- Replacing PDF extractors (D)
- Home recommend ranking changes

DONE WHEN:
- Chat with an active profile stays on that client's niche across a new tool thread
- Asking for a detail only present in an uploaded deck causes probe_brand (or equivalent retrieval) rather than hallucination
- Prompt inspection / logging proves full PDFs are not dumped into the system prompt
- Jeff Sources remain Jeff-only; brand chips are separate
- Collect does not re-ask filled profile fields
- Summarize files changed and any follow-up smokes added
```

### Notes for the human

- Run last. Verify with two profiles and one uploaded deck before accepting.

---

## Optional micro-split (only if an agent hits context pressure)

| Split | Use when |
| --- | --- |
| A1 / A2 | A1 = SQL/RLS/Storage via MCP; A2 = apps/web clients/middleware/env |
| D1 / D2 | D1 = upload + extract + chunks + status UI; D2 = embeddings + summarize/merge + re-summarize |
| E1 / E2 | E1 = load brief + USER_BRAND_FACTS + require brandProfileId; E2 = probe_brand tool + chips + Collect skip |

Do not merge A+B+C into one agent. Do not merge D+E.

---

## After all agents

Use the checklist at the bottom of doc 18. Suggested smoke path:

1. Sign up → create Brand profile "Client A" and "Client B".
2. On Client A, upload a short PDF or PPTX + paste a proof line; wait until ready; confirm brief looks right.
3. Home: select Client A → open a tool → confirm URL has profile id → chat should use Client A niche.
4. Ask for a detail that exists only in the upload → should retrieve brand material, not invent Jeff doctrine.
5. Home: switch to Client B → open same tool → niche follows Client B.
6. Confirm Jeff Sources chips never show Storage filenames as graph node ids.
