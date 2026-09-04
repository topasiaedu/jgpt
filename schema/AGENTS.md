# AGENTS.md — jgpt agent workflows

This file is the operating contract for Cursor agents working in this repo. Prefer it over improvisation.

## Dual stores (hard access wall)

| Store | Roots | Purpose |
| --- | --- | --- |
| **Jeff Teaching Graph** | `raw/jeff/`, `jeff-wiki/`, `jeff-graph/`, `schema/voice/`, `schema/alignment/` | Student-facing doctrine, voice, citations |
| **Dev / Cursor wiki** | `dev-wiki/`, `dev-graph/` | Architecture, goals, rejected methods, builder evals, miss queues |

### Access rules

1. **Student runtime / teaching eval** may mount only Jeff Teaching Graph paths (plus published voice/alignment). Never open `dev-wiki/` or `dev-graph/`.
2. **Builder agents** may read both stores while scaffolding the product. They must **never** paste Dev wiki content into student-facing answers or teaching drafts.
3. Phase-2 student deploy packages **omit** every `dev-*` path.
4. Coverage misses may log privately under `dev-wiki/` — students only hear the warm steer (below).

## Closed doctrine

- Doctrine comes only from allowlisted Jeff materials under `raw/jeff/` after compile.
- **No open-web RAG for doctrine.** Embeddings/search may run inside `jeff-wiki` / `jeff-graph` only.
- Every Jeff-attributable claim in an answer must **bind** to a graph node with a citation path. Unbound claims are stripped.
- Graph stores **reject / warns_against** knowledge. Use it to correct — do not soften into “other educators are also fine.”
- Labels like Suggested / draft are **not** confirmed Jeff IP. Do not present them as fact.
- Do not invent Jeff frameworks from base-model memory. If it is not in the graph (or clearly draft), treat as unknown doctrine.

## Response policy (student / teaching eval)

### In coverage

Compose only from retained Jeff nodes + citations. Match `schema/voice/jeff-style.md`. Run verifier against `schema/alignment/guardrails.md` before return.

### Out of coverage — Generally → Jeff → steer

Warm teacher’s-pet voice. Pattern:

1. **Generally** — light, non-filing, generally-accepted framing (not too specific).
2. **Jeff** — pivot to what Jeff drills / prioritizes from the graph, or the nearest taught angle.
3. **Steer** — one concrete next question into an in-coverage Jeff direction (inventory, brand, ownership, clarity, positioning, etc.).

**Never:**

- Meta-refuse about the knowledge base (“I don’t have that in my materials…”).
- Relativize other educators as equally acceptable under Jeff’s approach.
- Blank refuse with no steer.
- Invent Jeff-specific rules when unbound.
- Case-specific legal filings advice (steer to counsel without AI-meta dump).
- Show “gap in KB” / “flagged for the team” to the student.

Doctrine status vocabulary (see `schema/alignment/doctrine-policy.md`): `endorse` | `reject` | `conditional` | `unknown`. **`unknown` ≠ OK as Jeff doctrine.** General backdrop is allowed only inside the steer pattern above.

## Workflows

### ingest

**When:** New or revised files appear under `raw/jeff/` (teaching) or new builder notes need compile into `dev-wiki/`.

**Teaching ingest steps:**

1. Read `schema/prompts/ingest.md`.
2. For each new raw file: write or update a source summary under `jeff-wiki/sources/`.
3. Distill only what the source supports into claims / principles / terms / stories. Mark scaffolds Suggested if evidence is thin.
4. Update `jeff-graph/nodes.json` and `edges.json` with typed nodes, confidence, and citation fields per `jeff-graph/schema.md`.
5. Append a line to `jeff-wiki/log.md`.
6. Run **lint**. Do not promote Suggested scaffolds to confirmed doctrine without human review.

**Dev ingest:** same discipline for `dev-wiki/` + `dev-graph/` (decisions, rejected methods, eval notes). Never route Dev compile into student mounts.

### query

**When:** Answering a teaching question (student simulation) or a builder question.

1. Read `schema/prompts/query.md`.
2. Choose mount by caller:
   - Teaching / student sim → Jeff Teaching Graph only.
   - Builder architecture / process → may use Dev wiki; still never mix Dev text into a teaching answer.
3. Probe pipeline (teaching path): normalize → seed retrieve → traverse → gather evidence → rank/prune → coverage check → compose + voice → optional file-back.
4. If OUT of coverage: Generally → Jeff → steer. Log miss metadata to Dev wiki if useful; do not expose to the student.

### lint

**When:** After ingest, before eval scoring, and before any teaching file-back promotion.

1. Read `schema/prompts/lint.md`.
2. Check: unbound Jeff claims; contradicting endorse/reject pairs; Suggested labeled as fact; voice anti-patterns; any `dev-*` leak into teaching pages; missing citations on claim nodes.
3. Record findings in the appropriate log (`jeff-wiki/log.md` or `dev-wiki/log.md`). Fix or quarantine before query eval.

### file-back (optional)

Strong teaching synthesis → `jeff-wiki/draft/` only. Human approval required before moving into published wiki folders. Routine answers skip file-back.

## Sufficiency gate (do not skip)

Do not build a student frontend until golden + adversarial evals in `eval/` pass the bars in `dev-wiki/architecture.md` (citation coverage, zero invented doctrine, steer quality, zero Dev leak, zero relativizing). Limited release still uses Jeff Teaching Graph only and the same out-of-coverage rules.

## Repo-first storage

Proof of concept validation stays in git (markdown + JSON). Later student stack may export **only** `jeff-*` into a serving database rebuilt from git. Authoring remains in this repo.

## Anti-patterns for agents

- Scraping the public web to “complete” Jeff’s teaching.
- Inventing named IP frameworks as confirmed Jeff doctrine.
- Mounting `dev-wiki/` in a teaching-eval session.
- Using the acronym “PoC” in docs — write “proof of concept.”
- Committing unless the human asked.
