/**
 * POST /api/solana/approve-milestone
 * Approves a milestone and releases USDC to the freelancer on-chain.
 *
 * Body: { milestoneId: string, projectId: string }
 *
 * Flow:
 *   1. Validate user owns the project
 *   2. Call approveMilestoneOnChain()
 *   3. Update milestone status → "paid" with TX hash
 *   4. Update project status if all milestones paid
 *   5. Update user's total_earned
 *   6. Log transaction
 */

import { NextRequest, NextResponse } from "next/server";
import { approveMilestoneOnChain, explorerTxUrl } from "@/lib/solana/program";
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
  const { milestoneId, projectId } = body as {
    milestoneId?: string;
    projectId?: string;
  };

  if (!milestoneId || !projectId) {
    return NextResponse.json(
      { error: "milestoneId and projectId are required" },
      { status: 400 },
    );
  }

  // Fetch project (verify ownership)
  const { data: project, error: pErr } = await supabase
    .from("projects")
    .select("id, total_amount, escrow_pda, status, freelancer_id")
    .eq("id", projectId)
    .eq("freelancer_id", user.id)
    .single();

  if (pErr || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Fetch milestone
  const { data: milestone, error: mErr } = await supabase
    .from("milestones")
    .select("id, index, amount, status, title")
    .eq("id", milestoneId)
    .eq("project_id", projectId)
    .single();

  if (mErr || !milestone) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  if (milestone.status === "paid") {
    return NextResponse.json(
      { error: "Milestone already paid" },
      { status: 409 },
    );
  }

  if (milestone.status !== "submitted") {
    return NextResponse.json(
      { error: "Milestone must be in 'submitted' state to approve" },
      { status: 400 },
    );
  }

  // Fetch freelancer wallet address
  const { data: profile } = await supabase
    .from("users")
    .select("wallet_address")
    .eq("id", user.id)
    .single();

  const freelancerWallet = profile?.wallet_address ?? "demo_wallet";

  // Call on-chain (or demo mode)
  const result = await approveMilestoneOnChain({
    projectPDA: project.escrow_pda ?? "demo",
    milestoneIndex: milestone.index,
    milestoneAmount: Number(milestone.amount),
    freelancerWallet,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "On-chain approval failed" },
      { status: 500 },
    );
  }

  const now = new Date().toISOString();

  // Update milestone to paid
  await supabase
    .from("milestones")
    .update({
      status: "paid",
      approved_at: now,
      paid_at: now,
      solana_tx_hash: result.txHash,
    })
    .eq("id", milestoneId);

  // Check if all milestones are now paid
  const { data: allMilestones } = await supabase
    .from("milestones")
    .select("id, status")
    .eq("project_id", projectId);

  const allPaid = allMilestones?.every((m) => m.status === "paid") ?? false;

  // Update project status
  await supabase
    .from("projects")
    .update({
      status: allPaid ? "completed" : "in_progress",
      ...(allPaid ? { completed_at: now } : {}),
    })
    .eq("id", projectId);

  // Update user's total_earned (manual update — RPC not required)
  try {
    const { data: u } = await supabase
      .from("users")
      .select("total_earned, total_projects_completed")
      .eq("id", user.id)
      .single();

    if (u) {
      await supabase
        .from("users")
        .update({
          total_earned: Number(u.total_earned ?? 0) + Number(milestone.amount),
          ...(allPaid
            ? { total_projects_completed: Number(u.total_projects_completed ?? 0) + 1 }
            : {}),
        })
        .eq("id", user.id);
    }
  } catch {
    // Non-critical — don't fail the whole request
  }

  // Log transaction
  await supabase.from("transactions").insert({
    project_id: projectId,
    milestone_id: milestoneId,
    type: "milestone_payout",
    amount: Number(milestone.amount),
    currency: "USDC",
    to_address: freelancerWallet,
    solana_tx_hash: result.txHash,
    metadata: {
      milestone_title: milestone.title,
      milestone_index: milestone.index,
      demo_mode: result.demoMode,
      all_milestones_paid: allPaid,
    },
  });

  return NextResponse.json({
    success: true,
    txHash: result.txHash,
    explorerUrl: result.txHash ? explorerTxUrl(result.txHash) : null,
    demoMode: result.demoMode,
    projectCompleted: allPaid,
    amountReleased: Number(milestone.amount),
  });
}
