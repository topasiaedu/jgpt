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
| `OPENAI_QA_ENABLED` | No | unset = on for module chat; `0` / `false` / `off` disables |
| `OPENAI_QA_MODEL` | No | `gpt-4.1-nano` (judge only; repair uses `OPENAI_MODEL`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes for Brand profiles | `https://lizrtckbhfswyrokiawd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes for Brand profiles | anon or publishable key from Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes for Brand document ingest | server-only `service_role` key; never `NEXT_PUBLIC_` |

Set these under Project → Settings → Environment Variables for **Production** (and Preview if you use preview URLs), then **Redeploy**. Never expose `OPENAI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the browser.

### Brand documents smoke (manual)

After Auth + a Brand profile exist, with `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` set in `apps/web/.env.local`:

1. Open `/brand-profiles/[id]` while signed in.
2. **Paste:** paste a short proof line → Save paste and process → status becomes **Ready**; Active brief updates; you can still edit the brief and Save.
3. **PDF:** upload a short text PDF → wait for Ready → confirm brief/structured filled gaps (non-empty user fields stay).
4. **PPTX:** upload a short deck → Ready → same.
5. Optional SQL check on project Jeff GPT: `select status, kind from brand_assets;` and `select count(*), count(embedding) from brand_chunks;` for that profile.
6. Over-quota: try a file over ~40MB or a 21st document → API returns a clear error; no orphan ready state.
7. **Re-summarize brief** rebuilds `active_brief` from ready chunks + current structured fields.

### Brand chat grounding smoke (Agent E)

With a signed-in user, an owned Brand profile, `OPENAI_API_KEY`, and (for deck details) at least one **Ready** document:

1. Home: pick Client A → open a tool. URL has `profile=<uuid>`. First turn should stay on Client A niche without dumping a full PDF into the model.
2. Ask for a line that exists only in the uploaded deck (warranty, SKU, exact proof sentence). The assistant should retrieve Brand excerpts (`probe_brand`); Jeff Sources chips stay graph-only; Brand chips use `brand:<chunkUuid>`.
3. Home: switch to Client B → open the same tool. Niche follows Client B.
4. Collect: if audience / offer / niche / proof / stance / founder face are already filled on the profile, the tool should not re-ask those slots; it asks remaining gaps only.
5. Offline: `npm run test:brand-chat` (facts budget, Collect skip, excerpt cap, `brand:` ids).

`POST /api/chat` requires a session cookie plus owned `brandProfileId`. Jeff path is unchanged (`probeTeaching` + `probe_jeff`). Brand retrieval is `match_brand_chunks` plus keyword fallback on `brand_chunks` for that profile only.

Routes: `GET/POST /api/brand-profiles/[id]/assets`, `POST .../assets/paste`, `POST .../assets/[assetId]/process`, `DELETE .../assets/[assetId]`, `POST .../resummarize`.

### Supabase Auth (email / password)

Brand profiles use Supabase Auth **email + password** (not magic-link-only).

Human dashboard steps on project **Jeff GPT** (`lizrtckbhfswyrokiawd`):

1. Open [Authentication → Providers → Email](https://supabase.com/dashboard/project/lizrtckbhfswyrokiawd/auth/providers).
2. Ensure **Email** provider is **Enabled**.
3. Keep **Confirm email** on or off for your staging preference (off is easier for early internal testing; on for production).
4. Under [Authentication → URL Configuration](https://supabase.com/dashboard/project/lizrtckbhfswyrokiawd/auth/url-configuration), set **Site URL** to your app origin (local: `http://localhost:3000`) and add the same origin under **Redirect URLs**.

Schema, RLS, and private Storage bucket `brand-assets` are already applied on this project via Agent A. App clients live under `apps/web/lib/supabase/`; middleware refreshes the session cookie without blocking existing routes. Agent D fixed Storage path RLS (`storage.foldername(name)` for `{userId}/{profileId}/…`) so uploads match the object path.

`POST /api/chat` runs on the Node.js runtime with `maxDuration = 60` so probe + OpenAI tool loops are less likely to hit the platform timeout (which returns a non-JSON error page to the client).

### Teaching assets on serverless

`apps/web/content/jeff/` is committed so deploys are self-contained. `prebuild` refreshes it from monorepo `jeff-wiki/` / `jeff-graph/` / `schema/voice/` when those parents are visible. Runtime reads `content/jeff` first. Never exclude `node_modules` from `outputFileTracingExcludes` (that breaks `/api/chat` with MODULE_NOT_FOUND). `raw/` is excluded from tracing and watches.

## Safety

- No imports of `dev-wiki` or `dev-graph`
- Doctrine path guards block Dev stores and `raw/jeff/public`
- User-facing prose must not use em dash or en dash punctuation
