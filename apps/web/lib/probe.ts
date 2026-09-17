import fs from "fs";

import type { ChatSource } from "@/lib/chatTypes";
import type { EdgesFile, GraphEdge, GraphNode, NodesFile } from "@/lib/graphTypes";
import { isForbiddenDoctrinePath, monorepoPath, resolveJeffWikiFile } from "@/lib/paths";

/** Caps for the Phase B lexical probe. */
const MAX_SEED_NODES = 5;
const MAX_HOPS = 2;
const MAX_EVIDENCE_NODES = 8;
/** Extra slots for module bound anchors appended after user-led ranking. */
const MAX_BOUND_APPEND = 4;
const MAX_WIKI_CHARS = 1800;
const IN_COVERAGE_MIN_SCORE = 2.5;
/** Ignore doctrine-bonus-only seeds so hop upgrades can win. */
const MIN_SEED_SCORE = 2.0;

export type EvidenceItem = {
  node: GraphNode;
  score: number;
  hop: number;
  wikiExcerpt: string | null;
};

export type ProbeResult = {
  query: string;
  coverage: "in" | "out";
  evidence: EvidenceItem[];
  sources: ChatSource[];
  evidencePackText: string;
};

type ScoredSeed = {
  node: GraphNode;
  score: number;
};

/**
 * Loads teaching graph JSON from the monorepo. Never touches Dev stores.
 */
export function loadTeachingGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodesPath: string = monorepoPath("jeff-graph", "nodes.json");
  const edgesPath: string = monorepoPath("jeff-graph", "edges.json");

  if (isForbiddenDoctrinePath(nodesPath) || isForbiddenDoctrinePath(edgesPath)) {
    throw new Error("Refusing to load graph from a forbidden path.");
  }

  const nodesRaw: unknown = JSON.parse(fs.readFileSync(nodesPath, "utf8"));
  const edgesRaw: unknown = JSON.parse(fs.readFileSync(edgesPath, "utf8"));

  if (!isNodesFile(nodesRaw) || !isEdgesFile(edgesRaw)) {
    throw new Error("jeff-graph JSON shape is invalid.");
  }

  return { nodes: nodesRaw.nodes, edges: edgesRaw.edges };
}

/**
 * Full teaching probe: normalize → seed → traverse → gather wiki excerpts → pack.
 */
export function probeTeaching(query: string): ProbeResult {
  const normalizedQuery: string = normalizeQuery(query);
  const { nodes, edges } = loadTeachingGraph();
  const byId: Map<string, GraphNode> = new Map(nodes.map((node) => [node.id, node]));

  const seeds: ScoredSeed[] = scoreSeeds(normalizedQuery, nodes)
    .filter((seed) => seed.score >= MIN_SEED_SCORE)
    .slice(0, MAX_SEED_NODES);
  const retained: Map<string, EvidenceItem> = new Map();

  for (const seed of seeds) {
    retained.set(seed.node.id, {
      node: seed.node,
      score: seed.score,
      hop: 0,
      wikiExcerpt: null,
    });
  }

  let frontier: string[] = seeds.map((seed) => seed.node.id);
  for (let hop = 1; hop <= MAX_HOPS; hop += 1) {
    const nextFrontier: string[] = [];
    for (const nodeId of frontier) {
      const neighbors: string[] = collectNeighbors(nodeId, edges);
      for (const neighborId of neighbors) {
        const neighbor: GraphNode | undefined = byId.get(neighborId);
        if (neighbor === undefined) {
          continue;
        }
        const parent: EvidenceItem | undefined = retained.get(nodeId);
        const inheritedScore: number =
          parent !== undefined ? Math.max(0.5, parent.score * 0.55) : 0.5;
        const existing: EvidenceItem | undefined = retained.get(neighborId);
        if (existing !== undefined) {
          if (inheritedScore > existing.score) {
            existing.score = inheritedScore;
            existing.hop = hop;
          }
          continue;
        }
        retained.set(neighborId, {
          node: neighbor,
          score: inheritedScore,
          hop,
          wikiExcerpt: null,
        });
        nextFrontier.push(neighborId);
      }
    }
    frontier = nextFrontier;
  }

  // Re-score hop neighbors against the query so linked principles stay visible.
  const queryTokens: string[] = tokenize(normalizedQuery);
  for (const item of retained.values()) {
    if (item.hop === 0) {
      continue;
    }
    const haystack: string = [item.node.title, item.node.summary, ...(item.node.tags ?? [])]
      .join(" ")
      .toLowerCase();
    let lexicalBoost = 0;
    for (const token of queryTokens) {
      if (haystack.includes(token)) {
        lexicalBoost += 0.9;
      }
    }
    item.score += lexicalBoost;
  }

  const ranked: EvidenceItem[] = [...retained.values()]
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.hop - b.hop;
    })
    .slice(0, MAX_EVIDENCE_NODES)
    .map((item) => ({
      ...item,
      wikiExcerpt: loadWikiExcerpt(item.node),
    }));

  const bestSeedScore: number = seeds.length > 0 ? seeds[0].score : 0;
  const hasBoundDoctrine: boolean = ranked.some(
    (item) =>
      (item.node.doctrine === "endorse" ||
        item.node.doctrine === "reject" ||
        item.node.doctrine === "conditional") &&
      item.node.status !== "suggested" &&
      Array.isArray(item.node.citations) &&
      item.node.citations.length > 0,
  );

  const coverage: "in" | "out" =
    bestSeedScore >= IN_COVERAGE_MIN_SCORE && hasBoundDoctrine ? "in" : "out";

  const sources: ChatSource[] = ranked.map((item) => ({
    id: item.node.id,
    title: item.node.title,
    type: item.node.type,
  }));

  return {
    query: normalizedQuery,
    coverage,
    evidence: ranked,
    sources,
    evidencePackText: formatEvidencePack(ranked, coverage),
  };
}

