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
| Build Command | `npm run build` (runs `prebuild` → sync teaching assets, then `next build`) |
| Install Command | `npm install` (default) |
| Output | Next.js default |

### Environment variables

| Name | Required | Example |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes | your server key |
| `OPENAI_MODEL` | No | `gpt-4.1-mini` (default if unset) |

Never expose `OPENAI_API_KEY` to the browser. It is server-only.

### Teaching assets on serverless

`prebuild` copies monorepo `jeff-wiki/` and `jeff-graph/` into `apps/web/content/jeff/`. Runtime reads that bundle first so Vercel serverless file tracing does not depend on fragile parent paths. `raw/` is excluded from tracing and watches.

## Safety

- No imports of `dev-wiki` or `dev-graph`
- Doctrine path guards block Dev stores and `raw/jeff/public`
- User-facing prose must not use em dash or en dash punctuation
