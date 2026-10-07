# Chat history: implementation agent prompts

**Date:** 2026-10-06  
**Audience:** human pasting into Cursor agents  
**Label:** BUILDER PROMPTS. Not Jeff teaching IP.  
**Do not ingest into `jeff-wiki` / `jeff-graph`.**

Companion brief (required reading for every agent): [20-chat-history-what-we-are-doing.md](20-chat-history-what-we-are-doing.md)

Brand wall (do not break): [18-brand-profiles-what-we-are-doing.md](18-brand-profiles-what-we-are-doing.md)

## How to use

1. Confirm Supabase MCP is authenticated. Target project: **Jeff GPT** (`lizrtckbhfswyrokiawd`).
2. Run agents **in order A → B → C → D**.
3. Paste **one** agent block per new chat. Do not paste all four into one agent.
4. Each agent must re-read doc 20. Do not rely on prior chat memory across agents.
5. Model budget assumption: ~200k context. Prefer targeted reads. Do not crawl `raw/jeff/**`.
6. Do not commit unless the human asks.
7. Do not implement Brand profile ingest or Jeff wiki/graph work under these prompts.
8. Folders are part of A, B, and C. Do not spawn a fifth agent for folders.

## Shared hard rules (every agent)

- Chat history is **user transcript data**, not Jeff doctrine. Never write rows or exports into `raw/jeff`, `jeff-wiki`, or `jeff-graph`.
- Ban dash punctuation in student-facing prose (em/en dash, spaced hyphen as punctuation). Prefer period, comma, colon, or a new sentence. Hyphens inside code/paths/ids are fine.
- Match existing `apps/web` TypeScript style. Prefer double quotes for strings in new TS. No `any`. No non-null assertion `!`. No `as unknown as T`.
- Keep `MAX_DIALOGUE_MESSAGES` (16) as the LLM window. DB holds the full UI transcript.
- Brand profile remains **optional** per tool open. Null profile threads must not mix with profile threads in list/resume filters.
- Folders are **not** Brand profiles. Do not key list/resume by folder. A conversation has at most one `folder_id` (nullable). Deleting a folder ungroups chats; it must not delete transcripts.
- UI copy: use the word **folders**. Describe them as project grouping when a short explanation helps.
- Do not mutate existing Brand tables except adding an FK from `chat_conversations.brand_profile_id` to `brand_profiles(id)`.

---

## Agent A: Schema + RLS

### Paste this

```text
You are implementing Agent A of the jgpt chat history delivery.

READ FIRST (required):
- raw/agent-handoff/20-chat-history-what-we-are-doing.md
- .cursor/mcp.json
- Confirm existing public tables via Supabase MCP on project lizrtckbhfswyrokiawd (brand_profiles etc.). Do not drop or alter Brand columns except adding the FK reference from the new conversations table.

PREREQ: Supabase MCP must work against Jeff GPT (lizrtckbhfswyrokiawd). If unavailable, STOP and tell the human to authenticate. Do not invent a fake local-only DB.

YOUR ONLY JOB:
1) Create tables per doc 20:
   - chat_folders (id, owner_user_id FK auth.users, name, created_at, updated_at)
   - chat_conversations (id, owner_user_id, module_id, brand_profile_id nullable FK brand_profiles ON DELETE SET NULL, folder_id nullable FK chat_folders ON DELETE SET NULL, title, created_at, updated_at, deleted_at)
   - chat_messages (id, conversation_id FK CASCADE, ordinal, role check user|assistant, content, sources jsonb null, brand_sources jsonb null, created_at)
   - unique (conversation_id, ordinal)
   - index for list/resume: owner_user_id, module_id, brand_profile_id, updated_at DESC where deleted_at is null
   - index chat_folders (owner_user_id, created_at DESC)
   - index chat_conversations (folder_id)
2) Enable RLS. Owner-only on folders and conversations (owner_user_id = auth.uid()). Messages via conversation ownership join. Policies for SELECT/INSERT/UPDATE/DELETE as needed (folder hard delete; conversation soft delete updates deleted_at; append inserts messages and updates conversation.updated_at). Deleting a folder must SET NULL folder_id on conversations, not cascade-delete conversations.
3) Do NOT build Next.js API routes or UI in this agent.
4) Report exact SQL/objects created and any follow-ups for the human.

OUT OF SCOPE:
- App API routes
- ModuleChatShell changes
- Brand ingest / probe_brand
- Jeff wiki/graph
- Nested folders

DONE WHEN:
- All three tables exist on lizrtckbhfswyrokiawd with RLS enabled
- folder_id ON DELETE SET NULL is in place
- A signed-in user can only read/write their own rows (describe how you verified, e.g. policy review)
```

