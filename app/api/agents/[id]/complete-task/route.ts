/**
 * POST /api/agents/[id]/complete-task
 *
 * x402-style autonomous agent payment flow.
 *
 * This implements the x402 "Payment Required" pattern:
 *   1. Agent reports task completion
 *   2. Server validates → returns HTTP 402 Payment Required (x402 spec)
 *   3. Server auto-pays agent from escrow (no human approval needed)
 *   4. Returns payment proof
 *
 * In a real x402 implementation, the agent's wallet would sign the
 * payment authorization. For the hackathon demo, the server handles
 * the payment on behalf of the agent.
 *
 * Body: { projectId, taskDescription? }
 */

import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { payAgentOnChain, explorerTxUrl } from "@/lib/solana/program";

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { id: agentId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { projectId, taskDescription } = body as {
    projectId?: string;
    taskDescription?: string;
  };

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  // Fetch agent
  const { data: agent } = await supabase
    .from("ai_agents")
    .select("*")
    .eq("id", agentId)
    .eq("project_id", projectId)
    .single();

  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  if (!agent.is_active) return NextResponse.json({ error: "Agent is inactive" }, { status: 400 });

  // Fetch project (verify ownership + get escrow PDA)
  const { data: project } = await supabase
    .from("projects")
    .select("id, escrow_pda, status, total_amount, freelancer_id")
    .eq("id", projectId)
    .eq("freelancer_id", user.id)
    .single();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // ── x402 Pattern ──────────────────────────────────────────────────────────
  // Step 1: Return 402 Payment Required with payment details
  // Step 2: Client (server in this case) auto-pays
  // This is the x402 protocol's core handshake

  const paymentAmount = Number(agent.rate_per_task) || 5;

  // Simulate x402 handshake — in real x402, we'd return 402 first
  // then the agent's wallet would sign and re-submit
  // For demo: we do it in one step but label it correctly

  // Pay agent on-chain (or demo mode)
  const payResult = await payAgentOnChain({
    projectPDA: project.escrow_pda ?? "demo",
    agentWallet: agent.wallet_address,
    amountUsdc: paymentAmount,
  });

  if (!payResult.success) {
    return NextResponse.json(
      { error: payResult.error ?? "Payment failed" },
      { status: 500 },
    );
  }

  const serviceSupabase = getServiceSupabase();
  const now = new Date().toISOString();

  // Update agent stats
  await serviceSupabase
    .from("ai_agents")
    .update({
      total_paid: Number(agent.total_paid) + paymentAmount,
      tasks_completed: Number(agent.tasks_completed) + 1,
    })
    .eq("id", agentId);

  // Log transaction
  await serviceSupabase.from("transactions").insert({
    project_id: projectId,
    agent_id: agentId,
    type: "agent_payout",
    amount: paymentAmount,
    currency: "USDC",
    to_address: agent.wallet_address,
    solana_tx_hash: payResult.txHash,
    metadata: {
      agent_name: agent.name,
      agent_role: agent.role,
      task_description: taskDescription || "Task completed",
      x402_pattern: true,
      demo_mode: payResult.demoMode,
      explorer_url: payResult.txHash ? explorerTxUrl(payResult.txHash) : null,
    },
  });

  // Notify project owner
  await serviceSupabase.from("notifications").insert({
    user_id: project.freelancer_id,
    type: "agent_paid",
    title: `🤖 ${agent.name} paid $${paymentAmount} USDC`,
    body: `${agent.role} completed a task. Payment sent autonomously via x402.`,
    link: `/dashboard/projects/${projectId}?tab=agents`,
  });

  return NextResponse.json({
    success: true,
    // x402 payment proof
    payment: {
      agentId,
      agentName: agent.name,
      agentWallet: agent.wallet_address,
      amount: paymentAmount,
      currency: "USDC",
      txHash: payResult.txHash,
      explorerUrl: payResult.txHash ? explorerTxUrl(payResult.txHash) : null,
      demoMode: payResult.demoMode,
      protocol: "x402-inspired",
      timestamp: now,
    },
  });
}
