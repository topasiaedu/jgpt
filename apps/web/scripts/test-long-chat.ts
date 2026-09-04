/**
 * Verifies long-chat context rules without calling OpenAI:
 * - dialogue-only history (no sources / evidence blobs)
 * - last-16 cap
 * - fresh probe per latest ask (turn 2 funnel ≠ turn 1 founder dump alone)
 *
 * Run from apps/web: npm run test:long-chat
 */

import { buildProbeQuery, MAX_DIALOGUE_MESSAGES, toDialogueOnly } from "../lib/dialogue";
import { mergeSourcesById } from "../lib/mergeSources";
import { probeTeaching } from "../lib/probe";
import { buildSystemPrompt } from "../lib/systemPrompt";
import type { ChatMessage } from "../lib/chatTypes";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const fakeEvidenceBlob = "### fake-node (principle)\nwiki_excerpt:\nSTALE EVIDENCE FROM TURN 1";

const longHistory: ChatMessage[] = [];
for (let i = 0; i < 24; i += 1) {
  longHistory.push({
    role: i % 2 === 0 ? "user" : "assistant",
    content: i % 2 === 0 ? `user ask ${i}` : `assistant reply ${i}`,
    sources:
      i % 2 === 1
        ? [{ id: `stale-${i}`, title: "Stale", type: "principle" }]
        : undefined,
  });
}
// Poison an assistant content with an evidence-looking blob to prove we only pass content as dialogue.
longHistory[1] = {
  role: "assistant",
  content: `Short coaching answer.\n\n${fakeEvidenceBlob}`,
  sources: [{ id: "stale-founder", title: "Unseen founder", type: "principle" }],
};

const dialogue = toDialogueOnly(longHistory);
assert(dialogue.length === MAX_DIALOGUE_MESSAGES, `Expected ${MAX_DIALOGUE_MESSAGES} dialogue messages.`);
assert(
  dialogue.every((message) => message.sources === undefined),
  "Dialogue messages must not carry sources metadata.",
);
assert(
  dialogue[0]?.content === "user ask 8",
  "Expected oldest kept message to be the 9th from the end of a 24-message list.",
);

const turn1Query = "I am an unseen founder. Where should I start with personal brand and IP?";
const turn2Query = "give me a webinar funnel script for diabetes";

const turn1 = probeTeaching(turn1Query);
const turn2 = probeTeaching(turn2Query);

assert(turn1.evidence.length > 0, "Turn 1 (unseen founder) should retain evidence.");
assert(turn2.evidence.length > 0, "Turn 2 (webinar funnel / diabetes) should retain evidence.");

const turn1Ids = new Set(turn1.sources.map((source) => source.id));
const turn2Ids = new Set(turn2.sources.map((source) => source.id));
const overlap = [...turn2Ids].filter((id) => turn1Ids.has(id));
const turn2Only = [...turn2Ids].filter((id) => !turn1Ids.has(id));

assert(
  turn2Only.length > 0 || turn2.evidencePackText !== turn1.evidencePackText,
  "Turn 2 probe should not be an identical copy of turn 1 founder evidence.",
);

const historyForTurn2: ChatMessage[] = [
  { role: "user", content: turn1Query },
  {
    role: "assistant",
    content: "Start by getting seen. Boss is the brand.",
    sources: turn1.sources,
  },
  { role: "user", content: turn2Query },
];

const probeQuery = buildProbeQuery(toDialogueOnly(historyForTurn2));
assert(probeQuery === turn2Query, "Full topic-shift ask must probe on latest message only (no prior founder blend).");
assert(!probeQuery.includes(fakeEvidenceBlob), "Probe query must not include prior evidence blobs.");

const followUpHistory: ChatMessage[] = [
  ...historyForTurn2,
  { role: "assistant", content: "Here is a draft structure." },
  { role: "user", content: "Can you sharpen that?" },
];
const followUpQuery = buildProbeQuery(toDialogueOnly(followUpHistory));
assert(
  followUpQuery.includes("Can you sharpen that?") && followUpQuery.includes(turn2Query),
  "Short pronoun-like follow-up may blend prior user ask for resolution.",
);

const systemPrompt = buildSystemPrompt({
  evidencePackText: turn2.evidencePackText,
  coverage: turn2.coverage,
});

assert(systemPrompt.includes("this turn only") || systemPrompt.includes("THIS USER TURN"), "Prompt must state this-turn evidence.");
assert(systemPrompt.includes("probe_jeff"), "Prompt must mention probe_jeff tool.");
assert(systemPrompt.includes(turn2.evidencePackText), "System prompt must include this turn's evidence pack.");
assert(
  !systemPrompt.includes(turn1.evidencePackText) || turn1.evidencePackText === turn2.evidencePackText,
  "System prompt must not paste turn 1 evidence when composing turn 2 (unless packs identical).",
);

const dialogueForModel = toDialogueOnly(historyForTurn2);
assert(
  dialogueForModel.every((message) => !("sources" in message) || message.sources === undefined),
  "Model history must be dialogue-only.",
);
assert(
  !dialogueForModel.some((message) => message.content.includes("wiki_excerpt:")),
  "Capped history should not inject wiki_excerpt evidence sections (assistant replies are speech only).",
);

const merged = mergeSourcesById(turn1.sources, turn2.sources);
assert(merged.length >= turn2.sources.length, "Union of sources should include turn 2 sources.");

console.log("long-chat context ok");
console.log(
  JSON.stringify(
    {
      dialogueLen: dialogue.length,
      turn1SourceCount: turn1.sources.length,
      turn2SourceCount: turn2.sources.length,
      overlapCount: overlap.length,
      turn2OnlyCount: turn2Only.length,
      probeQuery,
      followUpQueryPreview: followUpQuery.slice(0, 160),
    },
    null,
    2,
  ),
);
