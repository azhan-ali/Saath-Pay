"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  Check,
  GripVertical,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Milestone {
  id: string;
  title: string;
  deliverable: string;
  amount: string;
  deadline: string;
  aiGenerated: boolean;
}

interface FormData {
  title: string;
  description: string;
  clientEmail: string;
  clientName: string;
  totalAmount: string;
  currency: string;
}

// ── Step indicator ───────────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border-[2.5px] border-ink font-[family-name:var(--font-marker)] text-sm transition-all ${
              i < current
                ? "bg-accent-green text-white shadow-[2px_2px_0_#1a1a1a]"
                : i === current
                ? "bg-accent-yellow shadow-[2px_2px_0_#1a1a1a]"
                : "bg-paper text-ink-soft"
            }`}
          >
            {i < current ? <Check size={14} strokeWidth={3} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={`h-[3px] w-8 rounded-full ${
                i < current ? "bg-accent-green" : "bg-ink/20"
              }`}
            />
          )}
        </div>
      ))}
      <span className="ml-2 font-[family-name:var(--font-hand)] text-sm text-ink-soft">
        Step {current + 1} of {total}
      </span>
    </div>
  );
}

// ── Main form ────────────────────────────────────────────────────────────────
export default function CreateProjectForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    clientEmail: "",
    clientName: "",
    totalAmount: "",
    currency: "USD",
  });

  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: crypto.randomUUID(), title: "", deliverable: "", amount: "", deadline: "", aiGenerated: false },
  ]);

  // ── Milestone helpers ──────────────────────────────────────────────────────
  const addMilestone = () =>
    setMilestones((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: "", deliverable: "", amount: "", deadline: "", aiGenerated: false },
    ]);

  const removeMilestone = (id: string) =>
    setMilestones((prev) => prev.filter((m) => m.id !== id));

  const updateMilestone = (id: string, field: keyof Milestone, value: string) =>
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );

  // ── AI generation ──────────────────────────────────────────────────────────
  const generateWithAI = async () => {
    if (!form.description || !form.totalAmount) {
      setError("Add a project description and total amount first.");
      return;
    }
    setError(null);
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description,
          totalAmount: Number(form.totalAmount),
        }),
      });
      if (!res.ok) throw new Error("AI generation failed");
      const { milestones: generated } = await res.json();
      setMilestones(
        generated.map(
          (m: { name: string; deliverable: string; amount: number; estimated_days: number }) => ({
            id: crypto.randomUUID(),
            title: m.name,
            deliverable: m.deliverable,
            amount: String(m.amount),
            deadline: "",
            aiGenerated: true,
          }),
        ),
      );
    } catch {
      setError("AI generation failed. You can add milestones manually.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateStep = (): boolean => {
    setError(null);
    if (step === 0) {
      if (!form.title.trim()) { setError("Project title is required."); return false; }
      if (!form.clientEmail.trim()) { setError("Client email is required."); return false; }
      if (!form.totalAmount || Number(form.totalAmount) <= 0) { setError("Enter a valid total amount."); return false; }
    }
    if (step === 1) {
      if (milestones.length === 0) { setError("Add at least one milestone."); return false; }
      for (const m of milestones) {
        if (!m.title.trim()) { setError("All milestones need a title."); return false; }
        if (!m.amount || Number(m.amount) <= 0) { setError("All milestones need an amount."); return false; }
      }
      const sum = milestones.reduce((acc, m) => acc + Number(m.amount), 0);
      const total = Number(form.totalAmount);
      if (Math.abs(sum - total) > 0.01) {
        setError(`Milestone amounts ($${sum.toFixed(2)}) must equal total ($${total.toFixed(2)}).`);
        return false;
      }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep((s) => s + 1); };
  const back = () => { setError(null); setStep((s) => s - 1); };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();

      // 1. Insert project
      const { data: project, error: pErr } = await supabase
        .from("projects")
        .insert({
          freelancer_id: userId,
          title: form.title.trim(),
          description: form.description.trim(),
          client_email: form.clientEmail.trim(),
          client_name: form.clientName.trim() || null,
          total_amount: Number(form.totalAmount),
          currency: form.currency,
          status: "draft",
        })
        .select("id")
        .single();

      if (pErr || !project) throw pErr ?? new Error("Failed to create project");

      // 2. Insert milestones
      const milestoneRows = milestones.map((m, idx) => ({
        project_id: project.id,
        index: idx,
        title: m.title.trim(),
        deliverable: m.deliverable.trim() || null,
        amount: Number(m.amount),
        deadline: m.deadline || null,
        ai_generated: m.aiGenerated,
        status: "pending",
      }));

      const { error: mErr } = await supabase.from("milestones").insert(milestoneRows);
      if (mErr) throw mErr;

      router.push(`/dashboard/projects/${project.id}?created=1`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="sketch-card bg-paper relative">
      {/* Washi tape */}
      <div className="tape" style={{ top: "-10px", left: "50%", transform: "translateX(-50%) rotate(-2deg)" }} />

      <StepDots current={step} total={3} />

      {/* ── Step 0: Basic Info ── */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="font-[family-name:var(--font-marker)] text-2xl text-ink mb-4">
            📋 Project Details
          </h2>

          <Field label="Project Title *">
            <input
              type="text"
              placeholder="e.g. AI Customer Support System"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="sketch-input"
            />
          </Field>

          <Field label="Project Description">
            <textarea
              placeholder="Describe what you're building — the AI will use this to generate milestones…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="sketch-input resize-none"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Client Email *">
              <input
                type="email"
                placeholder="client@company.com"
                value={form.clientEmail}
                onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                className="sketch-input"
              />
            </Field>
            <Field label="Client Name">
              <input
                type="text"
                placeholder="John Smith"
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                className="sketch-input"
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Total Amount *">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-[family-name:var(--font-marker)] text-lg text-ink-soft">
                  $
                </span>
                <input
                  type="number"
                  placeholder="2000"
                  min="1"
                  value={form.totalAmount}
                  onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                  className="sketch-input pl-8"
                />
              </div>
            </Field>
            <Field label="Currency">
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="sketch-input"
              >
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="INR">INR — Indian Rupee</option>
              </select>
            </Field>
          </div>
        </div>
      )}

      {/* ── Step 1: Milestones ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-[family-name:var(--font-marker)] text-2xl text-ink">
              🎯 Milestones
            </h2>
            <button
              type="button"
              onClick={generateWithAI}
              disabled={aiLoading}
              className="sketch-btn sketch-btn-primary !px-4 !py-2 !text-sm inline-flex items-center gap-2"
            >
              {aiLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Generating…</>
              ) : (
                <><Sparkles size={16} /> ✨ Generate with AI</>
              )}
            </button>
          </div>

          <p className="font-[family-name:var(--font-body)] text-sm text-ink-soft">
            Total: <strong>${Number(form.totalAmount).toLocaleString()} {form.currency}</strong> — milestone amounts must add up to this.
          </p>

          {/* Running sum indicator */}
          {milestones.length > 0 && (() => {
            const sum = milestones.reduce((a, m) => a + (Number(m.amount) || 0), 0);
            const total = Number(form.totalAmount);
            const diff = total - sum;
            const ok = Math.abs(diff) < 0.01;
            return (
              <div className={`rough-box px-4 py-2 font-[family-name:var(--font-sketch)] text-sm ${ok ? "bg-green-50 text-green-800" : "bg-yellow-50 text-yellow-800"}`}>
                {ok ? "✅ Amounts balanced!" : `⚠ $${Math.abs(diff).toFixed(2)} ${diff > 0 ? "remaining to allocate" : "over-allocated"}`}
              </div>
            );
          })()}

          <div className="space-y-4">
            {milestones.map((m, idx) => (
              <div
                key={m.id}
                className={`rough-box p-4 bg-paper relative ${m.aiGenerated ? "border-accent-purple" : ""}`}
              >
                {m.aiGenerated && (
                  <span className="absolute -top-2.5 left-3 px-2 py-0.5 bg-accent-purple text-white font-[family-name:var(--font-sketch)] text-xs rounded-[6px_8px_7px_9px]">
                    ✨ AI
                  </span>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <GripVertical size={16} className="text-ink-soft shrink-0" />
                  <span className="font-[family-name:var(--font-marker)] text-lg text-ink-soft">
                    #{idx + 1}
                  </span>
                  <div className="flex-1" />
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(m.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      aria-label="Remove milestone"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Title *">
                    <input
                      type="text"
                      placeholder="e.g. UI Design"
                      value={m.title}
                      onChange={(e) => updateMilestone(m.id, "title", e.target.value)}
                      className="sketch-input !py-2"
                    />
                  </Field>
                  <Field label="Amount ($) *">
                    <input
                      type="number"
                      placeholder="500"
                      min="0"
                      value={m.amount}
                      onChange={(e) => updateMilestone(m.id, "amount", e.target.value)}
                      className="sketch-input !py-2"
                    />
                  </Field>
                  <Field label="Deliverable">
                    <input
                      type="text"
                      placeholder="e.g. Figma file + prototype"
                      value={m.deliverable}
                      onChange={(e) => updateMilestone(m.id, "deliverable", e.target.value)}
                      className="sketch-input !py-2"
                    />
                  </Field>
                  <Field label="Deadline">
                    <input
                      type="date"
                      value={m.deadline}
                      onChange={(e) => updateMilestone(m.id, "deadline", e.target.value)}
                      className="sketch-input !py-2"
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addMilestone}
            className="sketch-btn w-full !py-2 inline-flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add Milestone
          </button>
        </div>
      )}

      {/* ── Step 2: Review ── */}
      {step === 2 && (
        <div className="space-y-5">
          <h2 className="font-[family-name:var(--font-marker)] text-2xl text-ink">
            👀 Review & Confirm
          </h2>

          <div className="sketch-card sketch-card-yellow">
            <h3 className="font-[family-name:var(--font-marker)] text-xl mb-3">Project</h3>
            <dl className="space-y-1 font-[family-name:var(--font-body)] text-sm">
              <Row label="Title" value={form.title} />
              <Row label="Client" value={`${form.clientName || ""} <${form.clientEmail}>`} />
              <Row label="Total" value={`$${Number(form.totalAmount).toLocaleString()} ${form.currency}`} />
              {form.description && <Row label="Description" value={form.description} />}
            </dl>
          </div>

          <div className="sketch-card sketch-card-green">
            <h3 className="font-[family-name:var(--font-marker)] text-xl mb-3">
              Milestones ({milestones.length})
            </h3>
            <div className="space-y-2">
              {milestones.map((m, i) => (
                <div key={m.id} className="flex items-center justify-between gap-2 py-1 border-b border-dashed border-ink/20 last:border-0">
                  <span className="font-[family-name:var(--font-sketch)] text-sm">
                    {i + 1}. {m.title}
                    {m.aiGenerated && <span className="ml-1 text-accent-purple text-xs">✨</span>}
                  </span>
                  <span className="font-[family-name:var(--font-marker)] text-base text-accent-green shrink-0">
                    ${Number(m.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rough-box bg-blue-50 p-4 font-[family-name:var(--font-body)] text-sm text-blue-800">
            <strong>What happens next:</strong> Project saved as <em>Draft</em>. You&apos;ll get a payment link to share with your client. Once they pay via Dodo, funds lock on Solana escrow.
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rough-box bg-red-50 p-3 font-[family-name:var(--font-sketch)] text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6 pt-4 border-t border-dashed border-ink/20">
        {step > 0 ? (
          <button type="button" onClick={back} className="sketch-btn inline-flex items-center gap-2">
            <ChevronLeft size={18} /> Back
          </button>
        ) : (
          <div />
        )}

        {step < 2 ? (
          <button type="button" onClick={next} className="sketch-btn sketch-btn-orange inline-flex items-center gap-2">
            Next <ChevronRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="sketch-btn sketch-btn-green inline-flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <><Loader2 size={18} className="animate-spin" /> Saving…</>
            ) : (
              <><Check size={18} /> Create Project</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-[family-name:var(--font-sketch)] text-sm text-ink-soft mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-ink-soft w-24 shrink-0">{label}:</dt>
      <dd className="font-bold text-ink">{value}</dd>
    </div>
  );
}
