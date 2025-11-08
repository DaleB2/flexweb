import Stripe from "stripe";

const apiVersion: Stripe.LatestApiVersion = "2025-10-29.clover";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  stripeClient = new Stripe(secretKey, { apiVersion });
  return stripeClient;
}
