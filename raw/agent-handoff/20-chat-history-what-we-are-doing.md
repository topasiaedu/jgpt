# Chat history: what we are doing

**Date:** 2026-10-06  
**Audience:** builders / Cursor agents only  
**Label:** PRODUCT / REPO BRIEF. Not Jeff teaching IP. Not student curriculum.  
**Do not ingest into `jeff-wiki` / `jeff-graph`.**

Companion: [21-chat-history-agent-prompts.md](21-chat-history-agent-prompts.md) (paste-ready implementation prompts).

Related product wall: [18-brand-profiles-what-we-are-doing.md](18-brand-profiles-what-we-are-doing.md). Brand profiles are a separate user-data layer. Chat history stores **transcripts**, not brand doctrine. Never write chat rows into `raw/jeff`, `jeff-wiki`, or `jeff-graph`. Folders group transcripts; they are **not** Brand profiles.

---

## One-line goal

Persist **module tool chats** for signed-in users so opening a tool can resume the last thread for that module and optional Brand profile, or start a new one, with a history sidebar on the tool page. Users may group those threads into **folders** (project grouping).

---

## Why this exists

Today `ModuleChatShell` keeps messages in React state. `ModuleWorkspace` remounts the shell with a bumping `threadKey` on each module open, so every visit is a cold start plus a seeded opener. Brand profiles already ground facts when `?profile=` is present, but the dialogue itself dies on leave.

Home recommend (`ChatShell` + `/api/recommend`) is **not** a Jeff coach transcript. It only ranks tools. Do not persist home recommend as chat history.

---

## Current reality (repo + Supabase)

| Area | State |
| --- | --- |
| Tool chat UI | `apps/web/components/tools/ModuleChatShell.tsx`: in-memory `messages`; seeded assistant opener; `postChat` each turn |
| Remount | `ModuleWorkspace` `key` = module + locale + homeIntent + brandProfileId + `threadKey` |
| Chat API | `POST /api/chat`: auth required; optional owned `brandProfileId`; dialogue capped via `toDialogueOnly` / `MAX_DIALOGUE_MESSAGES` (16) |
| Types / client | `apps/web/lib/chatTypes.ts`, `apps/web/lib/chatClient.ts` |
| Brand pick | `BrandProfilePickModal`: choose profile **or continue without** (`brandProfileId` optional) |
| Auth | Supabase email/password; `requireAuthedApi` on chat |
| Supabase (Jeff GPT `lizrtckbhfswyrokiawd`) | `brand_profiles`, `brand_assets`, `brand_chunks`, `user_preferences` exist with RLS. **No** chat tables or folder tables yet |

---

## Locked decisions

| Topic | Decision |
| --- | --- |
| Scope | Persist **module tool chats only**, for **signed-in** users |
| Out of scope (v1) | Anonymous history; home recommend as transcript; free-form home Jeff coach history; Jeff wiki/graph changes |
| Thread identity | One conversation = `owner_user_id` + `module_id` + optional `brand_profile_id` (null = continue without) + ordered messages |
| Folders (UI name) | Call them **folders** in the UI. Describe them as **project grouping**: the user dumps related chats into one folder. Not a second Brand profile. |
| Folder membership | A conversation belongs to **at most one** folder (`folder_id` nullable). Ungrouped chats are the inbox: no folder. |
| Folder vs Brand | Independent. A folder may mix tools and Brand profiles. Profile stays on the conversation (`brand_profile_id`). Do not key folders by profile or module. |
| Folder CRUD | Create, rename, delete. Deleting a folder **ungroups** its chats (`folder_id` SET NULL). It does **not** delete transcripts. |
| Folder sidebar | Collapsible folder groups plus an **ungrouped** section. Default move UX: **Move to folder** menu (including Ungroup / no folder). Drag and drop is optional later, not required in v1. |
| Landing UX | Auto-resume **last updated** non-deleted thread for that `(user, moduleId, brandProfileId\|null)`. Sidebar lists others, grouped by folder. **New chat** always starts a fresh conversation, **ungrouped** (`folder_id` null). User can move it after. |
| Profile filter | When URL has `?profile=<uuid>`, history list and auto-resume use that profile only. When no profile (continue without), filter to `brand_profile_id IS NULL`. Folder groups wrap that **filtered** list; they do not bypass the profile/module filter. |
| LLM window | Keep sending only the last ~16 dialogue messages to the model (`MAX_DIALOGUE_MESSAGES`). DB stores the **full** UI transcript |
| Persist path | After each successful `postChat`, append user + assistant turn via a dedicated authenticated history API (do not overload `/api/chat` with write logic in v1) |
| Sources | Store `sources` / `brandSources` as optional jsonb on assistant rows for future UI; module chat may keep chips hidden |
| Delete conversation | Soft delete conversations (`deleted_at`). Messages ride along (not shown when parent deleted). Soft delete does not remove the folder row. |
| Rename conversation | User can rename conversation title; default title from first user message (trimmed, length-capped) |
| Delivery | Implement via Agents A to D in doc 21. Folders fold into A (schema), B (APIs), C (sidebar UI). No fifth agent. Plan-only until a human pastes those prompts. No localStorage as source of truth |

