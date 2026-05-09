import type { ReactNode } from "next";
import AnimatedBackground from "../components/AnimatedBackground";
import CustomCursor from "../components/CustomCursor";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AnimatedBackground />
      <CustomCursor />
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative">
        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px_15px_13px_16px] bg-accent-orange border-[2.5px] border-ink shadow-[2px_2px_0_#1a1a1a] group-hover:rotate-[-4deg] transition-transform">
            <span
              className="font-[family-name:var(--font-marker)] text-xl text-white"
              style={{ textShadow: "1px 1px 0 #1a1a1a" }}
            >
              S
            </span>
          </div>
          <span className="font-[family-name:var(--font-marker)] text-2xl text-ink">
            SaathPay
          </span>
        </Link>
        {children}
      </main>
    </>
  );
}
