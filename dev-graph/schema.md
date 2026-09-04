# Dev graph schema

JSON files do not embed `$schema`. This document is the schema for `nodes.json` and `edges.json`.

## File shape

```json
{
  "version": 1,
  "nodes": [ /* Node */ ]
}
```

```json
{
  "version": 1,
  "edges": [ /* Edge */ ]
}
```

## Node types

| `type` | Use |
| --- | --- |
| `Decision` | Architecture or process choice |
| `Goal` | Project goal / milestone |
| `Method` | Method tried (often linked via `rejects` / `supersedes`) |
| `ArchitectureComponent` | Named system piece (e.g. DualStore) |
| `Risk` | Risk or failure mode |
| `OpenQuestion` | Unresolved builder question |
| `EvalNote` | Builder eval observation |

## Node required fields

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable kebab or camel id |
| `type` | string | One of the node types above |
| `title` | string | Short label |
| `summary` | string | One–three sentences |
| `status` | string | `active` \| `superseded` \| `rejected` \| `open` |
| `wiki_refs` | string[] | Paths under `dev-wiki/` |

Optional: `created`, `updated`, `tags` (string[]).

## Edge types

| `type` | Meaning |
| --- | --- |
| `implements` | Component implements a decision/goal |
| `depends_on` | Ordering / dependency |
| `supports` | Evidence or rationale link |
| `rejects` | Decision/method rejects another method |
| `supersedes` | Newer decision replaces older |
| `mitigates` | Component or decision mitigates a risk |
| `tracks` | Eval/process tracks a goal |

## Edge required fields

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable id |
| `type` | string | Edge type |
| `from` | string | Source node id |
| `to` | string | Target node id |
| `summary` | string | Why the link exists |

Optional: `confidence` (0–1).
