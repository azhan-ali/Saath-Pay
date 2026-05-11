/**
 * Mock USDC helpers for Solana devnet.
 *
 * On devnet, real USDC doesn't exist. We mint our own SPL token
 * and treat it as USDC for demo purposes.
 *
 * Usage:
 *   1. Run `npx ts-node lib/solana/mockUsdc.ts` to create the mint
 *   2. Copy the mint address to NEXT_PUBLIC_USDC_MINT in .env.local
 *   3. Use airdropMockUsdc() to fund test wallets
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { getConnection, RPC_ENDPOINT, USDC_MINT_STR } from "./program";

// ── Mint mock USDC (run once, save address to .env) ──────────────────────────

export async function createMockUsdcMint(payerKeypair: Keypair): Promise<string> {
  const {
    createMint,
    getMint,
  } = await import("@solana/spl-token");

  const connection = getConnection();
  const mint = await createMint(
    connection,
    payerKeypair,
    payerKeypair.publicKey, // mint authority
    payerKeypair.publicKey, // freeze authority
    6, // 6 decimals (same as real USDC)
  );

  console.log("✅ Mock USDC mint created:", mint.toBase58());
  console.log("Add to .env.local: NEXT_PUBLIC_USDC_MINT=" + mint.toBase58());
  return mint.toBase58();
}

// ── Airdrop mock USDC to a wallet ────────────────────────────────────────────

export async function airdropMockUsdc(params: {
  recipientWallet: string;
  amount: number; // in USDC (not micro-units)
  mintAuthorityKeypair: Keypair;
}): Promise<{ success: boolean; txHash?: string; error?: string }> {
  if (!USDC_MINT_STR) {
    return { success: false, error: "NEXT_PUBLIC_USDC_MINT not set in .env.local" };
  }

  try {
    const {
      getOrCreateAssociatedTokenAccount,
      mintTo,
    } = await import("@solana/spl-token");

    const connection = getConnection();
    const mint = new PublicKey(USDC_MINT_STR);
    const recipient = new PublicKey(params.recipientWallet);

    // Get or create the recipient's token account
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      params.mintAuthorityKeypair,
      mint,
      recipient,
    );

    // Mint tokens (amount * 10^6 for 6 decimals)
    const sig = await mintTo(
      connection,
      params.mintAuthorityKeypair,
      mint,
      tokenAccount.address,
      params.mintAuthorityKeypair,
      params.amount * 1_000_000,
    );

    return { success: true, txHash: sig };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to airdrop mock USDC",
    };
  }
}

// ── Get token account balance ────────────────────────────────────────────────

export async function getMockUsdcBalance(walletAddress: string): Promise<number> {
  if (!USDC_MINT_STR) return 0;

  try {
    const { getAssociatedTokenAddress } = await import("@solana/spl-token");
    const connection = getConnection();
    const mint = new PublicKey(USDC_MINT_STR);
    const wallet = new PublicKey(walletAddress);
    const ata = await getAssociatedTokenAddress(mint, wallet);
    const info = await connection.getTokenAccountBalance(ata);
    return Number(info.value.uiAmount ?? 0);
  } catch {
    return 0;
  }
}
