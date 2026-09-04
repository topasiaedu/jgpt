# Lint prompt

Verify teaching and (when asked) Dev compile quality. Follow `schema/AGENTS.md`.

## Teaching lint checklist

1. **JSON validity** — `jeff-graph/nodes.json` and `edges.json` parse; required fields present per `jeff-graph/schema.md`.
2. **Bound claims** — every `Claim` / endorseable teaching assertion cites at least one source page or raw span reference.
3. **Status honesty** — nodes with thin evidence are `suggested` or `draft`, never silently `approved`.
4. **Reject hygiene** — if Jeff warns against a practice, prefer a `rejects` / `warns_against` edge over soft “also fine” wording on wiki pages.
5. **Contradiction scan** — opposing endorse/reject pairs on the same topic are flagged until resolved or explicitly marked conditional.
6. **Access wall** — teaching pages must not quote or paraphrase `dev-wiki/` / `dev-graph/`.
7. **Voice / policy** — scan for anti-patterns in `schema/voice/do-dont.md` and `schema/alignment/guardrails.md` on newly composed drafts.
8. **No web doctrine** — no citations to third-party web pages presented as Jeff doctrine.

## Dev lint checklist

1. Decisions record **why**, including rejected methods.
2. Graph nodes for architecture choices stay consistent with `dev-wiki/architecture.md` and `decisions.md`.
3. No student-facing packaging instructions that include `dev-*` mounts.

## Output

- Pass / fail summary
- List of issues with file paths
- Suggested fixes (do not invent missing Jeff doctrine to “fix” thin citations — mark Suggested or queue more raw ingest instead)