---

## Product model

**Folder** = user-owned project grouping:

- Belongs to one auth user
- Has a `name` (editable)
- Holds zero or more conversations via `conversations.folder_id`
- Global to the user: not scoped to a module or Brand profile
- UI label: **folder**. Copy may say it is for grouping chats by project.

**Conversation** = one tool thread:

- Belongs to one auth user
- Tied to one catalog `module_id`
- Optional `brand_profile_id` (FK to `brand_profiles`, or null)
- Optional `folder_id` (FK to `chat_folders`, or null). Null = ungrouped inbox.
- At most one folder. Never many-to-many in v1.
- `title` (editable)
- `updated_at` for sort / auto-resume
- Soft-deleted via `deleted_at`

**Message** = one turn:

- `role`: `user` \| `assistant`
- `content`: text
- `ordinal`: stable order within the conversation
- Optional `sources` jsonb (Jeff graph chips)
- Optional `brand_sources` jsonb (brand chips)
- Seeded opener: first assistant row may be the pack opener (same as today). Persist it when the conversation is created so reload matches what the student saw.

**URL**

- Keep existing `?profile=` and home handoff `?from=home&q=`
- Add optional `?c=<conversationUuid>` when a specific thread is open (New chat clears it; selecting a sidebar row sets it). Auto-resume without `?c` loads the latest matching thread and may replace/set `?c` via client navigation so refresh stays on the same thread.
- No folder id in the URL in v1. Folder is metadata on the conversation.

---

## Folders vs Brand profiles (do not conflate)

| | Brand profile | Folder |
| --- | --- | --- |
| Job | Ground facts for generation (`?profile=`, ingest, probe) | Group chats the user treats as one project |
| Scope | Optional per conversation; filters list/resume | Optional per conversation; does **not** filter resume |
| Mix | One profile (or none) on a thread | One folder (or none). Folder may contain mixed modules and mixed profiles |
| Delete | Existing Brand rules | Delete folder ungroups chats; transcripts stay |
| UI | Pick modal / URL | History sidebar groups + Move to folder |

The tool page still scopes the **visible chat list** to this `moduleId` plus the current profile key. Inside that list, group by folder. A folder that also has chats from other tools will only show the matching subset here. Cross-module unified inbox stays out of scope.

---

## Architecture (target)

