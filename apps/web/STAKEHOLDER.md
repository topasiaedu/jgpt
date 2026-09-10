# Influence Engine Coach (stakeholder guide)

## What this is

A small web app for trying Jeff-aligned answers about personal IP, brand, trust, content, and positioning. Product chrome reads as **Influence Engine Coach** (educator / Brand Warriors energy), not a lab utility. Answers are grounded in the repo teaching store (`jeff-graph` + `jeff-wiki`), not open-web invention and not Dev wiki.

UI chrome defaults to **Chinese**, with an **EN** toggle in the footer. Chat model replies still follow Jeff language-match rules (answer in the language the user wrote).

There are two surfaces:

1. **Ask Jeff** (`/`): home dashboard. Primary ask is「今天要做什么 IP 内容？」. After you state an intent, the coach may recommend **2 to 4** named IP tools as clickable cards. Recommendations deep-link into a **fresh** tool chat (optional `?from=home&q=` carries your intent; not a form).
2. **All Tools** (`/tools`): category card wall (search OK). Browse by category and open any tool. There is **no stage-first hero** as the page story. **IP Stage Check** remains a normal catalog tool when you need a diagnosis; it is not the forced front door.

Each tool is **chat-first**: short intro (optional/skip), then a **new** guided chat seeded with a tool-scoped opener. There is **no intake form**. The assistant asks 1 to 2 clarifying questions per turn, then produces the deliverable in the same tool chat. Sources used still shows on replies.

Tools include the **full proposed module set** (not only the original 15), including **Earn Trust** and **Convert**. Stakeholder can cut later. Some modules are KB-thin (especially Convert and a few workshop-angle tools): expect Generally → Jeff → steer when Sources are light, not invented Jeff offer architecture or named frameworks.

**Quality bar:** module answers should feel like Jeff's aide (曝光→信任→成交, 立场, content assets ≠ ads, advice vs ego, direction ≠ volume), not a generic personal-brand GPT. If a reply could have come from any LinkedIn coach with no Jeff teaching, report it.

This is a **draft** teaching graph from early transcript ingest. It is not the full Jeff corpus. Do not treat every answer as settled IP doctrine.

Footer: quiet draft disclaimer + soft **线上学完整系统 / Learn the system live** link to the Influence Engine webinar opt-in. No countdown, scarcity, or form capture inside the coach.

## How to try home → recommend → tool

1. Open the shared Vercel URL (or run locally: see README).
2. Stay on **Ask Jeff**, or open `/`. First visit may show a short dark brand moment; dismiss or tap Continue once.
3. Answer「今天要做什么 IP 内容？」in the composer (or tap an example). You should see **2 to 4** recommended tool cards under the reply when intent is clear.
4. Open a recommended card. URL may include `?from=home&q=…`. You land in a **fresh** tool chat with a conversational opener (and a short note of your home intent when `q` is present).
5. Reply in chat. Expect 1 to 2 clarifying questions per turn, then a deliverable in that same chat. Sources chip + panel still apply.
6. Switch chrome language with the footer **中文 / EN** control. That does not force reply language.

You may also keep chatting on home, or open **全部工具 / All Tools** to browse without recommendations.

## How to try All Tools (category wall)

1. Open **全部工具 / All Tools** in the top nav, or go to `/tools`.
2. Browse category sections or search. Cards open the existing intro → chat path. Direct URL example: `/tools/ig-reel-script`.
3. Read the short intro (what it does, what to bring, what you get). Optionally check skip-for-this-tool (saved per tool id in your browser).
4. Tap **开始 / Start**. You land in a fresh chat with an opener question (no form).
5. Answer in conversation. When enough is known, you should get the module deliverable plus Sources used. You can also say **just write it** / **直接写一版** and ask for a draft with named assumptions.
6. Use **再看介绍 / Show intro** if you want to re-read the module blurb.

Leaving a tool and opening it again starts a **new** chat thread (home history is not mixed into the tool transcript).

## How to report a bad free-chat answer

Paste back to builders:

1. The exact question you asked
2. The full assistant reply
3. The **Sources used** / bubble chip node ids (or note if it shows **No graph source** / general steer)
4. What felt wrong (wrong Jeff framing, invented framework name, invented Jeff patient story / niche script, too soft on a reject, dense unreadable blob, bad or missing tool recommendations, etc.)
5. Chrome locale (中文 or EN) and whether the reply language mismatched the question

## How to report bad module output

Paste back to builders:

1. Which tool (for example **IG Reel Script**), and the URL `/tools/...` if handy (include `?from=home&q=` if present)
2. The chat transcript (opener + your answers + assistant replies), or at least the key facts you gave
3. The full assistant reply that felt wrong
4. The **Sources used** / bubble chip node ids (or **No graph source**)
5. What felt wrong (generic personal-brand tips with no Jeff mechanisms, wrong module job, salesy close, invented Jeff case study, interrogated with a long form-like list, etc.)

Do not ask builders to “loosen” the model into inventing Jeff rules. Bad answers usually mean the graph/wiki need ingest fixes, or the module overlay needs a tighter bind to existing nodes.

## Caveat

Graph status is still partly `draft` / `suggested`. Nodes with doctrine `unknown` or status `suggested` are not confirmed named Jeff frameworks.
