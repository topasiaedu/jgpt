# Brand profiles: what we are doing

**Date:** 2026-10-06  
**Audience:** builders / Cursor agents only  
**Label:** PRODUCT / REPO BRIEF. Not Jeff teaching IP. Not student curriculum.  
**Do not ingest into `jeff-wiki` / `jeff-graph`.**

Companion: [19-brand-profiles-agent-prompts.md](19-brand-profiles-agent-prompts.md) (paste-ready implementation prompts).

---

## One-line goal

Let an agency (or founder) save **many Brand profiles** under one account, pick one on home, and keep every tool chat grounded on that client's facts instead of inventing a random niche.

---

## Why this exists

Today chat only knows what the user typed in the current thread (dialogue capped at ~16 messages). Module intake / quality slots die with the session. There is no auth, no DB, no student upload path. Opening a new tool restarts cold, so the model wanders into random businesses.

Brand profiles are a **user-data layer**. They are not Jeff doctrine. Never write uploads into `raw/jeff`, `jeff-wiki`, or `jeff-graph`.

---

## Locked decisions (human confirmed)

| Topic | Decision |
| --- | --- |
| Naming | **Brand profiles** |
| Accounts | Supabase Auth, **email/password** |
| Cardinality | **One account → many Brand profiles** (agency / multi-client) |
| Default | Brand profile **on by default** for home and tool chat. No profile-off toggle in this delivery. |
| Home gate | User must **select or create** an active Brand profile **before** opening a tool from home (or entering a tool chat). |
| Ingest types | PDF, PPTX slides, txt/md, pasted text. Keynote via PDF export. |
| Context safety | Never dump raw files or full extract into the model. Always-on = capped `active_brief` + structured fields. Mid-chat deepen = `probe_brand` tool (parallel to `probe_jeff`). |
| Storage | Supabase Postgres + private Storage + `pgvector`. Repo MCP at `.cursor/mcp.json` for schema work. App env for runtime. |
| Delivery | Full stack in one product delivery (no localStorage MVP). Implement via the agent split in doc 19, not one mega-agent. |

---

## Product model

**Account** signs in with email/password.

**Brand profile** = one client workspace:

- Display name
- Structured fields (json): business/brand name, what they sell, who they serve, founder role/face, stance, proof/credentials, offer/CTA, tone notes, do-not-say
- Source assets (uploads + pastes)
- Generated `active_brief` (hard cap ~2.5k chars): what chat always sees
- Chunks + embeddings for mid-chat retrieval

**Active profile** = selected on home, stored in `user_preferences.last_active_profile_id`, and passed as `profile=<uuid>` on tool handoff URLs.

---

## Architecture (target)

```text
Home
  → sign in if needed
  → pick / create Brand profile (required)
  → create composer + recommend cards (existing)
  → open tool only with active profile
       /tools/[moduleId]?from=home&q=...&profile=<uuid>

POST /api/chat
  → require auth + owned brandProfileId
  → load active_brief + structured summary → USER_BRAND_FACTS in system prompt
  → Jeff path unchanged: probeTeaching + probe_jeff
  → new tool: probe_brand({ query }) → top chunks for that profile only

Upload / paste
  → private Storage brand-assets
  → async extract → chunk → embed → summarize structured + active_brief
  → user can edit fields/brief; save wins
```

### Context budget (2GB problem)

Raw corpora never enter the prompt.

1. Files stay in Storage.
2. Ingest is async with per-file and per-profile quotas (target: ~40MB/file, capped asset count and total extract chars).
3. Chat always gets only `USER_BRAND_FACTS` (brief + structured summary).
4. `probe_brand` returns 2 to 4 short chunks under a hard char budget; max 2 tool calls per turn (mirror `probe_jeff` / `MAX_PROBE_TOOL_CALLS`).
5. Jeff sources and brand sources stay separate in UI chips.

### Mid-chat brand probe (when the model looks deeper)

Always-on brief covers most turns. The model calls `probe_brand` when:

- User asks for a detail not in the brief (deck line, warranty, product name)
- Deliverable needs proof wording from uploaded materials
- Brief is thin for this ask
- User says "according to our deck / brand doc"

Do **not** call `probe_brand` for pure Jeff craft (use `probe_jeff`). Do **not** mix brand excerpts into Jeff citation ids.

---

## Supabase schema (target)

Enable `vector` extension.

- `brand_profiles`: `id`, `owner_user_id`, `name`, `structured` jsonb, `active_brief` text, `created_at`, `updated_at`
- `brand_assets`: `id`, `profile_id`, `kind` (`pdf` | `pptx` | `text` | `md` | `paste`), `file_name`, `storage_path`, `status` (`pending` | `ready` | `failed`), `error_message`, `created_at`
- `brand_chunks`: `id`, `profile_id`, `asset_id`, `ordinal`, `chunk_text`, `embedding` vector, `source_label` (page/slide)
- `user_preferences`: `user_id` PK, `last_active_profile_id`

RLS: owner-only (`owner_user_id = auth.uid()`); assets/chunks via profile ownership join.  
Storage bucket: `brand-assets` private; policies need INSERT + SELECT + UPDATE for upsert.

Auth: email/password enabled in Supabase dashboard (agent documents any dashboard step the human must click).

---

## App integration points (existing code)

