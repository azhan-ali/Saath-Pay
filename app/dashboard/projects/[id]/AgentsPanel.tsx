"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Plus,
  Zap,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Power,
  Wallet,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  role: string;
  wallet_address: string;
  rate_per_task: number;
  total_paid: number;
  tasks_completed: number;
  is_active: boolean;
  created_at: string;
}

interface PaymentResult {
  agentName: string;
  amount: number;
  txHash: string;
  explorerUrl: string | null;
  demoMode: boolean;
}

interface AgentsPanelProps {
  projectId: string;
  projectStatus: string;
  initialAgents: Agent[];
}

// ── Add Agent Form ────────────────────────────────────────────────────────────
function AddAgentForm({
  projectId,
  onAdded,
}: {
  projectId: string;
  onAdded: (agent: Agent) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    role: "",
    ratePerTask: "5",
  });

  const PRESET_AGENTS = [
    { name: "CodeReview-Bot", role: "Code Review & QA", rate: "5" },
    { name: "DocWriter-AI", role: "Documentation Writer", rate: "3" },
    { name: "TestRunner-Bot", role: "Automated Testing", rate: "4" },
    { name: "Deploy-Agent", role: "CI/CD & Deployment", rate: "8" },
  ];

  const submit = async () => {
    if (!form.name.trim()) { setError("Agent name is required"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agents/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          name: form.name,
          role: form.role || "General Assistant",
          ratePerTask: Number(form.ratePerTask) || 5,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add agent");
      onAdded(data.agent);
      setOpen(false);
      setForm({ name: "", role: "", ratePerTask: "5" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add agent");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="sketch-btn sketch-btn-primary !px-4 !py-2 !text-sm inline-flex items-center gap-2"
      >
        <Plus size={14} /> Add AI Agent
      </button>
    );
  }

  return (
    <div className="rough-box bg-paper p-4 space-y-3">
      <h3 className="font-[family-name:var(--font-marker)] text-lg">Add AI Agent</h3>

      {/* Presets */}
      <div>
        <p className="font-[family-name:var(--font-sketch)] text-xs text-ink-soft mb-2">Quick presets:</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_AGENTS.map((p) => (
            <button
              key={p.name}
              onClick={() => setForm({ name: p.name, role: p.role, ratePerTask: p.rate })}
              className="sketch-btn !px-2 !py-1 !text-xs"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-[family-name:var(--font-sketch)] text-xs text-ink-soft mb-1">
            Agent Name *
          </label>
          <input
            type="text"
            placeholder="e.g. CodeReview-Bot"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="sketch-input !py-2 !text-sm"
          />
        </div>
        <div>
          <label className="block font-[family-name:var(--font-sketch)] text-xs text-ink-soft mb-1">
            Role / Specialty
          </label>
          <input
            type="text"
            placeholder="e.g. Code Review & QA"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="sketch-input !py-2 !text-sm"
          />
        </div>
        <div>
          <label className="block font-[family-name:var(--font-sketch)] text-xs text-ink-soft mb-1">
            Rate per Task (USDC)
          </label>
          <input
            type="number"
            placeholder="5"
            min="0.1"
            step="0.1"
            value={form.ratePerTask}
            onChange={(e) => setForm({ ...form, ratePerTask: e.target.value })}
            className="sketch-input !py-2 !text-sm"
          />
        </div>
      </div>

      {error && (
        <p className="font-[family-name:var(--font-sketch)] text-xs text-red-600 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={loading}
          className="sketch-btn sketch-btn-green !px-4 !py-2 !text-sm inline-flex items-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add Agent
        </button>
        <button onClick={() => setOpen(false)} className="sketch-btn !px-4 !py-2 !text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Agent Card ────────────────────────────────────────────────────────────────
function AgentCard({
  agent,
  projectId,
  onTaskComplete,
  onToggle,
}: {
  agent: Agent;
  projectId: string;
  onTaskComplete: (result: PaymentResult) => void;
  onToggle: (agentId: string, newState: boolean) => void;
}) {
  const [paying, setPaying] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [taskDesc, setTaskDesc] = useState("");
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const solanaNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
  const explorerUrl = `https://explorer.solana.com/address/${agent.wallet_address}${solanaNetwork === "devnet" ? "?cluster=devnet" : ""}`;

  const completeTask = async () => {
    setPaying(true);
    setError(null);
    try {
      const res = await fetch(`/api/agents/${agent.id}/complete-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          taskDescription: taskDesc || "Task completed",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment failed");
      onTaskComplete(data.payment);
      setShowTaskInput(false);
      setTaskDesc("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const toggleAgent = async () => {
    setToggling(true);
    try {
      const res = await fetch(`/api/agents/${agent.id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (res.ok) onToggle(agent.id, data.isActive);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className={`rough-box p-4 bg-paper relative transition-all ${!agent.is_active ? "opacity-60" : ""}`}>
      {/* Status dot */}
      <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full border border-ink ${agent.is_active ? "bg-accent-green animate-pulse" : "bg-ink-soft"}`} />

      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px_13px_11px_14px] bg-accent-purple border-2 border-ink shadow-[2px_2px_0_#1a1a1a]">
          <Bot size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-[family-name:var(--font-marker)] text-lg text-ink leading-tight">
            {agent.name}
          </h3>
          <p className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">
            {agent.role}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center rough-box bg-paper-dark py-1.5">
          <div className="font-[family-name:var(--font-marker)] text-base text-accent-green">
            ${Number(agent.rate_per_task).toFixed(0)}
          </div>
          <div className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">per task</div>
        </div>
        <div className="text-center rough-box bg-paper-dark py-1.5">
          <div className="font-[family-name:var(--font-marker)] text-base text-ink">
            {agent.tasks_completed}
          </div>
          <div className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">tasks done</div>
        </div>
        <div className="text-center rough-box bg-paper-dark py-1.5">
          <div className="font-[family-name:var(--font-marker)] text-base text-accent-green">
            ${Number(agent.total_paid).toFixed(0)}
          </div>
          <div className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">total paid</div>
        </div>
      </div>

      {/* Wallet address */}
      <div className="flex items-center gap-1 mb-3">
        <Wallet size={12} className="text-ink-soft shrink-0" />
        <code className="font-mono text-xs text-ink-soft truncate flex-1">
          {agent.wallet_address.slice(0, 20)}…{agent.wallet_address.slice(-6)}
        </code>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="text-accent-blue hover:text-accent-orange transition-colors shrink-0"
          title="View on Solana Explorer"
        >
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Error */}
      {error && (
        <p className="font-[family-name:var(--font-sketch)] text-xs text-red-600 mb-2 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      {/* Actions */}
      {agent.is_active && (
        <div className="space-y-2">
          {showTaskInput ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Describe what the agent did (optional)"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="sketch-input !py-1.5 !text-xs w-full"
              />
              <div className="flex gap-2">
                <button
                  onClick={completeTask}
                  disabled={paying}
                  className="sketch-btn sketch-btn-green !px-3 !py-1.5 !text-xs inline-flex items-center gap-1 disabled:opacity-60 flex-1 justify-center"
                >
                  {paying ? (
                    <><Loader2 size={12} className="animate-spin" /> Paying…</>
                  ) : (
                    <><Zap size={12} /> Pay ${agent.rate_per_task} USDC</>
                  )}
                </button>
                <button
                  onClick={() => setShowTaskInput(false)}
                  className="sketch-btn !px-3 !py-1.5 !text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowTaskInput(true)}
              className="sketch-btn sketch-btn-orange w-full !py-2 !text-sm inline-flex items-center justify-center gap-2"
            >
              <Zap size={14} /> Agent Completed Task → Pay ${agent.rate_per_task} USDC
            </button>
          )}
        </div>
      )}

      {/* Toggle active */}
      <button
        onClick={toggleAgent}
        disabled={toggling}
        className="mt-2 sketch-btn !px-3 !py-1 !text-xs inline-flex items-center gap-1 w-full justify-center"
      >
        {toggling ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Power size={12} />
        )}
        {agent.is_active ? "Deactivate" : "Activate"} Agent
      </button>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function AgentsPanel({
  projectId,
  projectStatus,
  initialAgents,
}: AgentsPanelProps) {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [recentPayments, setRecentPayments] = useState<PaymentResult[]>([]);

  const handleAgentAdded = (agent: Agent) => {
    setAgents((prev) => [...prev, agent]);
    router.refresh();
  };

  const handleTaskComplete = (result: PaymentResult) => {
    setRecentPayments((prev) => [result, ...prev.slice(0, 4)]);
    // Update agent stats in local state
    setAgents((prev) =>
      prev.map((a) =>
        a.name === result.agentName
          ? {
              ...a,
              total_paid: a.total_paid + result.amount,
              tasks_completed: a.tasks_completed + 1,
            }
          : a,
      ),
    );
  };

  const handleToggle = (agentId: string, newState: boolean) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, is_active: newState } : a)),
    );
  };

  const totalAgentCost = agents.reduce((sum, a) => sum + Number(a.total_paid), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-marker)] text-2xl text-ink flex items-center gap-2">
            <Bot size={22} /> AI Agents
            <span className="px-2 py-0.5 bg-accent-purple text-white font-[family-name:var(--font-sketch)] text-xs rounded-[6px_8px_7px_9px]">
              x402
            </span>
          </h2>
          <p className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">
            Autonomous micropayments — no human approval needed
          </p>
        </div>
        <AddAgentForm projectId={projectId} onAdded={handleAgentAdded} />
      </div>

      {/* x402 explainer */}
      <div className="rough-box bg-purple-50 p-3 flex items-start gap-2">
        <Sparkles size={14} className="text-accent-purple shrink-0 mt-0.5" />
        <p className="font-[family-name:var(--font-body)] text-xs text-accent-purple">
          <strong>x402-inspired flow:</strong> Agent completes task → server returns HTTP 402 Payment Required →
          USDC auto-transfers from escrow to agent wallet → no human needed. Settlement in ~1 second.
        </p>
      </div>

      {/* Stats bar */}
      {agents.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Agents", value: agents.length, color: "sketch-card-purple" },
            { label: "Active", value: agents.filter((a) => a.is_active).length, color: "sketch-card-green" },
            { label: "Total Paid", value: `$${totalAgentCost.toFixed(0)}`, color: "sketch-card-yellow" },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`sketch-card ${s.color} text-center py-2`}
              style={{ transform: `rotate(${i % 2 === 0 ? -0.5 : 0.5}deg)` }}
            >
              <div className="font-[family-name:var(--font-marker)] text-2xl">{s.value}</div>
              <div className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent payments live feed */}
      {recentPayments.length > 0 && (
        <div className="sketch-card sketch-card-green">
          <h3 className="font-[family-name:var(--font-marker)] text-lg mb-3 flex items-center gap-2">
            <Zap size={16} /> Live Payment Feed
          </h3>
          <div className="space-y-2">
            {recentPayments.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-dashed border-ink/20 last:border-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-accent-green shrink-0" />
                  <span className="font-[family-name:var(--font-sketch)] text-sm">
                    {p.agentName} paid ${p.amount} USDC
                    {p.demoMode && (
                      <span className="ml-1 px-1 bg-yellow-100 text-yellow-700 text-xs rounded">demo</span>
                    )}
                  </span>
                </div>
                {p.explorerUrl && (
                  <a
                    href={p.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent-blue hover:underline font-[family-name:var(--font-sketch)] text-xs inline-flex items-center gap-1 shrink-0"
                  >
                    <ExternalLink size={10} /> TX
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent cards */}
      {agents.length === 0 ? (
        <div className="text-center py-8 rough-box bg-paper-dark">
          <Bot size={32} className="text-ink-soft mx-auto mb-2" />
          <p className="font-[family-name:var(--font-marker)] text-xl text-ink-soft mb-1">No agents yet</p>
          <p className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">
            Add an AI agent to automate sub-tasks with x402 micropayments
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {agents.map((agent, i) => (
            <div key={agent.id} style={{ transform: `rotate(${i % 2 === 0 ? -0.3 : 0.3}deg)` }}>
              <AgentCard
                agent={agent}
                projectId={projectId}
                onTaskComplete={handleTaskComplete}
                onToggle={handleToggle}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
