# Architecture (agreed)

Canonical diagrams live in the Cursor canvas `jgpt-architecture.canvas.tsx`. This page is the repo-readable summary for agents.

## Dual store

1. **Jeff Teaching Graph** (`raw/jeff/`, `jeff-wiki/`, `jeff-graph/`) — only student-probeable doctrine.
2. **Dev / Cursor wiki** (`dev-wiki/`, `dev-graph/`) — builder memory: goals, architecture, rejected methods, eval notes, miss queues.

Student runtime has **no edge** to the Dev wiki. Builder runtime may open both; teaching answers must not.

## Repo-first storage

Proof of concept validation stays in git (markdown + JSON). Later: export **only** the Jeff Teaching Graph into a serving database rebuilt from git. Never index `dev-*` into that copy.

## Compile-then-probe (Karpathy pattern)

Immutable `raw/` → ingest → compiled wiki + schema-driven graph → query → lint → optional file-back. Teaching compile feeds students; Dev compile feeds builders.

## Probe pipeline (teaching path)

1. Normalize query  
2. Seed retrieve (Jeff allowlist only)  
3. Traverse typed edges  
4. Gather evidence (citations, confidence)  
5. Rank + prune  
6. Coverage check (IN compose / OUT steer)  
7. Compose + voice + verifier  
8. Optional file-back (`jeff-wiki/draft/` or private Dev miss note)

No open-web RAG for doctrine. Embeddings may help **inside** the Jeff allowlist only.

## Sufficiency gate

Before any student frontend: pass golden + adversarial evals (citations, zero invented Jeff doctrine, Generally → Jeff → steer quality, zero Dev leak, zero educator relativizing, voice fit, stakeholder accept). Limited release still uses Jeff Teaching Graph only and the same out-of-coverage rules.

## Response policy

- **IN coverage:** bound Jeff nodes + citations; warm teacher’s-pet voice.
- **OUT of coverage:** Generally → Jeff → steer — never KB-meta refuse, never invent Jeff rules, never relativize other educators.
- **Legal line:** teaching patterns only; no case-specific filings advice.

## IP scaffolds

Public material does not yet give usable detailed IP workshop frameworks. Named scaffolds in teaching folders stay **Suggested / draft** until real transcript ingest proves them. Do not treat scaffolds as confirmed Jeff IP.
