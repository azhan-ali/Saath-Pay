"use client";

import { useState } from "react";
import { Loader2, Zap, ExternalLink, CheckCircle2 } from "lucide-react";

/**
 * Devnet-only tools: SOL airdrop button.
 * Only rendered when NEXT_PUBLIC_SOLANA_NETWORK=devnet.
 */
export default function WalletTools({ walletAddress }: { walletAddress: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    txHash?: string;
    explorerUrl?: string;
    error?: string;
  } | null>(null);

  const requestAirdrop = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/solana/airdrop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, amount: 1 }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, error: "Request failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sketch-card sketch-card-orange relative" style={{ transform: "rotate(-0.5deg)" }}>
      <div className="absolute -top-3 left-6 px-3 py-1 bg-ink text-paper font-[family-name:var(--font-sketch)] text-xs rounded-[8px_10px_9px_11px]">
        🧪 Devnet Tools
      </div>

      <h3 className="font-[family-name:var(--font-marker)] text-xl mb-2 mt-1">
        Get Test SOL
      </h3>
      <p className="font-[family-name:var(--font-body)] text-sm text-ink-soft mb-3">
        Airdrop 1 SOL to your wallet on devnet. You need SOL to pay transaction fees.
      </p>

      <button
        onClick={requestAirdrop}
        disabled={loading}
        className="sketch-btn sketch-btn-orange !px-4 !py-2 !text-sm inline-flex items-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Requesting airdrop…
          </>
        ) : (
          <>
            <Zap size={14} />
            Airdrop 1 SOL (devnet)
          </>
        )}
      </button>

      {result && (
        <div className={`mt-3 rough-box p-3 ${result.success ? "bg-green-50" : "bg-red-50"}`}>
          {result.success ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-[family-name:var(--font-sketch)] text-sm text-green-800">
                <CheckCircle2 size={14} />
                1 SOL airdropped successfully!
              </div>
              {result.explorerUrl && (
                <a
                  href={result.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-[family-name:var(--font-sketch)] text-xs text-accent-blue hover:underline"
                >
                  <ExternalLink size={12} /> View TX on Explorer
                </a>
              )}
            </div>
          ) : (
            <p className="font-[family-name:var(--font-sketch)] text-sm text-red-700">
              {result.error ?? "Airdrop failed. Try again in 30 seconds."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
