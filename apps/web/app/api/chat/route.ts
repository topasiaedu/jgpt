import { NextResponse } from "next/server";

import type {
  ChatErrorBody,
  ChatMessage,
  ChatRequestBody,
  ChatResponseBody,
} from "@/lib/chatTypes";
import { requireAuthedApi } from "@/lib/brandProfile/apiAuth";
import { isUuid } from "@/lib/brandProfile/db";
import { loadOwnedBrandProfileForChat } from "@/lib/brandProfile/loadChatContext";
import { probeBrandChunks } from "@/lib/brandProfile/probeBrand";
import { buildUserBrandFactsBlock } from "@/lib/brandProfile/userBrandFacts";
import { buildProbeQuery, toDialogueOnly } from "@/lib/dialogue";
import {
  appendModuleSystemOverlay,
  buildModuleProbeQuery,
} from "@/lib/modules/modulePrompt";
import { getModuleById } from "@/lib/modules/catalog";
import { getModulePack } from "@/lib/modules/packs";
import { HOME_INTENT_Q_MAX_CHARS } from "@/lib/modules/homeHandoff";
import { appendHomeRecommendOverlay } from "@/lib/modules/recommend";
import {
  detectLifecycleMode,
  isQualityRuntimeEnabled,
  systemPromptFormattingOverride,
} from "@/lib/modules/qualityRuntime";
import { generateJeffReply, getOpenAIConfig } from "@/lib/openai";
import { mergeBoundNodesIntoProbe, probeTeaching } from "@/lib/probe";
import { DEFAULT_LOCALE, parseLocale, type Locale } from "@/lib/i18n/messages";
import { runModuleResponseQa } from "@/lib/responseQa";
import { sanitizeAssistantReply } from "@/lib/sanitizeAssistantReply";
import { buildSystemPrompt } from "@/lib/systemPrompt";

/** fs-based probe + OpenAI tool loop; must not run on Edge. */
export const runtime = "nodejs";
/** Tool loops + optional module QA/repair need headroom beyond the default 10s Hobby / 15s Pro limit. */
export const maxDuration = 60;
/** Always run on the server; never statically cache chat. */
export const dynamic = "force-dynamic";

/**
 * POST /api/chat: fresh probe this turn + dialogue-only history + optional probe_jeff / probe_brand tools.
 * Requires an authenticated user. Optional owned brandProfileId injects capped USER_BRAND_FACTS
 * and enables probe_brand. Omitted profile skips brand facts and brand probe.
 * Optional moduleId enables named IP module packs (same closed-doctrine stack).
 * Module path runs a second ask-match QA call (+ at most one repair) after the primary reply.
 * Legacy intake map is optional; chat-first modules rely on conversation history.
 * Soft-fails with JSON error if OPENAI_API_KEY is missing.
 * Always returns JSON so the client never has to parse an HTML error page for app errors.
 */
