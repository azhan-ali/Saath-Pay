import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bot, ExternalLink, Zap, ArrowRight } from "lucide-react";
import EmptyState from "@/app/components/EmptyState";

export default async function AgentsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="space-y-4">
        <div>
          <p className="font-[family-name:var(--font-hand)] text-xl text-accent-purple">~ autonomous workers ~</p>
          <h1 className="font-[family-name:var(--font-marker)] text-4xl text-ink">AI Agents</h1>
        </div>
        <EmptyState
          emoji="🔧"
          title="Supabase not configured"
          description="Add Supabase keys to .env.local to see your agents."
          ctaLabel="← Back"
          ctaHref="/dashboard"
        />
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch all agents across all user's projects
  const { data: agents } = await supabase
    .from("ai_agents")
    .select(`
      *,
      projects!inner(id, title, freelancer_id)
    `)
    .eq("projects.freelancer_id", user.id)
    .order("created_at", { ascending: false });

  const list = agents ?? [];
  const totalPaid = list.reduce((sum, a) => sum + Number(a.total_paid), 0);
  const totalTasks = list.reduce((sum, a) => sum + Number(a.tasks_completed), 0);
  const activeCount = list.filter((a) => a.is_active).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-[family-name:var(--font-hand)] text-xl text-accent-purple">
          ~ autonomous workers ~
        </p>
        <h1 className="font-[family-name:var(--font-marker)] text-4xl text-ink flex items-center gap-3">
          AI Agents
          <span className="px-3 py-1 bg-accent-purple text-white font-[family-name:var(--font-sketch)] text-sm rounded-[8px_10px_9px_11px] shadow-[2px_2px_0_#1a1a1a]">
            x402
          </span>
        </h1>
        <p className="font-[family-name:var(--font-body)] text-ink-soft mt-1">
          All AI agents across your projects. They earn USDC autonomously — no human approval needed.
        </p>
      </div>

      {/* Stats */}
      {list.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Agents", value: list.length, color: "sketch-card-purple" },
            { label: "Active Now", value: activeCount, color: "sketch-card-green" },
            { label: "Tasks Done", value: totalTasks, color: "sketch-card-blue" },
            { label: "Total Paid", value: `$${totalPaid.toFixed(0)}`, color: "sketch-card-yellow" },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`sketch-card ${s.color} text-center`}
              style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
            >
              <div className="font-[family-name:var(--font-marker)] text-3xl">{s.value}</div>
              <div className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Agent list */}
      {list.length === 0 ? (
        <EmptyState
          emoji="🤖"
          title="No agents yet"
          description="Open a project and add AI agents from the Agents tab. They earn autonomous micropayments via x402 on Solana."
          ctaLabel="Go to Projects →"
          ctaHref="/dashboard/projects"
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map((agent, i) => {
            const project = (agent.projects as { id: string; title: string } | null);
            const solanaNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
            const explorerUrl = `https://explorer.solana.com/address/${agent.wallet_address}${solanaNetwork === "devnet" ? "?cluster=devnet" : ""}`;

            return (
              <div
                key={agent.id}
                className="sketch-card bg-paper relative"
                style={{ transform: `rotate(${i % 2 === 0 ? -0.3 : 0.3}deg)` }}
              >
                {/* Active indicator */}
                <div className={`absolute top-3 right-3 flex items-center gap-1 font-[family-name:var(--font-sketch)] text-xs ${agent.is_active ? "text-accent-green" : "text-ink-soft"}`}>
                  <div className={`w-2 h-2 rounded-full ${agent.is_active ? "bg-accent-green animate-pulse" : "bg-ink-soft"}`} />
                  {agent.is_active ? "Active" : "Inactive"}
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px_13px_11px_14px] bg-accent-purple border-2 border-ink shadow-[2px_2px_0_#1a1a1a]">
                    <Bot size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-marker)] text-xl text-ink">
                      {agent.name}
                    </h3>
                    <p className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">
                      {agent.role}
                    </p>
                    {project && (
                      <Link
                        href={`/dashboard/projects/${project.id}?tab=agents`}
                        className="font-[family-name:var(--font-sketch)] text-xs text-accent-orange hover:underline"
                      >
                        {project.title} →
                      </Link>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center rough-box bg-paper-dark py-1">
                    <div className="font-[family-name:var(--font-marker)] text-base text-accent-green">
                      ${Number(agent.rate_per_task).toFixed(0)}
                    </div>
                    <div className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">per task</div>
                  </div>
                  <div className="text-center rough-box bg-paper-dark py-1">
                    <div className="font-[family-name:var(--font-marker)] text-base">{agent.tasks_completed}</div>
                    <div className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">tasks</div>
                  </div>
                  <div className="text-center rough-box bg-paper-dark py-1">
                    <div className="font-[family-name:var(--font-marker)] text-base text-accent-green">
                      ${Number(agent.total_paid).toFixed(0)}
                    </div>
                    <div className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">earned</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  <code className="font-mono text-xs text-ink-soft truncate flex-1">
                    {agent.wallet_address.slice(0, 24)}…
                  </code>
                  <a href={explorerUrl} target="_blank" rel="noreferrer"
                    className="text-accent-blue hover:text-accent-orange transition-colors shrink-0">
                    <ExternalLink size={12} />
                  </a>
                </div>

                {project && (
                  <Link
                    href={`/dashboard/projects/${project.id}?tab=agents`}
                    className="sketch-btn !px-3 !py-1.5 !text-xs w-full inline-flex items-center justify-center gap-1"
                  >
                    <Zap size={12} /> Manage Agent
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* x402 explainer */}
      <div className="sketch-card sketch-card-purple relative" style={{ transform: "rotate(-0.2deg)" }}>
        <div className="absolute -top-3 left-6 px-3 py-1 bg-accent-purple text-white font-[family-name:var(--font-sketch)] text-sm rounded-[8px_10px_9px_11px] shadow-[2px_2px_0_#1a1a1a]">
          ⚡ Phase 6 — x402 Protocol
        </div>
        <div className="mt-2 font-[family-name:var(--font-body)] text-sm text-ink-soft space-y-1">
          <p><strong className="text-ink">How x402 works:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Agent completes a sub-task (code review, QA, docs, etc.)</li>
            <li>Agent reports completion → server returns <code className="bg-paper-dark px-1 text-xs">HTTP 402 Payment Required</code></li>
            <li>Server auto-pays agent from escrow vault on Solana</li>
            <li>USDC transfers in ~1 second · Fee under $0.01 · No human needed</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
