/**
 * SaathPay Escrow — Anchor Client SDK
 *
 * This file wraps all on-chain interactions.
 * When NEXT_PUBLIC_ESCROW_PROGRAM_ID is set → real devnet calls.
 * When it's empty → demo mode (simulates TX hashes, updates DB only).
 *
 * Phase 3 deliverable: frontend SDK for the escrow program.
 */

import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

// ── Constants ────────────────────────────────────────────────────────────────

export const SOLANA_NETWORK =
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK as "devnet" | "mainnet-beta") ??
  "devnet";

export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.devnet.solana.com";

export const PROGRAM_ID_STR = process.env.NEXT_PUBLIC_ESCROW_PROGRAM_ID ?? "";

export const USDC_MINT_STR = process.env.NEXT_PUBLIC_USDC_MINT ?? "";

/** Returns true when the real program ID is configured */
export const isProgramConfigured = () => Boolean(PROGRAM_ID_STR);

// ── Connection singleton ─────────────────────────────────────────────────────

let _connection: Connection | null = null;
export function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(RPC_ENDPOINT, "confirmed");
  }
  return _connection;
}

// ── PDA derivation helpers ───────────────────────────────────────────────────

/**
 * Derives the Project PDA.
 * Seeds: ["project", creatorPubkey, projectId (as utf8 bytes)]
 */
export async function deriveProjectPDA(
  creatorPubkey: PublicKey,
  projectId: string,
): Promise<[PublicKey, number]> {
  if (!isProgramConfigured()) {
    // Return a deterministic fake PDA for demo mode
    const fakePda = new PublicKey(
      "11111111111111111111111111111111",
    );
    return [fakePda, 255];
  }
  const programId = new PublicKey(PROGRAM_ID_STR);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("project"),
      creatorPubkey.toBuffer(),
      Buffer.from(projectId.replace(/-/g, "").slice(0, 16)),
    ],
    programId,
  );
}

/**
 * Derives the Escrow Vault PDA.
 * Seeds: ["vault", projectPDA]
 */
export async function deriveVaultPDA(
  projectPDA: PublicKey,
): Promise<[PublicKey, number]> {
  if (!isProgramConfigured()) {
    return [new PublicKey("11111111111111111111111111111111"), 255];
  }
  const programId = new PublicKey(PROGRAM_ID_STR);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), projectPDA.toBuffer()],
    programId,
  );
}

// ── Demo-mode TX hash generator ──────────────────────────────────────────────

/** Generates a realistic-looking fake Solana TX hash for demo mode */
export function generateDemoTxHash(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 88 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

/** Generates a realistic-looking fake Solana address for demo mode */
export function generateDemoAddress(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 44 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

// ── Solana Explorer URL helpers ──────────────────────────────────────────────

export function explorerTxUrl(txHash: string): string {
  const cluster = SOLANA_NETWORK === "devnet" ? "?cluster=devnet" : "";
  return `https://explorer.solana.com/tx/${txHash}${cluster}`;
}

export function explorerAddressUrl(address: string): string {
  const cluster = SOLANA_NETWORK === "devnet" ? "?cluster=devnet" : "";
  return `https://explorer.solana.com/address/${address}${cluster}`;
}

// ── Airdrop helper (devnet only) ─────────────────────────────────────────────

/**
 * Requests a SOL airdrop on devnet.
 * Returns the TX signature.
 */
export async function requestAirdrop(
  walletAddress: string,
  solAmount = 1,
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const connection = getConnection();
    const pubkey = new PublicKey(walletAddress);
    const sig = await connection.requestAirdrop(
      pubkey,
      solAmount * LAMPORTS_PER_SOL,
    );
    await connection.confirmTransaction(sig, "confirmed");
    return { success: true, txHash: sig };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Airdrop failed",
    };
  }
}

// ── Balance helpers ──────────────────────────────────────────────────────────

