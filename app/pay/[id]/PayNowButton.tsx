"use client";

import { useState } from "react";
import { Loader2, CreditCard, ExternalLink, Zap } from "lucide-react";

interface PayNowButtonProps {
  projectId: string;
  checkoutUrl: string | null;
  amount: number;
  currency: string;
  isDemoMode: boolean;
}

/**
 * "Pay Now" button on the public payment page.
 *
 * If checkoutUrl already exists → redirect directly.
 * If not → call /api/dodo/create-checkout first, then redirect.
 */
export default function PayNowButton({
  projectId,
  checkoutUrl: initialCheckoutUrl,
  amount,
  currency,
  isDemoMode,
}: PayNowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = initialCheckoutUrl;

      // If no checkout URL yet, create one
      if (!url) {
        const res = await fetch("/api/dodo/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to create checkout");
        url = data.checkoutUrl;
        if (data.demoMode) setDemoMode(true);
      }

      if (url) {
        window.location.href = url;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  };

  if (isDemoMode || demoMode) {
    return (
      <div className="space-y-3">
        <div className="rough-box bg-yellow-50 p-3 text-center">
          <p className="font-[family-name:var(--font-sketch)] text-sm text-yellow-800 mb-2">
            🧪 Demo Mode — Dodo keys not configured
          </p>
          <p className="font-[family-name:var(--font-body)] text-xs text-yellow-700">
            In production, this button opens Dodo's hosted checkout (card, UPI, NetBanking).
          </p>
        </div>
        <button
          onClick={handlePay}
          disabled={loading}
          className="sketch-btn sketch-btn-orange w-full !py-3 inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Processing…</>
          ) : (
            <><Zap size={18} /> Simulate Payment (Demo)</>
          )}
        </button>
        {error && (
          <p className="font-[family-name:var(--font-sketch)] text-xs text-red-600 text-center">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handlePay}
        disabled={loading}
        className="sketch-btn sketch-btn-green w-full !py-3 text-lg inline-flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <><Loader2 size={20} className="animate-spin" /> Redirecting to Dodo…</>
        ) : (
          <>
            <CreditCard size={20} />
            Pay ${amount.toLocaleString()} {currency}
          </>
        )}
      </button>

      {error && (
        <p className="font-[family-name:var(--font-sketch)] text-xs text-red-600 text-center">{error}</p>
      )}

      <p className="font-[family-name:var(--font-hand)] text-xs text-ink-soft text-center">
        Secure checkout via Dodo Payments · Card, UPI, NetBanking accepted
      </p>
    </div>
  );
}
