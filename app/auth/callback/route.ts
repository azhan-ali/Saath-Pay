import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * OAuth / email confirmation callback handler.
 * Exchanges the code for a session and redirects to the next URL.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.error("Auth callback error:", err);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
}
