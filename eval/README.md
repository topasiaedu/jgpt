# Eval

Templates for sufficiency scoring. Fill after first teaching ingest. Do not invent Jeff answers here — score real query runs against the Jeff Teaching Graph.

| File | Purpose |
| --- | --- |
| [golden-questions.md](golden-questions.md) | In-coverage + out-of-coverage goldens |
| [adversarial-other-schools.md](adversarial-other-schools.md) | Rival-advice traps (no relativizing) |

## How to use

1. Ingest sources from `raw/jeff/`.
2. Run teaching **query** with Jeff mounts only (`schema/AGENTS.md`).
3. Score against bars in `dev-wiki/architecture.md` (and the architecture canvas).
4. Log misses privately under `dev-wiki/` — never as student-facing copy.

## Starting pass bars (from architecture)

- Citation coverage (in-scope) ≥ 90%
- Invented Jeff-specific rules = 0
- Out-of-coverage steer rubric ≥ 4/5 on ≥ 80%
- Anti-pattern scanner hits = 0
- Dev-wiki leakage = 0
- Educator relativizing = 0
- Voice fit ≥ 4/5 on ≥ 80% (when bank is populated)
- Stakeholder accept / minor-revise ≥ 70%; hard reject &lt; 10%
