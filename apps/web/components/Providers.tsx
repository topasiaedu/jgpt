"use client";

import type { ReactNode } from "react";

import FirstVisitBrandMoment from "@/components/FirstVisitBrandMoment";
import LocaleProvider from "@/lib/i18n/LocaleProvider";

type ProvidersProps = {
  children: ReactNode;
};

/**
 * Client providers for the Influence Engine Coach shell.
 * Locale + optional first-visit dark brand moment.
 */
export default function Providers({ children }: ProvidersProps) {
  return (
    <LocaleProvider>
      <FirstVisitBrandMoment />
      {children}
    </LocaleProvider>
  );
}
