"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import WalletButton from "./WalletButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const links = [
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how" },
    { label: "Why SaathPay", href: "#why" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className={`rough-box flex items-center justify-between bg-paper px-5 py-3 transition-all ${
            scrolled ? "shadow-[4px_4px_0_#1a1a1a]" : "shadow-[6px_6px_0_#1a1a1a]"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px_15px_13px_16px] bg-accent-orange border-[2.5px] border-ink shadow-[2px_2px_0_#1a1a1a] group-hover:rotate-[-4deg] transition-transform">
                <span
                  className="font-[family-name:var(--font-marker)] text-xl text-white"
                  style={{ textShadow: "1px 1px 0 #1a1a1a" }}
                >
                  S
                </span>
              </div>
            </div>
            <span className="font-[family-name:var(--font-marker)] text-2xl text-ink">
              SaathPay
            </span>
            <span className="ml-1 text-lg">🇮🇳</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-[family-name:var(--font-sketch)] text-lg text-ink hover:text-accent-orange transition-colors relative group"
              >
                {link.label}
                <span className="absolute left-0 right-0 -bottom-1 h-[3px] bg-accent-yellow scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              </a>
            ))}
          </nav>

          {/* Right side: Auth + Wallet */}
          <div className="hidden md:flex items-center gap-3">
            <WalletButton />
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="sketch-btn sketch-btn-primary !px-4 !py-2 !text-base inline-flex items-center gap-2"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="sketch-btn !px-3 !py-2 !text-base"
                  data-cursor-label="log out"
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="sketch-btn !px-4 !py-2 !text-base">
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="sketch-btn sketch-btn-primary !px-5 !py-2 !text-base"
                >
                  Sign Up →
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg border-[2.5px] border-ink"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-3 sketch-card flex flex-col gap-3"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-[family-name:var(--font-sketch)] text-lg text-ink py-2 border-b border-dashed border-ink/30"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 mt-2">
              <WalletButton />
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="sketch-btn sketch-btn-primary !py-2 !text-base"
                  >
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="sketch-btn !py-2 !text-base">
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="sketch-btn !py-2 !text-base">
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="sketch-btn sketch-btn-primary !py-2 !text-base"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
