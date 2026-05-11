import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Upload,
  ExternalLink,
} from "lucide-react";
import SketchBadge from "@/app/components/SketchBadge";
import MilestoneActions from "./MilestoneActions";
import EscrowPanel from "./EscrowPanel";
import DodoCheckoutPanel from "./DodoCheckoutPanel";
import AgentsPanel from "./AgentsPanel";
import ProjectTabs from "./ProjectTabs";
import { isDodoConfigured } from "@/lib/dodo/client";

type MilestoneStatus = "pending" | "submitted" | "approved" | "paid" | "rejected";
type ProjectStatus = "draft" | "awaiting_payment" | "funded" | "in_progress" | "completed" | "disputed" | "refunded";

const milestoneStatusConfig: Record<MilestoneStatus, { label: string; color: "ink" | "yellow" | "orange" | "green" | "blue" | "red" | "pink" | "purple" }> = {
  pending:   { label: "Pending",    color: "ink"    },
  submitted: { label: "In Review",  color: "yellow" },
  approved:  { label: "Approved",   color: "blue"   },
  paid:      { label: "Paid ✓",     color: "green"  },
  rejected:  { label: "Rejected",   color: "red"    },
};

const projectStatusConfig: Record<ProjectStatus, { label: string; color: "ink" | "yellow" | "orange" | "green" | "blue" | "red" | "pink" | "purple" }> = {
  draft:            { label: "Draft",            color: "ink"    },
  awaiting_payment: { label: "Awaiting Payment", color: "yellow" },
  funded:           { label: "Funded ✓",         color: "blue"   },
  in_progress:      { label: "In Progress",      color: "orange" },
  completed:        { label: "Completed ✓",      color: "green"  },
  disputed:         { label: "Disputed ⚠",       color: "red"    },
  refunded:         { label: "Refunded",          color: "ink"    },
};

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; tab?: string }>;
}) {
  if (!isSupabaseConfigured()) redirect("/dashboard");

  const { id } = await params;
  const { created, tab } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch project + milestones + agents in parallel
  const [projectRes, agentsRes] = await Promise.all([
    supabase
      .from("projects")
      .select(`*, milestones(*)`)
      .eq("id", id)
      .eq("freelancer_id", user.id)
      .single(),
    supabase
      .from("ai_agents")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (!projectRes.data) notFound();
  const project = projectRes.data;
  const agents = agentsRes.data ?? [];

  const milestones = (project.milestones ?? []).sort(
    (a: { index: number }, b: { index: number }) => a.index - b.index,
  );

  const paidCount = milestones.filter((m: { status: string }) => m.status === "paid").length;
  const paidAmount = milestones
    .filter((m: { status: string }) => m.status === "paid")
    .reduce((sum: number, m: { amount: number }) => sum + Number(m.amount), 0);
  const pct = milestones.length > 0 ? Math.round((paidCount / milestones.length) * 100) : 0;
  const pCfg = projectStatusConfig[project.status as ProjectStatus] ?? projectStatusConfig.draft;

  const solanaNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
  const dodoConfigured = isDodoConfigured();
  const activeTab = tab ?? "milestones";

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1 font-[family-name:var(--font-sketch)] text-sm text-ink-soft hover:text-accent-orange mb-3"
        >
          <ArrowLeft size={14} /> All Projects
        </Link>

        {created && (
          <div className="mb-4 rough-box bg-green-50 p-3 font-[family-name:var(--font-sketch)] text-sm text-green-800 flex items-center gap-2">
            <CheckCircle2 size={16} /> Project created! Share the payment link below with your client.
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-[family-name:var(--font-marker)] text-3xl md:text-4xl text-ink">
                {project.title}
              </h1>
              <SketchBadge color={pCfg.color}>{pCfg.label}</SketchBadge>
            </div>
            <p className="font-[family-name:var(--font-body)] text-ink-soft mt-1">
              Client: <strong>{project.client_name || project.client_email}</strong>
              {project.client_name && (
                <span className="text-sm ml-1">({project.client_email})</span>
              )}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="font-[family-name:var(--font-marker)] text-3xl text-accent-green">
              ${Number(project.total_amount).toLocaleString()}
            </div>
            <div className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">
              {project.currency}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="sketch-card bg-paper">
        <div className="flex justify-between font-[family-name:var(--font-sketch)] text-sm text-ink-soft mb-2">
          <span>{paidCount} of {milestones.length} milestones paid</span>
          <span className="font-bold text-accent-green">{pct}% complete</span>
        </div>
        <div className="h-4 rough-box bg-paper-dark overflow-hidden">
          <div
            className="h-full bg-accent-green transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Escrow + Payment panels */}
      <div className="grid md:grid-cols-2 gap-4">
        <EscrowPanel
          projectId={project.id}
          projectStatus={project.status}
          totalAmount={Number(project.total_amount)}
          paidAmount={paidAmount}
          vaultAddress={project.escrow_pda}
          solanaNetwork={solanaNetwork}
        />
        <DodoCheckoutPanel
          projectId={project.id}
          checkoutUrl={project.dodo_checkout_url}
          projectStatus={project.status}
          isDodoConfigured={dodoConfigured}
        />
      </div>

      {/* Tabs: Milestones | Agents */}
      <ProjectTabs
        activeTab={activeTab}
        projectId={project.id}
        agentCount={agents.length}
      />

      {/* Tab content */}
      {activeTab === "milestones" && (
        <div className="space-y-4">
          {milestones.map((m: {
            id: string;
            index: number;
            title: string;
            deliverable: string | null;
            amount: number;
            deadline: string | null;
            status: string;
            proof_uri: string | null;
            solana_tx_hash: string | null;
            ai_generated: boolean;
            submitted_at: string | null;
            approved_at: string | null;
            paid_at: string | null;
          }, i: number) => {
            const mCfg = milestoneStatusConfig[m.status as MilestoneStatus] ?? milestoneStatusConfig.pending;
            return (
              <div
                key={m.id}
                className={`sketch-card bg-paper relative ${m.status === "paid" ? "opacity-80" : ""}`}
                style={{ transform: `rotate(${i % 2 === 0 ? -0.3 : 0.3}deg)` }}
              >
                <div className="absolute -top-3 -right-3 flex gap-1">
                  {m.ai_generated && <SketchBadge color="purple">✨ AI</SketchBadge>}
                  <SketchBadge color={mCfg.color}>{mCfg.label}</SketchBadge>
                </div>

                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">
                      #{m.index + 1}
                    </span>
                    <h3 className="font-[family-name:var(--font-marker)] text-xl text-ink">
                      {m.title}
                    </h3>
                    {m.deliverable && (
                      <p className="font-[family-name:var(--font-body)] text-sm text-ink-soft">
                        Deliverable: {m.deliverable}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-[family-name:var(--font-marker)] text-2xl text-accent-green">
                      ${Number(m.amount).toLocaleString()}
                    </div>
                    {m.deadline && (
                      <div className="font-[family-name:var(--font-hand)] text-xs text-ink-soft flex items-center gap-1 justify-end">
                        <Clock size={12} />
                        {new Date(m.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </div>
                    )}
                  </div>
                </div>

                {m.proof_uri && (
                  <a href={m.proof_uri} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 font-[family-name:var(--font-sketch)] text-sm text-accent-blue hover:underline mb-2">
                    <Upload size={14} /> View proof <ExternalLink size={12} />
                  </a>
                )}

                {m.solana_tx_hash && (
                  <a href={`https://explorer.solana.com/tx/${m.solana_tx_hash}?cluster=devnet`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 font-[family-name:var(--font-sketch)] text-xs text-accent-green hover:underline mb-2">
                    <ExternalLink size={12} /> View on Solana Explorer
                  </a>
                )}

                <div className="flex flex-wrap gap-3 font-[family-name:var(--font-hand)] text-xs text-ink-soft">
                  {m.submitted_at && <span>Submitted: {new Date(m.submitted_at).toLocaleDateString()}</span>}
                  {m.approved_at && <span>Approved: {new Date(m.approved_at).toLocaleDateString()}</span>}
                  {m.paid_at && <span>Paid: {new Date(m.paid_at).toLocaleDateString()}</span>}
                </div>

                <MilestoneActions
                  milestoneId={m.id}
                  projectId={project.id}
                  status={m.status as MilestoneStatus}
                />
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "agents" && (
        <AgentsPanel
          projectId={project.id}
          projectStatus={project.status}
          initialAgents={agents}
        />
      )}

      {project.description && (
        <div className="sketch-card sketch-card-blue">
          <h3 className="font-[family-name:var(--font-marker)] text-lg mb-2">📄 Description</h3>
          <p className="font-[family-name:var(--font-body)] text-ink-soft">{project.description}</p>
        </div>
      )}
    </div>
  );
}
