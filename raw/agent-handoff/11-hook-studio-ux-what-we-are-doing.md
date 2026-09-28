# What we are doing: Hook Studio (Maria-shaped UX, Jeff doctrine)

**Audience:** builders / implementer agents  
**Store:** `raw/agent-handoff/` (builder only)  
**Updated:** 2026-09-28  
**Repo:** `/Users/stanley/Documents/GIthub/jgpt`  
**Do not ingest into jeff-wiki / jeff-graph.**

> **BUILDER ONLY / NOT JEFF TEACHING.**  
> This brief locks a **Hook Studio** UX pass for Influence Engine Coach: batch hook generation with shared profile + mode tabs + copyable cards, powered by **Jeff Hook Formula** (and related packs), not Maria Wendt IP. It is not doctrine, not student curriculum, and must never be copied into `jeff-wiki` / `jeff-graph`.

Read this before any implementation prompt in `12-hook-studio-ux-agent-prompts.md`.

Related briefs (do not overwrite; this brief does **not** reopen reply/recommend work):

| File | Role vs this brief |
| --- | --- |
| `09` / `10` | Reply brevity, home recommend under input, opener bullets. **Keep.** Out of scope here. |
| `07` / `08` | `/tools` journey IA. Keep; do not redesign the All Tools wall. |
| `01` / `02` | Module packs + catalog. Pack ids stay. This brief extends **Hook Formula** UX only. |

Engineering SoT for past decisions: `dev-wiki/accomplishments-and-decisions.md` and dated session pages. Prefer those over chat history when they conflict with memory.

---

## One-line goal

Give Hook Formula (`scroll-stop-hook`) a **Maria-shaped Hook Studio surface** (shared profile, mode tabs, one-shot generate, copyable cards) while keeping **Jeff doctrine**, chat-first coaching, and existing pack overlays as the brain.

---

## Why now