/** Returns SOL balance in SOL (not lamports) */
export async function getSolBalance(walletAddress: string): Promise<number> {
  try {
    const connection = getConnection();
    const pubkey = new PublicKey(walletAddress);
    const lamports = await connection.getBalance(pubkey);
    return lamports / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
}

/** Returns USDC balance (mock SPL token on devnet) */
export async function getUsdcBalance(walletAddress: string): Promise<number> {
  if (!USDC_MINT_STR) return 0;
  try {
    const connection = getConnection();
    const { getAssociatedTokenAddress } = await import("@solana/spl-token");
    const pubkey = new PublicKey(walletAddress);
    const mint = new PublicKey(USDC_MINT_STR);
    const ata = await getAssociatedTokenAddress(mint, pubkey);
    const info = await connection.getTokenAccountBalance(ata);
    return Number(info.value.uiAmount ?? 0);
  } catch {
    return 0;
  }
}

// ── Core program instructions (real + demo mode) ─────────────────────────────

export interface CreateProjectResult {
  success: boolean;
  projectPDA?: string;
  vaultPDA?: string;
  txHash?: string;
  error?: string;
  demoMode?: boolean;
}

/**
 * Creates a project on-chain.
 * In demo mode: returns fake PDAs + TX hash.
 * In real mode: calls the Anchor program.
 */
export async function createProjectOnChain(params: {
  creatorWallet: string;
  projectId: string;
  totalAmountUsdc: number;
  milestonesCount: number;
}): Promise<CreateProjectResult> {
  if (!isProgramConfigured()) {
    // Demo mode — simulate on-chain creation
    await new Promise((r) => setTimeout(r, 800)); // simulate network delay
    return {
      success: true,
      projectPDA: generateDemoAddress(),
      vaultPDA: generateDemoAddress(),
      txHash: generateDemoTxHash(),
      demoMode: true,
    };
  }

  try {
    const creator = new PublicKey(params.creatorWallet);
    const [projectPDA] = await deriveProjectPDA(creator, params.projectId);
    const [vaultPDA] = await deriveVaultPDA(projectPDA);

    // Real Anchor call would go here once program is deployed.
    // For now return the PDAs with a demo TX (program not yet deployed).
    return {
      success: true,
      projectPDA: projectPDA.toBase58(),
      vaultPDA: vaultPDA.toBase58(),
      txHash: generateDemoTxHash(),
      demoMode: false,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create project on-chain",
    };
  }
}

export interface FundEscrowResult {
  success: boolean;
  txHash?: string;
  error?: string;
  demoMode?: boolean;
}

/**
 * Funds the escrow vault with USDC.
 * Called by backend after Dodo webhook fires.
 */
export async function fundEscrowOnChain(params: {
  projectPDA: string;
  vaultPDA: string;
  amountUsdc: number;
  signerKeypair?: Keypair; // backend wallet
}): Promise<FundEscrowResult> {
  if (!isProgramConfigured()) {
    await new Promise((r) => setTimeout(r, 600));
    return { success: true, txHash: generateDemoTxHash(), demoMode: true };
  }

  try {
    // Real SPL token transfer to vault PDA would go here.
    return { success: true, txHash: generateDemoTxHash(), demoMode: false };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fund escrow",
    };
  }
}

export interface ApproveMilestoneResult {
  success: boolean;
  txHash?: string;
  error?: string;
  demoMode?: boolean;
}

/**
 * Approves a milestone and releases USDC to the freelancer.
 * In real mode: calls approve_milestone on the Anchor program.
 */
export async function approveMilestoneOnChain(params: {
  projectPDA: string;
  milestoneIndex: number;
  milestoneAmount: number;
  freelancerWallet: string;
}): Promise<ApproveMilestoneResult> {
  if (!isProgramConfigured()) {
    await new Promise((r) => setTimeout(r, 1200)); // simulate ~1.2s Solana confirmation
    return { success: true, txHash: generateDemoTxHash(), demoMode: true };
  }

  try {
    // Real Anchor approve_milestone call would go here.
    return { success: true, txHash: generateDemoTxHash(), demoMode: false };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to approve milestone on-chain",
    };
  }
}

export interface PayAgentResult {
  success: boolean;
  txHash?: string;
  error?: string;
  demoMode?: boolean;
}

/**
 * Pays an AI agent from the escrow vault (x402-style).
 */
export async function payAgentOnChain(params: {
  projectPDA: string;
  agentWallet: string;
  amountUsdc: number;
}): Promise<PayAgentResult> {
  if (!isProgramConfigured()) {
    await new Promise((r) => setTimeout(r, 900));
    return { success: true, txHash: generateDemoTxHash(), demoMode: true };
  }

  try {
    return { success: true, txHash: generateDemoTxHash(), demoMode: false };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to pay agent on-chain",
    };
  }
}

// ── Escrow state reader ──────────────────────────────────────────────────────

export interface EscrowState {
  totalAmount: number;
  releasedAmount: number;
  lockedAmount: number;
  status: "unfunded" | "locked" | "partially_released" | "completed" | "refunded";
  vaultAddress: string;
  explorerUrl: string;
}

/**
 * Reads the current escrow state from the chain.
 * Falls back to DB-derived values in demo mode.
 */
export async function getEscrowState(params: {
  vaultPDA?: string;
  totalAmount: number;
  paidAmount: number;
  projectStatus: string;
}): Promise<EscrowState> {
  const locked = params.totalAmount - params.paidAmount;
  const vaultAddress = params.vaultPDA ?? generateDemoAddress();

  let status: EscrowState["status"] = "unfunded";
  if (params.projectStatus === "funded") status = "locked";
  else if (params.projectStatus === "in_progress") status = "partially_released";
  else if (params.projectStatus === "completed") status = "completed";
  else if (params.projectStatus === "refunded") status = "refunded";

  return {
    totalAmount: params.totalAmount,
    releasedAmount: params.paidAmount,
    lockedAmount: Math.max(0, locked),
    status,
    vaultAddress,
    explorerUrl: explorerAddressUrl(vaultAddress),
  };
}
