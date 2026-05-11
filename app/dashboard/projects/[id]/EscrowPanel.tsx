"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Unlock,
  ExternalLink,
  Loader2,
  Zap,
  Shield,
  AlertCircle,
} from "lucide-react";

interface EscrowPanelProps {
  projectId: string;
  projectStatus: string;
  totalAmount: number;
  paidAmount: number;
  vaultAddress?: string | null;
  solanaNetwork: string;
}

/**
 * Shows the live escrow state for a project.
 * Includes a "Fund Escrow (Demo)" button for testing without Dodo.
 */
export default function EscrowPanel({
  projectId,
  projectStatus,
  totalAmount,
  paidAmount,
  vaultAddress,
  solanaNetwork,
}: EscrowPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<{
    txHash: string;
    explorerUrl: string;
    demoMode: boolean;
  } | null>(null);

  const lockedAmount = Math.max(0, totalAmount - paidAmount);
  const isUnfunded = projectStatus === "draft" || projectStatus === "awaiting_payment";
  const isFunded = projectStatus === "funded";
  const isActive = projectStatus === "in_progress";
  const isCompleted = projectStatus === "completed";

  const explorerUrl = vaultAddress
    ? `https://explorer.solana.com/address/${vaultAddress}${solanaNetwork === "devnet" ? "?cluster=devnet" : ""}`
    : null;

  // ── Fund escrow (demo / manual trigger) ──────────────────────────────────
  const fundEscrow = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/solana/fund-escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fund escrow");
      setTxResult({
        txHash: data.txHash,
        explorerUrl: data.explorerUrl,
        demoMode: data.demoMode,
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fund escrow");
    } finally {
      setLoading(false);
    }
  };

  // ── Status config ─────────────────────────────────────────────────────────
  const statusInfo = {
    draft: { icon: AlertCircle, label: "Not initialized", color: "text-ink-soft", bg: "bg-paper-dark" },
    awaiting_payment: { icon: AlertCircle, label: "Awaiting client payment", color: "text-yellow-700", bg: "bg-yellow-50" },
    funded: { icon: Lock, label: "Fully locked in escrow", color: "text-blue-700", bg: "bg-blue-50" },
    in_progress: { icon: Lock, label: "Partially released", color: "text-orange-700", bg: "bg-orange-50" },
    completed: { icon: Unlock, label: "All funds released", color: "text-green-700", bg: "bg-green-50" },
    disputed: { icon: AlertCircle, label: "Under dispute", color: "text-red-700", bg: "bg-red-50" },
    refunded: { icon: Unlock, label: "Refunded", color: "text-ink-soft", bg: "bg-paper-dark" },
  };

  const cfg = statusInfo[projectStatus as keyof typeof statusInfo] ?? statusInfo.draft;
  const StatusIcon = cfg.icon;

  return (
    <div className="sketch-card sketch-card-blue relative">
      <div className="tape" style={{ top: "-10px", right: "20px", transform: "rotate(2deg)" }} />

      <h2 className="font-[family-name:var(--font-marker)] text-xl mb-3 flex items-center gap-2">
        <Shield size={20} /> Solana Escrow Vault
      </h2>

      {/* Status badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px_12px_11px_13px] border-2 border-ink ${cfg.bg} mb-4`}>
        <StatusIcon size={14} className={cfg.color} />
        <span className={`font-[family-name:var(--font-sketch)] text-sm ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {/* Amount breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="font-[family-name:var(--font-marker)] text-xl text-ink">
            ${totalAmount.toLocaleString()}
          </div>
          <div className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">Total</div>
        </div>
        <div className="text-center">
          <div className="font-[family-name:var(--font-marker)] text-xl text-accent-blue">
            ${lockedAmount.toLocaleString()}
          </div>
          <div className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">Locked</div>
        </div>
        <div className="text-center">
          <div className="font-[family-name:var(--font-marker)] text-xl text-accent-green">
            ${paidAmount.toLocaleString()}
          </div>
          <div className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">Released</div>
        </div>
      </div>

      {/* Vault address */}
      {vaultAddress && (
        <div className="mb-3">
          <p className="font-[family-name:var(--font-sketch)] text-xs text-ink-soft mb-1">
            Vault Address
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rough-box bg-paper px-2 py-1 font-mono text-xs text-ink truncate">
              {vaultAddress}
            </code>
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-accent-blue hover:text-accent-orange transition-colors"
                title="View on Solana Explorer"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* TX result */}
      {txResult && (
        <div className="rough-box bg-green-50 p-2 mb-3 space-y-1">
          <div className="flex items-center gap-2 font-[family-name:var(--font-sketch)] text-xs text-green-800">
            <Zap size={12} />
            Escrow funded!
            {txResult.demoMode && (
              <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                demo
              </span>
            )}
          </div>
          {txResult.explorerUrl && (
            <a
              href={txResult.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-[family-name:var(--font-sketch)] text-xs text-accent-blue hover:underline"
            >
              <ExternalLink size={10} /> View TX on Explorer
            </a>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="font-[family-name:var(--font-sketch)] text-xs text-red-600 mb-3">
          {error}
        </p>
      )}

      {/* Fund escrow button (demo / before Dodo integration) */}
      {isUnfunded && (
        <div className="space-y-2">
          <button
            onClick={fundEscrow}
            disabled={loading}
            className="sketch-btn sketch-btn-orange w-full !py-2 !text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Funding on Solana…
              </>
            ) : (
              <>
                <Zap size={14} />
                Fund Escrow (Demo)
              </>
            )}
          </button>
          <p className="font-[family-name:var(--font-hand)] text-xs text-ink-soft text-center">
            In production: client pays via Dodo → auto-funds escrow via webhook.
          </p>
        </div>
      )}

      {/* Network badge */}
      <div className="mt-3 flex items-center gap-1 font-[family-name:var(--font-hand)] text-xs text-ink-soft">
        <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
        Solana {solanaNetwork}
      </div>
    </div>
  );
}
