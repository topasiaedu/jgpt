/**
 * Types for jeff-graph nodes.json / edges.json (see jeff-graph/schema.md).
 */

export type DoctrineStatus = "endorse" | "reject" | "conditional" | "unknown";

export type NodeStatus = "suggested" | "draft" | "approved" | "deprecated";

export type GraphCitation = {
  wiki_path?: string;
  raw_path?: string;
  span_note?: string;
};

export type GraphNode = {
  id: string;
  type: string;
  title: string;
  summary: string;
  status: string;
  confidence: number;
  doctrine: string;
  citations: GraphCitation[];
  wiki_page?: string;
  tags?: string[];
  created?: string;
  updated?: string;
};

export type GraphEdge = {
  id: string;
  type: string;
  from: string;
  to: string;
  confidence: number;
  summary: string;
  citations?: GraphCitation[];
};

export type NodesFile = {
  version: number;
  nodes: GraphNode[];
};

export type EdgesFile = {
  version: number;
  edges: GraphEdge[];
};
