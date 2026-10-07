import type { EmailOtpType } from "@supabase/supabase-js";

const EMAIL_OTP_TYPES: ReadonlyArray<EmailOtpType> = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

/**
 * Narrows a query-string `type` to a Supabase EmailOtpType.
 */
export function parseEmailOtpType(raw: string | null): EmailOtpType | null {
  if (raw === null) {
    return null;
  }
  for (const candidate of EMAIL_OTP_TYPES) {
    if (candidate === raw) {
      return candidate;
    }
  }
  return null;
}