```text
Signed-in user opens /tools/[moduleId]?profile=... (or no profile)
  → resolve auth + optional owned profile (existing)
  → history client: list conversations for (moduleId, profileKey)
  → history client: list folders for owner (all folders, not filtered by module)
  → if ?c= valid owned id → load that thread
  → else auto-resume latest non-deleted for (module, profileKey)
  → else create conversation with seeded opener message (folder_id null)
  → ModuleChatShell renders full messages from DB (not empty remount)

User sends message
  → postChat({ messages: dialogue window from client state, moduleId, brandProfileId? })
  → on success: POST append turn (user + assistant) to conversation
  → bump conversation.updated_at / title if first user message

New chat
  → create conversation + opener, folder_id null
  → clear composer state; set ?c=newId
  → do not delete old threads

Sidebar
  → filtered conversations grouped under collapsible folders
  → ungrouped section for folder_id null
  → empty folders still appear so the user can rename, delete, or move into them
  → New chat; rename/delete conversation; Move to folder
  → folder create / rename / delete
```

### Context budget (same spirit as Brand profiles)

- Never dump the full DB transcript into the model.
- Client (or a small helper) still applies `toDialogueOnly` / last 16 before `postChat`.
- History APIs return full messages for UI pagination if needed later; v1 can return the whole thread (tool chats are short in practice). Cap a hard server max (e.g. 500 messages per conversation) to prevent abuse.

---

## Supabase schema (target)

Project: **Jeff GPT** (`lizrtckbhfswyrokiawd`). Do not mutate Brand tables. Add:

### `chat_folders`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | `gen_random_uuid()` |
| `owner_user_id` | uuid NOT NULL | FK `auth.users(id)` |
| `name` | text NOT NULL | Trimmed; reject empty; length-cap in app (~80) |
| `created_at` | timestamptz | default `now()` |
| `updated_at` | timestamptz | default `now()`; touch on rename |

Names need not be unique per owner. Optional abuse cap in the API (e.g. 50 folders per user).

Indexes:

- `(owner_user_id, created_at DESC)` for list

### `chat_conversations`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | `gen_random_uuid()` |
| `owner_user_id` | uuid NOT NULL | FK `auth.users(id)` |
| `module_id` | text NOT NULL | Catalog module id (validate in app) |
| `brand_profile_id` | uuid NULL | FK `brand_profiles(id)` ON DELETE SET NULL; null = continue without |
| `folder_id` | uuid NULL | FK `chat_folders(id)` ON DELETE SET NULL; null = ungrouped inbox |
| `title` | text NOT NULL | Default `"New chat"` or first user line |
| `created_at` | timestamptz | default `now()` |
| `updated_at` | timestamptz | default `now()`; touch on append / rename / move folder |
| `deleted_at` | timestamptz NULL | soft delete |

Indexes:

- `(owner_user_id, module_id, brand_profile_id, updated_at DESC)` for list + resume (partial `WHERE deleted_at IS NULL`)
- `(folder_id)` for grouping / SET NULL on folder delete
- Note: Postgres UNIQUE with nulls: treat "no profile" as null; app filters with `IS NULL` vs `= uuid`. No unique constraint forcing one thread per triple (many threads allowed).

**Folder FK integrity:** `folder_id` must point at a folder owned by the same `owner_user_id`. Enforce in the API on create/move. Optional DB trigger or composite check if easy; do not skip the app check.

### `chat_messages`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | `gen_random_uuid()` |
| `conversation_id` | uuid NOT NULL | FK `chat_conversations(id)` ON DELETE CASCADE |
| `ordinal` | int NOT NULL | `>= 0`; unique per `(conversation_id, ordinal)` |
| `role` | text NOT NULL | check `user` \| `assistant` |
| `content` | text NOT NULL | |
| `sources` | jsonb NULL | Jeff sources array |
| `brand_sources` | jsonb NULL | Brand sources array |
| `created_at` | timestamptz | default `now()` |

### RLS

- Owner-only on `chat_folders`: `owner_user_id = auth.uid()`.
- Owner-only on conversations: `owner_user_id = auth.uid()`.
- Messages: allow through join `conversation_id IN (SELECT id FROM chat_conversations WHERE owner_user_id = auth.uid())`.
- Soft-deleted conversations: still owned; APIs exclude them from list/get unless undoing delete (v1: no undelete UI).
- If `brand_profile_id` is set, app still verifies ownership on create (same as chat). RLS does not need to re-check profile ownership if FK + app checks hold; optional tighter policy can require the profile's `owner_user_id = auth.uid()`.
- Folder delete is a hard delete of the folder row. Conversations remain; `folder_id` becomes null via `ON DELETE SET NULL`.

