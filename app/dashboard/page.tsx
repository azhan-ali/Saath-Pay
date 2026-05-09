import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Rocket,
  Briefcase,
  Wallet,
  Zap,
  ArrowRight,
  Sparkles,
  Database,
  AlertTriangle,
} from "lucide-react";
import WalletAddressSync from "./WalletAddressSync";

export default async function DashboardPage() {
  // If Supabase isn't configured yet, show a helpful setup screen
  // instead of crashing. The dev can wire keys in .env.local and refresh.
  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch user profile (may be null on first load if trigger hasn't fired yet)
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.full_name || user.email?.split("@")[0] || "friend";

  const stats = [
    {
      label: "Total earnings",
      value: `$${Number(profile?.total_earned ?? 0).toFixed(2)}`,
      color: "sketch-card-yellow",
      icon: Wallet,
    },
    {
      label: "Projects completed",
      value: profile?.total_projects_completed ?? 0,
      color: "sketch-card-green",
      icon: Briefcase,
    },
    {
      label: "Reputation",
      value: `${profile?.reputation_score ?? 50}/100`,
      color: "sketch-card-pink",
      icon: Sparkles,
    },
    {
      label: "Avg settlement",
      value: "< 2 sec",
      color: "sketch-card-blue",
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-8">
      <WalletAddressSync />

      <div>
        <p className="font-[family-name:var(--font-hand)] text-2xl text-accent-orange">
          ~ welcome back ~
        </p>
        <h1 className="font-[family-name:var(--font-marker)] text-4xl md:text-5xl text-ink">
          Hey {displayName} 👋
        </h1>
        <p className="font-[family-name:var(--font-body)] text-lg text-ink-soft mt-1">
          Your command center for every project + payment.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`sketch-card ${s.color}`}
              style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
            >
              <Icon size={22} className="mb-2 text-ink" strokeWidth={2.5} />
              <div className="font-[family-name:var(--font-marker)] text-2xl md:text-3xl text-ink">
                {s.value}
              </div>
              <div className="font-[family-name:var(--font-hand)] text-base text-ink-soft">
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="sketch-card bg-paper relative"
        style={{ transform: "rotate(-0.3deg)" }}
      >
        <div className="absolute -top-3 left-6 px-3 py-1 bg-accent-green text-white font-[family-name:var(--font-sketch)] text-sm rounded-[8px_10px_9px_11px] shadow-[2px_2px_0_#1a1a1a]">
          ✅ Phase 1 complete
        </div>
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[16px_20px_18px_22px] bg-accent-yellow border-[3px] border-ink shadow-[3px_3px_0_#1a1a1a]">
            <Rocket size={28} className="text-ink" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h2 className="font-[family-name:var(--font-marker)] text-2xl text-ink mb-1">
              You&apos;re all set up!
            </h2>
            <p className="font-[family-name:var(--font-body)] text-ink-soft mb-3">
              Authentication ✓ · Database ✓ · Wallet connect ✓ — the foundation
              is solid. Next up: project creation, on-chain escrow, and Dodo
              checkout.
            </p>
            <div className="flex flex-wrap gap-2 font-[family-name:var(--font-sketch)] text-sm">
              <span className="highlight-green">Phase 2: Dashboard UI</span>
              <span className="highlight">Phase 3: Solana contract</span>
              <span className="highlight-pink">Phase 4: Dodo integration</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/dashboard"
          className="sketch-card sketch-card-orange relative group block"
          style={{ transform: "rotate(-0.5deg)" }}
        >
          <div className="absolute -top-3 -right-3 px-3 py-1 bg-ink text-paper font-[family-name:var(--font-sketch)] text-xs rounded-[8px_10px_9px_11px]">
            Coming in Phase 2
          </div>
          <h3 className="font-[family-name:var(--font-marker)] text-2xl mb-2">
            📝 Create Project
          </h3>
          <p className="font-[family-name:var(--font-body)] text-ink-soft mb-3">
            Build a new project with AI-generated milestones, send the payment
            link to your client, and get paid when work is approved.
          </p>
          <span className="font-[family-name:var(--font-sketch)] text-sm inline-flex items-center gap-1">
            Unlocks next{" "}
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </span>
        </Link>

        <Link
          href="/dashboard"
          className="sketch-card sketch-card-purple relative group block"
          style={{ transform: "rotate(0.5deg)" }}
        >
          <div className="absolute -top-3 -right-3 px-3 py-1 bg-ink text-paper font-[family-name:var(--font-sketch)] text-xs rounded-[8px_10px_9px_11px]">
            Coming in Phase 6
          </div>
          <h3 className="font-[family-name:var(--font-marker)] text-2xl mb-2">
            🤖 Add AI Agents
          </h3>
          <p className="font-[family-name:var(--font-body)] text-ink-soft mb-3">
            Hire AI agents for sub-tasks. They earn autonomous micropayments
            via x402 protocol on Solana.
          </p>
          <span className="font-[family-name:var(--font-sketch)] text-sm inline-flex items-center gap-1">
            Unlocks later{" "}
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </span>
        </Link>
      </div>
    </div>
  );
}

/**
 * Shown when Supabase env vars aren't set yet. Gives the dev
 * everything they need to finish Phase 1 wiring.
 */
function SetupRequired() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="font-[family-name:var(--font-hand)] text-2xl text-accent-orange">
          ~ almost there ~
        </p>
        <h1 className="font-[family-name:var(--font-marker)] text-4xl md:text-5xl text-ink flex items-center gap-3">
          <AlertTriangle className="text-accent-orange" size={40} />
          One step left
        </h1>
        <p className="font-[family-name:var(--font-body)] text-lg text-ink-soft mt-2">
          Phase 1 code is all shipped — just need to plug in Supabase.
        </p>
      </div>

      <div
        className="sketch-card sketch-card-yellow"
        style={{ transform: "rotate(-0.3deg)" }}
      >
        <div className="flex items-start gap-3 mb-4">
          <Database size={28} className="text-ink mt-1" strokeWidth={2.5} />
          <div>
            <h2 className="font-[family-name:var(--font-marker)] text-2xl">
              Configure Supabase (2 minutes)
            </h2>
            <p className="font-[family-name:var(--font-body)] text-ink-soft">
              Free tier is plenty for the hackathon.
            </p>
          </div>
        </div>

        <ol className="space-y-3 font-[family-name:var(--font-body)] text-ink">
          <li>
            <span className="font-bold">1.</span> Go to{" "}
            <a
              href="https://app.supabase.com"
              target="_blank"
              rel="noreferrer"
              className="underline text-accent-orange font-bold"
            >
              app.supabase.com
            </a>{" "}
            → sign in → <span className="font-bold">New Project</span>
          </li>
          <li>
            <span className="font-bold">2.</span> Pick a region close to India
            (Singapore / Mumbai). Save the DB password.
          </li>
          <li>
            <span className="font-bold">3.</span> Once ready, go to{" "}
            <span className="font-bold">Settings → API</span>. Copy:
            <ul className="ml-6 mt-2 space-y-1 list-disc">
              <li>
                <code className="bg-paper-dark px-1">Project URL</code>
              </li>
              <li>
                <code className="bg-paper-dark px-1">anon public key</code>
              </li>
              <li>
                <code className="bg-paper-dark px-1">service_role key</code>{" "}
                (keep secret!)
              </li>
            </ul>
          </li>
          <li>
            <span className="font-bold">4.</span> Paste them into{" "}
            <code className="bg-paper-dark px-1">.env.local</code>:
            <pre className="mt-2 p-3 rough-box bg-paper text-xs overflow-x-auto">
              {`NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...`}
            </pre>
          </li>
          <li>
            <span className="font-bold">5.</span> Go to{" "}
            <span className="font-bold">SQL Editor</span> → paste contents of{" "}
            <code className="bg-paper-dark px-1">supabase/schema.sql</code> →{" "}
            <span className="font-bold">Run</span>. This creates all tables.
          </li>
          <li>
            <span className="font-bold">6.</span> Go to{" "}
            <span className="font-bold">
              Authentication → Providers → Email
            </span>{" "}
            — turn <span className="font-bold">OFF</span> &quot;Confirm
            email&quot; for faster dev.
          </li>
          <li>
            <span className="font-bold">7.</span> Restart dev server:{" "}
            <code className="bg-paper-dark px-1">npm run dev</code> → refresh
            this page.
          </li>
        </ol>
      </div>

      <div
        className="sketch-card sketch-card-green text-center"
        style={{ transform: "rotate(0.3deg)" }}
      >
        <p className="font-[family-name:var(--font-hand)] text-xl text-ink">
          💡 Once configured, sign up → come back here → see your real dashboard
          with stats + wallet sync.
        </p>
      </div>

      <div className="text-center">
        <Link href="/" className="sketch-btn">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
