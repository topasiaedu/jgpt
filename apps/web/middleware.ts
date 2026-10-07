import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js middleware: refresh Supabase Auth cookies and send unsigned
 * visitors on / and /tools to /auth?next=...
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except Next static assets and common image files.
     * Keeps session refresh cheap and avoids touching binary public assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
