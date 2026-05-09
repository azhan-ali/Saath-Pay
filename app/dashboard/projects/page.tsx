import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import SketchBadge from "@/app/components/SketchBadge";
import EmptyState from "@/app/components/EmptyState";

// ── Status helpers ──────────────────────────────────────────────────────────
type ProjectStatus =
  | "draft"
  | "awaiting_payment"
  | "funded"
  | "in_progress"
  | "completed"
  | "disputed"
  | "refunded";

const statusConfig: Record<
  ProjectStatus,
  { label: string; color: "yellow" | "orange" | "green" | "blue" | "red" | "ink" | "pink" | "purple" }
> = {
  draft:            { label: "Draft",            color: "ink"    },
  awaiting_payment: { label: "Awaiting Payment", color: "yellow" },
  funded:           { label: "Funded ✓",         color: "blue"   },
  in_progress:      { label: "In Progress",      color: "orange" },
  completed:        { label: "Completed ✓",      color: "green"  },
  disputed:         { label: "Disputed ⚠",       color: "red"    },
  refunded:         { label: "Refunded",          color: "ink"    },
};

// ── Page ────────────────────────────────────────────────────────────────────
export default async function ProjectsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        emoji="🔧"
        title="Supabase not configured"
        description="Add your Supabase keys to .env.local and restart the dev server to see your projects."
        ctaLabel="← Back to dashboard"
        ctaHref="/dashboard"
      />
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: projects, error } = await supabase
    .from("projects")
    .select(`
      id, title, client_email, client_name,
      total_amount, currency, status, created_at,
      milestones(id, status)
    `)
    .eq("freelancer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) console.error("Projects fetch error:", error);

  const list = projects ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-hand)] text-xl text-accent-orange">
            ~ your work ~
          </p>
          <h1 className="font-[family-name:var(--font-marker)] text-4xl text-ink">
            Projects
          </h1>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="sketch-btn sketch-btn-orange inline-flex items-center gap-2 self-start"
        >
          <Plus size={18} strokeWidth={2.5} />
          New Project
        </Link>
      </div>

      {/* Search bar (client-side filtering handled by ProjectsClient) */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
        />
        <input
          type="text"
          placeholder="Search projects…"
          className="w-full pl-12 pr-4 py-3 rough-box bg-paper font-[family-name:var(--font-body)] text-lg text-ink placeholder:text-ink-soft/50 focus:outline-none focus:shadow-[4px_4px_0_#1a1a1a] transition-shadow"
        />
      </div>

      {/* Stats strip */}
      {list.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",      value: list.length,                                                  color: "sketch-card-yellow" },
            { label: "Active",     value: list.filter(p => p.status === "in_progress").length,          color: "sketch-card-orange" },
            { label: "Completed",  value: list.filter(p => p.status === "completed").length,            color: "sketch-card-green"  },
            { label: "Pending $",  value: list.filter(p => p.status === "awaiting_payment").length,     color: "sketch-card-pink"   },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`sketch-card ${s.color} text-center py-3`}
              style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
            >
              <div className="font-[family-name:var(--font-marker)] text-3xl">{s.value}</div>
              <div className="font-[family-name:var(--font-hand)] text-base text-ink-soft">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Project cards */}
      {list.length === 0 ? (
        <EmptyState
          emoji="📝"
          title="No projects yet"
          description="Create your first project, set milestones, and share the payment link with your client."
          ctaLabel="Create first project →"
          ctaHref="/dashboard/projects/new"
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {list.map((p, i) => {
            const cfg = statusConfig[p.status as ProjectStatus] ?? statusConfig.draft;
            const milestones = (p.milestones as { id: string; status: string }[]) ?? [];
            const done = milestones.filter(m => m.status === "paid").length;
            const total = milestones.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <Link
                key={p.id}
                href={`/dashboard/projects/${p.id}`}
                className={`sketch-card bg-paper block group relative`}
                style={{ transform: `rotate(${i % 2 === 0 ? -0.5 : 0.5}deg)` }}
              >
                {/* Status badge */}
                <div className="absolute -top-3 -right-3">
                  <SketchBadge color={cfg.color}>{cfg.label}</SketchBadge>
                </div>

                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-[family-name:var(--font-marker)] text-xl text-ink group-hover:text-accent-orange transition-colors leading-tight">
                    {p.title}
                  </h3>
                  <span className="font-[family-name:var(--font-marker)] text-xl text-accent-green shrink-0">
                    ${Number(p.total_amount).toLocaleString()}
                  </span>
                </div>

                <p className="font-[family-name:var(--font-body)] text-sm text-ink-soft mb-3">
                  Client: <span className="font-bold">{p.client_name || p.client_email}</span>
                </p>

                {/* Progress bar */}
                {total > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between font-[family-name:var(--font-sketch)] text-xs text-ink-soft mb-1">
                      <span>{done}/{total} milestones</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-3 rough-box bg-paper-dark overflow-hidden">
                      <div
                        className="h-full bg-accent-green transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}

                <p className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">
                  Created {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
