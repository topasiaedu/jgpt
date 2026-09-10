# Influence Engine Coach webapp

Stakeholder chat and IP Tools for testing Jeff teaching IP alignment. Product name in chrome: **Influence Engine Coach**. Lives at `apps/web` inside the jgpt monorepo.

See [STAKEHOLDER.md](./STAKEHOLDER.md) for tester-facing guidance.

## Product flow (Artemo-style)

1. **Home** (`/`): ask「今天要做什么 IP 内容？」→ free chat may recommend **2 to 4** tools as cards.
2. **Tool open**: `/tools/[moduleId]` starts a **fresh** chat with a pack `chatOpener` (optional `?from=home&q=` intent handoff; length-capped; not a form).
3. **Clarify then deliver**: 1 to 2 questions per turn, then the deliverable in the same tool chat.
4. **All Tools** (`/tools`): category card wall + search. No stage-first front door. IP Stage Check is a normal catalog tool.

## Routes

| Path | What it is |
| --- | --- |
| `/` | Home **Ask Jeff** (`ChatShell`): dashboard ask, example chips, recommend tool cards |
| `/tools` | **All Tools**: category card wall + search |
| `/tools/[moduleId]` | One module: short intro (optional) → fresh chat-first module chat |
| `/tools/[moduleId]?from=home&q=…` | Same tool with optional home intent hint (opener + silent system hint) |

## Local run

```bash
cd apps/web
cp .env.example .env.local
# set OPENAI_API_KEY (and optional OPENAI_MODEL)
npm install
npm run sync:jeff   # copies jeff-wiki + jeff-graph into content/jeff
npm run dev         # webpack only; do not use npm run dev:turbo
```

Open http://localhost:3000

From monorepo root you can also use `npm run dev --prefix apps/web`.

### UI language (chrome)

Default chrome locale is **Chinese (zh)**. Use the footer **中文 / EN** toggle to switch. Choice persists in `localStorage` under `ie-coach-locale`. On first visit with no saved choice, an English browser language may select EN; otherwise zh stays default. Chat model replies still follow Jeff language-match rules (user language), not the chrome toggle.

### Soft webinar footer

Footer includes a quiet **线上学完整系统 / Learn the system live** link to `https://webinar.influenceengine.co/opt-in`. No countdown or scarcity UI inside the coach.

### First-visit brand moment

Optional dark band (`#080808` + soft orange glow) shows once per browser until dismissed. Flag: `ie-coach-brand-moment-seen` in `localStorage`.

Probe without OpenAI:

```bash
npm run test:probe
```

## Vercel deploy

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Root Directory | `apps/web` |
| Include files outside Root Directory | Optional (teaching bundle is committed under `apps/web/content/jeff`) |
| Build Command | `npm run build` (runs `prebuild` → sync when monorepo parents exist, then `next build`) |
| Install Command | `npm install` (default) |
| Output | Next.js default |

### Environment variables

| Name | Required | Example |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes | your server key |
| `OPENAI_MODEL` | No | `gpt-4.1-mini` (default if unset) |

Set these under Project → Settings → Environment Variables for **Production** (and Preview if you use preview URLs), then **Redeploy**. Never expose `OPENAI_API_KEY` to the browser.

`POST /api/chat` runs on the Node.js runtime with `maxDuration = 60` so probe + OpenAI tool loops are less likely to hit the platform timeout (which returns a non-JSON error page to the client).

### Teaching assets on serverless

`apps/web/content/jeff/` is committed so deploys are self-contained. `prebuild` refreshes it from monorepo `jeff-wiki/` / `jeff-graph/` / `schema/voice/` when those parents are visible. Runtime reads `content/jeff` first. Never exclude `node_modules` from `outputFileTracingExcludes` (that breaks `/api/chat` with MODULE_NOT_FOUND). `raw/` is excluded from tracing and watches.

## Safety

- No imports of `dev-wiki` or `dev-graph`
- Doctrine path guards block Dev stores and `raw/jeff/public`
- User-facing prose must not use em dash or en dash punctuation
