"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Upload, CheckCircle2, Loader2 } from "lucide-react";

type MilestoneStatus = "pending" | "submitted" | "approved" | "paid" | "rejected";

/**
 * Action buttons for a milestone card.
 * - Freelancer: "Submit Proof" (pending → submitted)
 * - Client/Freelancer: "Approve" (submitted → approved → paid)
 *   In Phase 3 this will trigger the on-chain smart contract.
 *   For now it updates the DB status directly.
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

  const supabase = createClient();

  const submitProof = async () => {
    if (!proofUrl.trim()) { setError("Enter a proof URL (GitHub, Figma, Loom, etc.)"); return; }
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

  const approveMilestone = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from("milestones")
        .update({
          status: "paid",
          approved_at: new Date().toISOString(),
          paid_at: new Date().toISOString(),
          // solana_tx_hash will be filled in Phase 3
        })
        .eq("id", milestoneId);
      if (err) throw err;

      // Also update project status to in_progress if not already
      await supabase
        .from("projects")
        .update({ status: "in_progress" })
        .eq("id", projectId)
        .eq("status", "funded");

      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to approve milestone");
    } finally {
      setLoading(false);
    }
  };

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
      {error && (
        <p className="font-[family-name:var(--font-sketch)] text-xs text-red-600">{error}</p>
      )}

      {/* Pending → Submit proof */}
      {status === "pending" && (
        <>
          {showProofInput ? (
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://github.com/… or Figma/Loom link"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                className="sketch-input !py-2 !text-sm flex-1"
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

      {/* Submitted → Approve (simulates client approval; Phase 3 adds on-chain) */}
      {status === "submitted" && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={approveMilestone}
            disabled={loading}
            className="sketch-btn sketch-btn-green !px-4 !py-2 !text-sm inline-flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle2 size={14} />
            )}
            Approve & Release Payment
          </button>
          <p className="w-full font-[family-name:var(--font-hand)] text-xs text-ink-soft">
            ⚡ Phase 3: this will trigger on-chain USDC release via Solana smart contract.
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
