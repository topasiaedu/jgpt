# Jeff Teaching Graph schema

JSON files do not embed `$schema`. This document is the schema for `nodes.json` and `edges.json`.

## File shape

```json
{
  "version": 1,
  "nodes": []
}
```

```json
{
  "version": 1,
  "edges": []
}
```

Start nearly empty. Populate only from allowlisted ingest of `raw/jeff/`.

## Node types

| `type` | Use |
| --- | --- |
| `Framework` | Named teaching framework (mark Suggested until confirmed) |
| `Principle` | Durable teaching principle |
| `Claim` | Citable assertion |
| `Term` | Defined vocabulary |
| `Story` | Case / anecdote from sources |
| `Source` | Compiled or raw source record |
| `Reject` | Negative-knowledge / warned practice (optional dedicated type) |
| `ObjectionAnswer` | Stock reply to a common objection |
| `VoiceExemplar` | Style exemplar grounded in sources |

## Node required fields

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable id |
| `type` | string | Node type |
| `title` | string | Short label |
| `summary` | string | Teaching content summary |
| `status` | string | `suggested` \| `draft` \| `approved` \| `deprecated` |
| `confidence` | number | 0–1 |
| `citations` | array | See below |
| `doctrine` | string | `endorse` \| `reject` \| `conditional` \| `unknown` |

### `citations[]` items

| Field | Type | Notes |
| --- | --- | --- |
| `wiki_path` | string | Usually under `jeff-wiki/sources/` |
| `raw_path` | string | Optional path under `raw/jeff/` |
| `span_note` | string | Optional locator (timestamp, slide #, quote fragment) |

Optional node fields: `tags` (string[]), `created`, `updated`, `wiki_page`.

## Edge types

| `type` | Meaning |
| --- | --- |
| `includes` | Framework includes step/principle/claim |
| `supports` | Evidence supports a claim |
| `cites` | Claim/framework cites a Source |
| `rejects` | Claim/framework rejects a practice or rival framing |
| `warns_against` | Soft/hard warning without full reject node |
| `defines` | Term defines a concept used by claim/framework |
| `illustrated_by` | Story illustrates a claim/principle |
| `answers` | ObjectionAnswer answers an objection theme |

## Edge required fields

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable id |
| `type` | string | Edge type |
| `from` | string | Source node id |
| `to` | string | Target node id |
| `confidence` | number | 0–1 |
| `summary` | string | Why the link exists |

Optional: `citations` (same shape as nodes).

## Rules

1. Jeff-attributable `Claim` nodes need ≥1 citation before teaching compose may use them.
2. `status: suggested` and `doctrine: unknown` must not be presented as confirmed Jeff IP.
3. Prefer `rejects` / `warns_against` over relativizing language when Jeff corrects a practice.
4. Student runtime probes this graph only — never `dev-graph/`.
