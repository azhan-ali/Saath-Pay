"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { Wallet, LogOut, Copy, Check } from "lucide-react";

/**
 * Hand-drawn themed wallet connect button.
 * - Shows "Connect Wallet" when not connected
 * - Shows truncated address + SOL balance when connected
 * - Click to open dropdown with disconnect + copy options
 */
export default function WalletButton() {
  const { connection } = useConnection();
  const { publicKey, disconnect, connected, wallet } = useWallet();
  const { setVisible } = useWalletModal();

  const [balance, setBalance] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    let cancelled = false;
    connection
      .getBalance(publicKey)
      .then((lamports) => {
        if (!cancelled) setBalance(lamports / LAMPORTS_PER_SOL);
      })
      .catch(() => {
        if (!cancelled) setBalance(0);
      });
    return () => {
      cancelled = true;
    };
  }, [publicKey, connection]);

  if (!connected || !publicKey) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="sketch-btn sketch-btn-orange !px-4 !py-2 !text-sm"
        data-cursor-label="connect wallet!"
      >
        <Wallet size={16} className="mr-2" />
        Connect Wallet
      </button>
    );
  }

  const addr = publicKey.toBase58();
  const short = `${addr.slice(0, 4)}…${addr.slice(-4)}`;

  const copyAddress = async () => {
    await navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="sketch-btn sketch-btn-green !px-3 !py-2 !text-sm inline-flex items-center gap-2"
        data-cursor-label="wallet menu"
      >
        <span className="font-[family-name:var(--font-marker)]">{short}</span>
        <span className="hidden sm:inline font-[family-name:var(--font-sketch)] text-xs opacity-90">
          {balance !== null ? `${balance.toFixed(3)} SOL` : "…"}
        </span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 z-50 sketch-card bg-paper p-3">
            <div className="mb-2">
              <p className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">
                Connected via {wallet?.adapter.name ?? "wallet"}
              </p>
              <p className="font-[family-name:var(--font-marker)] text-lg break-all">
                {short}
              </p>
              <p className="font-[family-name:var(--font-sketch)] text-sm mt-1">
                Balance: <span className="font-bold">{balance?.toFixed(4) ?? "…"} SOL</span>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={copyAddress}
                className="sketch-btn !py-2 !text-sm inline-flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check size={14} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy Address
                  </>
                )}
              </button>
              <button
                onClick={async () => {
                  setOpen(false);
                  await disconnect();
                }}
                className="sketch-btn !py-2 !text-sm inline-flex items-center justify-center gap-2"
                style={{ background: "#ffe4e1" }}
              >
                <LogOut size={14} /> Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
