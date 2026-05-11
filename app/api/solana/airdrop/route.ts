/**
 * POST /api/solana/airdrop
 * Requests a devnet SOL airdrop for a wallet address.
 * Only works on devnet — blocked on mainnet.
 */

import { NextRequest, NextResponse } from "next/server";
import { requestAirdrop, SOLANA_NETWORK } from "@/lib/solana/program";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  // Only allow on devnet
  if (SOLANA_NETWORK !== "devnet") {
    return NextResponse.json(
      { error: "Airdrop only available on devnet" },
      { status: 403 },
    );
  }

  // Auth check
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { walletAddress, amount = 1 } = body as {
    walletAddress?: string;
    amount?: number;
  };

  if (!walletAddress) {
    return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
  }

  // Cap at 2 SOL per request
  const cappedAmount = Math.min(Number(amount) || 1, 2);

  const result = await requestAirdrop(walletAddress, cappedAmount);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Airdrop failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    txHash: result.txHash,
    amount: cappedAmount,
    explorerUrl: `https://explorer.solana.com/tx/${result.txHash}?cluster=devnet`,
  });
}
