/**
 * Unit checks for response QA judge parsing (no OpenAI calls).
 * Run from apps/web: npm run test:response-qa
 */

import {
  isResponseQaEnabled,
  latestUserAsk,
  parseJudgeVerdict,
  parseJudgeVerdictFromText,
} from "../lib/responseQa";
import type { ChatMessage } from "../lib/chatTypes";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const passVerdict = parseJudgeVerdict({
  pass: true,
  reasons: ["clarifying turn is appropriate"],
  fixInstructions: "",
});
assert(passVerdict !== null, "pass verdict should parse");
assert(passVerdict.pass === true, "pass should be true");
assert(passVerdict.reasons.length === 1, "should keep reasons");

const failVerdict = parseJudgeVerdict({
  pass: false,
  reasons: ["1 minute ask but only 5 short lines"],
  fixInstructions: "Expand into a full speakable 1-minute script with beats.",
});
assert(failVerdict !== null, "fail verdict should parse");
assert(failVerdict.pass === false, "pass should be false");
assert(
  failVerdict.fixInstructions.includes("1-minute"),
  "should keep fix instructions",
);

const snakeCase = parseJudgeVerdict({
  pass: false,
  reasons: ["too short"],
  fix_instructions: "Write the full script.",
});
assert(snakeCase !== null, "snake_case fix_instructions should parse");
assert(
  snakeCase.fixInstructions === "Write the full script.",
  "should map fix_instructions",
);

assert(parseJudgeVerdict(null) === null, "null should fail");
assert(parseJudgeVerdict({ pass: "yes" }) === null, "non-boolean pass should fail");
assert(
  parseJudgeVerdict({ pass: false, reasons: [], fixInstructions: "" }) === null,
  "fail with no guidance should fail parse",
);

const fromText = parseJudgeVerdictFromText(
  "{\"pass\":true,\"reasons\":[\"ok\"],\"fixInstructions\":\"\"}",
);
assert(fromText !== null && fromText.pass === true, "JSON text should parse");

const messy = parseJudgeVerdictFromText(
  "Here you go:\n{\"pass\":false,\"reasons\":[\"stub\"],\"fixInstructions\":\"Expand.\"}\n",
);
assert(messy !== null && messy.pass === false, "messy JSON extract should work");

const messages: ChatMessage[] = [
  { role: "assistant", content: "What niche?" },
  { role: "user", content: "  Write a 1 minute script about trust.  " },
];
assert(
  latestUserAsk(messages) === "Write a 1 minute script about trust.",
  "latestUserAsk should trim latest user",
);

const previousEnabled: string | undefined = process.env.OPENAI_QA_ENABLED;
process.env.OPENAI_QA_ENABLED = "0";
assert(isResponseQaEnabled() === false, "OPENAI_QA_ENABLED=0 should disable");
process.env.OPENAI_QA_ENABLED = "false";
assert(isResponseQaEnabled() === false, "OPENAI_QA_ENABLED=false should disable");
delete process.env.OPENAI_QA_ENABLED;
assert(isResponseQaEnabled() === true, "unset OPENAI_QA_ENABLED should enable");
if (previousEnabled === undefined) {
  delete process.env.OPENAI_QA_ENABLED;
} else {
  process.env.OPENAI_QA_ENABLED = previousEnabled;
}

console.log("response-qa ok");
console.log("ran judge parse + toggle + latestUserAsk checks");
