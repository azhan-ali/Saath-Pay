/**
 * /dashboard/ai-test
 *
 * Phase 5 verification page — test Gemini AI milestone generation directly.
 * Shows model info, response time, and generated milestones.
 * Useful for demo + hackathon judges.
 */

import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AITestClient from "./AITestClient";

export default async function AITestPage() {
  if (!isSupabaseConfigured()) redirect("/dashboard");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="font-[family-name:var(--font-hand)] text-xl text-accent-purple">
          ~ phase 5 ~
        </p>
        <h1 className="font-[family-name:var(--font-marker)] text-4xl text-ink">
          AI Milestone Generator
        </h1>
        <p className="font-[family-name:var(--font-body)] text-ink-soft mt-1">
          Powered by Google Gemini 2.0 Flash — describe your project, get smart milestones instantly.
        </p>
      </div>

      {/* Status card */}
      <div
        className={`sketch-card relative ${hasGeminiKey ? "sketch-card-green" : "sketch-card-yellow"}`}
        style={{ transform: "rotate(-0.3deg)" }}
      >
        <div className={`absolute -top-3 left-6 px-3 py-1 text-white font-[family-name:var(--font-sketch)] text-sm rounded-[8px_10px_9px_11px] shadow-[2px_2px_0_#1a1a1a] ${hasGeminiKey ? "bg-accent-green" : "bg-accent-orange"}`}>
          {hasGeminiKey ? "✅ Gemini Connected" : "⚠ Demo Mode"}
        </div>
        <div className="mt-2 font-[family-name:var(--font-body)] text-sm text-ink-soft">
          {hasGeminiKey ? (
            <span>
              <strong className="text-ink">Model:</strong> gemini-2.0-flash ·{" "}
              <strong className="text-ink">Rate limit:</strong> 10 req/min ·{" "}
              <strong className="text-ink">Free tier:</strong> 1M tokens/day
            </span>
          ) : (
            <span>
              Add <code className="bg-paper-dark px-1 text-xs">GEMINI_API_KEY</code> to{" "}
              <code className="bg-paper-dark px-1 text-xs">.env.local</code> for real AI.
              Get free key at{" "}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-accent-orange underline">
                aistudio.google.com
              </a>
            </span>
          )}
        </div>
      </div>

      <AITestClient />
    </div>
  );
}
