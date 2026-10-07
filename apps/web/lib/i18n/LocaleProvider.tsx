"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  persistLocaleChoice,
  readPersistedLocale,
} from "@/lib/i18n/localePersistence";
import {
  parseLocale,
  t,
  type Locale,
  type MessageKey,
  type MessageVars,
} from "@/lib/i18n/messages";

type TranslateFn = (key: MessageKey, vars?: MessageVars) => string;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
  t: TranslateFn;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type LocaleProviderProps = {
  children: ReactNode;
  initialLocale: Locale;
};

/**
 * Client locale provider. Default zh. Explicit choices persist to cookie + localStorage.
 * `initialLocale` comes from the locale cookie so SSR/first paint match the last toggle.
 */
export default function LocaleProvider({
  children,
  initialLocale,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useLayoutEffect(() => {
    const fromQuery = parseLocale(
      new URLSearchParams(window.location.search).get("locale"),
    );
    const stored = fromQuery ?? readPersistedLocale();
    if (stored !== null) {
      persistLocaleChoice(stored);
      applyDocumentLang(stored);
      setLocaleState(stored);
      return;
    }
    const browser = window.navigator.language.toLowerCase();
    if (browser.startsWith("en")) {
      persistLocaleChoice("en");
      applyDocumentLang("en");
      setLocaleState("en");
      return;
    }
    applyDocumentLang(initialLocale);
  }, [initialLocale]);

  const setLocale = useCallback((next: Locale) => {
    persistLocaleChoice(next);
    applyDocumentLang(next);
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((current) => {
      const next: Locale = current === "zh" ? "en" : "zh";
      persistLocaleChoice(next);
      applyDocumentLang(next);
      return next;
    });
  }, []);

  const translate = useCallback<TranslateFn>(
    (key, vars) => {
      return t(locale, key, vars);
    },
    [locale],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: translate,
    }),
    [locale, setLocale, toggleLocale, translate],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/**
 * Chrome i18n hook. Must be used under LocaleProvider.
 */
export function useI18n(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (ctx === null) {
    throw new Error("useI18n must be used within LocaleProvider");
  }
  return ctx;
}

/**
 * Syncs <html lang> with the active chrome locale.
 */
function applyDocumentLang(locale: Locale): void {
  document.documentElement.lang = locale === "zh" ? "zh-Hans" : "en";
}