Stanley reviewed Maria Wendt’s public tool ([Viral Instagram Hook Writer](https://learn.coachmariawendt.com/viral-instagram-hook-writer/)) on 2026-09-28 as a **UX reference**, not a clone target.

What works in Maria’s product:

1. Step 1 shared profile (niche, credentials/proof, content topics) reused across modes.
2. Step 2 mode tabs: Generate From Scratch, Rewrite, Competitors, Tweak & Repeat Viral, Research Trends.
3. One-shot generate into a list of cards with copy.
4. Each card: hook text + short “why it works” + principle label.

What Influence Engine Coach already has (chat-first):

| Job | Existing module / pack |
| --- | --- |
| Open from idea (4 legs) | Hook Formula `scroll-stop-hook` |
| Rewrite open only | Hook Rewriter `hook-rewriter` |
| Open pattern menu | Eight Ways to Open `eight-ways-to-open` |
| Full Reel | OPENS / IG Reel Script `ig-reel-script` |
| Memorable one-liner | Memory Hook (catalog) |

**Gap:** packaging. Students get Jeff quality via conversation, but not the fast batch studio feel (profile once, pick mode, generate cards, copy).

---

## Locked product direction (Stanley, 2026-09-28)

```text
1) Reference, do not clone
   Steal product shape only. Do NOT copy Maria’s proprietary Worker prompt,
   “Maria’s Principle” labels, or viral-guarantee framing.

2) Doctrine brain = Jeff
   Primary formula: Hook Formula 对象 ＋ 痛点 ＋ 反差/结果 ＋ 好奇 (fw.hook-formula).
   Bans stay: no overnight-fame / viral-as-guarantee; content assets not ads;
   hooks serve get-seen so trust can start; no trust-breaking clickbait.

3) Home base = Hook Formula module
   Ship Hook Studio ON `/tools/scroll-stop-hook` (and EN/ZH chrome).
   Do NOT create a new catalog module named “Viral Hook Writer”.
   Do NOT redesign /tools journey IA.

4) Chat-first remains default
   Keep seeded chat opener + conversational collect.
   Hook Studio batch surface is ADDITIVE (profile + modes + generate + cards).
   Students can still refine in chat after a batch.

5) Modes (Jeff names, not Maria names)
   P0: From idea | Rewrite
   P1: Competitor angle | Repeat a hit
   P2 (optional stretch): Trend angles (thin suggestions only; no fake live scrape)

6) Output cards (locked fields)
   - hook_text
   - why_it_works (Jeff reason; must ground in Hook Formula legs or rewrite intent)
   - formula_legs (short annotate: 对象 / 痛点 / 反差或结果 / 好奇) OR rewrite_note
   - optional film_first boolean or a single “film first” marker on one card
   Copy button per hook_text.

7) Profile strip (shared across modes)
   - niche / industry (required for batch)
   - proof / credentials / story (required for batch; Jeff: real proof, not hype)
   - content topics (optional)
   Persist in sessionStorage or localStorage for the tool; do not invent a backend user DB.

8) Brand / i18n
   Influence Engine Coach tokens. ZH-main + EN via existing i18n.
   No purple/cream AI-cliché restyle. No dash punctuation in user-facing copy.
```

### Explicitly wrong

| Wrong | Right |
| --- | --- |
| New module “Viral Instagram Hook Writer” | Extend Hook Formula (`scroll-stop-hook`) |
| Copy Maria principle strings / Worker prompt | Jeff Hook Formula + existing pack overlays |
| “Guaranteed viral hooks” chrome | Scroll-stop opens that earn attention; no virality promise |
| Replacing chat with forms-only | Batch studio + chat still available |
| Rewriting all 56 packs / home recommend / tools IA | Out of scope |
| Trends mode that pretends live Instagram research | Thin angle suggestions from niche + Jeff lens, or defer to P2 |

---

## Reference architecture (Maria, for implementers)

Observed on 2026-09-28 (public page behavior; **do not copy prompt text**):

- Client posts to a Worker with `{ niche, credentials, contentType, actionType, ...extra }`.
- `actionType` values: `generate` | `rewrite` | `competitors` | `similar` | `trends`.
- Model behind their Worker was Claude Haiku; response was JSON `hooks[]` with `hook_text`, `why_it_works`, `maria_principle`.
- Exact system prompt is **server-side** and proprietary. Reconstruct **shape** only.

Our mapping:

| Maria actionType | Our mode id | Pack / overlay brain |
| --- | --- | --- |
| `generate` | `from-idea` | `scroll-stop-hook` Hook Formula |
| `rewrite` | `rewrite` | `hook-rewriter` (reuse overlay; stay on Hook Formula page) |
| `competitors` | `competitor` | New thin mode overlay append (Jeff: extract pattern → rewrite into user’s proof + standpoint). Phase H3. |
| `similar` | `repeat` | New thin mode overlay append (Jeff: vary a hit without trust-breaking clickbait). Phase H3. |
| `trends` | `trends` | Optional H3 stretch or later; thin angles only. |

---

## Current vs target (Hook Formula page)

| Surface | Current | Target |
| --- | --- | --- |
| `/tools/scroll-stop-hook` | Chat-only `ModuleWorkspace` + `ModuleChatShell` | Same page: **Hook Studio panel** (profile + modes + generate) **above or beside** chat; chat kept for refine |
| Intake | Conversational slots in overlay (`audience`, `pain`, `contrast`, `curiosity`, …) | Batch profile strip for niche/proof/topics; formula legs still collected via chat **or** inferred from mode input + profile when user hits Generate |
| Output | Prose assistant message | Prefer **structured cards** after batch generate; prose OK in pure chat turns |
| Rewrite | Separate tool `/tools/hook-rewriter` | Still exists in catalog; Hook Studio **Rewrite** mode reuses that pack’s brain **without removing** the standalone tool |
| Copy | Manual select | One-click copy on each card |

### Key files today

- `apps/web/components/tools/ModuleWorkspace.tsx`
- `apps/web/components/tools/ModuleChatShell.tsx`
- `apps/web/lib/modules/packs/scroll-stop-hook.ts`
- `apps/web/lib/modules/packs/hook-rewriter.ts`
- `apps/web/lib/modules/packs/eight-ways-to-open.ts` (reference only; do not merge into Studio in P0)
- `apps/web/lib/modules/catalog.ts` (Hook Formula + Hook Rewriter entries)
- `apps/web/lib/modules/types.ts`
- `apps/web/lib/modules/modulePrompt.ts` / `apps/web/app/api/chat/route.ts` (module chat path)
- `apps/web/lib/i18n/messages.ts`
- `apps/web/app/globals.css`

---

## UX sketch (locked enough to build)

```text
/tools/scroll-stop-hook
┌─────────────────────────────────────────────┐
│ Content · Hook Formula                      │
│ [Show intro]                                │
├─────────────────────────────────────────────┤
│ Hook Studio                                 │
│ Profile: [Niche*] [Proof*] [Topics]         │
│ Modes: [From idea] [Rewrite] (H3: +2)       │
│ Mode input: textarea                        │
│ [Generate hooks]                            │
│ Cards: hook + why + legs + [Copy]           │
├─────────────────────────────────────────────┤
│ Chat (existing)                             │
│ Seeded opener · refine · clarify            │
└─────────────────────────────────────────────┘
```

Mobile: stack Studio above chat; cards full width; modes wrap (not a desktop-only tab strip that clips).

---

## Output contract (batch generate)

When the user runs **Generate** from Hook Studio, the model (or parser) should yield **5 to 8** hooks. Preferred machine-readable shape (JSON inside the assistant turn is OK if the UI parses it; markdown fallback allowed if labeled consistently):

```json
{
  "hooks": [
    {
      "hook_text": "...",
      "why_it_works": "...",
      "formula_legs": {
        "audience": "...",
        "pain": "...",
        "contrast_or_result": "...",
        "curiosity": "..."
      },
      "film_first": false
    }
  ]
}
```

Rules:

- From idea: every hook must carry all four legs (reject incomplete).
- Rewrite: body topic preserved; opens only; no trust-breaking clickbait.
- Always mark exactly one `film_first: true` when possible.
- No “this will go viral” claims in `why_it_works` or chrome.

---

## Phases (sizing for ~200k context agents)

| Phase | Outcome | Size intent |
| --- | --- | --- |
| **H1** | Hook Studio chrome on Hook Formula: profile, From idea + Rewrite modes, generate → chat/API, **card UI** (parse best-effort) | UI-heavy; limited prompt edits |
| **H2** | Hard generation contract: overlays + reliable structured parse + copy/i18n polish for From idea + Rewrite | Prompt + parse; no new modes |
| **H3** | Competitor angle + Repeat a hit modes (Jeff overlays); optional thin Trends | Two modes only; do not reopen H1 layout |

Do **not** ask one agent to ship H1+H2+H3 together.

---

## Brand / i18n / hard product rules (unchanged)

- Product: **Influence Engine Coach**
- UI chrome ZH-main + EN via existing i18n; reply language follows UI locale lock
- Chat-first core; no global intake-form product
- No dash punctuation in user-facing copy
- TypeScript: no `any`, no non-null assertions, no `as unknown as T`; double-quoted strings
- No Turbopack at monorepo root
- Do not commit unless Stanley asks
- BUILDER ONLY: never ingest this brief into jeff-wiki / jeff-graph

---

## Out of scope (this pass)

- Home Artemo recommend / reply brevity (`09`/`10`)
- `/tools` journey redesign
- New catalog modules
- Cloning Maria Worker prompt or principle taxonomy
- Live Instagram / web trend scraping
- Auth, billing, Cloudflare Worker rewrite of our stack
- Rewriting unrelated pack openers/overlays

---

## Done when (whole initiative)

1. On `/tools/scroll-stop-hook`, user can fill profile, pick From idea or Rewrite, generate, see copyable cards.
2. Cards teach Jeff Hook Formula (or rewrite intent), not Maria labels.
3. Chat still works for refine.
4. H3 modes land without breaking H1/H2.
5. `npm run build --prefix apps/web` passes after each phase.
6. Brief agent replies document approach + files touched + how to try locally.

---

## Access wall

- Student runtime mounts Jeff teaching only.
- Never paste these handoff docs into student answers or teaching ingest.
- Module **product** copy lives under `apps/web/` (catalog, overlays, i18n). Doctrine stays in `jeff-*`.
- These briefs are chrome / UX / prompt-product only. They are not teaching doctrine.
