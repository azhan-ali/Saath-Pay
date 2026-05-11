/**
 * POST /api/agents/add
 *
 * Adds an AI agent to a project.
 * Generates a fresh Solana keypair server-side for the agent's wallet.
 * Stores the public key in DB (private key is NOT stored — demo mode).
 *
 * Body: { projectId, name, role, ratePerTask }
 */

import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import { Keypair } from "@solana/web3.js";
import { generateDemoAddress } from "@/lib/solana/program";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { projectId, name, role, ratePerTask } = body as {
    projectId?: string;
    name?: string;
    role?: string;
    ratePerTask?: number;
  };

  if (!projectId || !name?.trim()) {
    return NextResponse.json({ error: "projectId and name are required" }, { status: 400 });
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id, escrow_pda")
    .eq("id", projectId)
    .eq("freelancer_id", user.id)
    .single();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // Generate a fresh Solana keypair for this agent
  // In production: encrypt private key with KMS before storing
  // For hackathon demo: generate address only (no real key storage)
  let walletAddress: string;
  try {
    const keypair = Keypair.generate();
    walletAddress = keypair.publicKey.toBase58();
    // NOTE: In production, store encrypted keypair.secretKey
    // For demo: we only store the public address
  } catch {
    walletAddress = generateDemoAddress();
  }

  const { data: agent, error } = await supabase
    .from("ai_agents")
    .insert({
      project_id: projectId,
      name: name.trim(),
      role: role?.trim() || "General Assistant",
      wallet_address: walletAddress,
      rate_per_task: Number(ratePerTask) || 5,
      total_paid: 0,
      tasks_completed: 0,
      is_active: true,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, agent });
}
