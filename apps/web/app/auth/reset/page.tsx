import { Suspense } from "react";

import ResetPasswordClient from "@/components/auth/ResetPasswordClient";

/**
 * Recovery landing page: set a new password after the email link session.
 */
export default function AuthResetPage() {
  return (
    <Suspense fallback={<div className="shell shell-studio shell-auth" />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
