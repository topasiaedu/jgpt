# What we are doing: Artemo-style user flow (Influence Engine Coach)

**Audience:** builders / implementer agents  
**Store:** `raw/agent-handoff/` (builder only)  
**Updated:** 2026-09-10  
**Do not ingest into jeff-graph.**

> **BUILDER ONLY / NOT JEFF TEACHING.**  
> This brief locks the **user flow** for `apps/web`. It is not doctrine, not student curriculum, and must never be copied into `jeff-wiki` / `jeff-graph`.

Read this before any implementation prompt in `06-artemo-flow-agent-prompts.md`.

Related briefs (keep intact; do not overwrite):

| File | Role vs this brief |
| --- | --- |
| `01-what-we-are-doing.md` / `02-…` | Module packs + Tools product; still valid for catalog/packs |
| `03-ui-redesign-what-we-are-doing.md` / `04-…` | Brand shell, ZH chrome, tokens (keep). **Stage-first front door IA in 03/U2 is superseded by this doc** |

---

## One-line goal

Make Influence Engine Coach match the **correct Artemo-style flow** Stanley locked on 2026-09-10: home asks what IP content to make today, recommends 2 to 4 tools, user opens a **fresh tool chat**, clarify then deliver. All Tools is a category card wall. Chat-first only. No stage journey as the default front door.

---

## Locked product flow (authoritative, 2026-09-10)

```text
1. Home / Dashboard (`/`)
   Ask: 「今天要做什么 IP 内容？」
   User answers in free chat.

2. Recommend tools
   From that answer, suggest 2 to 4 relevant Jeff IP tools
   (cards / buttons with deep links).
   Not a forced curriculum or stage journey.

3. User picks a tool
   Opens `/tools/[moduleId]` as a **new tool chat**
   (fresh thread; not mixed with home history).

4. Tool chat opener
   Initial assistant message stays conversational
   (what do you want to create with this tool today /
   tool-specific first question from pack `chatOpener`).

5. Clarify then deliver
   User replies → AI asks a few follow-ups (1 to 2 per turn)
   until enough → produce the deliverable in the **same** tool chat.

6. All Tools (`/tools`)
   Separate page: full tool card wall by category
   (Artemo-like). Search OK.
   No stage-first hero lecture as primary UX.

7. Keep forever
   Closed Jeff doctrine, probe, sources chip,
   ZH-main chrome + multilingual, Influence Engine Coach branding,
   chat-first (NO intake forms).
```

### Explicitly wrong / replace

| Wrong (current emphasis) | Replace with |
| --- | --- |
| Stage-check as default front door | Home question: 今天要做什么 IP 内容？ |
| Stage-first tools wall as primary IA | Category card wall (browse / search) |
| Form intake | Conversational slots only |
| Long curriculum-style onboarding before create | Short optional intro → chat opener → clarify → deliver |

IP Stage Check remains a **valid tool** in the catalog. It is not the default gate.

---

## Brand / i18n reminders (unchanged)

From the U1 to U3 redesign (still in force):

- Product name: **Influence Engine Coach**
- UI chrome **main = Chinese**; EN (+ multilingual) via existing i18n
- Chat replies still follow Jeff voice / language-match rules (not chrome locale alone)
- Brand tokens: orange CTA `#F36B21`, paper cream, Manrope + Noto Sans SC
- Soft webinar footer only → `https://webinar.influenceengine.co/opt-in` (no scarcity)
- No dash punctuation in user-facing copy (em/en dash or hyphen-as-punctuation)

---

## Current vs target IA

### Routes

| Route | Current (wrong primary story) | Target (locked) |
| --- | --- | --- |
| `/` | Free chat; empty state pushes **IP Stage Check** + fixed tool chips | **Dashboard:** ask「今天要做什么 IP 内容？」; after answer, **recommend 2 to 4 tools** as clickable cards |
| `/tools` | Stage hero (“你卡在哪一步”) → featured journey → rails | **All Tools:** category card grid only (search OK). Featured strip optional/small, not a journey |
| `/tools/[moduleId]` | Intro optional → module chat (good core) | Same chat-first core; **fresh thread per open**; opener tool-scoped; optional `?from=home&q=…` context; clarify then deliver |

### Nav

Target primary nav: **Ask / Home · All Tools** (wording via i18n).  
“Start here → IP Stage Check” as the primary onboarding path is **demoted**. Stage Check can appear as a normal card or occasional suggestion when the user’s goal fits.

---

## How recommend works

### Mental model

1. User states intent on home free chat (no `moduleId`).
2. Assistant (home / recommend mode) picks **2 to 4** module ids from the real catalog that fit the intent.
3. UI renders those as **link cards / buttons** to `/tools/[moduleId]` (optionally with context query params).
4. User may ignore recommendations and keep chatting, or open All Tools to browse.

### Implementation shape (prefer clean structured)

Prefer a **small structured channel** over fragile markdown scraping:

- Extend home (no `moduleId`) so the model can return tool suggestions, e.g. a typed field on the chat response such as `recommendedModuleIds: string[]` (validate against `MODULE_CATALOG` / ready packs only), **or** a constrained JSON side-channel the client already knows how to parse.
- Fallback: parse markdown deep links only if structured work is too large for the phase; document the choice in the PR/reply.

Do **not** invent module ids outside the catalog. Do **not** force a fixed 3-tool curriculum.