### Notes for the human

- Foundation only. Do not start B until A reports tables + RLS ready, including `chat_folders`.

---

## Agent B: History APIs + client helpers

### Paste this

```text
You are implementing Agent B of the jgpt chat history delivery.

READ FIRST (required):
- raw/agent-handoff/20-chat-history-what-we-are-doing.md
- apps/web/lib/brandProfile/apiAuth.ts
- apps/web/lib/brandProfile/clientApi.ts (pattern to mirror)
- apps/web/lib/brandProfile/db.ts / isUuid helpers
- apps/web/lib/modules/catalog.ts (validate moduleId)
- apps/web/lib/chatTypes.ts

PREREQ: Agent A schema + RLS exist on Jeff GPT, including chat_folders and conversations.folder_id. If tables are missing, STOP.

YOUR ONLY JOB:
1) Add apps/web/lib/chatHistory/ types + server helpers (create/list/get/append/rename/soft-delete conversations; create/list/rename/delete folders; move conversation folderId) using createServerSupabaseClient / requireAuthedApi.
2) Add App Router routes under apps/web/app/api/chat-history/:
   - GET/POST /api/chat-history (list with moduleId + optional brandProfileId meaning IS NULL when omitted; create with opener, folder_id null)
   - GET/PATCH /api/chat-history/[id] (PATCH title, deleted, and/or folderId uuid|null)
   - POST /api/chat-history/[id]/messages (append user+assistant after successful chat)
   - GET/POST /api/chat-history/folders
   - PATCH/DELETE /api/chat-history/folders/[id]
3) Validate: auth required; moduleId in catalog; brandProfileId if present must be owned uuid (reuse existing ownership helpers); folderId if present must be an owned folder uuid; soft-deleted conversations return 404 on get/append; list excludes deleted. DELETE folder ungroups chats (do not delete conversation rows). Optional folder count cap per doc 20.
4) Add apps/web/lib/chatHistory/clientApi.ts for the browser, including folder helpers. List conversations must include folder_id.
5) Title rules: default "New chat" (or locale-neutral placeholder string documented); on first user append, set title from trimmed userContent capped ~80 chars if still default. Folder name: trim, reject empty, cap ~80.
6) Do not change ModuleChatShell UI yet beyond exporting types if needed. Do not change /api/chat persist behavior.

OUT OF SCOPE:
- Sidebar UI
- Auto-resume wiring in ModuleWorkspace
- Schema migrations beyond tiny fixes if Agent A missed a column (prefer fix via MCP, document it)

DONE WHEN:
- Routes respond correctly for happy path + 401/403/404
- Client helpers exist and match response shapes
- List filter distinguishes profile uuid vs null (continue without)
- Folder create/rename/delete and Move (PATCH folderId) work; delete folder leaves conversations with folder_id null
```

### Notes for the human

- APIs only, including folders. Start C after list/create/get/append and folder CRUD work.

---

## Agent C: Wire ModuleChatShell, resume, New chat, folder sidebar

### Paste this