/**
 * Soft-merges pack boundNodeIds into an already-ranked probe result.
 * Appends missing anchors at the end (does not re-sort to the top) so module
 * grounding stays available for citations without flooding lexical seed scores.
 */
export function mergeBoundNodesIntoProbe(
  probe: ProbeResult,
  boundNodeIds: string[] | undefined,
): ProbeResult {
  if (boundNodeIds === undefined || boundNodeIds.length === 0) {
    return probe;
  }

  const present: Set<string> = new Set(probe.evidence.map((item) => item.node.id));
  const missingIds: string[] = boundNodeIds.filter((id) => !present.has(id));
  if (missingIds.length === 0) {
    return probe;
  }

  let nodes: GraphNode[];
  try {
    nodes = loadTeachingGraph().nodes;
  } catch {
    return probe;
  }

  const byId: Map<string, GraphNode> = new Map(nodes.map((node) => [node.id, node]));
  const extras: EvidenceItem[] = [];

  for (const id of missingIds.slice(0, MAX_BOUND_APPEND)) {
    const node: GraphNode | undefined = byId.get(id);
    if (node === undefined) {
      continue;
    }
    extras.push({
      node,
      score: 0,
      hop: 99,
      wikiExcerpt: loadWikiExcerpt(node),
    });
  }

  if (extras.length === 0) {
    return probe;
  }

  const evidence: EvidenceItem[] = [...probe.evidence, ...extras];
  const sources: ChatSource[] = evidence.map((item) => ({
    id: item.node.id,
    title: item.node.title,
    type: item.node.type,
  }));

  return {
    query: probe.query,
    coverage: probe.coverage,
    evidence,
    sources,
    evidencePackText: formatEvidencePack(evidence, probe.coverage),
  };
}

/**
 * Normalizes user text for lexical matching (keeps CJK characters).
 */
function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

/**
 * Tokenizes for lexical seed scoring. Latin words + individual CJK chars.
 */
function tokenize(text: string): string[] {
  const lower: string = text.toLowerCase();
  const tokens: string[] = [];
  const wordMatches: RegExpMatchArray | null = lower.match(/[a-z0-9_]+/g);
  if (wordMatches !== null) {
    for (const word of wordMatches) {
      if (word.length >= 2) {
        tokens.push(word);
      }
    }
  }
  const cjkMatches: RegExpMatchArray | null = lower.match(/[\u3400-\u9fff]/g);
  if (cjkMatches !== null) {
    for (const run of cjkMatches) {
      for (const char of run) {
        tokens.push(char);
      }
      if (run.length >= 2) {
        tokens.push(run);
      }
    }
  }
  return tokens;
}

/**
 * Scores every node against the query; returns descending list.
 */
