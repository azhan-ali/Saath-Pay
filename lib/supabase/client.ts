"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components.
 * If env vars are missing (demo mode), returns a stub that throws on use.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Return a proxy that throws when any Supabase method is accessed.
    // This lets the app render in demo mode without Supabase configured.
    return new Proxy(
      {},
      {
        get() {
          throw new Error(
            "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
          );
        },
      },
    ) as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(url, anonKey);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
