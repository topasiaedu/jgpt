import { NextResponse } from "next/server";

import {
  RECOMMEND_DRAFT_MIN_CHARS,
  validateRecommendedModuleIds,
} from "@/lib/modules/recommend";
import { generateHomeRecommendIds, getOpenAIConfig } from "@/lib/openai";

/** Lightweight recommend only; no probe loop. */
export const runtime = "nodejs";
/** Short headroom for a single constrained completion. */
export const maxDuration = 30;
export const dynamic = "force-dynamic";

export type RecommendResponseBody = {
  moduleIds: string[];
  /** too_short: draft under min chars; vague: model found no clear tools; ok: 2 to 4 ids. */
  status: "ok" | "vague" | "too_short";
};

export type RecommendErrorBody = {
  error: string;
};

/**
 * POST /api/recommend: debounced home as-you-type tool suggestions.
 * Returns validated catalog ids only. No coaching essay, no jeff probe.
 */
export async function POST(
  request: Request,
): Promise<NextResponse<RecommendResponseBody | RecommendErrorBody>> {
  try {
    return await handleRecommendPost(request);
  } catch (error) {
    const message: string =
      error instanceof Error ? error.message : "Unexpected recommend API failure.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Core recommend handler. Thrown errors become JSON via POST.
 */
async function handleRecommendPost(
  request: Request,
): Promise<NextResponse<RecommendResponseBody | RecommendErrorBody>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  if (!isRecommendRequestBody(body)) {
    return NextResponse.json(
      { error: "Body must include draft: string. Optional locale is ignored for ids." },
      { status: 400 },
    );
  }

  const draft: string = body.draft.trim().replace(/\s+/g, " ");
  if (draft.length < RECOMMEND_DRAFT_MIN_CHARS) {
    return NextResponse.json({ moduleIds: [], status: "too_short" });
  }

  const { apiKey, model } = getOpenAIConfig();
  if (apiKey === null) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is not set on the server. Add it in the Vercel project Environment Variables (Production), then redeploy.",
      },
      { status: 503 },
    );
  }

  try {
    const rawIds: string[] = await generateHomeRecommendIds({
      apiKey,
      model,
      draft,
    });
    const moduleIds: string[] = validateRecommendedModuleIds(rawIds);
    if (moduleIds.length === 0) {
      return NextResponse.json({ moduleIds: [], status: "vague" });
    }
    return NextResponse.json({ moduleIds, status: "ok" });
  } catch (error) {
    const message: string =
      error instanceof Error ? error.message : "OpenAI recommend request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

type RecommendRequestBody = {
  draft: string;
  locale?: "zh" | "en";
};

/**
 * Runtime validation for the recommend request body.
 */
function isRecommendRequestBody(value: unknown): value is RecommendRequestBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("draft" in value) || typeof (value as { draft: unknown }).draft !== "string") {
    return false;
  }

  if ("locale" in value) {
    const locale = (value as { locale: unknown }).locale;
    if (locale !== undefined && locale !== "zh" && locale !== "en") {
      return false;
    }
  }

  return true;
}
