"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Upload,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Zap,
  AlertCircle,
} from "lucide-react";

type MilestoneStatus = "pending" | "submitted" | "approved" | "paid" | "rejected";

/**
 * Action buttons for a milestone card.
 *
 * Phase 3 upgrade:
 * - "Approve & Release" now calls /api/solana/approve-milestone
 * - Real Solana TX hash is saved and shown with explorer link
 * - Demo mode badge shown when program not deployed yet
 */
export default function MilestoneActions({
  milestoneId,
  projectId,
  status,
}: {
  milestoneId: string;
  projectId: string;
  status: MilestoneStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [showProofInput, setShowProofInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<{
    txHash: string;
    explorerUrl: string;
    demoMode: boolean;
    amountReleased: number;
  } | null>(null);

  const supabase = createClient();

  // ── Submit proof (DB only — no on-chain action needed) ──────────────────
  const submitProof = async () => {
    if (!proofUrl.trim()) {
      setError("Enter a proof URL (GitHub, Figma, Loom, etc.)");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from("milestones")
        .update({
          status: "submitted",
          proof_uri: proofUrl.trim(),
          submitted_at: new Date().toISOString(),
        })
        .eq("id", milestoneId);
      if (err) throw err;
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit proof");
    } finally {
      setLoading(false);
      setShowProofInput(false);
    }
  };

  // ── Approve milestone — calls on-chain API ──────────────────────────────
  const approveMilestone = async () => {
    setLoading(true);
    setError(null);
    setTxResult(null);

    try {
      const res = await fetch("/api/solana/approve-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, projectId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Approval failed");
      }

      setTxResult({
        txHash: data.txHash,
        explorerUrl: data.explorerUrl,
        demoMode: data.demoMode,
        amountReleased: data.amountReleased,
      });

      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to approve milestone");
    } finally {
      setLoading(false);
    }
  };

  // ── Paid state ──────────────────────────────────────────────────────────
  if (status === "paid") {
    return (
      <div className="mt-3 flex items-center gap-2 font-[family-name:var(--font-sketch)] text-sm text-accent-green">
        <CheckCircle2 size={16} strokeWidth={2.5} />
        Payment released ✓
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 font-[family-name:var(--font-sketch)] text-xs text-red-600">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* TX success banner */}
      {txResult && (
        <div className="rough-box bg-green-50 p-3 space-y-1">
          <div className="flex items-center gap-2 font-[family-name:var(--font-sketch)] text-sm text-green-800">
            <Zap size={14} />
            <span>
              ${txResult.amountReleased} USDC released
              {txResult.demoMode && (
                <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                  demo mode
                </span>
              )}
            </span>
          </div>
          {txResult.explorerUrl && (
            <a
              href={txResult.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-[family-name:var(--font-sketch)] text-xs text-accent-blue hover:underline"
            >
              <ExternalLink size={12} /> View on Solana Explorer
            </a>
          )}
        </div>
      )}

      {/* Pending → Submit proof */}
      {status === "pending" && (
        <>
          {showProofInput ? (
            <div className="flex gap-2 flex-wrap">
              <input
                type="url"
                placeholder="https://github.com/… or Figma/Loom link"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                className="sketch-input !py-2 !text-sm flex-1 min-w-0"
              />
              <button
                onClick={submitProof}
                disabled={loading}
                className="sketch-btn sketch-btn-orange !px-3 !py-2 !text-sm"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : "Submit"}
              </button>
              <button
                onClick={() => setShowProofInput(false)}
                className="sketch-btn !px-3 !py-2 !text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowProofInput(true)}
              className="sketch-btn !px-4 !py-2 !text-sm inline-flex items-center gap-2"
            >
              <Upload size={14} /> Submit Proof
            </button>
          )}
        </>
      )}

      {/* Submitted → Approve (triggers on-chain USDC release) */}
      {status === "submitted" && (
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={approveMilestone}
            disabled={loading}
            className="sketch-btn sketch-btn-green !px-4 !py-2 !text-sm inline-flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Releasing on Solana…
              </>
            ) : (
              <>
                <Zap size={14} />
                Approve & Release USDC
              </>
            )}
          </button>
          <p className="w-full font-[family-name:var(--font-hand)] text-xs text-ink-soft">
            ⚡ Triggers on-chain USDC release via Solana smart contract.
          </p>
        </div>
      )}

      {/* Approved (transitional) */}
      {status === "approved" && (
        <p className="font-[family-name:var(--font-sketch)] text-sm text-accent-blue">
          ✓ Approved — processing payment…
        </p>
      )}
    </div>
  );
}
