import Stripe from "stripe";

const apiVersion: Stripe.LatestApiVersion = "2024-10-28.acacia";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion,
});