---

## API (target)

All routes require `requireAuthedApi()`. Prefer App Router handlers under `apps/web/app/api/chat-history/` (name can be `conversations` if clearer).

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/api/chat-history?moduleId=&brandProfileId=` | List non-deleted conversations for user+module; `brandProfileId` omitted or empty means `IS NULL` filter. Return id, title, updated_at, brand_profile_id, **folder_id** |
| `POST` | `/api/chat-history` | Create conversation: body `{ moduleId, brandProfileId?, title?, openerContent }`. Insert opener as ordinal 0 assistant. `folder_id` null. Return conversation + messages |
| `GET` | `/api/chat-history/[id]` | Get conversation + messages ordered by ordinal (404 if not owned or soft-deleted) |
| `PATCH` | `/api/chat-history/[id]` | Rename `{ title }` and/or soft-delete `{ deleted: true }` and/or move `{ folderId: uuid \| null }` (null ungroups). Verify folder exists and is owned when uuid. Touch `updated_at` on move. |
| `POST` | `/api/chat-history/[id]/messages` | Append after successful chat: `{ userContent, assistantContent, sources?, brandSources? }`. Server assigns next ordinals; updates `updated_at`; if title still default and userContent present, set title from first user line (cap ~80 chars) |
| `GET` | `/api/chat-history/folders` | List owner folders (id, name, created_at, updated_at) |
| `POST` | `/api/chat-history/folders` | Create `{ name }`. Return folder |
| `PATCH` | `/api/chat-history/folders/[id]` | Rename `{ name }` |
| `DELETE` | `/api/chat-history/folders/[id]` | Delete folder row. Conversations ungroup. 404 if not owned |

Client helpers: `apps/web/lib/chatHistory/clientApi.ts` (mirror brand profile client style). Include folder helpers next to conversation helpers.

**Not in v1:** streaming persistence inside `/api/chat`; server-side automatic save from the chat route (allowed later as a polish if append races appear); nested folders; sharing folders; drag and drop.

---

## UI (target)

Match dark studio chrome (`shell-studio`, `shell-studio-chat`). Generous spacing. No "Active profile" confusion: the history sidebar is **scoped to the profile key of this tool open** (URL profile or null), not a second global picker. Folders are extra grouping **inside** that scoped list.

### Tool page layout

- Left (or collapsible): conversation list + **New chat**
- Folders as **collapsible groups**. One **Ungrouped** section for chats with no folder (inbox).
- Empty folders still show as empty groups (user can rename, delete, or move chats into them).
- Main: existing module message list + composer (`ModuleChatShell`)
- List item: title, relative `updated_at`; overflow menu: rename, delete, **Move to folder** (pick a folder or Ungroup)
- Folder overflow: rename folder, delete folder (copy must say chats stay, they return to Ungrouped)
- Loading: brief status while list/thread hydrates; do not flash empty opener then replace without care (prefer load-then-show or skeleton)

### Behavior changes vs today

- Stop treating every land as a hard empty remount that throws away persistence. `threadKey` remount remains useful for New chat / locale change, but resume path loads DB state into the shell (pass `initialMessages` + `conversationId` props).
- `brandProfileId` remains optional per open; history keys off that choice. Folder membership does not change resume keying.
- Unsigned users: existing auth redirect on tool routes stays; no anonymous history.

### i18n

Add zh/en strings for New chat, history empty, rename, delete confirm, load errors, folders, Ungrouped, Move to folder, create/rename/delete folder, and the delete-folder warning that chats are kept. Ban dash punctuation in student-facing copy.

---

## App integration points

| Area | Paths |
| --- | --- |
| Shell | `ModuleChatShell.tsx`, `ModuleWorkspace.tsx` |
| Tool page | `apps/web/app/tools/[moduleId]/page.tsx` |
| Chat API (unchanged contract) | `apps/web/app/api/chat/route.ts` |
| Dialogue cap | `apps/web/lib/dialogue.ts` (`MAX_DIALOGUE_MESSAGES = 16`) |
| Auth helper | `apps/web/lib/brandProfile/apiAuth.ts` |
| Profile resolve | `apps/web/lib/brandProfile/resolveToolBrandProfile.ts` |
| Styles | `apps/web/app/globals.css` (studio tokens) |
| New | `apps/web/app/api/chat-history/**`, `apps/web/lib/chatHistory/**` |

---

## In scope / out of scope

### In scope

- Schema + RLS for `chat_folders` / `chat_conversations` / `chat_messages`
- History CRUD APIs with auth, including folder CRUD and move (`folderId`)
- Wire `ModuleChatShell` / `ModuleWorkspace`: list, auto-resume, New chat, append after successful turn
- Sidebar: collapsible folders, ungrouped inbox, Move to folder
- Rename + soft delete conversations
- Create, rename, delete folders (delete ungroups)
- Optional `?c=` deep link
- Store sources jsonb; UI may still hide chips

### Out of scope

- Anonymous / localStorage history
- Persisting home recommend as chat
- Changing Brand profile ingest, `probe_brand`, or Jeff graph
- Treating folders as Brand profiles or filtering resume by folder
- Nested folders, shared folders, folder in the URL
- Drag and drop (optional later)
- Infinite LLM context (keep 16-message window)
- Cross-module unified inbox (v1 is per-tool sidebar only; folders are global but the visible list stays filtered)
- Real-time multi-device sync polish beyond normal refetch
- Git commit unless the human asks

---

## Suggested agent split (see doc 21)

| Agent | Focus |
| --- | --- |
| A | Schema + RLS: conversations, messages, **folders**, `folder_id` FK |
| B | History APIs + typed client helpers, including **folder CRUD** and PATCH `folderId` |
| C | Wire ModuleWorkspace / ModuleChatShell (resume, New chat, append) **and** sidebar folder groups + Move to folder + folder create/rename/delete |
| D | Sidebar polish, conversation rename/delete, `?c=`, i18n, CSS (including folder chrome) |

Order: **A → B → C → D**. No Agent E. Folders are not a separate delivery.

---

## Definition of done (human check)

- [ ] Signed-in user opens a tool with a profile, chats, leaves, returns with same `?profile=`, sees the last thread
- [ ] Continue without profile keeps a separate null-profile history for that module
- [ ] New chat starts a fresh opener thread, ungrouped; old threads remain in the sidebar
- [ ] Soft delete hides a thread from the list
- [ ] Rename updates the sidebar title
- [ ] User can create a folder, rename it, and delete it
- [ ] Move to folder puts a chat in a folder; Ungroup returns it to the inbox
- [ ] Deleting a folder leaves the chats in Ungrouped; transcripts are not deleted
- [ ] Sidebar shows collapsible folder groups plus Ungrouped, still filtered by this tool + profile key
- [ ] A folder may contain chats from mixed tools/profiles in the DB; this tool page only lists the matching subset
- [ ] `/api/chat` still receives only a capped dialogue window; long threads still answer using the last ~16 messages
- [ ] Full transcript remains in DB for UI
- [ ] Unsigned users still cannot use tool chat history
- [ ] Nothing written into `jeff-wiki` / `jeff-graph`

---

## Prerequisite before agents start

1. Brand profiles delivery usable enough that tool auth + optional `?profile=` already work.
2. Supabase MCP authenticated against Jeff GPT (`lizrtckbhfswyrokiawd`).
3. Human pastes Agents A to D from doc 21 one at a time. Do not implement from this brief alone in a mega-agent.

