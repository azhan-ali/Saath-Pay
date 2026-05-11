import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSolBalance } from "@/lib/solana/program";
import {
  Wallet,
  ExternalLink,
  Zap,
  Shield,
  Info,
} from "lucide-react";
import WalletTools from "./WalletTools";

export default async function WalletPage() {
  if (!isSupabaseConfigured()) redirect("/dashboard");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("wallet_address, total_earned")
    .eq("id", user.id)
    .single();

  const walletAddress = profile?.wallet_address;
  const solBalance = walletAddress ? await getSolBalance(walletAddress) : 0;

  const solanaNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
  const explorerUrl = walletAddress
    ? `https://explorer.solana.com/address/${walletAddress}${solanaNetwork === "devnet" ? "?cluster=devnet" : ""}`
    : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-[family-name:var(--font-hand)] text-xl text-accent-blue">
          ~ your on-chain wallet ~
        </p>
        <h1 className="font-[family-name:var(--font-marker)] text-4xl text-ink">
          Wallet & Escrow
        </h1>
      </div>

      {/* Wallet address card */}
      <div className="sketch-card sketch-card-blue relative" style={{ transform: "rotate(-0.3deg)" }}>
        <div className="tape" style={{ top: "-10px", left: "30px", transform: "rotate(-2deg)" }} />
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px_18px_16px_20px] bg-accent-blue border-[3px] border-ink shadow-[3px_3px_0_#1a1a1a]">
            <Wallet size={26} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-[family-name:var(--font-marker)] text-2xl text-ink mb-1">
              Phantom Wallet
            </h2>
            {walletAddress ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <code className="flex-1 rough-box bg-paper px-3 py-1.5 font-mono text-sm text-ink truncate">
                    {walletAddress}
                  </code>
                  {explorerUrl && (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-accent-blue hover:text-accent-orange transition-colors"
                      title="View on Solana Explorer"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 font-[family-name:var(--font-hand)] text-xs text-ink-soft">
                  <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                  Connected · Solana {solanaNetwork}
                </div>
              </>
            ) : (
              <p className="font-[family-name:var(--font-body)] text-ink-soft">
                Connect your Phantom wallet using the button in the top bar.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Balances */}
      {walletAddress && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="sketch-card sketch-card-yellow text-center" style={{ transform: "rotate(-1deg)" }}>
            <div className="font-[family-name:var(--font-marker)] text-3xl text-ink">
              {solBalance.toFixed(4)}
            </div>
            <div className="font-[family-name:var(--font-hand)] text-base text-ink-soft">SOL Balance</div>
          </div>
          <div className="sketch-card sketch-card-green text-center" style={{ transform: "rotate(1deg)" }}>
            <div className="font-[family-name:var(--font-marker)] text-3xl text-ink">
              ${Number(profile?.total_earned ?? 0).toFixed(2)}
            </div>
            <div className="font-[family-name:var(--font-hand)] text-base text-ink-soft">Total Earned</div>
          </div>
          <div className="sketch-card sketch-card-pink text-center col-span-2 md:col-span-1" style={{ transform: "rotate(-0.5deg)" }}>
            <div className="font-[family-name:var(--font-marker)] text-3xl text-ink">USDC</div>
            <div className="font-[family-name:var(--font-hand)] text-base text-ink-soft">Stablecoin</div>
          </div>
        </div>
      )}

      {/* Devnet tools */}
      {solanaNetwork === "devnet" && walletAddress && (
        <WalletTools walletAddress={walletAddress} />
      )}

      {/* How escrow works */}
      <div className="sketch-card bg-paper relative" style={{ transform: "rotate(0.2deg)" }}>
        <div className="absolute -top-3 left-6 px-3 py-1 bg-accent-purple text-white font-[family-name:var(--font-sketch)] text-sm rounded-[8px_10px_9px_11px] shadow-[2px_2px_0_#1a1a1a]">
          ⚡ Phase 3 — Solana Escrow
        </div>
        <div className="flex items-start gap-3 mt-2">
          <Shield size={24} className="text-accent-purple shrink-0 mt-1" />
          <div>
            <h3 className="font-[family-name:var(--font-marker)] text-xl mb-2">How Escrow Works</h3>
            <ol className="space-y-2 font-[family-name:var(--font-body)] text-sm text-ink-soft">
              <li><span className="font-bold text-ink">1.</span> Client pays via Dodo (card/UPI) → Dodo webhook fires</li>
              <li><span className="font-bold text-ink">2.</span> Backend calls <code className="bg-paper-dark px-1 text-xs">fund_escrow</code> → USDC locks in Solana PDA</li>
              <li><span className="font-bold text-ink">3.</span> Freelancer submits proof → client reviews</li>
              <li><span className="font-bold text-ink">4.</span> Client approves → <code className="bg-paper-dark px-1 text-xs">approve_milestone</code> releases USDC instantly</li>
              <li><span className="font-bold text-ink">5.</span> Settlement in ~400ms · Fees under $0.01</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="rough-box bg-blue-50 p-4 flex items-start gap-3">
        <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="font-[family-name:var(--font-body)] text-sm text-blue-800">
          <strong>Devnet mode:</strong> All transactions are on Solana devnet — no real money involved.
          Use the airdrop button above to get test SOL. For demo USDC, set{" "}
          <code className="bg-blue-100 px-1 text-xs">NEXT_PUBLIC_USDC_MINT</code> in{" "}
          <code className="bg-blue-100 px-1 text-xs">.env.local</code>.
        </div>
      </div>
    </div>
  );
}
