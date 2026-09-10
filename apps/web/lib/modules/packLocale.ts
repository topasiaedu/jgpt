/**
 * Locale helpers for module packs (chat openers, etc.).
 */

import type { Locale } from "@/lib/i18n/messages";
import { PACK_CHAT_OPENERS_ZH } from "@/lib/modules/packChatOpenersZh";
import type { ModulePack } from "@/lib/modules/types";

/**
 * Returns the seeded Jeff opener for the active UI locale.
 * ZH prefers pack.chatOpenerZh, then the shared ZH map, then English chatOpener.
 */
export function getPackChatOpener(pack: ModulePack, locale: Locale): string {
  if (locale === "zh") {
    const fromPack = pack.chatOpenerZh;
    if (typeof fromPack === "string" && fromPack.trim().length > 0) {
      return fromPack.trim();
    }
    const fromMap = PACK_CHAT_OPENERS_ZH[pack.moduleId];
    if (typeof fromMap === "string" && fromMap.trim().length > 0) {
      return fromMap.trim();
    }
  }
  return pack.chatOpener;
}

/**
 * Fallback English opener when a pack is missing (should be rare).
 */
export function defaultChatOpener(locale: Locale): string {
  if (locale === "zh") {
    return "我会用对话带你跑完这个 IP 工具。你这次最需要拿到的一件事是什么？";
  }
  return "I will run this IP tool with you in chat. What is the one thing you need from this session?";
}
