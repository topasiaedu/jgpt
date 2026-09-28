# Agent handoff (builders only)

**Not Jeff teaching. Not student-facing. Do not ingest into `jeff-wiki` / `jeff-graph`.**

These files are builder briefs and **product / repo decision records** for work on `apps/web`. They sit under `raw/` so they stay out of the compiled teaching vault.

**Agent copy-paste prompt files (`*agent-prompts*`) were removed** so they cannot enter wiki ingest. Do not re-add paste-ready agent prompts under `raw/`.

| File | Use |
| --- | --- |
| [15-hook-studio-and-quality-runtime-decisions.md](15-hook-studio-and-quality-runtime-decisions.md) | **Current SoT:** decisions + shipped state for Hook Studio, Quality Runtime (Q0–Q5), and recent UI cleanup |
| [13-artemo-quality-runtime-what-we-are-doing.md](13-artemo-quality-runtime-what-we-are-doing.md) | Context brief: Artemo-level Quality Runtime + family migration (platform spine + pack templates) |
| [11-hook-studio-ux-what-we-are-doing.md](11-hook-studio-ux-what-we-are-doing.md) | Context brief: Hook Studio on Hook Formula (Maria-shaped UX, Jeff doctrine) |
| [09-reply-and-recommend-ux-what-we-are-doing.md](09-reply-and-recommend-ux-what-we-are-doing.md) | Prior: reply brevity, Artemo under-input recommend, opener + question bullets |

Older numbered briefs (`01` to `08`, and all `*agent-prompts*` including former `10` / `12` / `14`) were removed from disk after ships. Prefer `dev-wiki/accomplishments-and-decisions.md` and dated `dev-wiki/sessions/` pages for broader engineering history.

Engineering SoT for decisions also remains `dev-wiki/`. Prefer durable decision docs (like `15`) over chat history. Prefer `dev-wiki/` when folding long-lived engineering notes outside this folder.

**Quality Runtime note (2026-09-29):** Both layers required (code spine + per-pack overlays that fit family templates). No soft “ask denser” bandaid across 55 overlays. Script family defaults ~60s+. Q0 → Q5 shipped; see doc `15`.

**Hook Studio note (2026-09-28 / 29):** Top-nav `/studio`, Jeff Hook Formula brain, Maria UX shape only, Studio batch force-Deliver. See docs `11` and `15`.

**Reply / recommend note (2026-09-22):** Brief `09` locks: less framework lecturing, Artemo-style home recommend under the composer (debounced), conversational tool openers with bullets, clarifying questions as bullets when asking two.

## Access wall

- Student runtime mounts Jeff teaching only.
- Never paste these handoff docs into student answers or teaching ingest.
- Module **product** copy lives under `apps/web/` (catalog, overlays). Doctrine stays in `jeff-*`.
- These briefs are chrome / UX / product-runtime only. They are not teaching doctrine.