```text
You are implementing Agent C of the jgpt chat history delivery.

READ FIRST (required):
- raw/agent-handoff/20-chat-history-what-we-are-doing.md
- apps/web/components/tools/ModuleChatShell.tsx
- apps/web/components/tools/ModuleWorkspace.tsx
- apps/web/app/tools/[moduleId]/page.tsx
- apps/web/lib/chatClient.ts
- apps/web/lib/dialogue.ts (MAX_DIALOGUE_MESSAGES = 16; keep using capped history for postChat)
- apps/web/lib/chatHistory/clientApi.ts (from Agent B)

PREREQ: Agent B APIs available, including folders. If not, STOP.

YOUR ONLY JOB:
1) Extend ModuleChatShell (or a thin parent) to accept conversationId + initialMessages from persistence. On successful postChat, call append messages API with user + assistant (include sources/brandSources in payload even if UI hides chips).
2) On tool land (signed-in, ready module): load history list for moduleId + current brandProfileId|null AND load owner folders; if ?c= valid load that thread; else auto-resume latest updated; else create conversation with current chatOpener as ordinal 0 assistant (folder_id null).
3) New chat control: create conversation + opener, ungrouped, switch shell to that thread (remount key ok), update ?c=.
4) Sidebar must group the filtered conversation list:
   - collapsible folder groups (show empty folders too)
   - Ungrouped section for folder_id null
   - Move to folder menu on a conversation (pick folder or Ungroup). Drag and drop is out of scope.
   - Create folder, rename folder, delete folder. Delete-folder confirm must say chats are kept and return to Ungrouped.
5) Keep brandProfileId optional. Do not send brandProfileId to /api/chat when continuing without. Do not treat folders as profiles or change resume keying.
6) Still send only a dialogue window to postChat (last 16 role/content). Full messages stay in React state / DB for UI.
7) Conversation rename/delete polish can wait for Agent D if time is tight, but selection + resume + append + folder grouping + Move to folder + folder CRUD must work.

OUT OF SCOPE:
- Conversation soft delete / rename polish (Agent D) unless trivial
- Drag and drop
- Home ChatShell recommend persistence
- Anonymous users
- Jeff wiki/graph
- Cross-module inbox (other tools' chats in a folder stay hidden on this tool page)

DONE WHEN:
- Leave and return to the same tool+profile resumes the last thread
- New chat starts a fresh opener without wiping other threads in the list
- Failed postChat does not append a partial assistant turn
- User can put chats in folders, ungroup them, and delete a folder without losing transcripts
```

### Notes for the human

- Core UX including folders. Agent D polishes chrome, conversation rename/delete, and i18n if C shipped a working but rough sidebar.

---

## Agent D: Polish: sidebar, rename, delete, i18n, CSS

### Paste this

```text
You are implementing Agent D of the jgpt chat history delivery.

READ FIRST (required):
- raw/agent-handoff/20-chat-history-what-we-are-doing.md
- apps/web/components/tools/ModuleWorkspace.tsx and ModuleChatShell.tsx (post Agent C)
- apps/web/app/globals.css (shell-studio patterns)
- apps/web/lib/i18n/messages.ts

PREREQ: Agent C resume + append + folder grouping working.

YOUR ONLY JOB:
1) History sidebar matching dark studio chrome: generous spacing, clear New chat, collapsible folders, Ungrouped inbox, no second "active profile" control that fights BrandProfilePickModal. Filter copy should make clear the list is for this tool open's profile key only. Folders are project grouping, not a profile picker.
2) Rename conversation (inline or small dialog) via PATCH.
3) Soft delete conversation with confirm; refresh list; if deleted thread was open, auto-resume next latest or create new.
4) Polish folder chrome: create/rename/delete folder, Move to folder, empty-folder state. Keep delete-folder copy accurate (chats ungroup, they are not deleted).
5) Stabilize ?c= in the URL on select / create / resume (client navigation without full reload storms).
6) i18n zh/en strings including folder strings; ban dash punctuation in new student-facing copy.
7) Empty/loading/error states for the sidebar. Mobile: collapsible or stacked so chat remains usable.
8) Smoke-check: profile A threads never appear when opened with profile B or with continue-without. Folder groups still respect that filter.

OUT OF SCOPE:
- Changing /api/chat model behavior
- Brand profile CRUD
- Persisting home recommend
- Drag and drop
- New schema or a fifth agent

DONE WHEN:
- Rename + soft delete conversations work end to end
- Folder grouping still works and looks intentional in studio dark UI on desktop and usable on mobile
- Definition of done checklist in doc 20 can be ticked by a human
```

### Notes for the human

- Last mile. After D, run the human checklist in doc 20 (including folders).

---

## Order summary

```text
A schema/RLS (incl. folders) → B APIs (incl. folder CRUD + move) → C ModuleChatShell wire + folder sidebar → D polish/delete/rename/i18n
```

