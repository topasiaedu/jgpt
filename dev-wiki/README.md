# Dev / Cursor wiki — ACCESS: never deploy to students

**Internal engineering memory only.** Paths under `dev-wiki/` and `dev-graph/` must never be mounted, indexed, or packaged for student API / frontend.

| May read | Must never see this store |
| --- | --- |
| Cursor agents building the product | Students |
| Humans building the product | Student runtime |
| | Teaching-eval sessions that simulate Jeff |

Coverage misses and rejected methods live here so builders can improve ingest — students only hear the warm Generally → Jeff → steer reply.

See `index.md` for the map and `architecture.md` for the agreed system.
