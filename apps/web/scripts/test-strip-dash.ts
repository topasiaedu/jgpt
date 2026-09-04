/**
 * Unit-style checks for stripDashPunctuation.
 * Does not call OpenAI. Run from apps/web: npm run test:strip-dash
 */

import { stripDashPunctuation } from "../lib/stripDashPunctuation";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const cases: Array<{ input: string; expected: string; label: string }> = [
  {
    label: "em dash bilingual",
    input: "先被看到 — nobody knows you yet",
    expected: "先被看到. nobody knows you yet",
  },
  {
    label: "em dash mid sentence",
    input: "Content is资产, not ads — so focus on assets.",
    expected: "Content is资产, not ads. so focus on assets.",
  },
  {
    label: "en dash",
    input: "Trust first – then deal.",
    expected: "Trust first. then deal.",
  },
  {
    label: "spaced hyphen as dash",
    input: "One move - then ask back.",
    expected: "One move. then ask back.",
  },
  {
    label: "preserves in-word hyphens",
    input: "See jeff-wiki and well-known terms.",
    expected: "See jeff-wiki and well-known terms.",
  },
  {
    label: "no-op when clean",
    input: "Careful with that one. What matters is ownership.",
    expected: "Careful with that one. What matters is ownership.",
  },
];

for (const testCase of cases) {
  const got: string = stripDashPunctuation(testCase.input);
  assert(
    got === testCase.expected,
    `${testCase.label}: expected ${JSON.stringify(testCase.expected)}, got ${JSON.stringify(got)}`,
  );
}

assert(
  !stripDashPunctuation("a — b – c - d").includes("—"),
  "em dash must be gone",
);
assert(
  !stripDashPunctuation("a — b – c - d").includes("–"),
  "en dash must be gone",
);

console.log("strip-dash ok");
console.log(`ran ${String(cases.length)} cases`);
