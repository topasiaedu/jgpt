# Jeff IP test webapp

Stakeholder chat for testing Jeff teaching IP alignment. Lives at `apps/web` inside the jgpt monorepo.

See [STAKEHOLDER.md](./STAKEHOLDER.md) for tester-facing guidance.

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