| Area | Paths |
| --- | --- |
| Chat API | `apps/web/app/api/chat/route.ts` |
| Chat types | `apps/web/lib/chatTypes.ts` (`ChatRequestBody` gains `brandProfileId`) |
| Chat client | `apps/web/lib/chatClient.ts` |
| System prompt | `apps/web/lib/systemPrompt.ts` |
| Module overlay | `apps/web/lib/modules/modulePrompt.ts` |
| Quality runtime | `apps/web/lib/modules/qualityRuntime/*` (skip known slots from profile) |
| OpenAI tools | `apps/web/lib/openai.ts` (`probe_jeff` pattern to clone for `probe_brand`) |
| Home UI | `apps/web/components/ChatShell.tsx` |
| Tool workspace | `apps/web/components/tools/ModuleWorkspace.tsx`, `ModuleChatShell.tsx` |
| Home handoff | `apps/web/lib/modules/homeHandoff.ts` |
| Nav | `apps/web/components/AppNav.tsx` |
| Package | `apps/web/package.json` (add `@supabase/supabase-js`, `@supabase/ssr`, PDF/PPTX extract deps) |
| Supabase MCP | `.cursor/mcp.json` (already present) |

### New surfaces (target)

- `/auth` sign in / sign up (email/password)
- `/brand-profiles` list + create
- `/brand-profiles/[id]` edit fields, upload/paste, brief preview, re-summarize
- APIs under `apps/web/app/api/brand-profiles/**` (or equivalent) for CRUD, upload, paste, ingest trigger, preferences
- `apps/web/lib/supabase/{browser,server,middleware}.ts`
- `apps/web/lib/brandProfile/**` (load brief, probe chunks, quotas, summarize)

---

## Home → tools UX (target)

1. Unsigned: sign-in CTA; cannot open a tool chat without auth.
2. Signed-in with no profiles: force create first Brand profile.
3. Signed-in with profiles: picker defaults to `last_active_profile_id`; must have one selected before tool deep-link works.
4. Recommend cards and All Tools → module require active profile; else focus picker / create.
5. Handoff includes `profile=<uuid>`. Tool page validates ownership; if missing/invalid, redirect home with clear reason.

---

## Module slot behavior

When quality-runtime Collect runs, treat structured profile fields (audience, offer, niche, proof, stance, founder face) as already known. Ask only for gaps needed for that tool. Do not re-interrogate the same client every tool.

---

## In scope / out of scope

### In scope

- Supabase schema, RLS, Storage, pgvector, email/password Auth
- App Supabase clients + session middleware + env example
- Auth UI + Brand profiles CRUD + manage/upload UI
- Home profile gate + tool URL handoff + last-active preference
- Async ingest for PDF / PPTX / text / paste → chunks → embeddings → brief
- Chat: require `brandProfileId`, inject `USER_BRAND_FACTS`, `probe_brand` tool, brand source chips
- Quality-runtime / overlay skip-known-slots from profile
- Quotas and prompt budgets so large uploads cannot blow context

### Out of scope

- Jeff teaching ingest / wiki / graph changes
- Open-web RAG for Jeff doctrine
- Profile-off toggle
- localStorage as source of truth
- Magic-link-only auth (password is required; magic link optional later)
- Changing home recommend ranking logic (only gate it behind profile selection)
- Git commit unless the human asks

---

## Suggested agent split (see doc 19)

Do **not** implement this whole feature in one agent. Use Agents A → E in doc 19.

| Agent | Focus | Why this size |
| --- | --- | --- |
| A | Schema + RLS + Storage + Auth config + Supabase app clients/middleware/env | Foundation; small code surface, high blast radius if wrong |
| B | Auth UI + Brand profiles CRUD APIs + manage UI (fields/brief edit, no heavy ingest yet) | Product surfaces for accounts and profiles |
| C | Home picker gate + preference + tool handoff / redirects | UX gate; touches ChatShell + tools entry only |
| D | Upload + extract PDF/PPTX/text + chunk/embed + summarize brief + document UI | Heaviest new pipeline; keep isolated from chat brain |
| E | Chat injection + `probe_brand` + brand chips + module slot skip | Touches prompt/tool loop; needs A+D data ready |

Order: **A first**. Then **B**. **C** after B (needs list/create). **D** after A (needs tables); ideally after B so detail page can wire upload. **E** last (needs brief load + chunks + `brandProfileId` from C).

---

## Definition of done (human check)

- [ ] Sign up / sign in with email/password works
- [ ] One account can create multiple Brand profiles and switch between them
- [ ] Home blocks tool open until a profile is selected (or created)
- [ ] Active profile id appears on tool handoff URL and is sent to `/api/chat`
- [ ] Upload PDF and PPTX (plus paste) reaches `ready` and updates brief
- [ ] First chat turn uses brief only (no giant extract in prompt)
- [ ] Asking for a deck-specific detail triggers `probe_brand` (or clearly uses retrieved brand excerpts)
- [ ] Jeff Sources chips stay Jeff-only; brand materials show separately
- [ ] New tool chat does not invent a different client's niche when a profile is active
- [ ] Quality Collect does not re-ask fields already filled in the profile
- [ ] Nothing from Brand profiles was written into `jeff-wiki` / `jeff-graph`

---

## Prerequisite before agents start

1. Supabase MCP connected (`.cursor/mcp.json`) and a project selected.
2. Human can provide or confirm project URL + anon key for `apps/web` env.
3. OpenAI key already used by chat remains available for embeddings + brief summarization.
