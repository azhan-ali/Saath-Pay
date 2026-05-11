"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import WalletButton from "../components/WalletButton";
import NotificationBell from "./NotificationBell";
import { LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export default function DashboardNav() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }: { data: { user: import("@supabase/supabase-js").User | null } }) =>
      setUser(data.user ?? null),
    );
  }, []);

  const handleLogout = async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 py-3 px-4">
      <div className="max-w-7xl mx-auto rough-box bg-paper flex items-center justify-between px-5 py-3 shadow-[4px_4px_0_#1a1a1a]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px_15px_13px_16px] bg-accent-orange border-[2.5px] border-ink shadow-[2px_2px_0_#1a1a1a] group-hover:rotate-[-4deg] transition-transform">
            <span
              className="font-[family-name:var(--font-marker)] text-lg text-white"
              style={{ textShadow: "1px 1px 0 #1a1a1a" }}
            >
              S
            </span>
          </div>
          <span className="font-[family-name:var(--font-marker)] text-xl text-ink hidden sm:inline">
            SaathPay
          </span>
        </Link>

        {/* Center greeting */}
        <div className="hidden md:block">
          <p className="font-[family-name:var(--font-hand)] text-lg text-ink-soft">
            Hi,{" "}
            <span className="text-accent-orange font-bold">
              {user?.email?.split("@")[0] || "there"}
            </span>{" "}
            👋
          </p>
        </div>

        {/* Right: wallet + bell + logout */}
        <div className="flex items-center gap-2">
          <WalletButton />
          {user && <NotificationBell userId={user.id} />}
          <button
            onClick={handleLogout}
            className="sketch-btn !px-3 !py-2 !text-sm"
            data-cursor-label="log out"
            aria-label="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
