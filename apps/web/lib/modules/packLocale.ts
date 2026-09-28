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
    return "我会陪你跑完这个 IP 工具。\n\n我们这样配合：\n- 先说清楚你这次要带走的一件事\n- 你用白话回答就行\n- 需要时我直接交一版草稿\n\n你这次最需要拿到的一件事是什么？";
  }
  return "Hey. I will help you finish this IP tool.\n\nHere is how we will work:\n- Name the one outcome you need from this session\n- Answer in plain words as we go\n- I will draft when you are ready\n\nWhat is the one thing you need from this session?";
}
