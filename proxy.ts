import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

/**
 * Next.js 16+ proxy (replaces middleware.ts).
 * Refreshes the Supabase auth cookie on every request and enforces
 * route protection for /dashboard/**.
 */
export default async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static
     * - _next/image
     * - favicon / images / fonts
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf)$).*)",
  ],
};
