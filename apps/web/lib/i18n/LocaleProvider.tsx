"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  parseLocale,
  t,
  type Locale,
  type MessageKey,
} from "@/lib/i18n/messages";

type TranslateFn = (key: MessageKey, vars?: { n?: number }) => string;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
  t: TranslateFn;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type LocaleProviderProps = {
  children: ReactNode;
};

/**
 * Client locale provider. Default zh. Persists to localStorage.
 * Footer toggle switches zh↔en. First visit may follow browser EN preference.
 */
export default function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = parseLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
    if (stored !== null) {
      setLocaleState(stored);
    } else {
      const browser = window.navigator.language.toLowerCase();
      if (browser.startsWith("en")) {
        setLocaleState("en");
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale === "zh" ? "zh-Hans" : "en";
  }, [locale, hydrated]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((current) => (current === "zh" ? "en" : "zh"));
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
