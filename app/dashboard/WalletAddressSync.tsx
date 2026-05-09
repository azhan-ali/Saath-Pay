"use client";

import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * When a user connects a wallet, upsert the address onto their user profile.
 * Runs silently in the background — no UI.
 */
export default function WalletAddressSync() {
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    if (!connected || !publicKey) return;
    if (!isSupabaseConfigured()) return;

    const sync = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
          .from("users")
          .update({ wallet_address: publicKey.toBase58() })
          .eq("id", user.id);
      } catch (err) {
        console.error("Wallet sync failed:", err);
      }
    };

    sync();
  }, [connected, publicKey]);

  return null;
}
