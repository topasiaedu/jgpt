/**
 * Locale helpers for module packs (chat openers, etc.).
 */

import type { Locale } from "@/lib/i18n/messages";
import { PACK_CHAT_OPENERS_ZH } from "@/lib/modules/packChatOpenersZh";
import {
  buildLifecycleOpener,
  buildLifecycleOpenerZh,
  prefixJeffSpokenBeatEn,
  prefixJeffSpokenBeatZh,
} from "@/lib/modules/qualityRuntime/familyOverlay";
import type { ModulePack } from "@/lib/modules/types";

/**
 * Returns the seeded Jeff opener for the active UI locale.
 * ZH prefers pack.chatOpenerZh, then the shared ZH map, then English chatOpener.
 * Spoken beat is guaranteed even if a pack still stores a job-only line.
 */
export function getPackChatOpener(pack: ModulePack, locale: Locale): string {
  if (locale === "zh") {
    const fromPack = pack.chatOpenerZh;
    if (typeof fromPack === "string" && fromPack.trim().length > 0) {
      return prefixJeffSpokenBeatZh(fromPack, pack.moduleId);
    }
    const fromMap = PACK_CHAT_OPENERS_ZH[pack.moduleId];
    if (typeof fromMap === "string" && fromMap.trim().length > 0) {
      return prefixJeffSpokenBeatZh(fromMap, pack.moduleId);
    }
  }
  return prefixJeffSpokenBeatEn(pack.chatOpener, pack.moduleId);
}

/**
 * Fallback opener when a pack is missing (should be rare).
 */
export function defaultChatOpener(locale: Locale): string {
  if (locale === "zh") {
    return buildLifecycleOpenerZh({
      jobLine: "我来陪你跑完这个 IP 工具。",
      firstAsk: "你这次最需要拿到的一件事是什么？",
      seed: "default-chat-opener",
    });
  }
  return buildLifecycleOpener({
    jobLine: "I'll help you finish this IP tool.",
    firstAsk: "What is the one thing you need from this session?",
    seed: "default-chat-opener",
  });
}