export async function POST(request: Request): Promise<NextResponse<ChatResponseBody | ChatErrorBody>> {
  try {
    return await handleChatPost(request);
  } catch (error) {
    const message: string =
      error instanceof Error ? error.message : "Unexpected chat API failure.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Core chat handler. Thrown errors are converted to JSON by POST.
 */
async function handleChatPost(
  request: Request,
): Promise<NextResponse<ChatResponseBody | ChatErrorBody>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  if (!isChatRequestBody(body)) {
    return NextResponse.json(
      {
        error:
          "Body must include messages: { role, content }[]. Optional locale, moduleId, intake, homeIntent, and brandProfileId must be well-typed.",
      },
      { status: 400 },
    );
  }

  const auth = await requireAuthedApi();
  if (!auth.ok) {
    return auth.response;
  }

  let ownedProfile: Awaited<ReturnType<typeof loadOwnedBrandProfileForChat>> = null;
  let userBrandFacts: string | undefined = undefined;

  const brandProfileIdRaw: string | undefined = body.brandProfileId;
  if (typeof brandProfileIdRaw === "string" && brandProfileIdRaw.trim().length > 0) {
    const brandProfileId: string = brandProfileIdRaw.trim();
    if (!isUuid(brandProfileId)) {
      return NextResponse.json(
        { error: "brandProfileId must be a valid profile id." },
        { status: 400 },
      );
    }

    ownedProfile = await loadOwnedBrandProfileForChat(
      auth.ctx.supabase,
      brandProfileId,
    );
    if (ownedProfile === null) {
      return NextResponse.json(
        { error: "Brand profile not found or not owned by this account." },
        { status: 403 },
      );
    }

    userBrandFacts = buildUserBrandFactsBlock({
      profileName: ownedProfile.name,
      activeBrief: ownedProfile.activeBrief,
      structured: ownedProfile.structured,
    });
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

  const locale: Locale = parseLocale(body.locale) ?? DEFAULT_LOCALE;
  const dialogue: ChatMessage[] = toDialogueOnly(body.messages);
  const baseQuery: string = buildProbeQuery(dialogue);

  if (baseQuery.length === 0) {
    return NextResponse.json({ error: "Send at least one non-empty user message." }, { status: 400 });
  }

  const moduleId: string | undefined = body.moduleId;
  const intake: Record<string, string> | undefined = body.intake;
  const homeIntent: string | undefined =
    typeof body.homeIntent === "string" && body.homeIntent.trim().length > 0
      ? body.homeIntent.trim().slice(0, HOME_INTENT_Q_MAX_CHARS)
      : undefined;
  const catalogPack = typeof moduleId === "string" ? getModulePack(moduleId) : undefined;

  if (typeof moduleId === "string" && moduleId.trim().length > 0 && catalogPack === undefined) {
    return NextResponse.json(
      { error: `Unknown or not-yet-wired moduleId: ${moduleId}` },
      { status: 400 },
    );
  }

  const pack = catalogPack;

  const query: string =
    pack !== undefined
      ? buildModuleProbeQuery({ baseQuery, pack, intake })
      : baseQuery;

  let probe;
  try {
    // Automatic first probe on this turn's ask (not blind into the model).
    probe = probeTeaching(query);
    // Module packs: soft-append bound anchors after user-led ranking (no lexical flood).
    if (pack !== undefined) {
      probe = mergeBoundNodesIntoProbe(probe, pack.boundNodeIds);
    }
  } catch (error) {
    const message: string =
      error instanceof Error ? error.message : "Teaching probe failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const baseSystemPrompt: string = buildSystemPrompt({
    evidencePackText: probe.evidencePackText,
    coverage: probe.coverage,
    locale,
    ...(userBrandFacts !== undefined ? { userBrandFacts } : {}),
    ...(pack !== undefined && isQualityRuntimeEnabled(pack)
      ? {
          formattingOverride: systemPromptFormattingOverride(
            detectLifecycleMode({
              pack,
              messages: dialogue,
              intake,
              brandStructured: ownedProfile === null ? undefined : ownedProfile.structured,
            }).replyBudget,
          ),
        }
      : {}),
  });

  const recommendMode: boolean = pack === undefined;
  const moduleSystemPrompt: string =
    pack !== undefined
      ? appendModuleSystemOverlay({
          baseSystemPrompt,
          pack,
          intake,
          homeIntent,
          locale,
          messages: dialogue,
          brandStructured: ownedProfile === null ? undefined : ownedProfile.structured,
        })
      : appendHomeRecommendOverlay(baseSystemPrompt, locale);
  const systemPrompt: string = moduleSystemPrompt;

  try {
    const { reply, sources, brandSources, recommendedModuleIds } = await generateJeffReply({
      apiKey,
      model,
      systemPrompt,
      messages: dialogue,
      initialSources: probe.sources,
      runProbe: (toolQuery: string) => probeTeaching(toolQuery),
      ...(ownedProfile === null
        ? {}
        : {
            runBrandProbe: (toolQuery: string) =>
              probeBrandChunks({
                supabase: auth.ctx.supabase,
                profileId: ownedProfile.id,
                query: toolQuery,
              }),
          }),
      recommendMode,
    });

    // Module/tool path only: second-model ask-match QA + at most one repair.
    // Home recommend stays out of scope. Soft-fails to the original reply.
    let finalReply: string = reply;
    if (pack !== undefined && typeof moduleId === "string") {
      const moduleDef = getModuleById(moduleId);
      const moduleTitle: string =
        moduleDef !== undefined ? moduleDef.title : moduleId;
      const qa = await runModuleResponseQa({
        apiKey,
        repairModel: model,
        locale,
        moduleId,
        moduleTitle,
        messages: dialogue,
        draftReply: reply,
      });
      finalReply = qa.reply;
    }

    const response: ChatResponseBody = {
      reply: sanitizeAssistantReply(finalReply, locale),
      sources,
      ...(brandSources.length > 0 ? { brandSources } : {}),
      ...(recommendMode && recommendedModuleIds.length > 0
        ? { recommendedModuleIds }
        : {}),
    };
    return NextResponse.json(response);
  } catch (error) {
    const message: string =
      error instanceof Error ? error.message : "OpenAI request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/**
 * Runtime validation for the chat request body.
 */
function isChatRequestBody(value: unknown): value is ChatRequestBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("messages" in value)) {
    return false;
  }

  const messages = (value as { messages: unknown }).messages;
  if (!Array.isArray(messages)) {
    return false;
  }

  if (!messages.every(isChatMessage)) {
    return false;
  }

  if ("moduleId" in value) {
    const moduleId = (value as { moduleId: unknown }).moduleId;
    if (moduleId !== undefined && typeof moduleId !== "string") {
      return false;
    }
  }

  if ("intake" in value) {
    const intake = (value as { intake: unknown }).intake;
    if (intake !== undefined && !isStringRecord(intake)) {
      return false;
    }
  }

  if ("homeIntent" in value) {
    const homeIntent = (value as { homeIntent: unknown }).homeIntent;
    if (homeIntent !== undefined && typeof homeIntent !== "string") {
      return false;
    }
  }

  if ("brandProfileId" in value) {
    const brandProfileId = (value as { brandProfileId: unknown }).brandProfileId;
    if (brandProfileId !== undefined && typeof brandProfileId !== "string") {
      return false;
    }
  }

  if ("locale" in value) {
    const locale = (value as { locale: unknown }).locale;
    if (locale !== undefined && locale !== "zh" && locale !== "en") {
      return false;
    }
  }

  return true;
}

/**
 * Runtime validation for a single chat message.
 */
function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("role" in value) || !("content" in value)) {
    return false;
  }

  const role = (value as { role: unknown }).role;
  const content = (value as { content: unknown }).content;

  const roleOk = role === "user" || role === "assistant";
  const contentOk = typeof content === "string";

  return roleOk && contentOk;
}

/**
 * Runtime validation for intake: object with string values only.
 */
function isStringRecord(value: unknown): value is Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === "string");
}
