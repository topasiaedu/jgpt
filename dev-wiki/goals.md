# Goals

## Primary (now)

Keep the **Jeff Teaching Graph** accurate and stakeholder-acceptable, and grow it with more ingest while the limited **Jeff IP test** UI stays closed-doctrine.

Order of work (status):

1. Scaffold dual stores + agent schema — **done**
2. Upload allowlisted Jeff sources into `raw/jeff/` — **batch-1 done**; more batches open
3. First teaching ingest → bound claims + citations — **done (draft)**
4. Limited stakeholder UI (Jeff IP test on Vercel) — **done** as a fidelity check
5. Score goldens + adversarial prompts in `eval/` — **open**
6. Pass sufficiency gate for a fuller student product — **open**

## Secondary (after sufficiency / more ingest)

- Expand ingest; grow reject / negative-knowledge nodes.
- Thicker student product (auth, polish) still mounts `jeff-*` only.
- Optional teaching-only serving database rebuilt from git.
- Keep scores and miss queues in the Dev wiki.

## Non-goals

- Open-web RAG for doctrine.
- Deploying or indexing `dev-wiki/` / `dev-graph/` for students.
- Inventing named Jeff IP frameworks as fact without sources.
- Treating implementer prompt packs as teaching vault content.

## Success signals

See sufficiency checklist in `architecture.md` and the summary in [accomplishments-and-decisions.md](accomplishments-and-decisions.md): citation coverage, zero invented doctrine, steer quality, anti-pattern ban, zero Dev leak, no educator relativizing, voice fit, stakeholder accept.