function scoreSeeds(query: string, nodes: GraphNode[]): ScoredSeed[] {
  const queryTokens: string[] = tokenize(query);
  const queryLower: string = query.toLowerCase();
  const scored: ScoredSeed[] = [];

  for (const node of nodes) {
    const haystack: string = [
      node.id,
      node.type,
      node.title,
      node.summary,
      ...(node.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();

    let score = 0;

    if (queryLower.length >= 2 && haystack.includes(queryLower)) {
      score += 4;
    }

    for (const token of queryTokens) {
      if (haystack.includes(token)) {
        score += token.length >= 3 || /[\u3400-\u9fff]/.test(token) ? 1.2 : 0.6;
      }
      if (node.title.toLowerCase().includes(token)) {
        score += 0.8;
      }
      if (node.id.toLowerCase().includes(token)) {
        score += 0.4;
      }
    }

    if (node.doctrine === "endorse" || node.doctrine === "reject") {
      score += 0.25;
    }
    if (node.status === "suggested" || node.doctrine === "unknown") {
      score -= 0.35;
    }

    // Require a lexical hit; do not seed on doctrine bonus alone.
    const hasLexicalHit: boolean =
      (queryLower.length >= 2 && haystack.includes(queryLower)) ||
      queryTokens.some(
        (token) =>
          haystack.includes(token) ||
          node.title.toLowerCase().includes(token) ||
          node.id.toLowerCase().includes(token),
      );

    if (hasLexicalHit && score > 0) {
      scored.push({ node, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

/**
 * Collects adjacent node ids for one hop (both edge directions).
 */
function collectNeighbors(nodeId: string, edges: GraphEdge[]): string[] {
  const neighbors: string[] = [];
  for (const edge of edges) {
    if (edge.from === nodeId) {
      neighbors.push(edge.to);
    } else if (edge.to === nodeId) {
      neighbors.push(edge.from);
    }
  }
  return neighbors;
}

/**
 * Loads a short excerpt from the node's wiki_page or first wiki citation.
 */
function loadWikiExcerpt(node: GraphNode): string | null {
  const candidates: string[] = [];
  if (typeof node.wiki_page === "string" && node.wiki_page.length > 0) {
    candidates.push(node.wiki_page);
  }
  for (const citation of node.citations ?? []) {
    if (typeof citation.wiki_path === "string" && citation.wiki_path.length > 0) {
      candidates.push(citation.wiki_path);
    }
  }

  for (const candidate of candidates) {
    if (isForbiddenDoctrinePath(candidate)) {
      continue;
    }
    const absolute: string | null = resolveJeffWikiFile(candidate);
    if (absolute === null) {
      continue;
    }
    const body: string = fs.readFileSync(absolute, "utf8").trim();
    if (body.length === 0) {
      continue;
    }
    const excerpt: string =
      body.length > MAX_WIKI_CHARS ? `${body.slice(0, MAX_WIKI_CHARS)}\n…[truncated]` : body;
    return excerpt;
  }

  return null;
}

/**
 * Formats the evidence pack string injected into the model prompt.
 */
function formatEvidencePack(evidence: EvidenceItem[], coverage: "in" | "out"): string {
  if (evidence.length === 0) {
    return [
      "COVERAGE: out",
      "No retained Jeff Teaching Graph nodes for this question.",
      "Use Generally → Jeff → steer toward inventory, brand, ownership, clarity, or positioning.",
      "Do not invent Jeff-named frameworks.",
    ].join("\n");
  }

  const lines: string[] = [
    `COVERAGE: ${coverage}`,
    "Use only the nodes below for Jeff-attributable claims.",
    "Nodes with status suggested or doctrine unknown are not settled Jeff IP.",
    "",
  ];

  for (const item of evidence) {
    lines.push(`### ${item.node.id} (${item.node.type})`);
    lines.push(`title: ${item.node.title}`);
    lines.push(`doctrine: ${item.node.doctrine}; status: ${item.node.status}; confidence: ${item.node.confidence}`);
    lines.push(`summary: ${item.node.summary}`);
    if (item.node.tags !== undefined && item.node.tags.length > 0) {
      lines.push(`tags: ${item.node.tags.join(", ")}`);
    }
    if (item.wikiExcerpt !== null) {
      lines.push("wiki_excerpt:");
      lines.push(item.wikiExcerpt);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function isNodesFile(value: unknown): value is NodesFile {
  if (typeof value !== "object" || value === null || !("nodes" in value)) {
    return false;
  }
  return Array.isArray((value as { nodes: unknown }).nodes);
}

function isEdgesFile(value: unknown): value is EdgesFile {
  if (typeof value !== "object" || value === null || !("edges" in value)) {
    return false;
  }
  return Array.isArray((value as { edges: unknown }).edges);
}
