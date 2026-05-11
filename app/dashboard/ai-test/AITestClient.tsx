"use client";

import { useState } from "react";
import {
  Sparkles,
  Loader2,
  Clock,
  Bot,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface GeneratedMilestone {
  name: string;
  deliverable: string;
  amount: number;
  estimated_days: number;
}

const SAMPLE_PROJECTS = [
  {
    label: "AI Chatbot",
    description: "Build an AI-powered customer support chatbot for an e-commerce platform with Hindi language support, product recommendations, and order tracking integration.",
    amount: 3000,
  },
  {
    label: "SaaS Dashboard",
    description: "Create a B2B analytics dashboard for a fintech startup with real-time charts, user management, billing integration, and export functionality.",
    amount: 5000,
  },
  {
    label: "Mobile App",
    description: "Develop a React Native food delivery app with GPS tracking, payment gateway, restaurant management panel, and push notifications.",
    amount: 8000,
  },
];

export default function AITestClient() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    milestones: GeneratedMilestone[];
    demoMode: boolean;
    model: string;
    responseMs: number;
    warning?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!description.trim() || !amount || Number(amount) <= 0) {
      setError("Fill in both description and amount.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    const start = Date.now();

    try {
      const res = await fetch("/api/ai/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, totalAmount: Number(amount) }),
      });

      const data = await res.json();
      const ms = Date.now() - start;

      if (!res.ok) {
        if (res.status === 429) {
          setError("Rate limit hit — wait 1 minute and try again.");
          return;
        }
        throw new Error(data.error ?? "Generation failed");
      }

      setResult({
        milestones: data.milestones,
        demoMode: data.demoMode,
        model: data.model ?? "unknown",
        responseMs: ms,
        warning: data.warning,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_PROJECTS[0]) => {
    setDescription(sample.description);
    setAmount(String(sample.amount));
    setResult(null);
    setError(null);
  };

  const totalAmount = result?.milestones.reduce((a, m) => a + m.amount, 0) ?? 0;

  return (
    <div className="space-y-5">
      {/* Sample projects */}
      <div>
        <p className="font-[family-name:var(--font-sketch)] text-sm text-ink-soft mb-2">
          Try a sample project:
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROJECTS.map((s) => (
            <button
              key={s.label}
              onClick={() => loadSample(s)}
              className="sketch-btn !px-3 !py-1.5 !text-sm"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input form */}
      <div className="sketch-card bg-paper space-y-4">
        <div>
          <label className="block font-[family-name:var(--font-sketch)] text-sm text-ink-soft mb-1">
            Project Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project in detail — what you're building, tech stack, key features…"
            rows={4}
            className="sketch-input resize-none"
          />
          <p className="mt-1 font-[family-name:var(--font-hand)] text-xs text-ink-soft text-right">
            {description.length}/2000
          </p>
        </div>

        <div>
          <label className="block font-[family-name:var(--font-sketch)] text-sm text-ink-soft mb-1">
            Total Budget (USD) *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-[family-name:var(--font-marker)] text-lg text-ink-soft">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="2000"
              min="1"
              className="sketch-input pl-8"
            />
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="sketch-btn sketch-btn-primary w-full !py-3 inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Gemini is thinking…</>
          ) : (
            <><Sparkles size={18} /> ✨ Generate Milestones with AI</>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rough-box bg-red-50 p-3 flex items-center gap-2 font-[family-name:var(--font-sketch)] text-sm text-red-700">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px_10px_9px_11px] border-2 border-ink font-[family-name:var(--font-sketch)] text-sm ${result.demoMode ? "bg-yellow-50 text-yellow-800" : "bg-green-50 text-green-800"}`}>
              {result.demoMode ? <AlertCircle size={12} /> : <Bot size={12} />}
              {result.demoMode ? "Demo mode" : `Gemini ${result.model}`}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px_10px_9px_11px] border-2 border-ink bg-blue-50 font-[family-name:var(--font-sketch)] text-sm text-blue-800">
              <Clock size={12} />
              {result.responseMs}ms
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px_10px_9px_11px] border-2 border-ink bg-paper font-[family-name:var(--font-sketch)] text-sm">
              <CheckCircle2 size={12} className="text-accent-green" />
              {result.milestones.length} milestones
            </div>
          </div>

          {result.warning && (
            <div className="rough-box bg-yellow-50 p-2 font-[family-name:var(--font-hand)] text-xs text-yellow-700">
              ⚠ {result.warning}
            </div>
          )}

          {/* Milestone cards */}
          <div className="space-y-3">
            {result.milestones.map((m, i) => (
              <div
                key={i}
                className="sketch-card bg-paper relative"
                style={{ transform: `rotate(${i % 2 === 0 ? -0.3 : 0.3}deg)` }}
              >
                <div className="absolute -top-3 -right-3 px-2 py-0.5 bg-accent-purple text-white font-[family-name:var(--font-sketch)] text-xs rounded-[6px_8px_7px_9px] flex items-center gap-1">
                  <Sparkles size={10} /> AI
                </div>

                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">
                      Milestone {i + 1}
                    </span>
                    <h3 className="font-[family-name:var(--font-marker)] text-xl text-ink">
                      {m.name}
                    </h3>
                    <p className="font-[family-name:var(--font-body)] text-sm text-ink-soft">
                      {m.deliverable}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-[family-name:var(--font-marker)] text-2xl text-accent-green">
                      ${m.amount.toLocaleString()}
                    </div>
                    <div className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">
                      ~{m.estimated_days} days
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total check */}
          <div className={`rough-box p-3 flex items-center justify-between font-[family-name:var(--font-sketch)] text-sm ${Math.abs(totalAmount - Number(amount)) < 0.01 ? "bg-green-50 text-green-800" : "bg-yellow-50 text-yellow-800"}`}>
            <span>Total: ${totalAmount.toLocaleString()}</span>
            <span>
              {Math.abs(totalAmount - Number(amount)) < 0.01
                ? "✅ Matches budget exactly"
                : `⚠ Off by $${Math.abs(totalAmount - Number(amount)).toFixed(2)}`}
            </span>
          </div>

          {/* Regenerate */}
          <button
            onClick={generate}
            disabled={loading}
            className="sketch-btn !px-4 !py-2 !text-sm inline-flex items-center gap-2"
          >
            <RefreshCw size={14} /> Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
