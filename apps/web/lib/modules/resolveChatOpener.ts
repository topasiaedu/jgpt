/**
 * Lazy-resolves a module chat opener so the global shell does not import every pack.
 */

import type { Locale } from "@/lib/i18n/messages";

/**
 * Dynamically loads packs + locale helpers only when starting a new chat.
 */
export async function resolveModuleChatOpener(
  moduleId: string,
  locale: Locale,
): Promise<string> {
  const [{ getModulePack }, { getPackChatOpener, defaultChatOpener }] =
    await Promise.all([
      import("@/lib/modules/packs"),
      import("@/lib/modules/packLocale"),
    ]);
  const pack = getModulePack(moduleId);
  if (pack === undefined) {
    return defaultChatOpener(locale);
  }
  return getPackChatOpener(pack, locale);
}
