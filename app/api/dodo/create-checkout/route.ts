/**
 * POST /api/dodo/create-checkout
 *
 * Creates a Stripe Checkout Session (branded as "Dodo Payments" in UI).
 * Returns a checkout_url the freelancer shares with their client.
 *
 * Body: { projectId: string }
 *
 * Flow:
 *   1. Validate user owns the project
 *   2. Create Stripe Checkout Session with project metadata
 *   3. Save checkout_url to projects.dodo_checkout_url in DB
 *   4. Return { checkoutUrl, sessionId }
 *
 * When STRIPE_SECRET_KEY is not set → returns a demo /pay/[id] URL.
 */

import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import { isDodoConfigured, getStripeClient } from "@/lib/dodo/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { projectId } = body as { projectId?: string };

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  // Fetch project
  const { data: project, error: pErr } = await supabase
    .from("projects")
    .select("id, title, description, total_amount, currency, client_email, client_name, status, dodo_checkout_url")
    .eq("id", projectId)
    .eq("freelancer_id", user.id)
    .single();

  if (pErr || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Return cached URL if already generated
  if (project.dodo_checkout_url && !project.dodo_checkout_url.includes("?demo")) {
    return NextResponse.json({
      checkoutUrl: project.dodo_checkout_url,
      sessionId: null,
      demoMode: false,
      cached: true,
    });
  }

  // ── Demo mode (no Stripe keys) ────────────────────────────────────────────
  if (!isDodoConfigured()) {
    const demoUrl = `${APP_URL}/pay/${projectId}?demo=1`;
    await supabase
      .from("projects")
      .update({
        dodo_checkout_url: demoUrl,
        status: project.status === "draft" ? "awaiting_payment" : project.status,
      })
      .eq("id", projectId);

    return NextResponse.json({
      checkoutUrl: demoUrl,
      sessionId: "demo_session",
      demoMode: true,
    });
  }

  // ── Real Stripe Checkout ──────────────────────────────────────────────────
  try {
    const stripe = getStripeClient();

    // Amount in cents (Stripe uses lowest denomination)
    const amountCents = Math.round(Number(project.total_amount) * 100);

    // Map currency — Stripe uses lowercase ISO codes
    const currency = (project.currency ?? "USD").toLowerCase();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: amountCents,
            product_data: {
              name: project.title,
              description: project.description
                ? project.description.slice(0, 255)
                : `SaathPay escrow payment for ${project.title}`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: project.client_email,
      metadata: {
        project_id: projectId,
        freelancer_id: user.id,
        project_title: project.title,
        saathpay: "true",
      },
      success_url: `${APP_URL}/pay/${projectId}?payment=success`,
      cancel_url: `${APP_URL}/pay/${projectId}?payment=cancelled`,
    });

    const checkoutUrl = session.url ?? `${APP_URL}/pay/${projectId}`;

    // Save to DB
    await supabase
      .from("projects")
      .update({
        dodo_checkout_url: checkoutUrl,
        dodo_payment_id: session.id, // store Stripe session ID in dodo_payment_id field
        status: "awaiting_payment",
      })
      .eq("id", projectId);

    return NextResponse.json({
      checkoutUrl,
      sessionId: session.id,
      demoMode: false,
    });
  } catch (err) {
    console.error("Stripe checkout creation error:", err);
    const message = err instanceof Error ? err.message : "Payment provider error";

    // Fallback to demo URL
    const demoUrl = `${APP_URL}/pay/${projectId}?demo=1`;
    await supabase
      .from("projects")
      .update({ dodo_checkout_url: demoUrl, status: "awaiting_payment" })
      .eq("id", projectId);

    return NextResponse.json({
      checkoutUrl: demoUrl,
      sessionId: null,
      demoMode: true,
      warning: `Payment provider error: ${message}`,
    });
  }
}
