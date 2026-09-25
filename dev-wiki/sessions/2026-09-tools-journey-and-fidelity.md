# Session: Tools journey, frameworks ingest, pack fidelity (2026-09)

**Audience:** builders and Cursor agents  
**Store:** Dev / Cursor wiki only  
**Status:** BUILDER ONLY. Do not ingest into `jeff-wiki` / `jeff-graph`.  
**Updated:** 2026-09-18  
**Summary SoT:** [../accomplishments-and-decisions.md](../accomplishments-and-decisions.md)

This page is the dated engineering record for the tools journey UX, offline workshop ingest, Framework Needed elevation, locale lock, probe fidelity, and P0 pack deepenings. Prefer it (with the summary SoT) over chat history. Agent implementation prompts are **not** stored under `raw/agent-handoff/` anymore.

---

## Commits (verify on `main`)

| SHA | Message (short) |
| --- | --- |
| `733752b` | Ship Jeff workshop frameworks into the tools journey with locale lock and probe fidelity |
| `fd54b88` | Deepen tool packs to Jeff slide steps so answers stop sounding generic |

Confirmed present in repo history as of 2026-09-18.

---

## Accomplishments

### Offline slides and Framework Needed

- Offline AUG-D1 / D2 / D3 slides copied under `raw/jeff/slides/`, OCR / extract text produced, then ingested into teaching vault/graph as workshop evidence.
- Stakeholder PDF `[Jeff AI-GPT] Framework Needed` ingested with **elevated draft** priority (not the same as Jeff approved). Mapped about **14 named frameworks** into core module packs / catalog alignment.
- Kept Jeff named frameworks over generic module labels when they covered the same job.

### Tools journey UX (`/tools`)

Final product shape for this session:

- Journey stages (ZH chrome primary): **选题构思 → IP 定位 → 内容 → 信任 → 成交** (catalog: Ideation, IP Positioning, Content, Trust, Convert).
- **Core-only** tools page: practice modules not shown as a primary wall.
- Removed from `/tools`: search, sticky pill / numbered rail, 「更多练习工具」 disclosure, and Ask Jeff entry on that surface (as shipped in this workstream).
- Earlier intermediate: scroll-not-filter sticky rail with core visible + practice collapsed + search over all. That was then superseded by the core-only simplification above.

### Locale and English catalog

- Locale lock: once the user chooses ZH or EN, chrome and tool surfaces stay on that locale for the session rules as implemented.
- EN replies: ASCII quotes only (sanitizer / normalizer path).
- EN catalog: English-only titles (no Chinese sprinkle in EN titles).

### Probe fidelity

- Fixed module-hint flood into probe context so packs do not drown the graph/wiki evidence pack.
- Shared `modulePrompt` hygiene so overlays stay short, Jeff-specific, and consistent across packs.

### P0 pack rewrites (Jeff slide steps)

Deepened packs so coach answers follow Jeff workshop steps rather than generic GPT advice. Includes (representative, not exhaustive):

- Topic Bingo / ideation
- SELF DIAGNOSTIC / stage check
- Positioning Triangle
- Brand Pillars
- Hook Formula
- CONTENT BANK / FAQ bank
- Eight Ways (content asset stack)
- OPENS Reel / IG Reel script
- S.T.O.R.Y trust script
- Purchase / convert paths (ladder, soft CTA, trust offer bridge, and related convert cores)

Shipped in `fd54b88` on top of the frameworks + journey ship in `733752b`.

---

## Decisions locked

| Topic | Decision |
| --- | --- |
| Journey stages | Five stages: Ideation → IP Positioning → Content → Trust → Convert |
| Core vs practice | Core wall for primary teaching path; practice / Suggested stay out of the default `/tools` browse (ManyChat out; Brand Stance as practice / Suggested) |
| Convert core | Ladder + bridge (and related convert cores) stay on the primary path |
| Browse IA evolution | First: scroll-not-filter rail. Later: remove search + rail entirely; core-only page |
| Framework naming | Prefer Jeff named frameworks when similar to a generic module |
| 三行地图 | Expand / keep as a first-class teaching map, not a thin label |
| Comment craft | Split **评论回应三句法** vs **B.R.E.A.K** (do not merge into one module) |
| Content assets | **Stack / Eight Ways** vs **四种内容资产** stay as **two modules** (option B) |
| Suggested scaffolds | Stay draft until Jeff or delegate review |
| Framework Needed PDF | Elevated draft for builders / packs; **≠ approved doctrine** |
| Agent prompts | Do **not** store paste-ready implementation prompts under `raw/`; engineering SoT lives in `dev-wiki/` |

---

## Open / deferred

- P1 / P2 pack deepenings still outstanding from the fidelity audit (beyond the P0 set).
- Much of `raw/jeff` media remains local / often untracked (size); do not assume CI has the binaries.
- Browser MCP for QC is flaky; prefer HTTP / API smoke and scripted checks when verifying chat and tools.
- Promote elevated Framework Needed drafts only after explicit Jeff (or delegate) approval.

---

## Access wall

- This page and `dev-wiki/` generally: **BUILDER ONLY**.
- Never mount, sync, or ingest into student runtime, `jeff-wiki`, or `jeff-graph`.
- Teaching doctrine continues to come only from allowlisted `raw/jeff/` compiles.

## Related

- [../accomplishments-and-decisions.md](../accomplishments-and-decisions.md)
- [../log.md](../log.md)
- [../decisions.md](../decisions.md)
- Pointer only: `../../raw/agent-handoff/README.md` (no prompts)
