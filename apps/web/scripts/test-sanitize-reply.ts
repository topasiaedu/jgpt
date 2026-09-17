/**
 * Unit-style checks for English quote normalization + sanitizeAssistantReply.
 * Does not call OpenAI. Run from apps/web: npx tsx scripts/test-sanitize-reply.ts
 */

import { normalizeEnglishQuotes } from "../lib/normalizeEnglishQuotes";
import { sanitizeAssistantReply } from "../lib/sanitizeAssistantReply";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const quoteCases: Array<{ input: string; expected: string; label: string }> = [
  {
    label: "corner quotes",
    input: "Say 「boss is the brand」 out loud.",
    expected: "Say \"boss is the brand\" out loud.",
  },
  {
    label: "double corner quotes",
    input: "Call it 『content asset』.",
    expected: "Call it \"content asset\".",
  },
  {
    label: "curly doubles",
    input: "Get seen first. Then “trust”.",
    expected: "Get seen first. Then \"trust\".",
  },
  {
    label: "fullwidth quote",
    input: "This is ＂positioning＂.",
    expected: "This is \"positioning\".",
  },
  {
    label: "curly singles",
    input: "It is the founder’s face.",
    expected: "It is the founder's face.",
  },
];

for (const testCase of quoteCases) {
  const got: string = normalizeEnglishQuotes(testCase.input);
  assert(
    got === testCase.expected,
    `${testCase.label}: expected ${JSON.stringify(testCase.expected)}, got ${JSON.stringify(got)}`,
  );
}

const sanitizedEn: string = sanitizeAssistantReply(
  "Get seen first — say 「boss is the brand」.",
  "en",
);
assert(
  sanitizedEn === "Get seen first. say \"boss is the brand\".",
  `en sanitize: got ${JSON.stringify(sanitizedEn)}`,
);
assert(!sanitizedEn.includes("「"), "en sanitize must drop corner quotes");
assert(!sanitizedEn.includes("—"), "en sanitize must drop em dash");

const sanitizedZh: string = sanitizeAssistantReply(
  "先被看到 — 说「老板就是品牌」。",
  "zh",
);
assert(
  sanitizedZh.includes("「") && sanitizedZh.includes("」"),
  "zh sanitize must keep Chinese corner quotes",
);
assert(!sanitizedZh.includes("—"), "zh sanitize must still strip em dash");

console.log("sanitize-reply ok");
console.log(`ran ${String(quoteCases.length)} quote cases + locale sanitize checks`);
