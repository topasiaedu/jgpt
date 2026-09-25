/**
 * Live smoke: force a stub draft through module QA and expect one repair.
 * Run: npx tsx scripts/smoke-response-qa-repair.ts
 */

import { readFileSync } from "fs";
import { runModuleResponseQa } from "../lib/responseQa";

function loadEnvLocal(): void {
  const raw: string = readFileSync(".env.local", "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed: string = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      continue;
    }
    const eq: number = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key: string = trimmed.slice(0, eq).trim();
    let val: string = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith("\"") && val.endsWith("\"")) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

async function main(): Promise<void> {
  loadEnvLocal();

  const apiKeyRaw: string | undefined = process.env.OPENAI_API_KEY;
  if (typeof apiKeyRaw !== "string" || apiKeyRaw.trim().length === 0) {
    console.log(JSON.stringify({ skipped: true, reason: "no OPENAI_API_KEY" }));
    process.exit(0);
  }

  const apiKey: string = apiKeyRaw.trim();
  const repairModelRaw: string | undefined = process.env.OPENAI_MODEL;
  const repairModel: string =
    typeof repairModelRaw === "string" && repairModelRaw.trim().length > 0
      ? repairModelRaw.trim()
      : "gpt-4.1-mini";

  const stub: string =
    "Here is a quick script.\n1. Hook.\n2. Problem.\n3. Tip.\n4. Soft CTA.\nWant me to expand it?";

  const start: number = Date.now();
  const result = await runModuleResponseQa({
    apiKey,
    repairModel,
    locale: "en",
    moduleId: "ig-reel-script",
    moduleTitle: "IG Reel Script",
    messages: [
      {
        role: "user",
        content:
          "Write a full 1 minute IG Reel script for boutique fitness. Audience busy women. Standpoint: consistency beats intensity. Soft CTA DM PLAN. No more questions.",
      },
    ],
    draftReply: stub,
  });
  const elapsedMs: number = Date.now() - start;

  console.log(
    JSON.stringify(
      {
        elapsedMs,
        qaRan: result.qaRan,
        qaPassed: result.qaPassed,
        repaired: result.repaired,
        judgeReasons: result.judgeReasons,
        stubChars: stub.length,
        replyChars: result.reply.length,
        expanded: result.reply.length > stub.length * 2,
        replyPreview: result.reply.slice(0, 700),
      },
      null,
      2,
    ),
  );

  const ok: boolean =
    result.qaRan &&
    result.qaPassed === false &&
    result.repaired &&
    result.reply.length > stub.length * 2;

  process.exit(ok ? 0 : 2);
}

main().catch((error: unknown) => {
  const message: string = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
