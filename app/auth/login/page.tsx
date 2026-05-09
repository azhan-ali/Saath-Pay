"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Mail, Lock, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/dashboard";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured()) {
      setError(
        "Supabase is not configured yet. Add your keys to .env.local (see .env.example) and restart the dev server.",
      );
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      router.push(nextUrl);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid credentials";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="sketch-card bg-paper relative" style={{ transform: "rotate(0.5deg)" }}>
        <div
          className="tape"
          style={{
            top: "-10px",
            left: "50%",
            transform: "translateX(-50%) rotate(3deg)",
            background: "rgba(255, 107, 157, 0.7)",
          }}
        />

        <div className="text-center mb-6">
          <p className="font-[family-name:var(--font-hand)] text-xl text-accent-pink mb-1">
            ~ welcome back ~
          </p>
          <h1 className="font-[family-name:var(--font-marker)] text-4xl text-ink mb-2">
            Log in
          </h1>
          <p className="font-[family-name:var(--font-body)] text-ink-soft">
            Glad to see you back at SaathPay.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="email"
              placeholder="you@building.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 rough-box bg-paper font-[family-name:var(--font-body)] text-lg text-ink placeholder:text-ink-soft/50 focus:outline-none focus:shadow-[4px_4px_0_#1a1a1a] transition-shadow"
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 rough-box bg-paper font-[family-name:var(--font-body)] text-lg text-ink placeholder:text-ink-soft/50 focus:outline-none focus:shadow-[4px_4px_0_#1a1a1a] transition-shadow"
            />
          </div>

          {error && (
            <div className="rough-box bg-red-50 p-3 font-[family-name:var(--font-sketch)] text-sm text-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="sketch-btn sketch-btn-primary w-full disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Logging in…
              </>
            ) : (
              "Log In →"
            )}
          </button>

          <p className="text-center font-[family-name:var(--font-body)] text-sm text-ink-soft">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-accent-orange font-bold underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="sketch-card bg-paper text-center py-12">
            <Loader2 size={24} className="animate-spin mx-auto" />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
