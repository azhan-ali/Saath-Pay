/**
 * /pay/[id] — Public client-facing payment page
 *
 * This is what the freelancer shares with their client.
 * Shows project details + a "Pay Now" button that redirects to Dodo checkout.
 *
 * No auth required — client doesn't need a SaathPay account.
 */

import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Shield, Zap, CheckCircle2, ExternalLink, Lock } from "lucide-react";
import PayNowButton from "./PayNowButton";

// Use service role to read project without auth
function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createServiceClient(url, key);
}

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ demo?: string; payment?: string }>;
}) {
  const { id } = await params;
  const { demo, payment } = await searchParams;

  if (!isSupabaseConfigured()) {
    return <DemoPayPage projectId={id} />;
  }

  const supabase = getServiceSupabase();

  const { data: project } = await supabase
    .from("projects")
    .select(`
      id, title, description, total_amount, currency,
      client_email, client_name, status, dodo_checkout_url,
      milestones(id, title, amount, index)
    `)
    .eq("id", id)
    .single();

  if (!project) notFound();

  const milestones = (project.milestones ?? []).sort(
    (a: { index: number }, b: { index: number }) => a.index - b.index,
  );

  const isAlreadyPaid = ["funded", "in_progress", "completed"].includes(project.status);

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px_15px_13px_16px] bg-accent-orange border-[2.5px] border-ink shadow-[2px_2px_0_#1a1a1a] group-hover:rotate-[-4deg] transition-transform">
          <span className="font-[family-name:var(--font-marker)] text-xl text-white" style={{ textShadow: "1px 1px 0 #1a1a1a" }}>
            S
          </span>
        </div>
        <span className="font-[family-name:var(--font-marker)] text-2xl text-ink">SaathPay</span>
      </Link>

      <div className="w-full max-w-lg space-y-5">
        {/* Payment success banner */}
        {payment === "success" && (
          <div className="rough-box bg-green-50 p-4 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-green-600 shrink-0" />
            <div>
              <p className="font-[family-name:var(--font-marker)] text-lg text-green-800">Payment Successful!</p>
              <p className="font-[family-name:var(--font-body)] text-sm text-green-700">
                Funds are now locked in Solana escrow. The freelancer has been notified.
              </p>
            </div>
          </div>
        )}

        {/* Already paid banner */}
        {isAlreadyPaid && payment !== "success" && (
          <div className="rough-box bg-blue-50 p-4 flex items-center gap-3">
            <Lock size={18} className="text-blue-600 shrink-0" />
            <p className="font-[family-name:var(--font-body)] text-sm text-blue-800">
              This project has already been funded. Funds are locked in escrow.
            </p>
          </div>
        )}

        {/* Project card */}
        <div className="sketch-card bg-paper relative" style={{ transform: "rotate(-0.3deg)" }}>
          <div className="tape" style={{ top: "-10px", left: "50%", transform: "translateX(-50%) rotate(-2deg)" }} />

          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">Invoice from SaathPay</p>
              <h1 className="font-[family-name:var(--font-marker)] text-2xl md:text-3xl text-ink">
                {project.title}
              </h1>
              {project.description && (
                <p className="font-[family-name:var(--font-body)] text-sm text-ink-soft mt-1">
                  {project.description}
                </p>
              )}
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

          {/* Milestones breakdown */}
          {milestones.length > 0 && (
            <div className="rough-box bg-paper-dark p-3 mb-4">
              <p className="font-[family-name:var(--font-sketch)] text-xs text-ink-soft mb-2">
                Payment breakdown ({milestones.length} milestones)
              </p>
              <div className="space-y-1.5">
                {milestones.map((m: { id: string; index: number; title: string; amount: number }) => (
                  <div key={m.id} className="flex items-center justify-between">
                    <span className="font-[family-name:var(--font-body)] text-sm text-ink">
                      {m.index + 1}. {m.title}
                    </span>
                    <span className="font-[family-name:var(--font-marker)] text-base text-accent-green">
                      ${Number(m.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { icon: Shield, label: "Escrow protected", color: "text-accent-blue" },
              { icon: Zap, label: "Instant release", color: "text-accent-green" },
              { icon: Lock, label: "Solana secured", color: "text-accent-purple" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="text-center rough-box bg-paper p-2">
                <Icon size={16} className={`${color} mx-auto mb-1`} />
                <p className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">{label}</p>
              </div>
            ))}
          </div>

          {/* Pay button */}
          {!isAlreadyPaid && (
            <PayNowButton
              projectId={project.id}
              checkoutUrl={project.dodo_checkout_url}
              amount={Number(project.total_amount)}
              currency={project.currency}
              isDemoMode={Boolean(demo)}
            />
          )}

          {isAlreadyPaid && (
            <div className="flex items-center justify-center gap-2 py-3 font-[family-name:var(--font-sketch)] text-accent-green">
              <CheckCircle2 size={18} />
              Funds locked in escrow ✓
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="sketch-card sketch-card-blue text-center" style={{ transform: "rotate(0.3deg)" }}>
          <p className="font-[family-name:var(--font-hand)] text-base text-ink-soft">
            🔐 Your payment is held in a Solana smart contract escrow.
            Funds are only released when you approve each milestone.
            <br />
            <span className="text-accent-blue font-bold">You stay in control.</span>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center font-[family-name:var(--font-hand)] text-sm text-ink-soft">
          Powered by{" "}
          <a href="https://stripe.com" target="_blank" rel="noreferrer" className="text-accent-orange hover:underline">
            Stripe
          </a>{" "}
          ·{" "}
          <a href="https://solana.com" target="_blank" rel="noreferrer" className="text-accent-purple hover:underline">
            Solana
          </a>
        </p>
      </div>
    </div>
  );
}

// ── Demo page (no Supabase) ───────────────────────────────────────────────────

function DemoPayPage({ projectId }: { projectId: string }) {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="sketch-card sketch-card-yellow text-center">
          <h1 className="font-[family-name:var(--font-marker)] text-3xl mb-3">Demo Payment Page</h1>
          <p className="font-[family-name:var(--font-body)] text-ink-soft mb-4">
            Project ID: <code className="bg-paper-dark px-2 py-0.5 text-sm">{projectId}</code>
          </p>
          <p className="font-[family-name:var(--font-body)] text-sm text-ink-soft">
            Configure Supabase to see real project details here.
          </p>
        </div>
      </div>
    </div>
  );
}
