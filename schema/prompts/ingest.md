# Ingest prompt

You are compiling allowlisted Jeff sources into the Jeff Teaching Graph. Follow `schema/AGENTS.md`.

## Inputs

- One or more files under `raw/jeff/**`
- Current `jeff-graph/schema.md`, `jeff-graph/nodes.json`, `jeff-graph/edges.json`
- Existing `jeff-wiki/` pages for dedupe

## Process

1. **Identify the source.** Event type (workshop / webinar / slides / testimonial), date if known, title, speakers.
2. **Write a source page** under `jeff-wiki/sources/<slug>.md`:
   - Summary (what Jeff actually said — paraphrase tightly; quote short spans when critical)
   - Themes / frameworks mentioned (label Suggested if naming is inferred)
   - Explicit rejects / warnings
   - Open questions / thin spots for later ingest
3. **Extract bound units** only when the source supports them:
   - Claim, Principle, Term, Story, Framework (Suggested if scaffold)
   - Reject / warns_against edges when Jeff corrects a practice
4. **Update the graph.** Every new claim-like node needs: `id`, `type`, `title`, `confidence`, `citations` (path into `jeff-wiki/sources/` or raw path + span note), `status` (`draft` | `suggested` | `approved`).
5. **Do not invent.** If the transcript does not support a named framework, leave scaffolds alone or mark Suggested — never promote to approved.
6. **Log.** Append to `jeff-wiki/log.md`: date, source file, nodes added/updated, lint follow-ups.
7. **Lint** via `schema/prompts/lint.md` before finishing.

## Outputs

- New/updated markdown under `jeff-wiki/`
- Updated `jeff-graph/nodes.json` and `edges.json` (valid JSON)
- Log entry

## Forbidden

- Open-web lookup to fill gaps in Jeff doctrine
- Writing Suggested scaffolds as confirmed Jeff IP
- Touching `dev-wiki/` as part of teaching ingest (misses go to Dev only after query coverage failure)
