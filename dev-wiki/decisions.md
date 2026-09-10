# Decisions

Format: date · decision · why · alternatives considered.

## 2026-09-03 — Initial architecture lock

### D1 · Karpathy compile-then-probe

**Decision:** Immutable `raw/` sources compile into wiki + graph; agents ingest / query / lint against schema — not ad-hoc chat over loose PDFs.

**Why:** Diffable claims, citation paths, lintable contradictions, Cursor-readable checkout with zero infra for the proof of concept.

### D2 · Repo-first storage

**Decision:** Keep both stores as markdown + JSON in git for validation. Later student stack may export **only** Jeff Teaching Graph into a DB as a read-optimized serving copy rebuilt from git.

**Why:** Fast review in PRs; agents read the tree; no infra while testing sufficiency. Authoring stays in git even if a serving DB appears later.

### D3 · Dual store + student mount teaching-only

**Decision:** Hard wall between Dev / Cursor wiki and Jeff Teaching Graph. Student API / teaching eval mounts `jeff-*` (+ published voice/alignment) only. Omit `dev-*` from student deploys.

**Why:** Students must never see rejected methods, builder goals, or miss queues. Dev wiki is engineering memory, not a second teaching KB.

### D4 · Closed Jeff allowlist · no web RAG for doctrine

**Decision:** Doctrine only from allowlisted Jeff materials under `raw/jeff/` after compile. Search/embeddings stay inside `jeff-wiki` / `jeff-graph`.

**Why:** Product is Jeff’s teaching system, not a general education search engine. Prevents base-model + web completion inventing “Jeff” rules.

### D5 · Generally → Jeff → steer (out-of-coverage)

**Decision:** Warm teacher’s-pet pattern when outside bound nodes. Never KB-meta refuse; never blank refuse; never invent Jeff-specific rules.

**Why:** Immersion and usefulness without hallucinating doctrine. Misses still log privately to Dev wiki for builders.

### D6 · Reject relativizing other educators

**Decision:** Competing methods are not framed as equally acceptable under Jeff’s approach. Use reject / warns_against nodes to correct; keep Jeff’s authority.

**Why:** Soft both-sides language undermines the teaching product and fails adversarial evals.

### D7 · Sufficiency before student frontend

**Decision:** Do not start student UI until golden + adversarial bars pass (or Jeff accepts a narrower limited release under the same closed-doctrine and steer rules).

**Why:** Shipping a chat shell before doctrine quality is proven wastes trust and multiplies hallucination surface.

### D8 · Suggested scaffolds only for unproven IP frameworks

**Decision:** Named IP framework folders may exist as Suggested / draft placeholders. Confirmed Jeff IP waits for transcript/slide ingest.

**Why:** Public material emphasizes M&A / diligence / advisory; detailed IP workshop frameworks are not yet evidenced in usable form.

---

## Rejected methods

| Method | Why rejected |
| --- | --- |
| Open-web RAG to “complete” Jeff doctrine | Invents non-Jeff teaching; breaks closed allowlist and citation integrity |
| Single mixed wiki for students + builders | Leaks rejected methods / process notes; collapses the access wall |
| Student-facing “I don’t have that in my KB” refuse | Breaks immersion; feels like a cold refuse; hides the useful steer |
| Relativizing rival educators as “also fine” under Jeff | Undermines Jeff’s authority; fails adversarial other-school traps |
| Database-first authoring before sufficiency | Extra infra; harder PR review of claims; premature while validating in Cursor |
| Treating Suggested IP scaffolds as confirmed doctrine | Hallucinates Jeff IP; evidence gap on detailed frameworks |
| Mounting `dev-wiki/` in teaching-eval sessions | Contaminates student-path answers with builder memory |
| Building student frontend before sufficiency gate | Ships UX on unproven doctrine quality |
| Turbopack / next dev watching monorepo root with huge `raw/` | Blew node RAM (~51GB); use `apps/web` + webpack |
| `outputFileTracingExcludes` including `node_modules/**` on Vercel | Stripped Next/React from serverless NFT; HTML 500 on `/api/chat` |
| Chinese sprinkle inside English replies | Hard for non-Chinese readers; English ask → full English |
| Invented niche case scripts sold as Jeff teaching | Not in graph; freelanced GPT stories (e.g. fake patient meds scripts) |
| One probe for a whole long chat session | Stale evidence; context hog; miss topic shifts mid-session |
| Keeping agent implementation prompt packs in `raw/agent-handoff/` as vault content | Risk of ingesting builder prompts as teaching; deleted 2026-09-08 |

---

## 2026-09 — Stakeholder webapp and voice lock

### D9 · Limited stakeholder UI before full student product

**Decision:** Ship **Jeff IP test** (`apps/web` on Vercel) as a limited check for Jeff/stakeholders, while keeping closed doctrine and teaching-only mounts.

**Why:** Need live fidelity feedback without waiting for a full student product. Not a license to open-web RAG or mount Dev wiki.

### D10 · Voice: 1-on-1 English coach

**Decision:** Sound profile prioritizes 1-on-1 coaching (not webinar stage). English user language → full English (no CN mix). No dash punctuation in replies (prompt + strip).

**Why:** Stakeholder testing showed ChatGPT tone, webinar lecture voice, bilingual mix, and em dashes.

### D11 · Per-turn probe + optional re-probe tools

**Decision:** Fresh probe each send; up to two `probe_jeff` tool calls; this-turn evidence only; history dialogue capped.

**Why:** Long chats cannot rely on the first fetch; old packs waste context and go stale.

### D12 · Self-contained Vercel teaching bundle

**Decision:** Commit and trace `apps/web/content/jeff/`; do not exclude `node_modules` from NFT tracing.

**Why:** Serverless must boot and read teaching files reliably.
