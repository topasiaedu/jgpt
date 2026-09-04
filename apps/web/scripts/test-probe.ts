/**
 * Unit-style check: probe returns real graph nodes for a sample query.
 * Does not call OpenAI. Run from apps/web: npm run test:probe
 */

import { probeTeaching } from "../lib/probe";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const sampleQuery = "曝光 信任 成交 founder face 招牌";
const result = probeTeaching(sampleQuery);

assert(result.evidence.length > 0, "Expected evidence nodes for sample query.");
assert(result.sources.length === result.evidence.length, "Sources length mismatch.");

const ids: string[] = result.sources.map((source) => source.id);
const expectedAny: string[] = [
  "pr.exposure-trust-conversion",
  "pr.founder-face-printshop",
  "fw.exposure-trust-deal",
  "cl.buy-people-not-product",
];
const hit: boolean = expectedAny.some((id) => ids.includes(id));
assert(hit, `Expected one of ${expectedAny.join(", ")}; got ${ids.join(", ")}`);

for (const source of result.sources) {
  assert(typeof source.id === "string" && source.id.length > 0, "Source id missing.");
  assert(typeof source.title === "string" && source.title.length > 0, "Source title missing.");
  assert(typeof source.type === "string" && source.type.length > 0, "Source type missing.");
}

console.log("probe ok");
console.log(
  JSON.stringify(
    {
      query: sampleQuery,
      coverage: result.coverage,
      sourceCount: result.sources.length,
      sources: result.sources,
    },
    null,
    2,
  ),
);
