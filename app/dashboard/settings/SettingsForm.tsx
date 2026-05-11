"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Wallet,
  Shield,
  Star,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface SettingsFormProps {
  userId: string;
  email: string;
  initialProfile: {
    full_name: string;
    wallet_address: string;
    role: string;
    reputation_score: number;
    total_earned: number;
    total_projects_completed: number;
  };
}

export default function SettingsForm({ userId, email, initialProfile }: SettingsFormProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reputation = profile.reputation_score;
  const reputationLevel =
    reputation >= 90 ? "Elite" :
    reputation >= 75 ? "Trusted" :
    reputation >= 60 ? "Rising" : "New";

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const supabase = createClient();
      const { error: err } = await supabase
        .from("users")
        .update({
          full_name: profile.full_name.trim() || null,
        })
        .eq("id", userId);

      if (err) throw err;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const solanaNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
  const walletExplorerUrl = profile.wallet_address
    ? `https://explorer.solana.com/address/${profile.wallet_address}${solanaNetwork === "devnet" ? "?cluster=devnet" : ""}`
    : null;

  return (
    <div className="space-y-5">
      {/* Profile card */}
      <div className="sketch-card bg-paper relative" style={{ transform: "rotate(-0.3deg)" }}>
        <div className="tape" style={{ top: "-10px", left: "30px", transform: "rotate(-2deg)" }} />
        <h2 className="font-[family-name:var(--font-marker)] text-xl mb-4 flex items-center gap-2">
          <User size={18} /> Profile
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block font-[family-name:var(--font-sketch)] text-sm text-ink-soft mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Your name"
              className="sketch-input"
            />
          </div>

          <div>
            <label className="block font-[family-name:var(--font-sketch)] text-sm text-ink-soft mb-1">
              Email (read-only)
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="sketch-input opacity-60 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-[family-name:var(--font-sketch)] text-sm text-ink-soft mb-1">
              Role
            </label>
            <div className="sketch-input opacity-60 capitalize">{profile.role}</div>
          </div>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 font-[family-name:var(--font-sketch)] text-sm text-red-600">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 sketch-btn sketch-btn-green !px-5 !py-2 inline-flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving…</>
          ) : saved ? (
            <><Check size={16} /> Saved!</>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* Wallet card */}
      <div className="sketch-card sketch-card-blue relative" style={{ transform: "rotate(0.3deg)" }}>
        <h2 className="font-[family-name:var(--font-marker)] text-xl mb-3 flex items-center gap-2">
          <Wallet size={18} /> Solana Wallet
        </h2>

        {profile.wallet_address ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="flex-1 rough-box bg-paper px-3 py-2 font-mono text-sm text-ink truncate">
                {profile.wallet_address}
              </code>
              {walletExplorerUrl && (
                <a
                  href={walletExplorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent-blue hover:text-accent-orange transition-colors shrink-0"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
            <div className="flex items-center gap-1 font-[family-name:var(--font-hand)] text-xs text-ink-soft">
              <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              Connected · Solana {solanaNetwork}
            </div>
          </div>
        ) : (
          <p className="font-[family-name:var(--font-body)] text-sm text-ink-soft">
            Connect your Phantom wallet using the button in the top navigation bar.
          </p>
        )}
      </div>

      {/* Reputation card */}
      <div className="sketch-card sketch-card-pink relative" style={{ transform: "rotate(-0.2deg)" }}>
        <h2 className="font-[family-name:var(--font-marker)] text-xl mb-3 flex items-center gap-2">
          <Star size={18} /> Reputation Score
        </h2>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="font-[family-name:var(--font-marker)] text-5xl text-accent-pink">
              {reputation}
            </div>
            <div className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">/ 100</div>
          </div>
          <div className="flex-1">
            <div className="font-[family-name:var(--font-marker)] text-xl text-accent-pink mb-2">
              {reputationLevel} Freelancer
            </div>
            <div className="h-3 rough-box bg-paper-dark overflow-hidden mb-2">
              <div
                className="h-full bg-accent-pink transition-all"
                style={{ width: `${reputation}%` }}
              />
            </div>
            <div className="font-[family-name:var(--font-body)] text-xs text-ink-soft space-y-0.5">
              <p>Base: 50 pts</p>
              <p>Projects completed: +{profile.total_projects_completed * 10} pts</p>
              <p className="text-ink-soft italic">On-chain SBT reputation coming in v2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats card */}
      <div className="sketch-card sketch-card-green" style={{ transform: "rotate(0.2deg)" }}>
        <h2 className="font-[family-name:var(--font-marker)] text-xl mb-3 flex items-center gap-2">
          <Shield size={18} /> Account Stats
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-[family-name:var(--font-marker)] text-2xl text-accent-green">
              ${Number(profile.total_earned).toFixed(2)}
            </div>
            <div className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">Total Earned (USDC)</div>
          </div>
          <div>
            <div className="font-[family-name:var(--font-marker)] text-2xl text-ink">
              {profile.total_projects_completed}
            </div>
            <div className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">Projects Completed</div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rough-box bg-red-50 p-4">
        <h3 className="font-[family-name:var(--font-marker)] text-lg text-red-700 mb-2">Danger Zone</h3>
        <p className="font-[family-name:var(--font-body)] text-sm text-red-600 mb-3">
          Account deletion is permanent and cannot be undone.
        </p>
        <button
          disabled
          className="sketch-btn !px-4 !py-2 !text-sm opacity-40 cursor-not-allowed"
          title="Contact support to delete your account"
        >
          Delete Account (contact support)
        </button>
      </div>
    </div>
  );
}
