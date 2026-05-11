/**
 * POST /api/solana/fund-escrow
 * Funds the escrow vault with USDC.
 * Called by: Dodo webhook (Phase 4) OR manually for demo.
 *
 * Body: { projectId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { fundEscrowOnChain, explorerTxUrl } from "@/lib/solana/program";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  // This endpoint can be called by webhook (no user session) or by user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const body = await req.json().catch(() => ({}));
  const { projectId } = body as { projectId?: string };

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  // Fetch project
  const query = supabase
    .from("projects")
    .select("id, total_amount, escrow_pda, status, freelancer_id")
    .eq("id", projectId);

  // If user is logged in, scope to their projects
  if (user) query.eq("freelancer_id", user.id);

  const { data: project, error: pErr } = await query.single();

  if (pErr || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.status === "funded" || project.status === "in_progress") {
    return NextResponse.json(
      { error: "Escrow already funded" },
      { status: 409 },
    );
  }

  // Fund on-chain (or demo mode)
  const result = await fundEscrowOnChain({
    projectPDA: project.escrow_pda ?? "demo",
    vaultPDA: project.escrow_pda ?? "demo",
    amountUsdc: Number(project.total_amount),
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Failed to fund escrow" },
      { status: 500 },
    );
  }

  // Update project status to funded
  await supabase
    .from("projects")
    .update({ status: "funded" })
    .eq("id", projectId);

  // Log transaction
  await supabase.from("transactions").insert({
    project_id: projectId,
    type: "escrow_fund",
    amount: Number(project.total_amount),
    currency: "USDC",
    solana_tx_hash: result.txHash,
    metadata: {
      action: "fund_escrow",
      demo_mode: result.demoMode,
    },
  });

  return NextResponse.json({
    success: true,
    txHash: result.txHash,
    explorerUrl: result.txHash ? explorerTxUrl(result.txHash) : null,
    demoMode: result.demoMode,
    newStatus: "funded",
  });
}
