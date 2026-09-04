# Goals

## Primary (now)

Prove that the **Jeff Teaching Graph alone** can produce answers Jeff and stakeholders accept — including correct out-of-coverage steers — **before** any student UI.

Order of work:

1. Scaffold dual stores + agent schema (this repo state).
2. Upload allowlisted Jeff sources into `raw/jeff/`.
3. First teaching ingest → bound claims + citations.
4. Score goldens + adversarial prompts in `eval/`.
5. Pass sufficiency gate (or Jeff-approved narrower limited release under the same rules).

## Secondary (after sufficiency)

- Expand ingest; grow reject / negative-knowledge nodes.
- Thin student API that mounts `jeff-*` only.
- Optional teaching-only serving database rebuilt from git.
- Keep scores and miss queues in the Dev wiki.

## Non-goals (this phase)

- Student chat frontend.
- Open-web RAG for doctrine.
- Deploying or indexing `dev-wiki/` / `dev-graph/` for students.
- Inventing named Jeff IP frameworks as fact without sources.

## Success signals

See sufficiency checklist in `architecture.md` and bars mirrored in the architecture canvas: citation coverage, zero invented doctrine, steer quality, anti-pattern ban, zero Dev leak, no educator relativizing, voice fit, stakeholder accept.
