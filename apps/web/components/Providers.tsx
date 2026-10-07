"use client";

import type { ReactNode } from "react";

import ChatHistoryShell from "@/components/chatHistory/ChatHistoryShell";
import LocaleProvider from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/messages";
import { AuthSessionProvider } from "@/lib/supabase/useAuthSession";

type ProvidersProps = {
  children: ReactNode;
  initialLocale: Locale;
};

/**
 * Client providers for the Influence Engine Coach shell.
 * Chat history chrome mounts once under auth so signed-in routes share one sidebar.
 * ChatHistoryShell owns the chrome loader until auth is ready, then mounts the
 * sidebar shell. It must not suspend here: a Suspense fallback of bare children
 * hydrates against app-with-history and throws a recoverable mismatch.
 */
export default function Providers({ children, initialLocale }: ProvidersProps) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <AuthSessionProvider>
        <ChatHistoryShell>{children}</ChatHistoryShell>
      </AuthSessionProvider>
    </LocaleProvider>
  );
}
