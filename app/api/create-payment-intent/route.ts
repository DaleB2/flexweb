import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

export async function POST(request: Request) {
  const { email, amountCents, currency } = await request.json();

  if (!email || !amountCents || !currency) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  if (!stripeSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    receipt_email: email,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#061031",
        colorBackground: "#ffffff",
        borderRadius: "16px",
      },
    },
  });
}