### Catalog source of truth

- Definitions / categories: `apps/web/lib/modules/catalog.ts`
- Packs / openers / overlays: `apps/web/lib/modules/packs/`, `modulePrompt.ts`
- Home empty-state / chips today: `apps/web/components/ChatShell.tsx` (stage-primary chips to demote)
- API: `apps/web/app/api/chat/route.ts`, types in `apps/web/lib/chatTypes.ts`

---

## Tool chat session model

| Rule | Detail |
| --- | --- |
| Fresh thread | Opening a tool starts a **new** chat. Do not append home messages into the tool transcript as one continuous thread. |
| Opener | Seed first assistant turn from pack `chatOpener` (conversational, tool-scoped). No API call until user replies (current `ModuleChatShell` pattern). |
| Context from home | Optional query params, e.g. `?from=home&q=…` (URL-encoded short intent). Tool may use `q` to personalize the first question or as a silent system hint; still **not** a form. |
| Clarify then deliver | Overlays already say ask 1 to 2 questions per turn then deliver; reinforce in home→tool handoff and QA. Deliverable stays in the same tool chat. |
| Remount | Navigating away and back to a module should not silently resume an old in-memory thread unless product later adds explicit history (out of scope). Current `useState` seed on mount is the right default; ensure keying/remount if soft navigation reuses the component incorrectly. |

---

## What to keep from existing code

| Keep | Notes |
| --- | --- |
| Module packs + `chatOpener` / `intakeFields` as internal slots | Chat-first; no form UI |
| `modulePrompt.ts` overlays + probe hints | Jeff-distinctive rewrite rules |
| Closed doctrine + fresh probe + sources chip | Unchanged architecture |
| Brand tokens, fonts, AppNav/AppFooter, i18n | From U1 to U3 |
| Soft webinar footer | No scarcity |
| `POST /api/chat` with optional `moduleId` | Extend carefully for recommend mode |
| Optional short intro modal | Skip remembered; not a long curriculum |
| Category ladder in catalog | Fine as **browse grouping** on All Tools, not as a forced journey |

Runtime (conceptually unchanged):

```text
ChatShell (home, recommend) → POST /api/chat (no moduleId)
ModuleChatShell (tool) → POST /api/chat (moduleId + overlay) → probe → reply + sources
```

---

## What to strip / simplify

| Strip or demote | Where |
| --- | --- |
| Stage hero as primary Tools UX (“你卡在哪一步” / stage CTA) | `ToolsGrid.tsx`, tools i18n strings, `STAKEHOLDER.md` / `README.md` |
| Empty-state primary chip forcing IP Stage Check | `ChatShell.tsx`, `AppNav.tsx` “Start here” if it is the main path |
| Journey framing (featured trio as curriculum steps) | Featured may shrink to optional strip or disappear |
| ModuleWorkspace / tools chrome that over-emphasizes stage rails as the product story | Keep category label; drop stage-journey copy |
| Any leftover intake form gate | Must stay gone |

Do **not** delete the `ip-stage-check` pack. Demote it from front-door status only.

---

## Success criteria

- Home leads with「今天要做什么 IP 内容？」(or equivalent ZH-primary string); user can answer in chat.
- After a clear intent message, user sees **2 to 4** catalog-valid tool recommendations as clickable deep links.
- Clicking a recommendation opens `/tools/[moduleId]` with a **fresh** tool chat and conversational opener.
- Clarify (1 to 2 questions/turn) then deliverable in that tool chat; sources still work.
- `/tools` is a category card wall (search OK); stage hero is gone or non-primary.
- Brand, ZH-main chrome, multilingual, closed doctrine, no intake forms.
- STAKEHOLDER + README describe this flow (not stage-first front door).

## Non-goals

- New Jeff doctrine pages or ingest from these handoffs
- Rebuilding probe / dual-store architecture
- Adding dozens of new module packs
- Auth, billing, persistent chat history DB
- Turning All Tools back into a forced stage curriculum
- Overwriting briefs `01` to `04`

---

## Related files (start here; do not dump wholesale)

| Area | Paths |
| --- | --- |
| Home | `apps/web/app/page.tsx`, `components/ChatShell.tsx` |
| All Tools | `app/tools/page.tsx`, `components/tools/ToolsGrid.tsx` |
| Tool route | `app/tools/[moduleId]/page.tsx`, `ModuleWorkspace.tsx`, `ModuleChatShell.tsx`, `ModuleIntroModal.tsx` |
| Catalog / packs | `lib/modules/catalog.ts`, `packs/`, `modulePrompt.ts`, `types.ts` |
| API / types | `app/api/chat/route.ts`, `lib/chatTypes.ts`, `lib/chatClient.ts` |
| i18n / brand | `lib/i18n/messages.ts`, `LocaleProvider.tsx`, `globals.css`, `AppNav.tsx` |
| Docs to update in F3 | `STAKEHOLDER.md`, `README.md`, short `dev-wiki/log.md` note |

---

## Phased delivery

See `06-artemo-flow-agent-prompts.md`:

| Phase | Focus |
| --- | --- |
| **F1** | Home dashboard ask + recommend 2 to 4 tools |
| **F2** | All Tools = category card wall only |
| **F3** | Tool chat clarify-then-deliver polish + home→tool context + stakeholder docs + browser QC |
