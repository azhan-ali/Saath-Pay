/**
 * POST /api/webhooks/dodo
 *
 * Receives Stripe webhook events (UI labels them as "Dodo Payments").
 *
 * Security:
 *   - Verifies Stripe webhook signature using STRIPE_WEBHOOK_SECRET
 *   - Deduplicates via Stripe event ID stored in DB
 *   - Returns 200 immediately to prevent retries on slow on-chain ops
 *
 * Events handled:
 *   checkout.session.completed  → fund Solana escrow + notify freelancer
 *   payment_intent.payment_failed → reset project to draft
 *   charge.refunded             → mark project as refunded
 *
 * To test locally:
 *   stripe listen --forward-to localhost:3000/api/webhooks/dodo
 */

import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { fundEscrowOnChain, explorerTxUrl } from "@/lib/solana/program";

// Service role client — bypasses RLS for webhook processing
function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const rawBody = await req.text();
  const stripeSignature = req.headers.get("stripe-signature");

  // ── Parse + verify event ──────────────────────────────────────────────────
  let event: {
    id: string;
    type: string;
    data: {
      object: {
        id?: string;
        metadata?: Record<string, string>;
        amount_total?: number;
        currency?: string;
        payment_intent?: string;
        payment_status?: string;
      };
    };
  };

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret && stripeSignature) {
    try {
      const { getStripeClient } = await import("@/lib/dodo/client");
      const stripe = getStripeClient();
      event = stripe.webhooks.constructEvent(rawBody, stripeSignature, webhookSecret) as typeof event;
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }
  } else {
    // No secret — parse without verification (dev/demo mode)
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }

  const supabase = getServiceSupabase();

  // Deduplicate by Stripe event ID
  if (event.id && event.id !== "demo") {
    const { data: existing } = await supabase
      .from("transactions")
      .select("id")
      .eq("metadata->>stripe_event_id", event.id)
      .maybeSingle();

    if (existing) {
      console.log("Duplicate Stripe event, skipping:", event.id);
      return NextResponse.json({ received: true, duplicate: true });
    }
  }

  // ── Route by event type ───────────────────────────────────────────────────
  try {
    switch (event.type) {
      case "checkout.session.completed":
        if (event.data.object.payment_status === "paid") {
          await handlePaymentSucceeded(supabase, event.id, event.data.object);
        }
        break;

      case "payment_intent.succeeded":
        // Handled via checkout.session.completed — skip to avoid double-processing
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(supabase, event.data.object);
        break;

      case "charge.refunded":
        await handleRefundSucceeded(supabase, event.data.object);
        break;

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error processing event ${event.type}:`, err);
    // Return 200 anyway — prevents Stripe from retrying indefinitely
  }

  return NextResponse.json({ received: true });
}

// ── checkout.session.completed ────────────────────────────────────────────────

async function handlePaymentSucceeded(
  supabase: ReturnType<typeof getServiceSupabase>,
  eventId: string,
  session: {
    id?: string;
    metadata?: Record<string, string>;
    amount_total?: number;
    currency?: string;
  },
) {
  const projectId = session.metadata?.project_id;
  if (!projectId) {
    console.warn("checkout.session.completed: no project_id in metadata");
    return;
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, total_amount, escrow_pda, status, freelancer_id, title")
    .eq("id", projectId)
    .single();

  if (!project) {
    console.error("Project not found:", projectId);
    return;
  }

  // Skip if already funded
  if (["funded", "in_progress", "completed"].includes(project.status)) {
    console.log("Project already funded, skipping:", projectId);
    return;
  }

  // Fund Solana escrow
  const escrowResult = await fundEscrowOnChain({
    projectPDA: project.escrow_pda ?? "demo",
    vaultPDA: project.escrow_pda ?? "demo",
    amountUsdc: Number(project.total_amount),
  });

  // Update project
  await supabase
    .from("projects")
    .update({ status: "funded" })
    .eq("id", projectId);

  // Log transaction
  await supabase.from("transactions").insert({
    project_id: projectId,
    type: "escrow_fund",
    amount: Number(session.amount_total ?? project.total_amount * 100) / 100,
    currency: "USDC",
    solana_tx_hash: escrowResult.txHash,
    dodo_payment_id: session.id,
    metadata: {
      stripe_event_id: eventId,
      stripe_session_id: session.id,
      stripe_currency: session.currency,
      solana_demo_mode: escrowResult.demoMode,
      explorer_url: escrowResult.txHash ? explorerTxUrl(escrowResult.txHash) : null,
    },
  });

  // Notify freelancer
  await supabase.from("notifications").insert({
    user_id: project.freelancer_id,
    type: "escrow_funded",
    title: "💰 Payment Received!",
    body: `Client paid for "${project.title}". Funds locked on Solana. Start working!`,
    link: `/dashboard/projects/${projectId}`,
  });

  console.log(`✅ Payment processed: project ${projectId}, tx ${escrowResult.txHash}`);
}

// ── payment_intent.payment_failed ─────────────────────────────────────────────

async function handlePaymentFailed(
  supabase: ReturnType<typeof getServiceSupabase>,
  obj: { metadata?: Record<string, string> },
) {
  const projectId = obj.metadata?.project_id;
  if (!projectId) return;

  await supabase
    .from("projects")
    .update({ status: "draft" })
    .eq("id", projectId)
    .eq("status", "awaiting_payment");

  console.log(`❌ Payment failed: project ${projectId} reset to draft`);
}

// ── charge.refunded ───────────────────────────────────────────────────────────

async function handleRefundSucceeded(
  supabase: ReturnType<typeof getServiceSupabase>,
  obj: { metadata?: Record<string, string> },
) {
  const projectId = obj.metadata?.project_id;
  if (!projectId) return;

  await supabase
    .from("projects")
    .update({ status: "refunded" })
    .eq("id", projectId);

  console.log(`↩️ Refund processed: project ${projectId}`);
}
