import { Suspense } from "react";

import AuthPageClient from "@/components/auth/AuthPageClient";

/**
 * Auth route: sign in (default), sign up, and forgot-password request.
 * New password after email recovery lives at /auth/reset.
 */
export default function AuthPage() {
  return (
    <Suspense fallback={<div className="shell shell-studio shell-auth" />}>
      <AuthPageClient />
    </Suspense>
  );
}
