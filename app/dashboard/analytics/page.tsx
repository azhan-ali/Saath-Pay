import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  TrendingUp,
  Wallet,
  Briefcase,
  Zap,
  Bot,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default async function AnalyticsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="space-y-4">
        <div>
          <p className="font-[family-name:var(--font-hand)] text-xl text-accent-blue">~ your numbers ~</p>
          <h1 className="font-[family-name:var(--font-marker)] text-4xl text-ink">Analytics</h1>
        </div>
        <div className="rough-box bg-yellow-50 p-4 font-[family-name:var(--font-body)] text-sm text-yellow-800">
          Configure Supabase to see your analytics.
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch all data in parallel — projects first, then transactions
  const [profileRes, projectsRes, agentsRes] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase
      .from("projects")
      .select("id, title, status, total_amount, currency, created_at, completed_at, milestones(id, status, amount, paid_at)")
      .eq("freelancer_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("ai_agents")
      .select("id, name, total_paid, tasks_completed, projects!inner(freelancer_id)")
      .eq("projects.freelancer_id", user.id),
  ]);

  const projects = projectsRes.data ?? [];
  const projectIds = projects.map((p: { id: string }) => p.id);

  // Fetch transactions separately after we have project IDs
  const { data: txData } = await supabase
    .from("transactions")
    .select("*")
    .in("project_id", projectIds.length > 0 ? projectIds : ["none"])
    .order("created_at", { ascending: false })
    .limit(15);

  const profile = profileRes.data;
  const transactions = txData ?? [];
  const agents = agentsRes.data ?? [];

  // ── Computed stats ────────────────────────────────────────────────────────
  const totalEarned = Number(profile?.total_earned ?? 0);
  const completedProjects = projects.filter((p: { status: string }) => p.status === "completed").length;
  const activeProjects = projects.filter((p: { status: string }) =>
    ["funded", "in_progress"].includes(p.status),
  ).length;
  const pendingProjects = projects.filter((p: { status: string }) =>
    ["draft", "awaiting_payment"].includes(p.status),
  ).length;

  const totalAgentPaid = agents.reduce((sum: number, a: { total_paid: number }) => sum + Number(a.total_paid), 0);
  const totalAgentTasks = agents.reduce((sum: number, a: { tasks_completed: number }) => sum + Number(a.tasks_completed), 0);

  // Pending payout = sum of funded/in_progress project amounts minus paid milestones
  const pendingPayout = projects
    .filter((p: { status: string }) => ["funded", "in_progress"].includes(p.status))
    .reduce((sum: number, p: { total_amount: number; milestones: { status: string; amount: number }[] }) => {
      const paid = (p.milestones ?? [])
        .filter((m: { status: string }) => m.status === "paid")
        .reduce((s: number, m: { amount: number }) => s + Number(m.amount), 0);
      return sum + Number(p.total_amount) - paid;
    }, 0);

  // Reputation score
  const reputation = Number(profile?.reputation_score ?? 50);
  const reputationLevel =
    reputation >= 90 ? "Elite" :
    reputation >= 75 ? "Trusted" :
    reputation >= 60 ? "Rising" : "New";
  const reputationColor =
    reputation >= 90 ? "text-accent-green" :
    reputation >= 75 ? "text-accent-blue" :
    reputation >= 60 ? "text-accent-orange" : "text-ink-soft";

  const solanaNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";

  return (
    <div className="space-y-6">
      <div>
        <p className="font-[family-name:var(--font-hand)] text-xl text-accent-blue">~ your numbers ~</p>
        <h1 className="font-[family-name:var(--font-marker)] text-4xl text-ink">Analytics</h1>
        <p className="font-[family-name:var(--font-body)] text-ink-soft mt-1">
          Real-time stats from your Supabase DB + Solana transactions.
        </p>
      </div>

      {/* ── Primary stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Earned", value: `$${totalEarned.toFixed(2)}`, icon: Wallet, color: "sketch-card-yellow" },
          { label: "Pending Payout", value: `$${pendingPayout.toFixed(2)}`, icon: Clock, color: "sketch-card-orange" },
          { label: "Active Projects", value: activeProjects, icon: Briefcase, color: "sketch-card-blue" },
          { label: "Completed", value: completedProjects, icon: CheckCircle2, color: "sketch-card-green" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`sketch-card ${s.color}`}
              style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
            >
              <Icon size={20} className="mb-2 text-ink" strokeWidth={2.5} />
              <div className="font-[family-name:var(--font-marker)] text-2xl md:text-3xl text-ink">
                {s.value}
              </div>
              <div className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Reputation + Agent stats ── */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Reputation */}
        <div className="sketch-card sketch-card-pink relative" style={{ transform: "rotate(-0.3deg)" }}>
          <div className="absolute -top-3 left-6 px-3 py-1 bg-accent-pink text-white font-[family-name:var(--font-sketch)] text-sm rounded-[8px_10px_9px_11px] shadow-[2px_2px_0_#1a1a1a]">
            ⭐ Reputation
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="text-center">
              <div className={`font-[family-name:var(--font-marker)] text-5xl ${reputationColor}`}>
                {reputation}
              </div>
              <div className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">/ 100</div>
            </div>
            <div className="flex-1">
              <div className={`font-[family-name:var(--font-marker)] text-xl ${reputationColor} mb-1`}>
                {reputationLevel} Freelancer
              </div>
              {/* Progress bar */}
              <div className="h-3 rough-box bg-paper-dark overflow-hidden mb-2">
                <div
                  className="h-full bg-accent-pink transition-all"
                  style={{ width: `${reputation}%` }}
                />
              </div>
              <div className="font-[family-name:var(--font-body)] text-xs text-ink-soft space-y-0.5">
                <p>✓ {completedProjects} projects completed (+{completedProjects * 10} pts)</p>
                <p>✓ Base score: 50 pts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agent stats */}
        <div className="sketch-card sketch-card-purple relative" style={{ transform: "rotate(0.3deg)" }}>
          <div className="absolute -top-3 left-6 px-3 py-1 bg-accent-purple text-white font-[family-name:var(--font-sketch)] text-sm rounded-[8px_10px_9px_11px] shadow-[2px_2px_0_#1a1a1a]">
            🤖 AI Agents (x402)
          </div>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { label: "Total Agents", value: agents.length },
              { label: "Tasks Done", value: totalAgentTasks },
              { label: "Agent Costs", value: `$${totalAgentPaid.toFixed(0)}` },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-[family-name:var(--font-marker)] text-2xl text-ink">{s.value}</div>
                <div className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 font-[family-name:var(--font-hand)] text-xs text-ink-soft">
            Avg settlement: <strong className="text-ink">~1 second</strong> · Fees: <strong className="text-ink">&lt;$0.01</strong>
          </div>
        </div>
      </div>

      {/* ── Project breakdown ── */}
      <div className="sketch-card bg-paper" style={{ transform: "rotate(-0.2deg)" }}>
        <h2 className="font-[family-name:var(--font-marker)] text-2xl mb-4 flex items-center gap-2">
          <TrendingUp size={20} /> Project Breakdown
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Total", value: projects.length, color: "bg-ink" },
            { label: "Active", value: activeProjects, color: "bg-accent-blue" },
            { label: "Pending $", value: pendingProjects, color: "bg-accent-yellow" },
            { label: "Done", value: completedProjects, color: "bg-accent-green" },
          ].map((s) => (
            <div key={s.label} className="text-center rough-box bg-paper-dark py-2">
              <div className="font-[family-name:var(--font-marker)] text-2xl">{s.value}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <div className={`w-2 h-2 rounded-full ${s.color}`} />
                <span className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Project list */}
        {projects.length > 0 && (
          <div className="space-y-2">
            {projects.slice(0, 5).map((p: {
              id: string;
              title: string;
              status: string;
              total_amount: number;
              milestones: { status: string; amount: number }[];
            }) => {
              const milestones = p.milestones ?? [];
              const paid = milestones.filter((m: { status: string }) => m.status === "paid").length;
              const pct = milestones.length > 0 ? Math.round((paid / milestones.length) * 100) : 0;
              return (
                <Link
                  key={p.id}
                  href={`/dashboard/projects/${p.id}`}
                  className="flex items-center gap-3 py-2 px-3 rough-box bg-paper-dark hover:bg-paper transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-[family-name:var(--font-sketch)] text-sm text-ink truncate">{p.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rough-box bg-paper overflow-hidden">
                        <div className="h-full bg-accent-green" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-[family-name:var(--font-hand)] text-xs text-ink-soft shrink-0">{pct}%</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-[family-name:var(--font-marker)] text-base text-accent-green">
                      ${Number(p.total_amount).toLocaleString()}
                    </div>
                    <div className="font-[family-name:var(--font-hand)] text-xs text-ink-soft capitalize">{p.status.replace("_", " ")}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Transaction history ── */}
      <div className="sketch-card bg-paper" style={{ transform: "rotate(0.2deg)" }}>
        <h2 className="font-[family-name:var(--font-marker)] text-2xl mb-4 flex items-center gap-2">
          <Zap size={20} /> Transaction History
        </h2>

        {transactions.length === 0 ? (
          <p className="font-[family-name:var(--font-hand)] text-sm text-ink-soft text-center py-4">
            No transactions yet — fund an escrow to see them here.
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx: {
              id: string;
              type: string;
              amount: number;
              currency: string;
              solana_tx_hash: string | null;
              created_at: string;
              metadata: { agent_name?: string; milestone_title?: string; demo_mode?: boolean } | null;
            }) => {
              const typeLabel: Record<string, string> = {
                escrow_fund: "Escrow Funded",
                milestone_payout: "Milestone Paid",
                agent_payout: "Agent Paid",
                refund: "Refunded",
              };
              const typeColor: Record<string, string> = {
                escrow_fund: "text-accent-blue",
                milestone_payout: "text-accent-green",
                agent_payout: "text-accent-purple",
                refund: "text-red-500",
              };

              return (
                <div key={tx.id} className="flex items-center gap-3 py-2 px-3 rough-box bg-paper-dark">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-[family-name:var(--font-sketch)] text-sm ${typeColor[tx.type] ?? "text-ink"}`}>
                        {typeLabel[tx.type] ?? tx.type}
                      </span>
                      {tx.metadata?.demo_mode && (
                        <span className="px-1 bg-yellow-100 text-yellow-700 font-[family-name:var(--font-sketch)] text-xs rounded">
                          demo
                        </span>
                      )}
                    </div>
                    {(tx.metadata?.agent_name || tx.metadata?.milestone_title) && (
                      <p className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">
                        {tx.metadata.agent_name ?? tx.metadata.milestone_title}
                      </p>
                    )}
                    <p className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">
                      {new Date(tx.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-[family-name:var(--font-marker)] text-base text-accent-green">
                      ${Number(tx.amount).toFixed(2)} {tx.currency}
                    </div>
                    {tx.solana_tx_hash && (
                      <a
                        href={`https://explorer.solana.com/tx/${tx.solana_tx_hash}?cluster=${solanaNetwork}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-[family-name:var(--font-sketch)] text-xs text-accent-blue hover:underline inline-flex items-center gap-0.5"
                      >
                        TX <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Settlement speed ── */}
      <div className="sketch-card sketch-card-green text-center" style={{ transform: "rotate(-0.3deg)" }}>
        <div className="font-[family-name:var(--font-marker)] text-3xl text-ink mb-1">
          &lt; 2 seconds
        </div>
        <div className="font-[family-name:var(--font-hand)] text-base text-ink-soft">
          Average settlement time · vs 5-7 days for bank wire · vs 3 days for PayPal
        </div>
        <div className="mt-2 font-[family-name:var(--font-sketch)] text-sm text-accent-green">
          Fees: &lt;$0.01 per transaction on Solana devnet
        </div>
      </div>
    </div>
  );
}
