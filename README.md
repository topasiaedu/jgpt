# jgpt: Jeff Teaching Graph (repo scaffold)

Repo-first knowledge system for Jeff’s teaching doctrine. Two stores, hard wall between them:

| Store | Paths | Who may use it |
| --- | --- | --- |
| **Jeff Teaching Graph** | `raw/jeff/`, `jeff-wiki/`, `jeff-graph/` | Students (after sufficiency) · Cursor teaching evals |
| **Dev / Cursor wiki** | `dev-wiki/`, `dev-graph/` | Builders and Cursor agents only. **Never** students. |

Architecture decisions and diagrams live in the Cursor canvas `jgpt-architecture.canvas.tsx`. Agent workflows live in [`schema/AGENTS.md`](schema/AGENTS.md).

## Pattern (Karpathy-style)

1. Drop **immutable** sources into `raw/` (do not edit after ingest without a new file or explicit revision note).
2. Run **ingest** → compiled pages in `jeff-wiki/` / `dev-wiki/` + graph JSON.
3. **Query** against the allowlisted store for the caller.
4. **Lint** for unbound claims, contradictions, voice anti-patterns, and access-wall leaks.
5. Optional **file-back** of strong teaching synthesis to `jeff-wiki/draft/` for human approval.

## Jeff IP test (webapp)

Next.js App Router app at **`apps/web/`** (isolated from the huge `raw/` tree).

### Local dev (safe)

From the monorepo root:

```bash
npm install --prefix apps/web
npm run dev
```

Or from `apps/web`:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Title: **Jeff IP test**.

**Memory safety:** `raw/jeff` is tens of GB. The app root is `apps/web`, so Next does not sit beside `raw/`. Default `npm run dev` uses webpack. Prefer not leaving `next dev` running long. Do **not** use `npm run dev:turbo` unless you have verified watches stay inside `apps/web`.

### Probe-only test (no OpenAI)

```bash
npm run test:probe
```

Runs a lexical probe against `jeff-graph` + linked `jeff-wiki` pages and prints source ids. Useful when `OPENAI_API_KEY` is unset.

### Env vars

Copy `apps/web/.env.example` to `apps/web/.env.local`:

```text
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

Required for live chat. Without a key, `POST /api/chat` returns a clear JSON config error (503).

### Vercel

1. Import this repo.
2. **Root Directory:** `apps/web`
3. Set `OPENAI_API_KEY` (and optional `OPENAI_MODEL`).
4. Deploy. Server reads `jeff-wiki/`, `jeff-graph/`, and `schema/voice|alignment` via monorepo-relative paths (`../../…` from `apps/web`). File tracing includes those trees; `raw/`, `dev-wiki/`, and `dev-graph/` are excluded from doctrine.

Do **not** mount `dev-wiki/` or `dev-graph/` into the webapp. Do **not** use `raw/jeff/public` as doctrine.

### Chat API (Phase B)

`POST /api/chat` with `{ "messages": [{ "role": "user"|"assistant", "content": "…" }] }` returns `{ "reply": "…", "sources": [{ "id", "title", "type" }] }`. The UI Sources used panel shows those nodes.

## Quick map

```text
apps/web/          ← Jeff IP test Next.js UI + API
jeff-wiki/         ← compiled teaching pages
jeff-graph/        ← teaching nodes + edges
schema/            ← AGENTS.md, prompts, voice, alignment
raw/jeff/          ← USER UPLOADS HERE (immutable sources)
raw/agent-handoff/ ← builder handoff (not doctrine)
dev-wiki/          ← internal engineering memory (ACCESS WALL)
dev-graph/         ← internal decision graph
eval/              ← golden + adversarial templates
```
