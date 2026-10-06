"use client";

import type { ReactNode } from "react";

import LocaleProvider from "@/lib/i18n/LocaleProvider";

type ProvidersProps = {
  children: ReactNode;
};

/**
 * Client providers for the Influence Engine Coach shell.
 */
export default function Providers({ children }: ProvidersProps) {
  return <LocaleProvider>{children}</LocaleProvider>;
}
