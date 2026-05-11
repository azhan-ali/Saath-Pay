"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  CreditCard,
  AlertCircle,
} from "lucide-react";

interface DodoCheckoutPanelProps {
  projectId: string;
  checkoutUrl: string | null;
  projectStatus: string;
  isDodoConfigured: boolean;
}

/**
 * Phase 4 — Dodo Payments checkout panel.
 * Shows the payment link + "Generate" button.
 * When Dodo keys are set, creates a real Dodo checkout URL.
 * When not set, shows a demo URL with instructions.
 */
export default function DodoCheckoutPanel({
  projectId,
  checkoutUrl: initialUrl,
  projectStatus,
  isDodoConfigured,
}: DodoCheckoutPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState(initialUrl);
  const [copied, setCopied] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dodo/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate link");
      setCheckoutUrl(data.checkoutUrl);
      setDemoMode(data.demoMode);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate checkout link");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!checkoutUrl) return;
    await navigator.clipboard.writeText(checkoutUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCompleted = ["funded", "in_progress", "completed"].includes(projectStatus);

  return (
    <div className="sketch-card sketch-card-yellow relative">
      <div className="tape" style={{ top: "-10px", left: "20px", transform: "rotate(-3deg)" }} />

      <h2 className="font-[family-name:var(--font-marker)] text-xl mb-1 flex items-center gap-2">
        <CreditCard size={20} /> Dodo Payment Link
      </h2>
      <p className="font-[family-name:var(--font-body)] text-sm text-ink-soft mb-3">
        Share with your client → they pay via card/UPI → funds auto-lock on Solana.
      </p>

      {/* Payment provider not configured warning */}
      {!isDodoConfigured && (
        <div className="rough-box bg-orange-50 p-2 mb-3 flex items-start gap-2">
          <AlertCircle size={14} className="text-orange-600 shrink-0 mt-0.5" />
          <p className="font-[family-name:var(--font-sketch)] text-xs text-orange-700">
            Add <code className="bg-orange-100 px-1">STRIPE_SECRET_KEY</code> to .env.local for real checkout.
            Demo URL generated for now.
          </p>
        </div>
      )}

      {/* URL display */}
      {checkoutUrl ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <code className="flex-1 rough-box bg-paper px-3 py-2 font-mono text-xs text-ink truncate">
              {checkoutUrl}
            </code>
            <button
              onClick={copyLink}
              className="sketch-btn !px-3 !py-2 shrink-0"
              title="Copy link"
            >
              {copied ? <Check size={14} className="text-accent-green" /> : <Copy size={14} />}
            </button>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noreferrer"
              className="sketch-btn !px-3 !py-2 shrink-0"
              title="Open checkout"
            >
              <ExternalLink size={14} />
            </a>
          </div>

          {demoMode && (
            <p className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">
              🧪 Demo URL — add Dodo API keys for real checkout
            </p>
          )}

          {isCompleted && (
            <p className="font-[family-name:var(--font-hand)] text-xs text-accent-green">
              ✓ Client has already paid via this link
            </p>
          )}

          {/* Regenerate button */}
          {!isCompleted && (
            <button
              onClick={generateLink}
              disabled={loading}
              className="sketch-btn !px-3 !py-1.5 !text-xs inline-flex items-center gap-1"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
              Regenerate
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={generateLink}
          disabled={loading}
          className="sketch-btn sketch-btn-orange w-full !py-2.5 inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Generating…</>
          ) : (
            <><Zap size={16} /> Generate Payment Link</>
          )}
        </button>
      )}

      {error && (
        <p className="mt-2 font-[family-name:var(--font-sketch)] text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
