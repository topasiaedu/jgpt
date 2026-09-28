/**
 * Tiny parser smoke for Hook Studio H2/H3 (no test framework).
 * Run: npx tsx scripts/smoke-hook-studio-parse.ts
 */

import { parseHookStudioReply } from "../lib/hookStudio/parseHookStudioHooks";
import type { HookStudioMode } from "../lib/hookStudio/types";

type Case = {
  name: string;
  input: string;
  mode: HookStudioMode;
  expectKind: "cards" | "fallback";
  expectCardCount?: number;
  expectFilmFirstCount?: number;
};

const completeLegs = {
  audience: "coaches",
  pain: "invisible",
  contrast_or_result: "seen then trusted",
  curiosity: "what changed",
};

const cases: Case[] = [
  {
    name: "fenced json from-idea",
    mode: "from-idea",
    expectKind: "cards",
    expectCardCount: 2,
    expectFilmFirstCount: 1,
    input: [
      "Here you go:",
      "```json",
      JSON.stringify({
        hooks: [
          {
            hook_text: "Open A",
            why_it_works: "Four legs land",
            formula_legs: completeLegs,
            film_first: true,
          },
          {
            hook_text: "Open B",
            why_it_works: "Also complete",
            formula_legs: {
              audience: "sellers",
              pain: "ads fail",
              contrast_or_result: "assets win",
              curiosity: "how",
            },
            film_first: false,
          },
        ],
      }),
      "```",
      "Which one will you film?",
    ].join("\n"),
  },
  {
    name: "drop incomplete from-idea legs",
    mode: "from-idea",
    expectKind: "cards",
    expectCardCount: 1,
    expectFilmFirstCount: 1,
    input: JSON.stringify({
      hooks: [
        {
          hook_text: "Incomplete",
          why_it_works: "missing curiosity",
          formula_legs: {
            audience: "a",
            pain: "b",
            contrast_or_result: "c",
            curiosity: "",
          },
        },
        {
          hook_text: "Complete",
          why_it_works: "ok",
          formula_legs: completeLegs,
        },
      ],
    }),
  },
  {
    name: "rewrite without legs keeps rewrite_note",
    mode: "rewrite",
    expectKind: "cards",
    expectCardCount: 1,
    expectFilmFirstCount: 1,
    input: JSON.stringify({
      hooks: [
        {
          hook_text: "Stronger open",
          why_it_works: "Earns first seconds",
          rewrite_note: "Sharpened pain + curiosity",
        },
      ],
    }),
  },
  {
    name: "competitor requires formula legs",
    mode: "competitor",
    expectKind: "cards",
    expectCardCount: 1,
    expectFilmFirstCount: 1,
    input: JSON.stringify({
      hooks: [
        {
          hook_text: "Dropped no legs",
          why_it_works: "pattern named",
        },
        {
          hook_text: "Grounded in proof",
          why_it_works: "Extracted contrast pattern into user niche",
          formula_legs: completeLegs,
          film_first: true,
        },
      ],
    }),
  },
  {
    name: "repeat requires formula legs",
    mode: "repeat",
    expectKind: "cards",
    expectCardCount: 1,
    expectFilmFirstCount: 1,
    input: JSON.stringify({
      hooks: [
        {
          hook_text: "Varied angle",
          why_it_works: "Kept pain mechanism, changed specificity",
          formula_legs: completeLegs,
        },
      ],
    }),
  },
  {
    name: "prose fallback",
    mode: "from-idea",
    expectKind: "fallback",
    input: "1. Soft open\n对象: x\nNot JSON at all.",
  },
];

let failed = 0;
for (const testCase of cases) {
  const result = parseHookStudioReply(testCase.input, { mode: testCase.mode });
  const kindOk: boolean = result.kind === testCase.expectKind;
  let detailOk = true;
  if (result.kind === "cards") {
    if (
      typeof testCase.expectCardCount === "number" &&
      result.cards.length !== testCase.expectCardCount
    ) {
      detailOk = false;
    }
    if (typeof testCase.expectFilmFirstCount === "number") {
      const filmCount: number = result.cards.filter((card) => card.film_first).length;
      if (filmCount !== testCase.expectFilmFirstCount) {
        detailOk = false;
      }
    }
  }

  if (kindOk && detailOk) {
    console.log(`ok  ${testCase.name}`);
  } else {
    failed += 1;
    console.log(`FAIL ${testCase.name}`, JSON.stringify(result));
  }
}

if (failed > 0) {
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, cases: cases.length }));
