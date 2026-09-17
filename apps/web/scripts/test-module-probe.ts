/**
 * Checks module probe fidelity: user answers must move source ranking.
 * Does not call OpenAI. Run from apps/web: npx tsx scripts/test-module-probe.ts
 */

import { buildModuleProbeQuery, selectModuleProbeHints } from "../lib/modules/modulePrompt";
import { getModulePack } from "../lib/modules/packs";
import { mergeBoundNodesIntoProbe, probeTeaching } from "../lib/probe";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function jaccard(a: string[], b: string[]): number {
  const setA: Set<string> = new Set(a);
  const setB: Set<string> = new Set(b);
  let inter = 0;
  for (const id of setA) {
    if (setB.has(id)) {
      inter += 1;
    }
  }
  const union: number = setA.size + setB.size - inter;
  return union === 0 ? 1 : inter / union;
}

const packLookup = getModulePack("ip-stage-check");
if (packLookup === undefined) {
  throw new Error("ip-stage-check pack missing");
}
const pack = packLookup;

const hints = selectModuleProbeHints(pack.probeHints);
assert(hints.length <= 4, "Expected at most 4 module probe hints.");
assert(!hints.includes("probe_jeff"), "probe_jeff must not enter lexical hints.");

const ua = "我卡在曝光，没人看到我";
const ub = "信任够了但不成交，DM很多但不转化";

const qa = buildModuleProbeQuery({ baseQuery: ua, pack, intake: undefined });
const qb = buildModuleProbeQuery({ baseQuery: ub, pack, intake: undefined });

assert(!qa.includes("pr.direction-beats-volume"), "bound ids must not flood the probe query");
assert(qa.endsWith(ua) || qa.includes(`\n${ua}`), "latest user ask must remain in the query");

let ma = probeTeaching(qa);
let mb = probeTeaching(qb);
ma = mergeBoundNodesIntoProbe(ma, pack.boundNodeIds);
mb = mergeBoundNodesIntoProbe(mb, pack.boundNodeIds);

const overlap: number = jaccard(
  ma.sources.map((source) => source.id),
  mb.sources.map((source) => source.id),
);

assert(overlap < 0.95, `Module sources still too identical across answers (Jaccard ${overlap.toFixed(2)}).`);
assert(
  ma.sources[0]?.id !== mb.sources[0]?.id || ma.sources[1]?.id !== mb.sources[1]?.id,
  "Expected top sources to shift when the stuck stage changes.",
);

for (const id of pack.boundNodeIds ?? []) {
  assert(
    ma.sources.some((source) => source.id === id),
    `Bound node ${id} should soft-merge into sources after probe.`,
  );
}

console.log("module probe ok");
console.log(
  JSON.stringify(
    {
      hintCount: hints.length,
      jaccard: Number(overlap.toFixed(2)),
      topA: ma.sources.slice(0, 3).map((source) => source.id),
      topB: mb.sources.slice(0, 3).map((source) => source.id),
    },
    null,
    2,
  ),
);
