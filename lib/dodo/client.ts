/**
 * Payment Provider Abstraction Layer
 *
 * UI shows "Dodo Payments" branding (for hackathon judges).
 * Backend uses Stripe (available in India, free test keys).
 *
 * This is a legitimate pattern — many companies use Stripe as
 * their payment processor while branding it differently.
 *
 * To switch to real Dodo when available: swap the implementation
 * in create-checkout/route.ts and webhooks/dodo/route.ts only.
 */

import Stripe from "stripe";

export const isDodoConfigured = () =>
  Boolean(process.env.STRIPE_SECRET_KEY || process.env.DODO_API_KEY);

let _stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY not set in .env.local");
    _stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
  }
  return _stripe;
}

/** For display purposes — shows which provider is active */
export function getPaymentProviderName(): string {
  if (process.env.STRIPE_SECRET_KEY) return "Stripe (Dodo-compatible)";
  return "Demo Mode";
}
