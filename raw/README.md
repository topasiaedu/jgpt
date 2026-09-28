# `raw/`: immutable sources

Sources land here first. Compilers read them; they do not rewrite them in place.

## Builder handoff (not teaching)

| Path | Put |
| --- | --- |
| [`agent-handoff/`](agent-handoff/) | Builder briefs + product decisions (not teaching). **Current SoT:** `15` Hook Studio + Quality Runtime + UI cleanup. Context briefs: `13` / `11` / `09`. No `*agent-prompts*` under `raw/`. Engineering SoT also: [`dev-wiki/accomplishments-and-decisions.md`](../dev-wiki/accomplishments-and-decisions.md). |

**Do not ingest `agent-handoff/` into `jeff-wiki` / `jeff-graph`.** It is builder process, not Jeff doctrine. After a ship, prefer folding the record into `dev-wiki/` and trimming paste-ready prompts if ingest risk returns.

## Jeff teaching sources (student doctrine)

**Upload here:**

| Path | Put |
| --- | --- |
| `jeff/workshops/` | Workshop transcripts, facilitator notes, Q&A dumps |
| `jeff/webinars/` | Webinar transcripts / recordings notes |
| `jeff/slides/` | Slide decks or exported slide text |
| `jeff/testimonials/` | Approved student / client testimonials |
| `jeff/public/` | Optional public clips or short excerpts (later) |

### Naming convention

Prefer date + short slug so ingest logs stay readable:

```text
raw/jeff/webinars/2024-11-12-ip-for-founders.md
raw/jeff/slides/2024-11-12-ip-for-founders.pdf
```

Supported starters: `.md`, `.txt`, `.pdf`, `.vtt`, `.srt` (and common deck formats). Keep one logical event per file when possible.

### Immutability rule

1. After a file has been ingested, treat it as **append-only history**.
2. Need a fix? Add a corrected file (e.g. `…-rev2.md`) or a sidecar note. Do not silently overwrite the ingested blob without recording the change in `jeff-wiki/log.md`.
3. Never paste open-web third-party doctrine into `raw/jeff/` and call it Jeff.

### What not to put here

- Builder notes, rejected methods, eval scores → `dev-wiki/` (or a future `raw/dev/` if you split later).
- Invented “Jeff frameworks” with no transcript/slide basis.
- Case-specific client privileged material unless explicitly approved for this repo.
- Treating `agent-handoff/` prompts as teaching content (briefs are builder-only; never ingest).

## After upload (Jeff teaching only)

1. Open [`schema/AGENTS.md`](../schema/AGENTS.md) → workflow **ingest**.
2. Confirm new pages under `jeff-wiki/sources/` and nodes in `jeff-graph/`.
3. Run **lint**, then score a few goldens in `eval/`.
