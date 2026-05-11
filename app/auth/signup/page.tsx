"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Mail, Lock, User as UserIcon, Briefcase, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "freelancer" as "freelancer" | "client",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured yet. Add your keys to .env.local and restart the dev server.");
      return;
    }

    if (!form.fullName.trim()) { setError("Please enter your full name."); return; }
    if (!form.email.trim())    { setError("Please enter your email."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      const supabase = createClient();

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: form.fullName.trim(),
            role: form.role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed — no user returned.");

      // Step 2: Manually upsert profile (fallback if trigger didn't fire)
      // This is safe to call even if trigger already created the row
      const { error: profileError } = await supabase
        .from("users")
        .upsert(
          {
            id: authData.user.id,
            email: form.email.trim(),
            full_name: form.fullName.trim(),
            role: form.role,
          },
          { onConflict: "id", ignoreDuplicates: false }
        );

      // Profile error is non-fatal — trigger may have already created it
      if (profileError) {
        console.warn("Profile upsert warning (non-fatal):", profileError.message);
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      // Make common errors more readable
      if (message.includes("already registered") || message.includes("already been registered")) {
        setError("This email is already registered. Try logging in instead.");
      } else if (message.includes("Password should be")) {
        setError("Password must be at least 6 characters.");
      } else {
        setError(message);
      }
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
      <div className="sketch-card bg-paper relative" style={{ transform: "rotate(-0.5deg)" }}>
        <div
          className="tape"
          style={{ top: "-10px", left: "50%", transform: "translateX(-50%) rotate(-3deg)" }}
        />

        <div className="text-center mb-6">
          <p className="font-[family-name:var(--font-hand)] text-xl text-accent-orange mb-1">
            ~ welcome to saathpay ~
          </p>
          <h1 className="font-[family-name:var(--font-marker)] text-4xl text-ink mb-2">
            Create account
          </h1>
          <p className="font-[family-name:var(--font-body)] text-ink-soft">
            Start getting paid in seconds, not weeks.
          </p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-2">🎉</div>
            <p className="font-[family-name:var(--font-marker)] text-2xl text-ink">Account created!</p>
            <p className="font-[family-name:var(--font-body)] text-ink-soft mt-2">
              Redirecting to dashboard…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role picker */}
            <div>
              <label className="block font-[family-name:var(--font-sketch)] text-sm text-ink-soft mb-2">
                I am a…
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["freelancer", "client"] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm({ ...form, role })}
                    className={`rough-box py-3 font-[family-name:var(--font-marker)] text-base transition-all ${
                      form.role === role
                        ? "bg-accent-yellow shadow-[3px_3px_0_#1a1a1a]"
                        : "bg-paper hover:bg-paper-dark"
                    }`}
                  >
                    <Briefcase size={16} className="inline mr-1" />
                    {role === "freelancer" ? "Freelancer" : "Client"}
                  </button>
                ))}
              </div>
            </div>

            <InputField
              icon={<UserIcon size={18} />}
              type="text"
              placeholder="Your full name"
              value={form.fullName}
              onChange={(v) => setForm({ ...form, fullName: v })}
              required
            />
            <InputField
              icon={<Mail size={18} />}
              type="email"
              placeholder="you@building.com"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              required
            />
            <InputField
              icon={<Lock size={18} />}
              type="password"
              placeholder="Password (min 6 chars)"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              minLength={6}
              required
            />

            {error && (
              <div className="rough-box bg-red-50 border-red-300 p-3 font-[family-name:var(--font-sketch)] text-sm text-red-800">
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="sketch-btn sketch-btn-orange w-full disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 size={18} className="mr-2 animate-spin" /> Creating account…</>
              ) : (
                "Create Account →"
              )}
            </button>

            <p className="text-center font-[family-name:var(--font-body)] text-sm text-ink-soft">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-accent-orange font-bold underline">
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </motion.div>
  );
}

function InputField({
  icon, type, placeholder, value, onChange, required, minLength,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft">{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="w-full pl-12 pr-4 py-3 rough-box bg-paper font-[family-name:var(--font-body)] text-base text-ink placeholder:text-ink-soft/50 focus:outline-none focus:shadow-[4px_4px_0_#1a1a1a] transition-shadow"
      />
    </div>
  );
}
