/**
 * POST /api/solana/create-project
 * Creates a project on-chain (or in demo mode) and saves PDAs to DB.
 *
 * Body: { projectId: string, walletAddress: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { createProjectOnChain, explorerTxUrl } from "@/lib/solana/program";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { projectId, walletAddress } = body as {
    projectId?: string;
    walletAddress?: string;
  };

  if (!projectId || !walletAddress) {
    return NextResponse.json(
      { error: "projectId and walletAddress are required" },
      { status: 400 },
    );
  }

  // Fetch project from DB to get amount + milestone count
  const { data: project, error: pErr } = await supabase
    .from("projects")
    .select("id, total_amount, freelancer_id, milestones(id)")
    .eq("id", projectId)
    .eq("freelancer_id", user.id)
    .single();

  if (pErr || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const milestonesCount = (project.milestones as { id: string }[])?.length ?? 0;

  // Call on-chain (or demo mode)
  const result = await createProjectOnChain({
    creatorWallet: walletAddress,
    projectId,
    totalAmountUsdc: Number(project.total_amount),
    milestonesCount,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "On-chain creation failed" },
      { status: 500 },
    );
  }

  // Save PDAs + TX hash to DB
  const { error: updateErr } = await supabase
    .from("projects")
    .update({
      escrow_pda: result.vaultPDA,
      solana_tx_hash: result.txHash,
      status: "awaiting_payment",
    })
    .eq("id", projectId);

  if (updateErr) {
    console.error("DB update error:", updateErr);
  }

  // Log transaction
  await supabase.from("transactions").insert({
    project_id: projectId,
    type: "escrow_fund",
    amount: 0, // not funded yet, just initialized
    currency: "USDC",
    solana_tx_hash: result.txHash,
    metadata: {
      action: "create_project",
      project_pda: result.projectPDA,
      vault_pda: result.vaultPDA,
      demo_mode: result.demoMode,
    },
  });

  return NextResponse.json({
    success: true,
    projectPDA: result.projectPDA,
    vaultPDA: result.vaultPDA,
    txHash: result.txHash,
    explorerUrl: result.txHash ? explorerTxUrl(result.txHash) : null,
    demoMode: result.demoMode,
  });
}
